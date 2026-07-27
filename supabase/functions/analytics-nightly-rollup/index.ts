// Nightly analytics rollup — invokable manually or via pg_cron.
// Computes daily_kpi_snapshots + customer_segments + product_intelligence.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let day: string | null = null;
  try { const b = await req.json(); day = b?.day ?? null; } catch { /* noop */ }

  const results: Record<string, unknown> = {};
  try {
    const kpi = await supabase.rpc('compute_daily_kpi', day ? { _day: day } : {});
    results.kpi = kpi.error ? { error: kpi.error.message } : 'ok';
    const seg = await supabase.rpc('compute_customer_segments');
    results.segments = seg.error ? { error: seg.error.message } : seg.data;
    const pi = await supabase.rpc('compute_product_intelligence');
    results.product_intelligence = pi.error ? { error: pi.error.message } : pi.data;
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ ok: true, results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
