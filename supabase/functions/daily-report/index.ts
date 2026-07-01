// Aggregates yesterday's sales + low-stock into public.daily_reports
// Scheduled via pg_cron (see scheduled SQL in project setup).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { buildCors } from "../_shared/cors.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // Target date: yesterday (UTC) by default, or ?date=YYYY-MM-DD
  const url = new URL(req.url);
  const param = url.searchParams.get("date");
  const target = param
    ? new Date(param)
    : new Date(Date.now() - 24 * 60 * 60 * 1000);
  const day = target.toISOString().slice(0, 10);
  const start = `${day}T00:00:00.000Z`;
  const endDate = new Date(target);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const end = endDate.toISOString().slice(0, 10) + "T00:00:00.000Z";

  try {
    // Sales aggregates from invoices issued that day
    const { data: invs, error: invErr } = await supabase
      .from("invoices")
      .select("subtotal_sar,vat_amount_sar,grand_total_sar,status,created_at")
      .gte("created_at", start)
      .lt("created_at", end)
      .neq("status", "void");
    if (invErr) throw invErr;

    const orders_count = invs?.length ?? 0;
    const sales_subtotal_sar = (invs ?? []).reduce((s, i) => s + Number(i.subtotal_sar || 0), 0);
    const vat_collected_sar = (invs ?? []).reduce((s, i) => s + Number(i.vat_amount_sar || 0), 0);
    const grand_total_sar = (invs ?? []).reduce((s, i) => s + Number(i.grand_total_sar || 0), 0);

    // New customers that day
    const { count: new_customers } = await supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .gte("created_at", start)
      .lt("created_at", end);

    // Low-stock items (qty < min_qty)
    const { data: lowStock } = await supabase
      .from("inventory_items")
      .select("id,name,quantity,min_qty")
      .lt("quantity", 50); // fallback threshold; tweak as needed

    const { error: upErr } = await supabase.from("daily_reports").upsert({
      report_date: day,
      orders_count,
      sales_subtotal_sar: Math.round(sales_subtotal_sar * 100) / 100,
      vat_collected_sar: Math.round(vat_collected_sar * 100) / 100,
      grand_total_sar: Math.round(grand_total_sar * 100) / 100,
      new_customers: new_customers ?? 0,
      low_stock_items: lowStock ?? [],
    });
    if (upErr) throw upErr;

    return new Response(
      JSON.stringify({ ok: true, date: day, orders_count, grand_total_sar }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
