// Admin-only email template preview. Renders the exact HTML/subject
// that would be sent, using either a real record (entityId) or sample data.
import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { brandedShell, esc } from '../_shared/email-sender.ts';

// ---------- sample fixtures ----------
const SAMPLE_ORDER = {
  id: 'sample00-0000-0000-0000-000000000abc',
  contact_name: 'أحمد المطيري',
  company_name: 'مطاعم النخيل',
  email: 'sample@alnakhlacoal.com',
  product_type: 'فحم النخلة الفاخر',
  quantity: 25,
  unit: 'كرتون',
  grand_total_sar: 3450.75,
};
const SAMPLE_SHIPMENT = {
  id: 'sample00-0000-0000-0000-000000000ship',
  status: 'in_transit',
  tracking_no: 'SPL-8830-KSA',
  tracking_url: 'https://track.example.com/SPL-8830-KSA',
  carrier: 'SMSA Express',
  origin_city: 'جدة',
  destination_city: 'الرياض',
  recipient_name: 'أحمد المطيري',
  order_id: SAMPLE_ORDER.id,
};
const SAMPLE_QUOTE = {
  id: 'sample00-0000-0000-0000-000000000qot',
  full_name: 'خالد الأنصاري',
  company_name: 'شركة الأنصاري للضيافة',
  email: 'sample@alnakhlacoal.com',
  product: 'فحم النخلة — Grade A',
  quantity: 500,
  unit: 'كرتون',
  destination: 'الدمام',
  quoted_price_sar: 118.50,
};
const SAMPLE_INVOICE = {
  id: 'sample00-0000-0000-0000-000000000inv',
  invoice_no: 'INV-2026-0001',
  issue_date: new Date().toISOString().slice(0, 10),
  due_date: null,
  seller_name: 'فحم النخلة | Palm Charcoal',
  seller_vat_number: '3000000000003',
  seller_cr: '4030000000',
  buyer_name: SAMPLE_ORDER.company_name,
  buyer_vat_number: '3000000000101',
  subtotal_sar: 3000,
  vat_rate: 0.15,
  vat_amount_sar: 450,
  grand_total_sar: 3450,
  currency: 'SAR',
  status: 'issued',
};

// ---------- shared render helpers (mirror the live templates) ----------
function renderOrderConfirmation(order: any) {
  const oid = String(order.id).slice(0, 8).toUpperCase();
  const summary = `${esc(order.product_type)} · ${esc(order.quantity)} ${esc(order.unit)}` +
    (order.grand_total_sar ? ` · الإجمالي شامل الضريبة: ${Number(order.grand_total_sar).toFixed(2)} ر.س` : '');
  const html = brandedShell({
    title: 'تم استلام طلبك بنجاح 🌴',
    bodyHtml: `
      <p style="margin:0 0 16px;line-height:1.9;color:#333">عميلنا العزيز ${esc(order.contact_name || order.company_name || '')}،</p>
      <p style="margin:0 0 12px;line-height:1.9;color:#333">
        شكراً لطلبك من <strong>فحم النخلة</strong>. تم استلام طلبك وسيقوم فريقنا بمراجعته والتواصل معك خلال ساعات العمل لتأكيد التفاصيل وترتيب الشحن.
      </p>
      <p style="margin:0 0 20px;line-height:1.9;color:#333">يمكنك متابعة حالة الطلب في أي وقت من حسابك في الموقع.</p>`,
    cardLabel: 'ORDER', cardValue: `#${oid}`, cardExtra: summary,
  });
  return { subject: `تم استلام طلبك — #${oid} · فحم النخلة`, html };
}

