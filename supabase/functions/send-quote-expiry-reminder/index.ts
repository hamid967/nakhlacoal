// Cron-invokable: sends a reminder for priced quotes expiring within 48h.
// Also can be called manually by an admin from the UI.
import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail, brandedShell, esc } from '../_shared/email-sender.ts';

const VALIDITY_DAYS = 7;
const REMIND_WITHIN_HOURS = 48;

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jhdr = { ...corsHeaders, 'Content-Type': 'application/json' };

  // Accept either service-role (cron) or admin user auth
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace('Bearer ', '');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

  let allowed = token === serviceKey || token === anonKey;
  let triggeredBy: string | null = null;

  if (!allowed && token) {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: claims } = await sb.auth.getClaims(token);
    if (claims?.claims?.sub) {
      const admin = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);
      const { data: isAdmin } = await admin.rpc('has_role', { _user_id: claims.claims.sub, _role: 'admin' });
      if (isAdmin) { allowed = true; triggeredBy = claims.claims.sub; }
    }
  }

  if (!allowed) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: jhdr });
  }

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);

  const nowMs = Date.now();
  const validityMs = VALIDITY_DAYS * 24 * 3600 * 1000;
  const cutoffLower = new Date(nowMs - (validityMs - REMIND_WITHIN_HOURS * 3600 * 1000)).toISOString();
  const cutoffUpper = new Date(nowMs).toISOString();

  // Priced quotes not yet accepted/rejected/converted, updated between (now - 7d) and (now - 5d)
  const { data: quotes, error } = await admin
    .from('quote_requests')
    .select('*')
    .eq('status', 'priced')
    .is('reminder_sent_at', null)
    .gte('updated_at', cutoffLower)
    .lte('updated_at', cutoffUpper);

  if (error) {
    console.error('[expiry-reminder] query error', error);
    return new Response(JSON.stringify({ error: 'query failed' }), { status: 500, headers: jhdr });
  }

  const results: Array<Record<string, unknown>> = [];
  for (const q of quotes ?? []) {
    if (!q.email) { results.push({ id: q.id, skipped: 'no email' }); continue; }
    const qid = String(q.id).slice(0, 8).toUpperCase();
    const expiresAt = new Date(new Date(q.updated_at).getTime() + validityMs);
    const price = q.quoted_price_sar ? Number(q.quoted_price_sar).toFixed(2) + ' ر.س' : '—';
    const remaining = Math.max(0, Math.round((expiresAt.getTime() - nowMs) / (3600 * 1000)));

    const html = brandedShell({
      title: 'تذكير: عرض السعر ينتهي قريباً ⏳',
      bodyHtml: `<p style="margin:0 0 16px;line-height:1.8;color:#333">عميلنا العزيز ${esc(q.full_name || q.company_name || '')},</p>
        <p style="margin:0 0 20px;line-height:1.8;color:#333">
          نودّ تذكيرك بأن عرض السعر الذي أعددناه لك سينتهي خلال <b>${remaining} ساعة تقريباً</b>. للاستفادة من نفس التسعير، يرجى التأكيد قبل انتهاء المدة.
        </p>`,
      cardLabel: 'QUOTE',
      cardValue: `#${qid}`,
      cardExtra: `${esc(q.product)} · ${esc(q.quantity)} ${esc(q.unit)} · السعر: ${price}`,
    });

    const r = await sendEmail({
      template: 'quote-expiry-reminder',
      to: q.email,
      subject: `تذكير: عرض السعر #${qid} ينتهي خلال ${remaining} ساعة`,
      html,
      from: 'فحم النخلة | Palm Charcoal <quotes@notify.alnakhlacoal.com>',
      entityType: 'quote_request',
      entityId: q.id,
      triggeredBy,
      metadata: { remaining_hours: remaining },
      admin,
    });

    if (r.ok) {
      await admin.from('quote_requests').update({ reminder_sent_at: new Date().toISOString() }).eq('id', q.id);
    }
    results.push({ id: q.id, ok: r.ok, error: r.error });
  }

  return new Response(JSON.stringify({ processed: results.length, results }), { headers: jhdr });
});
