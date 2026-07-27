// Phase 11 — Automation Dispatcher
// Drains automation_events, evaluates matching automation_rules, executes actions.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Rule = {
  id: string;
  name: string;
  trigger_event: string;
  conditions: Record<string, unknown>;
  actions: Array<Record<string, any>>;
  active: boolean;
  throttle_seconds: number | null;
  last_run_at: string | null;
  run_count: number | null;
};

type Event = {
  id: string;
  kind: string;
  payload: Record<string, any>;
  attempts: number;
};

// Map event kind -> automation_rules.trigger_event values that should match.
const EVENT_TO_TRIGGER: Record<string, string[]> = {
  'stock.low': ['stock.low', 'low_stock'],
  'cart.abandoned': ['cart.abandoned', 'abandoned_cart'],
  'order.created': ['order.created'],
  'order.status_changed': ['order.status_changed'],
  'quote.accepted': ['quote.accepted'],
  'zatca.failed': ['zatca.failed', 'zatca_failed'],
  'churn.risk': ['churn.risk', 'churn_risk'],
};

const NOTIF_DEFAULTS: Record<string, { title: string; severity: 'info'|'warning'|'critical'|'success'; link?: string }> = {
  'stock.low':       { title: 'مخزون منخفض',           severity: 'warning',  link: '/admin/products' },
  'cart.abandoned':  { title: 'سلة مهجورة',            severity: 'info',     link: '/admin/customers' },
  'zatca.failed':    { title: 'فشل فاتورة ZATCA',      severity: 'critical', link: '/admin/zatca' },
  'churn.risk':      { title: 'عميل معرّض للفقد',      severity: 'warning',  link: '/admin/customers' },
  'order.created':   { title: 'طلب جديد',              severity: 'info',     link: '/admin/orders' },
  'order.status_changed': { title: 'تغيّر حالة طلب',   severity: 'info',     link: '/admin/orders' },
  'quote.accepted':  { title: 'تم قبول عرض سعر',       severity: 'success',  link: '/admin/quotes' },
};

// Very small condition evaluator: supports { "field": value } equality and
// { "field": { "op": "gt|gte|lt|lte|eq|in", "value": ... } } shorthand.
function matchesConditions(conditions: Record<string, unknown> | null, payload: Record<string, any>) {
  if (!conditions || typeof conditions !== 'object') return true;
  for (const [k, raw] of Object.entries(conditions)) {
    const actual = payload?.[k];
    if (raw && typeof raw === 'object' && !Array.isArray(raw) && 'op' in (raw as any)) {
      const { op, value } = raw as { op: string; value: any };
      switch (op) {
        case 'gt':  if (!(Number(actual) >  Number(value))) return false; break;
        case 'gte': if (!(Number(actual) >= Number(value))) return false; break;
        case 'lt':  if (!(Number(actual) <  Number(value))) return false; break;
        case 'lte': if (!(Number(actual) <= Number(value))) return false; break;
        case 'eq':  if (actual !== value) return false; break;
        case 'in':  if (!Array.isArray(value) || !value.includes(actual)) return false; break;
        default: return false;
      }
    } else if (actual !== raw) {
      return false;
    }
  }
  return true;
}

function interpolate(template: string, payload: Record<string, any>): string {
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, path: string) => {
    const parts = path.split('.');
    let v: any = payload;
    for (const p of parts) v = v?.[p];
    return v == null ? '' : String(v);
  });
}

