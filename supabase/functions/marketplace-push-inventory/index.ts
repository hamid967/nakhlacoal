// Push prices + stock to active marketplace channels (Amazon SP-API, Noon).
// Runs every 15 minutes via pg_cron. Safe no-op when credentials are missing.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Listing {
  id: string;
  channel_id: string;
  variant_id: string;
  external_sku: string | null;
  external_id: string | null;
  price_sar: number | null;
  stock_qty: number | null;
}

async function getAmazonAccessToken(): Promise<string | null> {
  const clientId = Deno.env.get('AMAZON_SP_API_CLIENT_ID');
  const clientSecret = Deno.env.get('AMAZON_SP_API_CLIENT_SECRET');
  const refreshToken = Deno.env.get('AMAZON_REFRESH_TOKEN');
  if (!clientId || !clientSecret || !refreshToken) return null;
  const res = await fetch('https://api.amazon.com/auth/o2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!res.ok) {
    console.error('[amazon-token]', res.status, await res.text());
    return null;
  }
  const j = await res.json();
  return j.access_token as string;
}

async function pushAmazonListing(
  listing: Listing,
  variant: { sku: string; price: number; stock: number },
  token: string,
): Promise<{ ok: boolean; error?: string; ref?: string }> {
  const sellerId = Deno.env.get('AMAZON_SELLER_ID');
  const marketplaceId = Deno.env.get('AMAZON_MARKETPLACE_ID') ?? 'A17E79C6D8DWNP'; // amazon.sa
  const endpoint = Deno.env.get('AMAZON_SP_API_ENDPOINT') ?? 'https://sellingpartnerapi-eu.amazon.com';
  if (!sellerId) return { ok: false, error: 'missing_seller_id' };

  const sku = listing.external_sku ?? variant.sku;
  const url = `${endpoint}/listings/2021-08-01/items/${sellerId}/${encodeURIComponent(sku)}?marketplaceIds=${marketplaceId}`;
  const body = {
    productType: 'PRODUCT',
    patches: [
      { op: 'replace', path: '/attributes/purchasable_offer', value: [{
        marketplace_id: marketplaceId, currency: 'SAR',
        our_price: [{ schedule: [{ value_with_tax: variant.price }] }],
      }] },
      { op: 'replace', path: '/attributes/fulfillment_availability', value: [{
        fulfillment_channel_code: 'DEFAULT', quantity: variant.stock,
      }] },
    ],
  };
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'x-amz-access-token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, error: `amazon_${res.status}: ${text.slice(0, 200)}` };
  try {
    const j = JSON.parse(text);
    return { ok: true, ref: j.submissionId ?? j.sku ?? sku };
  } catch { return { ok: true, ref: sku }; }
}

async function pushNoonListing(
  listing: Listing,
  variant: { sku: string; price: number; stock: number },
): Promise<{ ok: boolean; error?: string; ref?: string }> {
  const partnerCode = Deno.env.get('NOON_PARTNER_CODE');
  const apiKey = Deno.env.get('NOON_API_KEY');
  const endpoint = Deno.env.get('NOON_API_ENDPOINT') ?? 'https://api.noon.partners';
  if (!partnerCode || !apiKey) return { ok: false, error: 'missing_noon_credentials' };

  const sku = listing.external_sku ?? variant.sku;
  const url = `${endpoint}/v3/partner/${partnerCode}/offers/${encodeURIComponent(sku)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      price: variant.price,
      stock: variant.stock,
      is_active: variant.stock > 0,
    }),
  });
  const text = await res.text();
  if (!res.ok) return { ok: false, error: `noon_${res.status}: ${text.slice(0, 200)}` };
  return { ok: true, ref: sku };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: channels } = await supabase
    .from('marketplace_channels')
    .select('id, provider, name, active')
    .eq('active', true);

  const summary: Record<string, { pushed: number; failed: number; errors: string[] }> = {};
  let amazonToken: string | null = null;

  for (const ch of channels ?? []) {
    summary[ch.name] = { pushed: 0, failed: 0, errors: [] };
    const { data: listings } = await supabase
      .from('marketplace_listings')
      .select('id, channel_id, variant_id, external_sku, external_id, price_sar, stock_qty')
      .eq('channel_id', ch.id)
      .in('status', ['active', 'pending', 'error']);

    for (const l of (listings as Listing[]) ?? []) {
      const { data: v } = await supabase
        .from('product_variants')
        .select('sku, price, stock, reserved_qty, is_active')
        .eq('id', l.variant_id)
        .maybeSingle();
      if (!v) continue;
      const variantPayload = {
        sku: v.sku,
        price: Number(l.price_sar ?? v.price),
        stock: Math.max(0, (v.stock ?? 0) - (v.reserved_qty ?? 0)),
      };
      let result: { ok: boolean; error?: string; ref?: string };
      if (ch.provider === 'amazon') {
        amazonToken ??= await getAmazonAccessToken();
        if (!amazonToken) { result = { ok: false, error: 'missing_amazon_credentials' }; }
        else result = await pushAmazonListing(l, variantPayload, amazonToken);
      } else if (ch.provider === 'noon') {
        result = await pushNoonListing(l, variantPayload);
      } else {
        result = { ok: false, error: `unknown_provider_${ch.provider}` };
      }

      await supabase.from('marketplace_listings').update({
        status: result.ok ? 'active' : 'error',
        last_pushed_at: result.ok ? new Date().toISOString() : null,
        last_error: result.ok ? null : result.error ?? 'unknown_error',
        external_id: result.ref ?? l.external_id,
        stock_qty: variantPayload.stock,
        price_sar: variantPayload.price,
      }).eq('id', l.id);

      if (result.ok) summary[ch.name].pushed++;
      else { summary[ch.name].failed++; summary[ch.name].errors.push(result.error ?? 'unknown'); }
    }

    await supabase.from('marketplace_channels')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', ch.id);
  }

  return new Response(JSON.stringify({ ok: true, summary }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