const SHIP_LABELS: Record<string, string> = {
  pending: 'قيد التجهيز', shipped: 'تم الشحن 🚚', in_transit: 'قيد النقل',
  out_for_delivery: 'خرج للتوصيل', delivered: 'تم التسليم ✅', returned: 'مرتجعة',
};
function renderShipment(shipment: any, orderRef: string | null, contactName: string | null) {
  const status = String(shipment.status || 'shipped');
  const statusLabel = SHIP_LABELS[status] ?? status;
  const trackingUrl = shipment.tracking_url && String(shipment.tracking_url).trim().length > 0 ? String(shipment.tracking_url) : null;
  const rows: string[] = [];
  if (shipment.carrier) rows.push(`<div><b>الناقل:</b> ${esc(shipment.carrier)}</div>`);
  rows.push(`<div style="direction:ltr;text-align:right"><b>رقم التتبع:</b> <code style="background:#f6f5ef;padding:2px 6px;border-radius:4px">${esc(shipment.tracking_no)}</code></div>`);
  if (shipment.origin_city || shipment.destination_city) rows.push(`<div><b>الوجهة:</b> ${esc(shipment.origin_city ?? '—')} ← ${esc(shipment.destination_city ?? '—')}</div>`);
  if (orderRef) rows.push(`<div><b>مرجع الطلب:</b> ${esc(orderRef)}</div>`);
  const cta = trackingUrl ? `<div style="margin:24px 0 8px;text-align:center"><a href="${esc(trackingUrl)}" style="display:inline-block;background:#1A4A00;color:#f4e4b2;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;letter-spacing:1px">تتبّع الشحنة</a></div>` : '';
  const html = brandedShell({
    title: `تحديث الشحن: ${statusLabel}`,
    bodyHtml: `<p style="margin:0 0 16px;line-height:1.9;color:#333">عميلنا العزيز ${esc(contactName || '')}،</p>
      <p style="margin:0 0 12px;line-height:1.9;color:#333">نودّ إعلامك بأن شحنتك من <strong>فحم النخلة</strong> ${status === 'delivered' ? 'قد وصلت إلى وجهتها بنجاح.' : 'قيد التنفيذ.'} فيما يلي تفاصيل التتبع:</p>
      <div style="line-height:2;color:#333;font-size:14px">${rows.join('')}</div>
      ${cta}
      <p style="margin:20px 0 0;line-height:1.9;color:#666;font-size:13px">إذا واجهت أي مشكلة في التتبع أو التسليم، يرجى التواصل معنا مباشرةً.</p>`,
    cardLabel: 'SHIPMENT STATUS', cardValue: statusLabel,
    cardExtra: shipment.tracking_no ? `Tracking · ${esc(shipment.tracking_no)}` : undefined,
  });
  return { subject: `تحديث الشحن ${orderRef ? `— ${orderRef}` : ''} · ${statusLabel}`, html };
}

const ORDER_STATUS_AR: Record<string, { title: string; body: string }> = {
  new:        { title: 'تم استلام طلبك',  body: 'استلمنا طلبك بنجاح وسيتم مراجعته خلال وقت قصير.' },
  contacted:  { title: 'تم التواصل معك',  body: 'تواصلنا معك بخصوص طلبك، يرجى الرد لإكمال الإجراءات.' },
  confirmed:  { title: 'تم تأكيد طلبك',   body: 'طلبك مؤكد وقيد التجهيز الآن في مستودعنا بجدة.' },
  shipped:    { title: 'تم شحن طلبك',     body: 'طلبك في طريقه إليك. سنوافيك بتحديثات التتبع.' },
  completed:  { title: 'تم تسليم طلبك',   body: 'تم تسليم طلبك بنجاح. شكراً لثقتك بفحم النخلة 🌴' },
  cancelled:  { title: 'تم إلغاء الطلب',  body: 'تم إلغاء طلبك. للاستفسار راسلنا على nakhlacoal@gmail.com' },
};
function renderOrderStatus(order: any, status: string) {
  const s = ORDER_STATUS_AR[status] ?? ORDER_STATUS_AR.new;
  const oid = String(order.id).slice(0, 8).toUpperCase();
  const summary = `${esc(order.product_type)} · ${esc(order.quantity)} ${esc(order.unit)}` +
    (order.grand_total_sar ? ` · الإجمالي شامل الضريبة: ${Number(order.grand_total_sar).toFixed(2)} ر.س` : '');
  const html = brandedShell({
    title: s.title,
    bodyHtml: `<p style="margin:0 0 16px;line-height:1.8;color:#333">عميلنا العزيز ${esc(order.contact_name || order.company_name || '')},</p>
      <p style="margin:0 0 20px;line-height:1.8;color:#333">${s.body}</p>`,
    cardLabel: 'ORDER', cardValue: `#${oid}`, cardExtra: summary,
  });
  return { subject: `${s.title} — #${oid}`, html };
}

