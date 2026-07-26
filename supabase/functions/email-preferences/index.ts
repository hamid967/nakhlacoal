// Public endpoint for managing email subscription preferences via unsubscribe token.
// - GET  ?token=xxx           -> current preferences
// - POST { token, prefs }     -> update preferences
// - POST { token, all: true } -> unsubscribe from everything
import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const CATEGORY_COLS = [
  'order_updates',
  'shipment_updates',
  'invoice_receipts',
  'quote_updates',
  'marketing',
] as const;

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req, 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jhdr = { ...corsHeaders, 'Content-Type': 'application/json' };

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  try {
    const url = new URL(req.url);
    let token = url.searchParams.get('token') ?? '';
    let body: any = null;
    if (req.method === 'POST') {
      body = await req.json().catch(() => ({}));
      token = token || String(body?.token ?? '');
    }
    if (!token || token.length < 8) {
      return new Response(JSON.stringify({ error: 'invalid token' }), { status: 400, headers: jhdr });
    }

    const { data: row } = await admin
      .from('email_preferences')
      .select('email, order_updates, shipment_updates, invoice_receipts, quote_updates, marketing, unsubscribed_all')
      .eq('unsubscribe_token', token)
      .maybeSingle();

    if (!row) {
      return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: jhdr });
    }

    if (req.method === 'GET') {
      return new Response(JSON.stringify({ ok: true, email: row.email, prefs: row }), { headers: jhdr });
    }

    // POST -> update
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body?.all === true) {
      patch.unsubscribed_all = true;
      for (const c of CATEGORY_COLS) patch[c] = false;
    } else if (body?.prefs && typeof body.prefs === 'object') {
      for (const c of CATEGORY_COLS) {
        if (typeof body.prefs[c] === 'boolean') patch[c] = body.prefs[c];
      }
      if (typeof body.prefs.unsubscribed_all === 'boolean') patch.unsubscribed_all = body.prefs.unsubscribed_all;
    } else {
      return new Response(JSON.stringify({ error: 'nothing to update' }), { status: 400, headers: jhdr });
    }

    const { error } = await admin
      .from('email_preferences')
      .update(patch)
      .eq('unsubscribe_token', token);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: jhdr });
    }
    return new Response(JSON.stringify({ ok: true }), { headers: jhdr });
  } catch (e) {
    console.error('[email-preferences] error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: jhdr });
  }
});
