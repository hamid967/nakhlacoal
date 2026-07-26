import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail, brandedShell, esc } from '../_shared/email-sender.ts';

const STATUS_AR: Record<string, { title: string; body: string }> = {
  new:        { title: 'تم استلام طلبك',  body: 'استلمنا طلبك بنجاح وسيتم مراجعته خلال وقت قصير.' },
  contacted:  { title: 'تم التواصل معك',  body: 'تواصلنا معك بخصوص طلبك، يرجى الرد لإكمال الإجراءات.' },
  confirmed:  { title: 'تم تأكيد طلبك',   body: 'طلبك مؤكد وقيد التجهيز الآن في مستودعنا بجدة.' },
  shipped:    { title: 'تم شحن طلبك',     body: 'طلبك في طريقه إليك. سنوافيك بتحديثات التتبع.' },
  completed:  { title: 'تم تسليم طلبك',   body: 'تم تسليم طلبك بنجاح. شكراً لثقتك بفحم النخلة 🌴' },
  cancelled:  { title: 'تم إلغاء الطلب',  body: 'تم إلغاء طلبك. للاستفسار راسلنا على mab355@gmail.com' },
};
const ALLOWED_STATUSES = Object.keys(STATUS_AR);

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
    const userId = claims.claims.sub as string;
    const { data: isAdmin, error: roleErr } = await admin.rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (roleErr || !isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: jhdr });
    }

    const { orderId, status } = await req.json();
    if (!orderId || typeof orderId !== 'string' || !status || typeof status !== 'string') {
      return new Response(JSON.stringify({ error: 'orderId and status are required' }), { status: 400, headers: jhdr });
    }
    if (!ALLOWED_STATUSES.includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status' }), { status: 400, headers: jhdr });
    }

    const { data: order } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (!order?.email) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no email' }), { headers: jhdr });
    }

    const s = STATUS_AR[status];
    const oid = String(order.id).slice(0, 8).toUpperCase();
    const summary = `${esc(order.product_type)} · ${esc(order.quantity)} ${esc(order.unit)}` +
      (order.grand_total_sar ? ` · الإجمالي شامل الضريبة: ${Number(order.grand_total_sar).toFixed(2)} ر.س` : '');
    const html = brandedShell({
      title: s.title,
      bodyHtml: `<p style="margin:0 0 16px;line-height:1.8;color:#333">عميلنا العزيز ${esc(order.contact_name || order.company_name || '')},</p>
        <p style="margin:0 0 20px;line-height:1.8;color:#333">${s.body}</p>`,
      cardLabel: 'ORDER',
      cardValue: `#${oid}`,
      cardExtra: summary,
    });

    const result = await sendEmail({
      template: `order-${status}`,
      to: order.email,
      subject: `${s.title} — #${oid}`,
      html,
      entityType: 'order',
      entityId: order.id,
      triggeredBy: userId,
      metadata: { status },
      admin,
    });

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error, details: result.details }), { status: 502, headers: jhdr });
    }
    return new Response(JSON.stringify({ ok: true, id: result.id }), { headers: jhdr });
  } catch (e) {
    console.error('[send-order-status-email] error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: jhdr });
  }
});
