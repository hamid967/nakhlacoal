// Create a Moyasar payment session for an order.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const MOYASAR_API = 'https://api.moyasar.com/v1';

interface Body {
  order_id: string;
  callback_url?: string;
  metadata?: Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const body: Body = await req.json();
    if (!body?.order_id || typeof body.order_id !== 'string') {
      return json({ error: 'order_id required' }, 400);
    }

    const secret = Deno.env.get('MOYASAR_SECRET_KEY');
    if (!secret) return json({ error: 'MOYASAR_SECRET_KEY not configured' }, 500);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: order, error: orderErr } = await admin
      .from('orders')
      .select('id, grand_total_sar, status, payment_status, email, full_name, phone')
      .eq('id', body.order_id)
      .single();

    if (orderErr || !order) return json({ error: 'order_not_found' }, 404);
    if (order.payment_status === 'paid') return json({ error: 'already_paid' }, 400);
    if (!order.grand_total_sar || Number(order.grand_total_sar) <= 0) {
      return json({ error: 'invalid_amount' }, 400);
    }

    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    const callback = body.callback_url || `${origin.replace(/\/$/, '')}/checkout/success?order=${order.id}`;

    const amountHalalas = Math.round(Number(order.grand_total_sar) * 100);

    const authHeader = 'Basic ' + btoa(secret + ':');
    const payload = {
      amount: amountHalalas,
      currency: 'SAR',
      description: `Palm Charcoal Order ${order.id}`,
      callback_url: callback,
      metadata: {
        order_id: order.id,
        ...(body.metadata || {}),
      },
      source: {
        type: 'creditcard',
      },
    };

    // Use Payment API (not Invoices) so client-side Moyasar.js handles method selection.
    // We return a hosted invoice URL for simplicity.
    const invoicePayload = {
      amount: amountHalalas,
      currency: 'SAR',
      description: `طلب فحم النخلة #${order.id.slice(0, 8)}`,
      callback_url: callback,
      success_url: callback,
      back_url: `${origin.replace(/\/$/, '')}/checkout/failed?order=${order.id}`,
      metadata: {
        order_id: order.id,
      },
    };

    const res = await fetch(`${MOYASAR_API}/invoices`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoicePayload),
    });

    const providerResponse = await res.json();

    if (!res.ok) {
      await admin.from('payments').insert({
        order_id: order.id,
        provider: 'moyasar',
        amount_sar: order.grand_total_sar,
        status: 'failed',
        failure_reason: providerResponse?.message || 'moyasar_error',
        raw_response: providerResponse,
      });
      return json({ error: 'moyasar_error', details: providerResponse }, 502);
    }

    await admin.from('payments').insert({
      order_id: order.id,
      provider: 'moyasar',
      provider_ref: providerResponse.id,
      amount_sar: order.grand_total_sar,
      status: 'initiated',
      raw_response: providerResponse,
    });

    await admin
      .from('orders')
      .update({ payment_status: 'awaiting_payment', status: 'awaiting_payment' })
      .eq('id', order.id);

    return json({
      payment_id: providerResponse.id,
      redirect_url: providerResponse.url,
      status: providerResponse.status,
    });
  } catch (e) {
    console.error('[payments-create-session]', e);
    return json({ error: 'internal', message: String(e) }, 500);
  }
});

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
