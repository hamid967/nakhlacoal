import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';

const STATUS_AR: Record<string, { title: string; body: string }> = {
  new:        { title: 'تم استلام طلبك',  body: 'استلمنا طلبك بنجاح وسيتم مراجعته خلال وقت قصير.' },
  contacted:  { title: 'تم التواصل معك',  body: 'تواصلنا معك بخصوص طلبك، يرجى الرد لإكمال الإجراءات.' },
  confirmed:  { title: 'تم تأكيد طلبك',   body: 'طلبك مؤكد وقيد التجهيز الآن في مستودعنا بجدة.' },
  shipped:    { title: 'تم شحن طلبك',     body: 'طلبك في طريقه إليك. سنوافيك بتحديثات التتبع.' },
  completed:  { title: 'تم تسليم طلبك',   body: 'تم تسليم طلبك بنجاح. شكراً لثقتك بفحم النخلة 🌴' },
  cancelled:  { title: 'تم إلغاء الطلب',  body: 'تم إلغاء طلبك. للاستفسار راسلنا على mab355@gmail.com' },
};

function tpl(orderId: string, status: string, customer: string, summary: string) {
  const s = STATUS_AR[status] ?? { title: `تحديث حالة الطلب: ${status}`, body: '' };
  return `<!doctype html><html dir="rtl" lang="ar"><body style="margin:0;background:#f6f5ef;font-family:'Segoe UI',Tahoma,Arial,sans-serif;color:#1a1a1a">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5ef;padding:32px 0">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e8e4d6">
          <tr><td style="background:linear-gradient(135deg,#1A4A00,#0e2e00);padding:28px;text-align:center;color:#f4e4b2">
            <div style="font-size:13px;letter-spacing:6px;opacity:.7">PALM CHARCOAL</div>
            <div style="font-size:22px;font-weight:700;margin-top:6px">فحم النخلة</div>
          </td></tr>
          <tr><td style="padding:32px">
            <h1 style="margin:0 0 12px;font-size:22px;color:#1A4A00">${s.title}</h1>
            <p style="margin:0 0 16px;line-height:1.8;color:#333">عميلنا العزيز ${customer || ''}،</p>
            <p style="margin:0 0 20px;line-height:1.8;color:#333">${s.body}</p>
            <div style="background:#f6f5ef;border-radius:12px;padding:16px;margin:20px 0">
              <div style="font-size:12px;color:#8a8674;letter-spacing:2px;margin-bottom:6px">ORDER</div>
              <div style="font-size:16px;font-weight:600">#${orderId.slice(0,8).toUpperCase()}</div>
              ${summary ? `<div style="margin-top:10px;color:#555;font-size:14px">${summary}</div>` : ''}
            </div>
            <p style="font-size:13px;color:#888;margin:24px 0 0">للاستفسارات: واتساب 0540060095 · mab355@gmail.com</p>
          </td></tr>
          <tr><td style="background:#0e2e00;color:#bfae74;padding:16px;text-align:center;font-size:11px;letter-spacing:3px">
            © ${new Date().getFullYear()} PALM CHARCOAL · JEDDAH, KSA
          </td></tr>
        </table>
      </td></tr>
    </table></body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: claims, error: authErr } = await supabase.auth.getClaims(authHeader.replace('Bearer ', ''));
    if (authErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { orderId, status } = await req.json();
    if (!orderId || !status) {
      return new Response(JSON.stringify({ error: 'orderId and status are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: order } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (!order?.email) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no email' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'Resend connector not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const summary = `${order.product_type} · ${order.quantity} ${order.unit}` +
      (order.grand_total_sar ? ` · الإجمالي شامل الضريبة: ${Number(order.grand_total_sar).toFixed(2)} ر.س` : '');
    const html = tpl(order.id, status, order.contact_name || order.company_name || '', summary);
    const subject = (STATUS_AR[status]?.title ?? 'تحديث حالة الطلب') + ` — #${order.id.slice(0,8).toUpperCase()}`;

    const r = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: 'Palm Charcoal <onboarding@resend.dev>',
        to: [order.email],
        subject,
        html,
      }),
    });
    const body = await r.json().catch(() => ({}));
    if (!r.ok) {
      console.error('resend error', r.status, body);
      return new Response(JSON.stringify({ error: 'send failed', detail: body }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify({ ok: true, id: body?.id }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