const QUOTE_STATUS_AR: Record<string, { title: string; body: (p: number | null) => string }> = {
  new: { title: 'استلمنا طلب عرض السعر', body: () => 'وصلنا طلبك بنجاح. سيقوم فريق المبيعات بمراجعة الكميّة وإعداد أفضل عرض خلال وقت قصير.' },
  under_review: { title: 'عرض السعر قيد المراجعة', body: () => 'يعمل فريقنا حالياً على تسعير طلبك بناءً على الكميّة والوجهة المطلوبة.' },
  priced: { title: 'تم إعداد عرض السعر', body: (p) => p ? `يسرّنا تقديم عرض السعر التالي: <b>${Number(p).toFixed(2)} ر.س</b> للوحدة (شامل ضريبة القيمة المضافة عند التطبيق). العرض ساري لمدة 7 أيام.` : 'تم إعداد عرض السعر الخاص بك، يرجى مراجعته عبر حسابك في بوابة العملاء.' },
  accepted: { title: 'تم قبول عرض السعر', body: () => 'شكراً لقبولك العرض! سيتواصل معك فريقنا لإتمام إجراءات الدفع والشحن.' },
  rejected: { title: 'تم إغلاق عرض السعر', body: () => 'تم إغلاق طلب عرض السعر. إذا كنت ترغب بمناقشة الأسعار أو الشروط راسلنا مباشرة.' },
  converted_to_order: { title: 'تم تحويل عرض السعر إلى طلب', body: () => 'ممتاز! تم إنشاء طلب رسمي بناءً على العرض المتفق عليه. ستصلك تحديثات حالة الطلب تباعاً.' },
};
function renderQuoteStatus(q: any, status: string) {
  const s = QUOTE_STATUS_AR[status] ?? QUOTE_STATUS_AR.new;
  const price = q.quoted_price_sar ? Number(q.quoted_price_sar) : null;
  const qid = String(q.id).slice(0, 8).toUpperCase();
  const details = `${esc(q.product)} · ${esc(q.quantity)} ${esc(q.unit)}` + (q.destination ? ` · ${esc(q.destination)}` : '');
  const html = brandedShell({
    title: s.title,
    bodyHtml: `<p style="margin:0 0 16px;line-height:1.8;color:#333">عميلنا العزيز ${esc(q.full_name || q.company_name || '')},</p>
      <p style="margin:0 0 20px;line-height:1.8;color:#333">${s.body(price)}</p>`,
    cardLabel: 'QUOTE', cardValue: `#${qid}`, cardExtra: details,
  });
  return { subject: `${s.title} — #${qid}`, html };
}

function renderInvoiceReceipt(inv: any, items: any[]) {
  const invNo = inv.invoice_no ?? `#${String(inv.id).slice(0, 8).toUpperCase()}`;
  const totalRow = (label: string, val: string, bold = false) =>
    `<tr><td style="padding:6px 8px;color:#555;font-size:13px">${label}</td><td style="padding:6px 8px;text-align:left;font-weight:${bold ? 700 : 500};color:#1a1a1a">${val}</td></tr>`;
  const itemsHtml = items.length
    ? `<table style="width:100%;border-collapse:collapse;margin:8px 0 16px;font-size:13px">
        <thead><tr style="background:#f6f5ef;color:#555">
          <th style="padding:8px;text-align:start">الوصف</th>
          <th style="padding:8px;text-align:center">الكمية</th>
          <th style="padding:8px;text-align:center">السعر</th>
          <th style="padding:8px;text-align:center">الإجمالي</th>
        </tr></thead>
        <tbody>${items.map((it: any) => `<tr style="border-bottom:1px solid #eee">
          <td style="padding:8px">${esc(it.description ?? '—')}</td>
          <td style="padding:8px;text-align:center">${esc(it.quantity ?? 0)} ${esc(it.unit ?? '')}</td>
          <td style="padding:8px;text-align:center">${Number(it.unit_price_sar ?? 0).toFixed(2)}</td>
          <td style="padding:8px;text-align:center">${Number(it.line_total_sar ?? 0).toFixed(2)}</td>
        </tr>`).join('')}</tbody></table>` : '';
  const html = brandedShell({
    title: `فاتورة ضريبية · ${invNo}`,
    bodyHtml: `
      <p style="margin:0 0 12px;line-height:1.8;color:#333">
        عميلنا العزيز ${esc(inv.buyer_name || '')},<br/>
        يسعدنا إرفاق نسخة PDF من الفاتورة الضريبية بتفاصيلها الكاملة أدناه.
      </p>
      ${itemsHtml}
      <table style="width:100%;border-top:1px solid #eee;margin-top:8px">
        ${totalRow('الإجمالي قبل الضريبة', `${Number(inv.subtotal_sar ?? 0).toFixed(2)} ر.س`)}
        ${totalRow(`ضريبة القيمة المضافة (${Math.round((Number(inv.vat_rate ?? 0.15)) * 100)}%)`, `${Number(inv.vat_amount_sar ?? 0).toFixed(2)} ر.س`)}
        ${totalRow('الإجمالي شامل الضريبة', `${Number(inv.grand_total_sar ?? 0).toFixed(2)} ر.س`, true)}
      </table>
      <p style="margin:18px 0 0;font-size:12px;color:#888">مرفق: نسخة PDF متوافقة مع متطلبات هيئة الزكاة والضريبة (ZATCA).</p>`,
    cardLabel: 'INVOICE', cardValue: invNo,
    cardExtra: `${esc(inv.seller_name ?? 'Palm Charcoal')} · VAT ${esc(inv.seller_vat_number ?? '—')}`,
  });
  return { subject: `فاتورة ضريبية ${invNo} · فحم النخلة`, html };
}

