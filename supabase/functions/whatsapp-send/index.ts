// Send a WhatsApp message via Meta Cloud API.
// Body: { to: E164 phone, template?: string, body?: string, language?: 'ar'|'en' }
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'https://esm.sh/zod@3.23.8';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WABA_TOKEN = Deno.env.get('META_WABA_TOKEN');
const WABA_PHONE_ID = Deno.env.get('META_WABA_PHONE_ID');

const Body = z.object({
  to: z.string().regex(/^\+?\d{8,15}$/),
  body: z.string().min(1).max(4000).optional(),
  template: z.string().min(1).max(120).optional(),
  language: z.enum(['ar', 'en']).default('ar'),
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405, headers: corsHeaders });

  const parsed = Body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const { to, body, template, language } = parsed.data;

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const phone = to.replace(/\D/g, '');

  const { data: conv } = await supabase
    .from('whatsapp_conversations')
    .upsert(
      { customer_phone: phone, last_message_at: new Date().toISOString(), last_message_preview: (body ?? template ?? '').slice(0, 140), status: 'open' },
      { onConflict: 'customer_phone' }
    )
    .select('id')
    .single();

  if (!WABA_TOKEN || !WABA_PHONE_ID) {
    // Test mode — record intent only.
    if (conv) {
      await supabase.from('whatsapp_messages').insert({
        conversation_id: conv.id,
        direction: 'outbound',
        body: body ?? null,
        template_name: template ?? null,
        status: 'queued',
        error: 'meta_not_configured',
      });
    }
    return new Response(JSON.stringify({ ok: true, mode: 'test' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const payload = template
    ? { messaging_product: 'whatsapp', to: phone, type: 'template', template: { name: template, language: { code: language === 'ar' ? 'ar_SA' : 'en_US' } } }
    : { messaging_product: 'whatsapp', to: phone, type: 'text', text: { body: body ?? '' } };

  const res = await fetch(`https://graph.facebook.com/v20.0/${WABA_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${WABA_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const out = await res.json().catch(() => ({}));

  if (conv) {
    await supabase.from('whatsapp_messages').insert({
      conversation_id: conv.id,
      direction: 'outbound',
      body: body ?? null,
      template_name: template ?? null,
      status: res.ok ? 'sent' : 'failed',
      wa_message_id: out?.messages?.[0]?.id ?? null,
      error: res.ok ? null : JSON.stringify(out).slice(0, 500),
    });
  }

  return new Response(JSON.stringify({ ok: res.ok, response: out }), {
    status: res.ok ? 200 : 502,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
