import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

const STATUS_AR: Record<string, { title: string; body: (price: number | null) => string }> = {
  new: {
    title: 'استلمنا طلب عرض السعر',
    body: () => 'وصلنا طلبك بنجاح. سيقوم فريق المبيعات بمراجعة الكميّة وإعداد أفضل عرض خلال وقت قصير.',
  },
  under_review: {
    title: 'عرض السعر قيد المراجعة',
    body: () => 'يعمل فريقنا حالياً على تسعير طلبك بناءً على الكميّة والوجهة المطلوبة.',
  },
  priced: {
    title: 'تم إعداد عرض السعر',
    body: (p) =>
      p
        ? `يسرّنا تقديم عرض السعر التالي: <b>${Number(p).toFixed(2)} ر.س</b> للوحدة (شامل ضريبة القيمة المضافة عند التطبيق). العرض ساري لمدة 7 أيام.`
        : 'تم إعداد عرض السعر الخاص بك، يرجى مراجعته عبر حسابك في بوابة العملاء.',
  },
  accepted: {
    title: 'تم قبول عرض السعر',
    body: () => 'شكراً لقبولك العرض! سيتواصل معك فريقنا لإتمام إجراءات الدفع والشحن.',
  },
  rejected: {
    title: 'تم إغلاق عرض السعر',
    body: () => 'تم إغلاق طلب عرض السعر. إذا كنت ترغب بمناقشة الأسعار أو الشروط راسلنا مباشرة.',
  },
  converted_to_order: {
    title: 'تم تحويل عرض السعر إلى طلب',
    body: () => 'ممتاز! تم إنشاء طلب رسمي بناءً على العرض المتفق عليه. ستصلك تحديثات حالة الطلب تباعاً.',
  },
};

const ALLOWED = Object.keys(STATUS_AR);

function esc(v: string): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function tpl(q: any, status: string) {
  const s = STATUS_AR[status];
  const price = q.quoted_price_sar ? Number(q.quoted_price_sar) : null;
  const name = esc(q.full_name || q.company_name || '');
  const qid = esc(String(q.id).slice(0, 8).toUpperCase());
  const details = `${esc(q.product)} · ${esc(String(q.quantity))} ${esc(q.unit)}` +
    (q.destination ? ` · ${esc(q.destination)}` : '');
  return `<!doctype html><html dir="rtl" lang="ar"><body style="margin:0;background:#f6f5ef;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#1a1a1a">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5ef;padding:32px 0"><tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e4d6">
        <tr><td style="background:linear-gradient(135deg,#1A4A00,#0e2e00);padding:28px;text-align:center;color:#f4e4b2">
          <div style="font-size:13px;letter-spacing:6px;opacity:.7">PALM CHARCOAL</div>
          <div style="font-size:22px;font-weight:700;margin-top:6px">فحم النخلة</div>
        </td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 12px;font-size:22px;color:#1A4A00">${s.title}</h1>
          <p style="margin:0 0 16px;line-height:1.8;color:#333">عميلنا العزيز ${name},</p>
          <p style="margin:0 0 20px;line-height:1.8;color:#333">${s.body(price)}</p>
          <div style="background:#f6f5ef;border-radius:12px;padding:16px;margin:20px 0">
            <div style="font-size:12px;color:#8a8674;letter-spacing:2px;margin-bottom:6px">QUOTE</div>
            <div style="font-size:16px;font-weight:600">#${qid}</div>
            <div style="margin-top:10px;color:#555;font-size:14px">${details}</div>
          </div>
          <p style="font-size:13px;color:#888;margin:24px 0 0">للاستفسارات: واتساب 0540060095 · mab355@gmail.com</p>
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

    const { quoteId, status } = await req.json();
    if (!quoteId || typeof quoteId !== 'string' || !status || typeof status !== 'string') {
      return new Response(JSON.stringify({ error: 'quoteId and status are required' }), { status: 400, headers: jhdr });
    }
    if (!ALLOWED.includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400, headers: jhdr });
    }

    const { data: q } = await admin.from('quote_requests').select('*').eq('id', quoteId).maybeSingle();
    if (!q?.email) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no email' }), { headers: jhdr });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), { status: 500, headers: jhdr });
    }

    const subject = `${STATUS_AR[status].title} — #${String(q.id).slice(0, 8).toUpperCase()}`;
    const html = tpl(q, status);

    const r = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'Palm Charcoal <onboarding@resend.dev>',
        to: [q.email],
        subject,
        html,
      }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('resend error', r.status, body);
      return new Response(JSON.stringify({ error: 'send failed', details: body }), { status: 502, headers: jhdr });
    }
    return new Response(JSON.stringify({ ok: true, id: body?.id }), { headers: jhdr });
  } catch (e) {
    console.error('[send-quote-status-email] error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: jhdr });
  }
});