async function runAction(
  supabase: ReturnType<typeof createClient>,
  action: Record<string, any>,
  event: Event,
): Promise<{ ok: boolean; result?: any; error?: string }> {
  const type = String(action.type || '').toLowerCase();
  const payload = event.payload || {};
  try {
    if (type === 'create_notification' || type === 'notify_admin') {
      const preset = NOTIF_DEFAULTS[event.kind] || { title: event.kind, severity: 'info' as const };
      const title = interpolate(String(action.title || action.message || preset.title), payload);
      const body  = action.body ? interpolate(String(action.body), payload) : null;
      const { data, error } = await supabase.from('admin_notifications').insert({
        title, body,
        severity: action.severity || preset.severity,
        kind: event.kind,
        link: action.link || preset.link,
        entity_type: action.entity_type || null,
        entity_id: action.entity_id || null,
      }).select('id').single();
      if (error) return { ok: false, error: error.message };
      return { ok: true, result: { notification_id: (data as any)?.id } };
    }

    if (type === 'send_email') {
      const to = interpolate(String(action.to || ''), payload);
      const subject = interpolate(String(action.subject || ''), payload);
      const html = interpolate(String(action.html || action.body || ''), payload);
      if (!to || !subject) return { ok: false, error: 'missing to/subject' };
      const resendKey = Deno.env.get('RESEND_API_KEY');
      if (!resendKey) return { ok: false, error: 'RESEND_API_KEY not configured' };
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${resendKey}` },
        body: JSON.stringify({
          from: action.from || 'Palm Charcoal <notify@notify.alnakhlacoal.com>',
          to: [to], subject, html: html || `<p>${subject}</p>`,
        }),
      });
      const j = await r.json().catch(() => ({}));
      return r.ok ? { ok: true, result: j } : { ok: false, error: JSON.stringify(j) };
    }

    if (type === 'send_whatsapp') {
      const { error } = await supabase.functions.invoke('whatsapp-send', {
        body: {
          to: interpolate(String(action.to || ''), payload),
          message: interpolate(String(action.message || ''), payload),
        },
      });
      if (error) return { ok: false, error: error.message };
      return { ok: true };
    }

    if (type === 'webhook') {
      const url = String(action.url || '');
      if (!/^https:\/\//.test(url)) return { ok: false, error: 'webhook url must be https' };
      const r = await fetch(url, {
        method: action.method || 'POST',
        headers: { 'Content-Type': 'application/json', ...(action.headers || {}) },
        body: JSON.stringify({ event: event.kind, payload }),
      });
      return { ok: r.ok, result: { status: r.status } };
    }

    if (type === 'assign_tag') {
      // best-effort: no-op unless a tags table exists
      return { ok: true, result: 'noop' };
    }

    return { ok: false, error: `unknown action type: ${type}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

async function processEvent(supabase: ReturnType<typeof createClient>, event: Event) {
  const triggers = EVENT_TO_TRIGGER[event.kind] ?? [event.kind];
  const { data: rulesData, error: rulesErr } = await supabase
    .from('automation_rules')
    .select('*')
    .eq('active', true)
    .in('trigger_event', triggers);
  if (rulesErr) throw new Error(`fetch rules: ${rulesErr.message}`);

  const rules = (rulesData ?? []) as Rule[];
  let auto = false;
  const runs: any[] = [];

  // Fallback: if no user-defined rule matches, still create a notification for known kinds.
  if (rules.length === 0 && NOTIF_DEFAULTS[event.kind]) {
    const preset = NOTIF_DEFAULTS[event.kind];
    await supabase.from('admin_notifications').insert({
      title: preset.title, body: JSON.stringify(event.payload).slice(0, 500),
      severity: preset.severity, kind: event.kind, link: preset.link,
    });
    auto = true;
  }

  for (const rule of rules) {
    // Throttle
    if (rule.throttle_seconds && rule.last_run_at) {
      const since = Date.now() - new Date(rule.last_run_at).getTime();
      if (since < rule.throttle_seconds * 1000) {
        runs.push({ rule_id: rule.id, status: 'throttled' });
        continue;
      }
    }
    if (!matchesConditions(rule.conditions, event.payload)) {
      runs.push({ rule_id: rule.id, status: 'skipped', log: { reason: 'conditions_unmet' } });
      continue;
    }
    const actionResults: any[] = [];
    let anyFail = false;
    for (const action of rule.actions || []) {
      const res = await runAction(supabase, action, event);
      actionResults.push({ action: action.type, ...res });
      if (!res.ok) anyFail = true;
    }
    const status = anyFail ? 'failed' : 'success';
    await supabase.from('automation_runs').insert({
      rule_id: rule.id,
      entity_type: event.kind,
      status,
      log: { event_id: event.id, payload: event.payload, actions: actionResults },
    });
    await supabase.from('automation_rules').update({
      last_run_at: new Date().toISOString(),
      run_count: (rule.run_count ?? 0) + 1,
    }).eq('id', rule.id);
    runs.push({ rule_id: rule.id, status });
  }

  return { rules_matched: rules.length, runs, auto_notified: auto };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: any = {};
  try { body = await req.json(); } catch { /* noop */ }

  // Dry-run mode: evaluate a single rule against last 24h synthetic events without executing.
  if (body?.mode === 'test' && body.rule_id) {
    const { data: rule } = await supabase.from('automation_rules').select('*').eq('id', body.rule_id).maybeSingle();
    if (!rule) return new Response(JSON.stringify({ ok: false, error: 'rule_not_found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const trigger = (rule as Rule).trigger_event;
    const kinds = Object.entries(EVENT_TO_TRIGGER).filter(([, v]) => v.includes(trigger)).map(([k]) => k);
    const { data: events } = await supabase
      .from('automation_events')
      .select('id,kind,payload')
      .in('kind', kinds.length ? kinds : [trigger])
      .gte('created_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      .limit(20);
    const matched = (events ?? []).filter((e: any) => matchesConditions((rule as Rule).conditions, e.payload));
    return new Response(JSON.stringify({ ok: true, dry_run: true, sampled: events?.length ?? 0, would_run: matched.length, samples: matched.slice(0, 5) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Drain the queue (cap per invocation).
  const limit = Math.min(Number(body?.limit) || 50, 200);
  const { data: events, error: qErr } = await supabase
    .from('automation_events')
    .select('id,kind,payload,attempts')
    .is('processed_at', null)
    .order('created_at', { ascending: true })
    .limit(limit);
  if (qErr) {
    return new Response(JSON.stringify({ ok: false, error: qErr.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const summary: any[] = [];
  for (const raw of (events ?? [])) {
    const ev = raw as Event;
    try {
      const result = await processEvent(supabase, ev);
      await supabase.from('automation_events').update({
        processed_at: new Date().toISOString(),
        processed_result: result,
        attempts: (ev.attempts ?? 0) + 1,
      }).eq('id', ev.id);
      summary.push({ id: ev.id, kind: ev.kind, ...result });
    } catch (e) {
      await supabase.from('automation_events').update({
        attempts: (ev.attempts ?? 0) + 1,
        processed_result: { error: (e as Error).message },
      }).eq('id', ev.id);
      summary.push({ id: ev.id, kind: ev.kind, error: (e as Error).message });
    }
  }

  return new Response(JSON.stringify({ ok: true, processed: summary.length, summary }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
