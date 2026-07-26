import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail, brandedShell, esc } from '../_shared/email-sender.ts';

const DEFAULT_ADMIN_EMAIL = 'nakhlacoal@gmail.com';

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jhdr = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const { quoteId } = await req.json().catch(() => ({}));
    if (!quoteId || typeof quoteId !== 'string') {
      return new Response(JSON.stringify({ error: 'quoteId is required' }), { status: 400, headers: jhdr });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: settings } = await admin
      .from('email_settings')
      .select('auto_admin_quote_alert, admin_notify_email')
      .eq('id', true)
      .maybeSingle();

    if (settings && settings.auto_admin_quote_alert === false) {
      return new Response(JSON.stringify({ skipped: true, reason: 'disabled' }), { headers: jhdr });
    }

    const recipient = (settings?.admin_notify_email || DEFAULT_ADMIN_EMAIL).trim();

    const { data: q, error } = await admin
      .from('quote_requests')
      .select('*')
      .eq('id', quoteId)
      .maybeSingle();

    if (error || !q) {
      return new Response(JSON.stringify({ error: 'quote not found' }), { status: 404, headers: jhdr });
    }

    const qid = String(q.id).slice(0, 8).toUpperCase();
    const qty = Number(q.quantity ?? 0);
    const unitPrice = q.quoted_price_sar != null ? Number(q.quoted_price_sar) : null;
    const subtotal = unitPrice != null ? qty * unitPrice : null;
    const vat = subtotal != null ? subtotal * 0.15 : null;
    const grand = subtotal != null && vat != null ? subtotal + vat : null;
    const fmt = (n: number) =>
      new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR', maximumFractionDigits: 2 }).format(n);

    const trackUrl = `https://alnakhlacoal.com/quote/track?id=${encodeURIComponent(q.id)}`;
    const adminUrl = `https://alnakhlacoal.com/admin/quotes/${encodeURIComponent(q.id)}`;

    const rows: [string, string][] = [
      ['رقم الطلب', qid],
      ['الاسم', q.full_name || '—'],
      ['الشركة', q.company_name || '—'],
      ['البريد', q.email || '—'],
      ['الجوال', q.phone || '—'],
      ['الوجهة', q.destination || '—'],
      ['الحالة', q.status || 'new'],
      ['ملاحظات', q.notes || '—'],
    ];

    const infoTable = rows.map(([k, v]) =>
      `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#666;width:140px">${esc(k)}</td>` +
      `<td style="padding:8px 12px;border-bottom:1px solid #eee;color:#0A0B09"><b>${esc(String(v))}</b></td></tr>`
    ).join('');

    const itemsTable = `
      <table style="width:100%;border-collapse:collapse;font-family:inherit;margin:8px 0 4px">
        <thead>
          <tr style="background:#f6f5ef;color:#1A4A00;font-size:12px;letter-spacing:1px">
            <th style="padding:10px;text-align:right">المنتج</th>
            <th style="padding:10px;text-align:center">الكمية</th>
            <th style="padding:10px;text-align:center">سعر الوحدة</th>
            <th style="padding:10px;text-align:left">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding:12px;border-bottom:1px solid #eee"><b>${esc(q.product || '—')}</b></td>
            <td style="padding:12px;border-bottom:1px solid #eee;text-align:center">${esc(qty)} ${esc(q.unit || '')}</td>
            <td style="padding:12px;border-bottom:1px solid #eee;text-align:center">${unitPrice != null ? fmt(unitPrice) : '<span style="color:#999">لم يُسعّر بعد</span>'}</td>
            <td style="padding:12px;border-bottom:1px solid #eee;text-align:left"><b>${subtotal != null ? fmt(subtotal) : '—'}</b></td>
          </tr>
        </tbody>
      </table>`;

    const totalsBlock = subtotal != null ? `
      <table style="width:100%;border-collapse:collapse;margin-top:8px">
        <tr><td style="padding:6px 12px;color:#666;text-align:right">المجموع الفرعي</td><td style="padding:6px 12px;text-align:left">${fmt(subtotal)}</td></tr>
        <tr><td style="padding:6px 12px;color:#666;text-align:right">ضريبة القيمة المضافة (15%)</td><td style="padding:6px 12px;text-align:left">${fmt(vat!)}</td></tr>
        <tr><td style="padding:10px 12px;color:#1A4A00;text-align:right;border-top:2px solid #1A4A00"><b>الإجمالي شامل الضريبة</b></td><td style="padding:10px 12px;text-align:left;border-top:2px solid #1A4A00;color:#1A4A00"><b>${fmt(grand!)}</b></td></tr>
      </table>` : `<p style="margin:8px 0 0;font-size:13px;color:#8a8674">لم يتم تسعير الطلب بعد — يظهر الإجمالي بعد إدخال سعر الوحدة من لوحة الإدارة.</p>`;

    const html = brandedShell({
      title: 'طلب عرض سعر جديد',
      bodyHtml: `
        <p style="margin:0 0 16px;color:#333;line-height:1.7">
          تم استلام طلب عرض سعر جديد رقم <b>${esc(qid)}</b>. تفاصيل الطلب أدناه.
        </p>
        <h3 style="margin:20px 0 8px;font-size:15px;color:#1A4A00;letter-spacing:1px">تفاصيل المنتج</h3>
        ${itemsTable}
        ${totalsBlock}
        <h3 style="margin:24px 0 8px;font-size:15px;color:#1A4A00;letter-spacing:1px">بيانات العميل</h3>
        <table style="width:100%;border-collapse:collapse;font-family:inherit">${infoTable}</table>
        <div style="margin-top:28px;text-align:center">
          <a href="${adminUrl}" style="display:inline-block;background:#1A4A00;color:#f4e4b2;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;margin:4px">فتح في لوحة الإدارة</a>
          <a href="${trackUrl}" style="display:inline-block;background:#f4e4b2;color:#1A4A00;padding:12px 22px;border-radius:10px;text-decoration:none;font-weight:600;margin:4px;border:1px solid #1A4A00">صفحة تتبع الطلب</a>
        </div>
        <p style="margin:16px 0 0;font-size:12px;color:#8a8674;text-align:center;direction:ltr">${esc(trackUrl)}</p>`,
    });

    const result = await sendEmail({
      template: 'admin-new-quote-alert',
      to: recipient,
      subject: `طلب عرض سعر جديد — ${qid}`,
      html,
      entityType: 'quote_request',
      entityId: q.id,
      category: 'transactional',
      admin,
      metadata: { alertType: 'admin_new_quote' },
    });

    return new Response(JSON.stringify(result), { status: result.ok ? 200 : 502, headers: jhdr });
  } catch (err) {
    console.error('[notify-admin-new-quote]', err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: jhdr });
  }
});
