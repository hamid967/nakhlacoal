// Admin AI Copilot — natural-language Q&A over the business database (read-only).
// Uses Lovable AI Gateway (google/gemini-2.5-flash) with a strict JSON DSL that
// the server translates to whitelisted supabase-js queries.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const READ_TABLES = new Set([
  'orders', 'order_items', 'products', 'product_variants', 'customers',
  'invoices', 'payments', 'shipments', 'daily_kpi_snapshots',
  'customer_segments', 'product_intelligence', 'quote_requests',
  'inventory_items', 'stock_by_warehouse', 'product_reviews',
]);

interface Query {
  table: string;
  select?: string;
  filters?: Array<{ col: string; op: 'eq' | 'gte' | 'lte' | 'gt' | 'lt' | 'ilike'; val: string | number }>;
  order?: { col: string; asc?: boolean };
  limit?: number;
}

const SYSTEM_PROMPT = `You are the admin data copilot for "فحم النخلة | Palm Charcoal".
You answer questions about the business by emitting ONE JSON query against a whitelisted schema.
Available tables: ${[...READ_TABLES].join(', ')}.
Common columns: orders(status, grand_total_sar, created_at, city, user_id), daily_kpi_snapshots(day, revenue_sar, orders_count, aov_sar), customer_segments(tier, rfm_score, ltv_sar), product_intelligence(variant_id, velocity_30d, abc_class).
Respond in Arabic. First think briefly, then emit a JSON code block with keys {table, select, filters?, order?, limit?}.
After the tool result is returned in a follow-up, write a concise Arabic answer with numbers.`;

async function runQuery(supabase: ReturnType<typeof createClient>, q: Query) {
  if (!READ_TABLES.has(q.table)) throw new Error(`table_not_allowed:${q.table}`);
  let qb = supabase.from(q.table).select(q.select ?? '*', { count: 'exact' });
  for (const f of q.filters ?? []) {
    // deno-lint-ignore no-explicit-any
    qb = (qb as any)[f.op](f.col, f.val);
  }
  if (q.order) qb = qb.order(q.order.col, { ascending: q.order.asc ?? false });
  qb = qb.limit(Math.min(q.limit ?? 25, 100));
  const { data, error, count } = await qb;
  if (error) throw new Error(error.message);
  return { rows: data, count };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('method_not_allowed', { status: 405, headers: corsHeaders });

  const apiKey = Deno.env.get('LOVABLE_API_KEY');
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY missing' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Verify caller is an admin/manager.
  const authHeader = req.headers.get('Authorization') ?? '';
  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }),
    { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: roleOk } = await admin.rpc('has_role', { _user_id: user.id, _role: 'admin' });
  const { data: mgrOk }  = await admin.rpc('has_role', { _user_id: user.id, _role: 'manager' });
  const { data: superOk } = await admin.rpc('has_role', { _user_id: user.id, _role: 'super_admin' });
  if (!roleOk && !mgrOk && !superOk) {
    return new Response(JSON.stringify({ error: 'forbidden' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const { question } = await req.json();
  if (!question || typeof question !== 'string') {
    return new Response(JSON.stringify({ error: 'question required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  // Ask the model for a query DSL.
  const planRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: question },
      ],
    }),
  });
  if (!planRes.ok) {
    const txt = await planRes.text();
    return new Response(JSON.stringify({ error: 'ai_plan_failed', detail: txt }),
      { status: planRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const planJson = await planRes.json();
  const planText: string = planJson.choices?.[0]?.message?.content ?? '';

  // Extract first ```json { ... } ``` block.
  const match = planText.match(/```json\s*([\s\S]*?)```/) ?? planText.match(/\{[\s\S]*\}/);
  let query: Query | null = null;
  try {
    if (match) query = JSON.parse((match[1] ?? match[0]).trim());
  } catch { /* noop */ }

  let rows: unknown[] = [];
  let count: number | null = null;
  let queryError: string | null = null;
  if (query?.table) {
    try {
      const r = await runQuery(admin, query);
      rows = r.rows ?? [];
      count = r.count ?? null;
    } catch (e) { queryError = (e as Error).message; }
  }

  // Ask the model to summarize.
  const summaryRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Lovable-API-Key': apiKey },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'أجب بالعربية في جملتين أو ثلاث فقط، مع الأرقام والوحدات (ر.س).' },
        { role: 'user', content: `السؤال: ${question}\nالبيانات: ${JSON.stringify({ count, rows: rows.slice(0, 20) })}\nخطأ: ${queryError ?? 'لا يوجد'}` },
      ],
    }),
  });
  const summaryJson = summaryRes.ok ? await summaryRes.json() : null;
  const answer = summaryJson?.choices?.[0]?.message?.content ?? 'تعذّر توليد الإجابة.';

  return new Response(JSON.stringify({ ok: true, answer, query, count, rows: rows.slice(0, 20), queryError }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
