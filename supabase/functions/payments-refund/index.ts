// Refund a paid Moyasar payment (full or partial). Admin/accountant only.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const { payment_id, amount_sar } = await req.json();
    if (!payment_id) return json({ error: 'payment_id required' }, 400);

    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.replace(/^Bearer\s+/i, '');
    if (!jwt) return json({ error: 'unauthorized' }, 401);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anon = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });
    const { data: userData } = await anon.auth.getUser();
    if (!userData?.user) return json({ error: 'unauthorized' }, 401);

    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: roles } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id);
    const allowed = (roles || []).some((r: { role: string }) =>
      ['admin', 'super_admin', 'accountant'].includes(r.role),
    );
    if (!allowed) return json({ error: 'forbidden' }, 403);

    const { data: pay } = await admin
      .from('payments')
      .select('*')
      .eq('id', payment_id)
      .single();
    if (!pay) return json({ error: 'payment_not_found' }, 404);
    if (pay.status !== 'paid') return json({ error: 'payment_not_paid' }, 400);

    const secret = Deno.env.get('MOYASAR_SECRET_KEY');
    if (!secret) return json({ error: 'MOYASAR_SECRET_KEY not configured' }, 500);

    const refundAmount = amount_sar ? Math.round(Number(amount_sar) * 100) : undefined;
    const url = `https://api.moyasar.com/v1/payments/${pay.provider_ref}/refund`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(secret + ':'),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refundAmount ? { amount: refundAmount } : {}),
    });
    const body = await res.json();
    if (!res.ok) return json({ error: 'moyasar_refund_failed', details: body }, 502);

    await admin
      .from('payments')
      .update({ status: 'refunded', raw_response: body })
      .eq('id', pay.id);

    await admin
      .from('orders')
      .update({ payment_status: 'refunded', status: 'refunded' })
      .eq('id', pay.order_id);

    return json({ ok: true, refund: body });
  } catch (e) {
    console.error('[payments-refund]', e);
    return json({ error: 'internal', message: String(e) }, 500);
  }
});

function json(b: unknown, status = 200): Response {
  return new Response(JSON.stringify(b), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
