// Pull new marketplace orders (Amazon SP-API, Noon) and import them into public.orders.
// Runs every 5 minutes via pg_cron.
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
  if (!res.ok) return null;
  return (await res.json()).access_token as string;
}

async function fetchAmazonOrders(token: string, sinceIso: string): Promise<Array<Record<string, unknown>>> {
  const marketplaceId = Deno.env.get('AMAZON_MARKETPLACE_ID') ?? 'A17E79C6D8DWNP';
  const endpoint = Deno.env.get('AMAZON_SP_API_ENDPOINT') ?? 'https://sellingpartnerapi-eu.amazon.com';
  const url = `${endpoint}/orders/v0/orders?MarketplaceIds=${marketplaceId}&CreatedAfter=${encodeURIComponent(sinceIso)}`;
  const res = await fetch(url, { headers: { 'x-amz-access-token': token } });
  if (!res.ok) { console.error('[amazon-orders]', res.status, await res.text()); return []; }
  const j = await res.json();
  return j?.payload?.Orders ?? [];
}

async function fetchNoonOrders(sinceIso: string): Promise<Array<Record<string, unknown>>> {
  const partnerCode = Deno.env.get('NOON_PARTNER_CODE');
  const apiKey = Deno.env.get('NOON_API_KEY');
  const endpoint = Deno.env.get('NOON_API_ENDPOINT') ?? 'https://api.noon.partners';
  if (!partnerCode || !apiKey) return [];
  const url = `${endpoint}/v3/partner/${partnerCode}/orders?created_after=${encodeURIComponent(sinceIso)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!res.ok) { console.error('[noon-orders]', res.status, await res.text()); return []; }
  const j = await res.json();
  return j?.data ?? j?.orders ?? [];
}

function normalizeAmazon(o: Record<string, unknown>) {
  const total = (o.OrderTotal as { Amount?: string } | undefined)?.Amount;
  const buyer = o.BuyerInfo as { BuyerName?: string; BuyerEmail?: string } | undefined;
  const ship = o.ShippingAddress as { City?: string; AddressLine1?: string; Phone?: string; CountryCode?: string; PostalCode?: string } | undefined;
  return {
    externalId: String(o.AmazonOrderId ?? ''),
    company_name: buyer?.BuyerName ?? 'Amazon Buyer',
    contact_name: buyer?.BuyerName ?? 'Amazon Buyer',
    email: buyer?.BuyerEmail ?? null,
    phone: ship?.Phone ?? '',
    city: ship?.City ?? '',
    address: ship?.AddressLine1 ?? '',
    country: ship?.CountryCode ?? 'SA',
    postal_code: ship?.PostalCode ?? null,
    grand_total: total ? Number(total) : 0,
  };
}

function normalizeNoon(o: Record<string, unknown>) {
  const c = (o.customer as Record<string, string> | undefined) ?? {};
  const a = (o.shipping_address as Record<string, string> | undefined) ?? {};
  return {
    externalId: String(o.order_nr ?? o.id ?? ''),
    company_name: c.name ?? 'Noon Buyer',
    contact_name: c.name ?? 'Noon Buyer',
    email: c.email ?? null,
    phone: c.phone ?? '',
    city: a.city ?? '',
    address: a.address_line1 ?? '',
    country: a.country ?? 'SA',
    postal_code: a.postal_code ?? null,
    grand_total: Number(o.total ?? 0),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: channels } = await supabase
    .from('marketplace_channels').select('id, provider, name, last_sync_at').eq('active', true);

  const summary: Record<string, { imported: number; skipped: number }> = {};
  let amazonToken: string | null = null;

  for (const ch of channels ?? []) {
    summary[ch.name] = { imported: 0, skipped: 0 };
    const since = ch.last_sync_at ?? new Date(Date.now() - 60 * 60 * 1000).toISOString();
    let rawOrders: Array<Record<string, unknown>> = [];
    if (ch.provider === 'amazon') {
      amazonToken ??= await getAmazonAccessToken();
      if (amazonToken) rawOrders = await fetchAmazonOrders(amazonToken, since);
    } else if (ch.provider === 'noon') {
      rawOrders = await fetchNoonOrders(since);
    }

    for (const raw of rawOrders) {
      const n = ch.provider === 'amazon' ? normalizeAmazon(raw) : normalizeNoon(raw);
      if (!n.externalId) continue;

      const { data: existing } = await supabase.from('marketplace_orders')
        .select('id').eq('channel_id', ch.id).eq('external_order_id', n.externalId).maybeSingle();
      if (existing) { summary[ch.name].skipped++; continue; }

      const { data: order, error: orderErr } = await supabase.from('orders').insert({
        status: 'pending', product_type: 'marketplace',
        quantity: 1, unit: 'order',
        company_name: n.company_name, contact_name: n.contact_name,
        phone: n.phone, email: n.email, city: n.city, address: n.address,
        country: n.country, postal_code: n.postal_code,
        grand_total_sar: n.grand_total, payment_status: 'paid',
        notes: `${ch.name} (${ch.provider}) #${n.externalId}`,
      }).select('id').maybeSingle();
      if (orderErr) { console.error('[order-insert]', orderErr); continue; }

      await supabase.from('marketplace_orders').insert({
        channel_id: ch.id, external_order_id: n.externalId,
        order_id: order?.id ?? null, raw, status: 'imported',
      });
      summary[ch.name].imported++;
    }

    await supabase.from('marketplace_channels')
      .update({ last_sync_at: new Date().toISOString() }).eq('id', ch.id);
  }

  return new Response(JSON.stringify({ ok: true, summary }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
