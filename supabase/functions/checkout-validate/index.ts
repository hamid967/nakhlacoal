// Server-side price validator for Checkout.
// Recomputes subtotal / VAT / total from product_variants + coupons,
// so the browser cannot dictate the amount charged.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';

const BodySchema = z.object({
  items: z.array(z.object({
    variant_id: z.string().uuid(),
    qty: z.number().int().positive().max(100000),
  })).min(1).max(100),
  coupon_code: z.string().trim().min(1).max(64).optional().nullable(),
  client_total: z.number().nonnegative().optional(),
});

const VAT_RATE = 0.15;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'invalid_body', details: parsed.error.flatten().fieldErrors }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { items, coupon_code, client_total } = parsed.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    const variantIds = [...new Set(items.map((i) => i.variant_id))];
    const { data: variants, error: vErr } = await supabase
      .from('product_variants')
      .select('id, sku, price, stock, reserved_qty, is_active, label_ar, label_en')
      .in('id', variantIds);
    if (vErr) throw vErr;

    const byId = new Map((variants ?? []).map((v: any) => [v.id, v]));
    const lines: any[] = [];
    let subtotal = 0;
    for (const it of items) {
      const v = byId.get(it.variant_id);
      if (!v || !v.is_active) {
        return new Response(JSON.stringify({ error: 'variant_unavailable', variant_id: it.variant_id }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const available = Math.max(0, Number(v.stock ?? 0) - Number(v.reserved_qty ?? 0));
      if (available < it.qty) {
        return new Response(JSON.stringify({ error: 'insufficient_stock', variant_id: it.variant_id, available }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const price = Number(v.price);
      const line_total = Math.round(price * it.qty * 100) / 100;
      subtotal += line_total;
      lines.push({ variant_id: v.id, sku: v.sku, label_ar: v.label_ar, label_en: v.label_en, unit_price: price, qty: it.qty, line_total });
    }
    subtotal = Math.round(subtotal * 100) / 100;

    // Optional coupon
    let discount = 0;
    let couponInfo: { code: string; type: string; value: number } | null = null;
    if (coupon_code) {
      const { data: coupon } = await supabase
        .from('coupons')
        .select('code, discount_type, discount_value, min_order_sar, is_active, starts_at, ends_at, usage_limit, times_used')
        .eq('code', coupon_code.toUpperCase())
        .maybeSingle();
      if (coupon && coupon.is_active) {
        const now = new Date();
        const okWindow = (!coupon.starts_at || new Date(coupon.starts_at) <= now)
          && (!coupon.ends_at || new Date(coupon.ends_at) >= now);
        const okUsage = !coupon.usage_limit || (coupon.times_used ?? 0) < coupon.usage_limit;
        const okMin = subtotal >= Number(coupon.min_order_sar ?? 0);
        if (okWindow && okUsage && okMin) {
          if (coupon.discount_type === 'percent') {
            discount = Math.round(subtotal * (Number(coupon.discount_value) / 100) * 100) / 100;
          } else {
            discount = Math.min(subtotal, Number(coupon.discount_value));
          }
          couponInfo = { code: coupon.code, type: coupon.discount_type, value: Number(coupon.discount_value) };
        }
      }
    }

    const taxable = Math.max(0, subtotal - discount);
    const vat = Math.round(taxable * VAT_RATE * 100) / 100;
    const total = Math.round((taxable + vat) * 100) / 100;

    const drift = client_total !== undefined ? Math.abs(Number(client_total) - total) : 0;
    const ok = client_total === undefined || drift <= 0.01;

    return new Response(JSON.stringify({
      ok,
      currency: 'SAR',
      vat_rate: VAT_RATE,
      subtotal, discount, vat, total,
      coupon: couponInfo,
      lines,
      drift,
      computed_at: new Date().toISOString(),
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error('[checkout-validate]', msg);
    return new Response(JSON.stringify({ error: 'server_error', details: msg }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
