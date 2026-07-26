import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

function tpl(to: string) {
  return `<!doctype html><html dir="rtl" lang="ar"><body style="margin:0;background:#f6f5ef;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#1a1a1a">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5ef;padding:32px 0"><tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e4d6">
        <tr><td style="background:linear-gradient(135deg,#1A4A00,#0e2e00);padding:28px;text-align:center;color:#f4e4b2">
          <div style="font-size:13px;letter-spacing:6px;opacity:.7">PALM CHARCOAL</div>
          <div style="font-size:22px;font-weight:700;margin-top:6px">فحم النخلة</div>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 12px;font-size:22px;color:#1A4A00">اختبار إرسال البريد ✅</h1>
          <p style="margin:0 0 16px;line-height:1.8;color:#333">هذه رسالة اختبارية من لوحة الإدارة للتحقق من إعدادات Resend والنطاق الموثّق.</p>
          <div style="background:#f6f5ef;border-radius:12px;padding:16px;margin:20px 0">
            <div style="font-size:12px;color:#8a8674;letter-spacing:2px;margin-bottom:6px">RECIPIENT</div>
            <div style="font-size:15px;font-weight:600">${to}</div>
            <div style="margin-top:10px;color:#555;font-size:13px">وقت الإرسال: ${new Date().toISOString()}</div>
          </div>
          <p style="font-size:13px;color:#888;margin:24px 0 0">إذا وصلتك هذه الرسالة، فإن التكامل يعمل بشكل صحيح.</p>
        </td></tr>
        <tr><td style="background:#0e2e00;color:#bfae74;padding:16px;text-align:center;font-size:11px;letter-spacing:3px">
          © ${new Date().getFullYear()} PALM CHARCOAL · JEDDAH, KSA
        </td></tr>
      </table>
    </td></tr></table></body></html>`;
}

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jhdr = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: jhdr });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error: authErr } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (authErr || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: jhdr });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: isAdmin, error: roleErr } = await admin.rpc('has_role', {
      _user_id: claims.claims.sub,
      _role: 'admin',
    });
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: jhdr });
    }

    const { to } = await req.json();
    const email = String(to ?? '').trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'Valid email required' }), { status: 400, headers: jhdr });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500, headers: jhdr });
    }

    const r = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'فحم النخلة | Palm Charcoal <no-reply@notify.alnakhlacoal.com>',
        reply_to: 'mab355@gmail.com',
        to: [email],
        subject: 'اختبار إرسال البريد — فحم النخلة',
        html: tpl(email),
      }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('resend test error', r.status, body);
      return new Response(
        JSON.stringify({ error: 'send failed', status: r.status, details: body }),
        { status: 502, headers: jhdr },
      );
    }
    return new Response(JSON.stringify({ ok: true, id: body?.id, to: email }), { headers: jhdr });
  } catch (e) {
    console.error('[send-test-email] error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: jhdr });
  }
});
