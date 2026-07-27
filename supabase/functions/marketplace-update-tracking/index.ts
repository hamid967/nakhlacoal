// Push tracking numbers back to Amazon/Noon when a shipment is created for
// an order that originated from a marketplace. Invoke with { shipmentId }.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAmazonAccessToken(): Promise<string | null> {
  const clientId = Deno.env.get('AMAZON_SP_API_CLIENT_ID');
  const clientSecret = Deno.env.get('AMAZON_SP_API_CLIENT_SECRET');
  const refreshToken = Deno.env.get('AMAZON_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) return null;
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token', refresh_token: refreshToken,
      client_id: clientId, client_secret: clientSecret,
    }),
  });
  return res.ok ? (await res.json()).access_token : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  let body: { shipmentId?: string } = {};
  try { body = await req.json(); } catch { /* noop */ }
  if (!body.shipmentId) {
    return new Response(JSON.stringify({ error: 'shipmentId required' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const { data: shipment } = await supabase.from('shipments')
    .select('id, order_id, carrier, tracking_no, tracking_url, status').eq('id', body.shipmentId).maybeSingle();
  if (!shipment?.order_id || !shipment.tracking_no) {
    return new Response(JSON.stringify({ ok: true, skipped: 'no_tracking_or_order' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const { data: mo } = await supabase.from('marketplace_orders')
    .select('id, channel_id, external_order_id, raw')
    .eq('order_id', shipment.order_id).maybeSingle();
  if (!mo) {
    return new Response(JSON.stringify({ ok: true, skipped: 'not_marketplace_order' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  const { data: channel } = await supabase.from('marketplace_channels')
    .select('id, provider').eq('id', mo.channel_id).maybeSingle();
  if (!channel) {
    return new Response(JSON.stringify({ ok: false, error: 'channel_not_found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }

  let ok = false; let error: string | null = null;

  if (channel.provider === 'amazon') {
    const token = await getAmazonAccessToken();
    if (!token) error = 'missing_amazon_credentials';
    else {
      const endpoint = Deno.env.get('AMAZON_SP_API_ENDPOINT') ?? 'https://sellingpartnerapi-eu.amazon.com';
      const res = await fetch(`${endpoint}/orders/v0/orders/${mo.external_order_id}/shipmentConfirmation`, {
        method: 'POST',
        headers: { 'x-amz-access-token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marketplaceId: Deno.env.get('AMAZON_MARKETPLACE_ID') ?? 'A17E79C6D8DWNP',
          codCollectionMethod: 'DirectPayment',
          packageDetail: {
            packageReferenceId: shipment.id,
            carrierCode: shipment.carrier,
            trackingNumber: shipment.tracking_no,
            shipDate: new Date().toISOString(),
          },
        }),
      });
      ok = res.ok; if (!ok) error = `amazon_${res.status}: ${(await res.text()).slice(0, 200)}`;
    }
  } else if (channel.provider === 'noon') {
    const partnerCode = Deno.env.get('NOON_PARTNER_CODE');
    const apiKey = Deno.env.get('NOON_API_KEY');
    const endpoint = Deno.env.get('NOON_API_ENDPOINT') ?? 'https://api.noon.partners';
    if (!partnerCode || !apiKey) error = 'missing_noon_credentials';
    else {
      const res = await fetch(`${endpoint}/v3/partner/${partnerCode}/orders/${mo.external_order_id}/ship`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carrier: shipment.carrier,
          tracking_number: shipment.tracking_no,
          tracking_url: shipment.tracking_url,
        }),
      });
      ok = res.ok; if (!ok) error = `noon_${res.status}: ${(await res.text()).slice(0, 200)}`;
    }
  }

  await supabase.from('marketplace_orders')
    .update({ status: ok ? 'shipped' : 'ship_failed' }).eq('id', mo.id);

  return new Response(JSON.stringify({ ok, error }), {
    status: ok ? 200 : 502,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
