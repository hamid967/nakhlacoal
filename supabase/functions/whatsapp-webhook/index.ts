// WhatsApp Business Cloud API webhook receiver.
// - Verifies Meta subscription challenge on GET.
// - Ingests inbound messages/statuses on POST and stores them
//   into whatsapp_conversations + whatsapp_messages.
// Runs with verify_jwt=false (Meta cannot send Supabase JWT).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VERIFY_TOKEN = Deno.env.get('META_WABA_VERIFY_TOKEN') ?? 'change-me';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  // Meta verification handshake
  if (req.method === 'GET') {
    const u = new URL(req.url);
    const mode = u.searchParams.get('hub.mode');
    const token = u.searchParams.get('hub.verify_token');
    const challenge = u.searchParams.get('hub.challenge');
    if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
      return new Response(challenge, { status: 200 });
    }
    return new Response('forbidden', { status: 403 });
  }

  if (req.method !== 'POST') {
    return new Response('method not allowed', { status: 405, headers: corsHeaders });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  try {
    const payload = await req.json();
    const entries = payload?.entry ?? [];
    for (const e of entries) {
      for (const change of e.changes ?? []) {
        const value = change.value ?? {};
        for (const msg of value.messages ?? []) {
          const phone: string = msg.from;
          const body: string = msg.text?.body ?? '[media]';
          const waId: string = msg.id;

          // Upsert conversation
          const { data: conv } = await supabase
            .from('whatsapp_conversations')
            .upsert(
              {
                customer_phone: phone,
                last_message_at: new Date().toISOString(),
                last_message_preview: body.slice(0, 140),
                status: 'open',
              },
              { onConflict: 'customer_phone' }
            )
            .select('id')
            .single();
          if (!conv) continue;

          await supabase.from('whatsapp_messages').insert({
            conversation_id: conv.id,
            direction: 'inbound',
            body,
            wa_message_id: waId,
            status: 'delivered',
          });
        }
      }
    }
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[whatsapp-webhook]', err);
    return new Response(JSON.stringify({ error: 'invalid_payload' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
