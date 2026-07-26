// Auto-triggered shipment notification email (no auth; called by DB trigger via pg_net,
// and manually resendable from the admin dashboard).
import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail, brandedShell, esc } from '../_shared/email-sender.ts';

const TEMPLATE = 'shipment-notification';

const STATUS_LABELS: Record<string, string> = {
  pending: 'قيد التجهيز',
  shipped: 'تم الشحن 🚚',
  in_transit: 'قيد النقل',
  out_for_delivery: 'خرج للتوصيل',
  delivered: 'تم التسليم ✅',
  returned: 'مرتجعة',
};

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jhdr = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const { shipmentId, status: statusOverride, force } = await req.json().catch(() => ({}));
    if (!shipmentId || typeof shipmentId !== 'string') {
      return new Response(JSON.stringify({ error: 'shipmentId required' }), { status: 400, headers: jhdr });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Feature toggle (respected only for auto-triggered sends; manual resend bypasses)
    if (!force) {
      const { data: settings } = await admin
        .from('email_settings').select('auto_shipment_notification').eq('id', true).maybeSingle();
      if (settings && settings.auto_shipment_notification === false) {
        return new Response(JSON.stringify({ skipped: true, reason: 'disabled' }), { headers: jhdr });
      }
    }

    const { data: shipment } = await admin.from('shipments').select('*').eq('id', shipmentId).maybeSingle();
    if (!shipment) {
      return new Response(JSON.stringify({ error: 'shipment not found' }), { status: 404, headers: jhdr });
    }
    if (!shipment.tracking_no) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no tracking_no' }), { headers: jhdr });
    }

    // Resolve recipient email from linked order
    let email: string | null = null;
    let contactName: string | null = shipment.recipient_name ?? null;
    let orderRef: string | null = null;
    if (shipment.order_id) {
      const { data: order } = await admin.from('orders')
        .select('id,email,contact_name,company_name').eq('id', shipment.order_id).maybeSingle();
      if (order) {
        email = order.email ?? null;
        contactName = contactName || order.contact_name || order.company_name || null;
        orderRef = order.id ? `#${String(order.id).slice(0, 8).toUpperCase()}` : null;
      }
    }
    if (!email) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no email' }), { headers: jhdr });
    }

    const status = (statusOverride || shipment.status || 'shipped') as string;
    const statusLabel = STATUS_LABELS[status] ?? status;

    // Dedupe: skip if same shipment+status already sent (unless force)
    if (!force) {
      const { data: prior } = await admin
        .from('email_log').select('id,metadata')
        .eq('template', TEMPLATE).eq('entity_id', shipmentId).eq('status', 'sent').limit(20);
      const already = (prior ?? []).some((r: any) => r?.metadata?.shipment_status === status);
      if (already) {
        return new Response(JSON.stringify({ skipped: true, reason: 'already sent for status' }), { headers: jhdr });
      }
    }

    const trackingUrl = shipment.tracking_url && String(shipment.tracking_url).trim().length > 0
      ? String(shipment.tracking_url)
      : null;

    const detailsRows: string[] = [];
    if (shipment.carrier) detailsRows.push(`<div><b>الناقل:</b> ${esc(shipment.carrier)}</div>`);
    detailsRows.push(`<div style="direction:ltr;text-align:right"><b>رقم التتبع:</b> <code style="background:#f6f5ef;padding:2px 6px;border-radius:4px">${esc(shipment.tracking_no)}</code></div>`);
    if (shipment.origin_city || shipment.destination_city) {
      detailsRows.push(`<div><b>الوجهة:</b> ${esc(shipment.origin_city ?? '—')} ← ${esc(shipment.destination_city ?? '—')}</div>`);
    }
    if (orderRef) detailsRows.push(`<div><b>مرجع الطلب:</b> ${esc(orderRef)}</div>`);

    const cta = trackingUrl ? `
      <div style="margin:24px 0 8px;text-align:center">
        <a href="${esc(trackingUrl)}" style="display:inline-block;background:#1A4A00;color:#f4e4b2;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;letter-spacing:1px">
          تتبّع الشحنة
        </a>
      </div>` : '';

    const html = brandedShell({
      title: `تحديث الشحن: ${statusLabel}`,
      bodyHtml: `
        <p style="margin:0 0 16px;line-height:1.9;color:#333">
          عميلنا العزيز ${esc(contactName || '')}،
        </p>
        <p style="margin:0 0 12px;line-height:1.9;color:#333">
          نودّ إعلامك بأن شحنتك من <strong>فحم النخلة</strong> ${status === 'delivered' ? 'قد وصلت إلى وجهتها بنجاح.' : 'قيد التنفيذ.'} فيما يلي تفاصيل التتبع:
        </p>
        <div style="line-height:2;color:#333;font-size:14px">
          ${detailsRows.join('')}
        </div>
        ${cta}
        <p style="margin:20px 0 0;line-height:1.9;color:#666;font-size:13px">
          إذا واجهت أي مشكلة في التتبع أو التسليم، يرجى التواصل معنا مباشرةً.
        </p>`,
      cardLabel: 'SHIPMENT STATUS',
      cardValue: statusLabel,
      cardExtra: shipment.tracking_no ? `Tracking · ${esc(shipment.tracking_no)}` : undefined,
    });

    const result = await sendEmail({
      template: TEMPLATE,
      to: email,
      subject: `تحديث الشحن ${orderRef ? `— ${orderRef}` : ''} · ${statusLabel}`,
      html,
      entityType: 'shipment',
      entityId: shipment.id,
      metadata: {
        auto: !force,
        shipment_status: status,
        tracking_no: shipment.tracking_no,
        carrier: shipment.carrier,
        order_id: shipment.order_id,
      },
      admin,
    });

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error, details: result.details }), { status: 502, headers: jhdr });
    }
    return new Response(JSON.stringify({ ok: true, id: result.id }), { headers: jhdr });
  } catch (e: any) {
    console.error('[send-shipment-notification] exception:', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: jhdr });
  }
});