// ---------- entry ----------
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
    const { data: isAdmin } = await admin.rpc('has_role', { _user_id: userId, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: jhdr });
    }

    const { template, entityId } = await req.json().catch(() => ({}));
    if (!template || typeof template !== 'string') {
      return new Response(JSON.stringify({ error: 'template required' }), { status: 400, headers: jhdr });
    }

    let usedSample = true;
    let recipient: string | null = null;
    let result: { subject: string; html: string } | null = null;

    // route by template family
    if (template === 'order-confirmation') {
      let order: any = SAMPLE_ORDER;
      if (entityId) {
        const { data } = await admin.from('orders').select('*').eq('id', entityId).maybeSingle();
        if (data) { order = data; usedSample = false; }
      }
      recipient = order.email ?? null;
      result = renderOrderConfirmation(order);
    } else if (template === 'shipment-notification') {
      let shipment: any = SAMPLE_SHIPMENT;
      let orderRef: string | null = `#${String(SAMPLE_ORDER.id).slice(0, 8).toUpperCase()}`;
      let contactName: string | null = shipment.recipient_name;
      if (entityId) {
        const { data } = await admin.from('shipments').select('*').eq('id', entityId).maybeSingle();
        if (data) {
          shipment = data; usedSample = false;
          if (data.order_id) {
            const { data: o } = await admin.from('orders').select('id,email,contact_name,company_name').eq('id', data.order_id).maybeSingle();
            if (o) {
              recipient = o.email ?? null;
              contactName = data.recipient_name || o.contact_name || o.company_name || null;
              orderRef = o.id ? `#${String(o.id).slice(0, 8).toUpperCase()}` : null;
            }
          }
        }
      } else {
        recipient = SAMPLE_ORDER.email;
      }
      result = renderShipment(shipment, orderRef, contactName);
    } else if (template.startsWith('order-') && ORDER_STATUS_AR[template.replace('order-', '')]) {
      const status = template.replace('order-', '');
      let order: any = SAMPLE_ORDER;
      if (entityId) {
        const { data } = await admin.from('orders').select('*').eq('id', entityId).maybeSingle();
        if (data) { order = data; usedSample = false; }
      }
      recipient = order.email ?? null;
      result = renderOrderStatus(order, status);
    } else if (template.startsWith('quote-') && QUOTE_STATUS_AR[template.replace('quote-', '')]) {
      const status = template.replace('quote-', '');
      let q: any = SAMPLE_QUOTE;
      if (entityId) {
        const { data } = await admin.from('quote_requests').select('*').eq('id', entityId).maybeSingle();
        if (data) { q = data; usedSample = false; }
      }
      recipient = q.email ?? null;
      result = renderQuoteStatus(q, status);
    } else if (template === 'invoice-receipt') {
      let inv: any = SAMPLE_INVOICE;
      let items: any[] = [
        { description: 'فحم النخلة الفاخر — Grade A', quantity: 20, unit: 'كرتون', unit_price_sar: 120, line_total_sar: 2400 },
        { description: 'فحم النخلة — Long Burn', quantity: 5, unit: 'كرتون', unit_price_sar: 120, line_total_sar: 600 },
      ];
      if (entityId) {
        const { data } = await admin.from('invoices').select('*').eq('id', entityId).maybeSingle();
        if (data) {
          inv = data; usedSample = false;
          const { data: rows } = await admin.from('invoice_items').select('*').eq('invoice_id', entityId);
          if (rows) items = rows;
          if (inv.customer_id) {
            const { data: c } = await admin.from('customers').select('email').eq('id', inv.customer_id).maybeSingle();
            if (c) recipient = c.email ?? null;
          }
          if (!recipient && inv.order_id) {
            const { data: o } = await admin.from('orders').select('email').eq('id', inv.order_id).maybeSingle();
            if (o) recipient = o.email ?? null;
          }
        }
      } else {
        recipient = SAMPLE_ORDER.email;
      }
      result = renderInvoiceReceipt(inv, items);
    } else {
      return new Response(JSON.stringify({ error: `Unsupported template: ${template}` }), { status: 400, headers: jhdr });
    }

    return new Response(JSON.stringify({
      ok: true,
      template,
      subject: result!.subject,
      html: result!.html,
      recipient,
      usedSample,
      note: template === 'invoice-receipt' ? 'المعاينة تعرض جسم البريد؛ سيُرفق ملف PDF تلقائيًا عند الإرسال الفعلي.' : null,
    }), { headers: jhdr });
  } catch (e: any) {
    console.error('[preview-email-template] error:', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: jhdr });
  }
});
