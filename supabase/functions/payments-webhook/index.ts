// Moyasar webhook handler — verifies signature and updates payment/order status.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-moyasar-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const raw = await req.text();
    const secret = Deno.env.get('MOYASAR_WEBHOOK_SECRET');
    const signature = req.headers.get('x-moyasar-signature') || req.headers.get('Moyasar-Signature');

    // Verify signature (HMAC-SHA256 of raw body with webhook secret) when provided
    if (secret && signature) {
      const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign'],
      );
      const sigBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(raw));
      const expected = Array.from(new Uint8Array(sigBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      if (expected !== signature.toLowerCase().replace(/^sha256=/, '')) {
        console.warn('[payments-webhook] signature mismatch');
        return new Response('invalid signature', { status: 401, headers: CORS });
      }
    }

    const event = JSON.parse(raw);
    const data = event?.data || event;
    const providerRef: string | undefined = data?.id;
    const status: string = data?.status || event?.type || 'unknown';
    const method: string | undefined = data?.source?.type;
    const orderId: string | undefined = data?.metadata?.order_id;

    if (!providerRef) {
      return new Response(JSON.stringify({ error: 'missing_payment_id' }), {
        status: 400,
        headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Idempotent upsert on provider_ref
    const { data: existing } = await admin
      .from('payments')
      .select('id, order_id, status')
      .eq('provider_ref', providerRef)
      .maybeSingle();

    const normalized = normalizeStatus(status);

    if (existing) {
      await admin
        .from('payments')
        .update({
          status: normalized,
          method: method ?? undefined,
          raw_response: event,
          failure_reason: normalized === 'failed' ? (data?.source?.message || data?.message) : null,
        })
        .eq('id', existing.id);
    } else if (orderId) {
      const { data: order } = await admin
        .from('orders')
        .select('grand_total_sar')
        .eq('id', orderId)
        .maybeSingle();
      await admin.from('payments').insert({
        order_id: orderId,
        provider: 'moyasar',
        provider_ref: providerRef,
        method: method ?? null,
        amount_sar: order?.grand_total_sar ?? (Number(data?.amount || 0) / 100),
        status: normalized,
        raw_response: event,
        failure_reason: normalized === 'failed' ? (data?.source?.message || data?.message) : null,
      });
    }

    // Propagate to order if paid
    if (normalized === 'paid' && (existing?.order_id || orderId)) {
      const oid = existing?.order_id || orderId!;
      await admin
        .from('orders')
        .update({
          payment_status: 'paid',
          paid_at: new Date().toISOString(),
          payment_method: method ?? null,
          status: 'paid',
        })
        .eq('id', oid);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[payments-webhook]', e);
    return new Response(JSON.stringify({ error: 'internal' }), {
      status: 500,
      headers: { ...CORS, 'Content-Type': 'application/json' },
    });
  }
});

function normalizeStatus(s: string): string {
  const v = (s || '').toLowerCase();
  if (v.includes('paid') || v === 'succeeded' || v === 'captured') return 'paid';
  if (v.includes('fail')) return 'failed';
  if (v.includes('refund')) return 'refunded';
  if (v.includes('cancel')) return 'cancelled';
  if (v.includes('expire')) return 'expired';
  if (v === 'initiated' || v === 'pending' || v.includes('authorized')) return 'initiated';
  return v || 'unknown';
}
