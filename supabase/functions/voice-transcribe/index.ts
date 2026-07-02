// Lovable AI STT proxy (multipart audio in → JSON transcript out)
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

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

    const inbound = await req.formData();
    const file = inbound.get('file');
    if (!(file instanceof File) && !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: 'file field required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const size = (file as Blob).size;
    if (size < 1024) {
      return new Response(JSON.stringify({ error: 'audio too short' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (size > 25 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'audio too large (>25MB)' }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const type = (file as Blob).type || 'audio/webm';
    const ext =
      ({ 'audio/webm': 'webm', 'audio/mp4': 'mp4', 'audio/mpeg': 'mp3', 'audio/wav': 'wav', 'audio/ogg': 'ogg' } as Record<string, string>)[
        type.split(';')[0]
      ] ?? 'webm';

    const upstream = new FormData();
    upstream.append('model', 'openai/gpt-4o-mini-transcribe');
    upstream.append('file', file, `voice.${ext}`);
    const lang = inbound.get('language');
    if (typeof lang === 'string' && /^[a-z]{2}$/.test(lang)) upstream.append('language', lang);

    const res = await fetch('https://ai.gateway.lovable.dev/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}` },
      body: upstream,
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      return new Response(JSON.stringify({ error: `STT ${res.status}`, detail: txt }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const json = await res.json();
    return new Response(JSON.stringify({ text: json.text ?? '' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
