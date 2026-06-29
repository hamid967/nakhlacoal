import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const SECRET = Deno.env.get('RECAPTCHA_SECRET_KEY');
const MIN_SCORE = 0.5;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    if (!SECRET) {
      return new Response(JSON.stringify({ success: false, error: 'server_misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { token, action } = await req.json().catch(() => ({}));
    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'missing_token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = new URLSearchParams({ secret: SECRET, response: token });
    const r = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      body,
    });
    const data = (await r.json()) as {
      success: boolean;
      score?: number;
      action?: string;
      'error-codes'?: string[];
    };

    const okAction = !action || !data.action || data.action === action;
    const okScore = typeof data.score === 'number' ? data.score >= MIN_SCORE : true;
    const success = Boolean(data.success) && okAction && okScore;

    return new Response(
      JSON.stringify({ success, score: data.score ?? null, action: data.action ?? null }),
      {
        status: success ? 200 : 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (_e) {
    return new Response(JSON.stringify({ success: false, error: 'verify_failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
