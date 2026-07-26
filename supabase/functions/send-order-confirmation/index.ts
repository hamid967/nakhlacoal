// Auto-triggered order confirmation email (no auth; called by DB trigger via pg_net).
import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail, brandedShell, esc } from '../_shared/email-sender.ts';

const TEMPLATE = 'order-confirmation';

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jhdr = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const { orderId } = await req.json().catch(() => ({}));
    if (!orderId || typeof orderId !== 'string') {
      return new Response(JSON.stringify({ error: 'orderId required' }), { status: 400, headers: jhdr });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Feature toggle
    const { data: settings } = await admin
      .from('email_settings').select('auto_order_confirmation').eq('id', true).maybeSingle();
    if (settings && settings.auto_order_confirmation === false) {
      return new Response(JSON.stringify({ skipped: true, reason: 'disabled' }), { headers: jhdr });
    }

    // Dedupe: only send once per order
    const { data: prior } = await admin
      .from('email_log').select('id')
      .eq('template', TEMPLATE).eq('entity_id', orderId).eq('status', 'sent').limit(1);
    if (prior && prior.length) {
      return new Response(JSON.stringify({ skipped: true, reason: 'already sent' }), { headers: jhdr });
    }

    const { data: order } = await admin.from('orders').select('*').eq('id', orderId).maybeSingle();
    if (!order?.email) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no email' }), { headers: jhdr });
    }

    const oid = String(order.id).slice(0, 8).toUpperCase();
    const summary = `${esc(order.product_type)} · ${esc(order.quantity)} ${esc(order.unit)}` +
      (order.grand_total_sar ? ` · الإجمالي شامل الضريبة: ${Number(order.grand_total_sar).toFixed(2)} ر.س` : '');

    const html = brandedShell({
      title: 'تم استلام طلبك بنجاح 🌴',
      bodyHtml: `
        <p style="margin:0 0 16px;line-height:1.9;color:#333">
          عميلنا العزيز ${esc(order.contact_name || order.company_name || '')}،
        </p>
        <p style="margin:0 0 12px;line-height:1.9;color:#333">
          شكراً لطلبك من <strong>فحم النخلة</strong>. تم استلام طلبك وسيقوم فريقنا بمراجعته والتواصل معك خلال ساعات العمل لتأكيد التفاصيل وترتيب الشحن.
        </p>
        <p style="margin:0 0 20px;line-height:1.9;color:#333">
          يمكنك متابعة حالة الطلب في أي وقت من حسابك في الموقع.
        </p>`,
      cardLabel: 'ORDER',
      cardValue: `#${oid}`,
      cardExtra: summary,
    });

    const result = await sendEmail({
      template: TEMPLATE,
      to: order.email,
      subject: `تم استلام طلبك — #${oid} · فحم النخلة`,
      html,
      entityType: 'order',
      entityId: order.id,
      metadata: { auto: true },
      admin,
    });

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error, details: result.details }), { status: 502, headers: jhdr });
    }
    return new Response(JSON.stringify({ ok: true, id: result.id }), { headers: jhdr });
  } catch (e) {
    console.error('[send-order-confirmation] error:', e);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: jhdr });
  }
});
