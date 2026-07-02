// Lovable AI TTS — returns audio/mpeg (mp3) for easy <audio> playback
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const MAX_INPUT = 3500;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const key = Deno.env.get('LOVABLE_API_KEY');
    if (!key) {
      return new Response(JSON.stringify({ error: 'Missing LOVABLE_API_KEY' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { text, voice, lang } = await req.json().catch(() => ({}));
    if (typeof text !== 'string' || !text.trim()) {
      return new Response(JSON.stringify({ error: 'text required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const clean = text.replace(/```[\s\S]*?```/g, ' ').replace(/[#*_>`~]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, MAX_INPUT);

    const res = await fetch('https://ai.gateway.lovable.dev/v1/audio/speech', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini-tts',
        input: clean,
        voice: voice || 'alloy',
        response_format: 'mp3',
        instructions: lang === 'ar' ? 'اقرأ بلهجة عربية فصحى دافئة وواضحة.' : 'Read in a warm, refined English tone.',
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return new Response(JSON.stringify({ error: `TTS ${res.status}`, detail: txt }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(res.body, {
      headers: { ...corsHeaders, 'Content-Type': 'audio/mpeg', 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
