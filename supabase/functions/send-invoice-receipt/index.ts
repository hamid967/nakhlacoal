// Auto-triggered invoice receipt email with PDF attachment.
// Fires from DB trigger on invoices INSERT or status change to 'issued'/'paid'.
import { buildCors } from '../_shared/cors.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { sendEmail, brandedShell, esc, type EmailAttachment } from '../_shared/email-sender.ts';
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

const TEMPLATE = 'invoice-receipt';

interface InvoiceRow {
  id: string;
  invoice_no: string | null;
  order_id: string | null;
  customer_id: string | null;
  issue_date: string | null;
  due_date: string | null;
  seller_name: string | null;
  seller_vat_number: string | null;
  seller_cr: string | null;
  seller_address: string | null;
  buyer_name: string | null;
  buyer_vat_number: string | null;
  buyer_address: string | null;
  subtotal_sar: number | null;
  vat_rate: number | null;
  vat_amount_sar: number | null;
  grand_total_sar: number | null;
  currency: string | null;
  status: string | null;
  qr_payload: string | null;
  notes: string | null;
}

interface InvoiceItem {
  description: string | null;
  quantity: number | null;
  unit: string | null;
  unit_price_sar: number | null;
  line_total_sar: number | null;
}

function fmt(n: number | null | undefined): string {
  return (Number(n ?? 0)).toFixed(2);
}

async function buildInvoicePdf(inv: InvoiceRow, items: InvoiceItem[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Invoice ${inv.invoice_no ?? inv.id}`);
  pdf.setAuthor('Palm Charcoal');
  pdf.setCreator('Palm Charcoal Portal');

  const page = pdf.addPage([595.28, 841.89]); // A4
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const palm = rgb(0.102, 0.290, 0.0);
  const ink = rgb(0.1, 0.1, 0.1);
  const muted = rgb(0.42, 0.42, 0.42);
  const line = rgb(0.85, 0.85, 0.85);

  const W = 595.28;
  const M = 40;
  let y = 800;

  // Header band
  page.drawRectangle({ x: 0, y: 770, width: W, height: 60, color: palm });
  page.drawText('PALM CHARCOAL', { x: M, y: 800, size: 18, font: bold, color: rgb(0.957, 0.894, 0.698) });
  page.drawText('TAX INVOICE / VAT RECEIPT', { x: M, y: 782, size: 10, font, color: rgb(0.957, 0.894, 0.698) });
  const invNo = inv.invoice_no ?? inv.id.slice(0, 8).toUpperCase();
  page.drawText(`# ${invNo}`, { x: W - M - bold.widthOfTextAtSize(`# ${invNo}`, 14), y: 800, size: 14, font: bold, color: rgb(1, 1, 1) });
  page.drawText(`ISSUED ${inv.issue_date ?? ''}`, { x: W - M - font.widthOfTextAtSize(`ISSUED ${inv.issue_date ?? ''}`, 9), y: 782, size: 9, font, color: rgb(0.957, 0.894, 0.698) });

  y = 740;

  // Parties
  const colW = (W - M * 2 - 20) / 2;
  const drawParty = (x: number, title: string, name: string, vat: string, addr: string) => {
    page.drawText(title, { x, y, size: 9, font: bold, color: muted });
    page.drawText(name || '-', { x, y: y - 14, size: 11, font: bold, color: ink });
    page.drawText(`VAT: ${vat || '-'}`, { x, y: y - 28, size: 9, font, color: ink });
    const addrLines = (addr || '-').match(/.{1,45}/g) ?? ['-'];
    addrLines.slice(0, 2).forEach((l, i) => page.drawText(l, { x, y: y - 42 - i * 12, size: 9, font, color: muted }));
  };
  drawParty(M, 'SELLER', inv.seller_name ?? 'Palm Charcoal', inv.seller_vat_number ?? '', inv.seller_address ?? '');
  drawParty(M + colW + 20, 'BUYER', inv.buyer_name ?? '', inv.buyer_vat_number ?? '', inv.buyer_address ?? '');

  y -= 90;

  // Items table
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: line });
  y -= 4;
  page.drawText('DESCRIPTION', { x: M, y: y - 12, size: 9, font: bold, color: muted });
  page.drawText('QTY', { x: 320, y: y - 12, size: 9, font: bold, color: muted });
  page.drawText('UNIT PRICE', { x: 380, y: y - 12, size: 9, font: bold, color: muted });
  page.drawText('LINE TOTAL', { x: W - M - 70, y: y - 12, size: 9, font: bold, color: muted });
  y -= 22;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: line });

  y -= 4;
  const rows = items.length ? items : [{ description: 'Charcoal order', quantity: 1, unit: '', unit_price_sar: inv.subtotal_sar ?? 0, line_total_sar: inv.subtotal_sar ?? 0 }];
  for (const it of rows) {
    if (y < 200) break;
    const desc = (it.description ?? 'Item').slice(0, 55);
    page.drawText(desc, { x: M, y: y - 12, size: 10, font, color: ink });
    page.drawText(`${it.quantity ?? 0} ${it.unit ?? ''}`.trim(), { x: 320, y: y - 12, size: 10, font, color: ink });
    page.drawText(fmt(it.unit_price_sar), { x: 380, y: y - 12, size: 10, font, color: ink });
    const lt = fmt(it.line_total_sar);
    page.drawText(lt, { x: W - M - font.widthOfTextAtSize(lt, 10), y: y - 12, size: 10, font, color: ink });
    y -= 20;
  }

  // Totals
  y -= 6;
  page.drawLine({ start: { x: 320, y }, end: { x: W - M, y }, thickness: 1, color: line });
  const totalRow = (label: string, value: string, boldRow = false) => {
    y -= 18;
    const f = boldRow ? bold : font;
    const c = boldRow ? palm : ink;
    page.drawText(label, { x: 320, y, size: boldRow ? 12 : 10, font: f, color: c });
    page.drawText(value, { x: W - M - f.widthOfTextAtSize(value, boldRow ? 12 : 10), y, size: boldRow ? 12 : 10, font: f, color: c });
  };
  const cur = inv.currency ?? 'SAR';
  totalRow('Subtotal', `${fmt(inv.subtotal_sar)} ${cur}`);
  totalRow(`VAT (${((inv.vat_rate ?? 0.15) * 100).toFixed(0)}%)`, `${fmt(inv.vat_amount_sar)} ${cur}`);
  totalRow('TOTAL DUE', `${fmt(inv.grand_total_sar)} ${cur}`, true);

  // Status stamp
  const statusLabel = (inv.status ?? 'issued').toUpperCase();
  page.drawRectangle({ x: M, y: 120, width: 120, height: 34, borderColor: palm, borderWidth: 1.5, color: rgb(0.965, 0.961, 0.937) });
  page.drawText(statusLabel, { x: M + 12, y: 132, size: 14, font: bold, color: palm });

  // Notes
  if (inv.notes) {
    const notes = inv.notes.slice(0, 200);
    const noteLines = notes.match(/.{1,80}/g) ?? [];
    let ny = 100;
    page.drawText('NOTES', { x: M, y: ny, size: 8, font: bold, color: muted });
    noteLines.slice(0, 3).forEach((l, i) => page.drawText(l, { x: M, y: ny - 12 - i * 11, size: 8, font, color: muted }));
  }

  // Footer
  page.drawLine({ start: { x: M, y: 60 }, end: { x: W - M, y: 60 }, thickness: 0.5, color: line });
  page.drawText('Palm Charcoal - Jeddah, KSA - WhatsApp +966 54 006 0085 - nakhlacoal@gmail.com', {
    x: M, y: 46, size: 8, font, color: muted,
  });
  page.drawText('This is an official ZATCA-compliant tax invoice.', { x: M, y: 34, size: 8, font, color: muted });

  return pdf.save();
}

function toBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

Deno.serve(async (req) => {
  const corsHeaders = buildCors(req);
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const jhdr = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const { invoiceId, force } = await req.json().catch(() => ({} as any));
    if (!invoiceId || typeof invoiceId !== 'string') {
      return new Response(JSON.stringify({ error: 'invoiceId required' }), { status: 400, headers: jhdr });
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Feature toggle (skippable via `force`)
    if (!force) {
      const { data: settings } = await admin
        .from('email_settings').select('auto_invoice_receipt').eq('id', true).maybeSingle();
      if (settings && (settings as any).auto_invoice_receipt === false) {
        return new Response(JSON.stringify({ skipped: true, reason: 'disabled' }), { headers: jhdr });
      }
    }

    // Dedupe (unless force)
    if (!force) {
      const { data: prior } = await admin
        .from('email_log').select('id')
        .eq('template', TEMPLATE).eq('entity_id', invoiceId).eq('status', 'sent').limit(1);
      if (prior && prior.length) {
        return new Response(JSON.stringify({ skipped: true, reason: 'already sent' }), { headers: jhdr });
      }
    }

    const { data: inv } = await admin.from('invoices').select('*').eq('id', invoiceId).maybeSingle();
    if (!inv) {
      return new Response(JSON.stringify({ error: 'invoice not found' }), { status: 404, headers: jhdr });
    }
    const invoice = inv as unknown as InvoiceRow;

    // Resolve recipient email
    let recipient: string | null = null;
    if (invoice.customer_id) {
      const { data: c } = await admin.from('customers').select('email').eq('id', invoice.customer_id).maybeSingle();
      if (c?.email) recipient = c.email;
    }
    if (!recipient && invoice.order_id) {
      const { data: o } = await admin.from('orders').select('email').eq('id', invoice.order_id).maybeSingle();
      if (o?.email) recipient = o.email;
    }
    if (!recipient) {
      return new Response(JSON.stringify({ skipped: true, reason: 'no recipient email' }), { headers: jhdr });
    }

    // Items
    const { data: items } = await admin
      .from('invoice_items').select('description, quantity, unit, unit_price_sar, line_total_sar')
      .eq('invoice_id', invoiceId).order('created_at', { ascending: true });

    // PDF
    const pdfBytes = await buildInvoicePdf(invoice, (items ?? []) as InvoiceItem[]);
    const attachment: EmailAttachment = {
      filename: `Invoice-${invoice.invoice_no ?? invoice.id.slice(0, 8)}.pdf`,
      content: toBase64(pdfBytes),
      content_type: 'application/pdf',
    };

    const invNo = invoice.invoice_no ?? invoice.id.slice(0, 8).toUpperCase();
    const cur = invoice.currency ?? 'SAR';
    const total = fmt(invoice.grand_total_sar);
    const vat = fmt(invoice.vat_amount_sar);
    const sub = fmt(invoice.subtotal_sar);

    const html = brandedShell({
      title: 'إيصال الفاتورة الضريبية 🧾',
      bodyHtml: `
        <p style="margin:0 0 16px;line-height:1.9;color:#333">
          عميلنا العزيز ${esc(invoice.buyer_name || '')}،
        </p>
        <p style="margin:0 0 12px;line-height:1.9;color:#333">
          تجدون طيّه <strong>الفاتورة الضريبية</strong> الخاصة بطلبكم من <strong>فحم النخلة</strong> بصيغة PDF متوافقة مع هيئة الزكاة والضريبة والجمارك (ZATCA).
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0;border-collapse:collapse">
          <tr><td style="padding:6px 0;color:#666;font-size:13px">المجموع قبل الضريبة</td><td style="padding:6px 0;text-align:end;font-size:13px">${sub} ${esc(cur)}</td></tr>
          <tr><td style="padding:6px 0;color:#666;font-size:13px">ضريبة القيمة المضافة (${((invoice.vat_rate ?? 0.15) * 100).toFixed(0)}%)</td><td style="padding:6px 0;text-align:end;font-size:13px">${vat} ${esc(cur)}</td></tr>
          <tr><td style="padding:10px 0;border-top:1px solid #e5e5e5;font-weight:700;color:#1A4A00">الإجمالي شامل الضريبة</td><td style="padding:10px 0;border-top:1px solid #e5e5e5;text-align:end;font-weight:700;color:#1A4A00">${total} ${esc(cur)}</td></tr>
        </table>
        <p style="margin:0 0 12px;line-height:1.9;color:#333">
          للاطلاع على الفاتورة كاملة يرجى فتح المرفق <em>Invoice-${esc(invNo)}.pdf</em>.
        </p>`,
      cardLabel: 'INVOICE',
      cardValue: `#${esc(invNo)}`,
      cardExtra: `تاريخ الإصدار: ${esc(invoice.issue_date ?? '')}${invoice.due_date ? ` · تاريخ الاستحقاق: ${esc(invoice.due_date)}` : ''}`,
    });

    const result = await sendEmail({
      template: TEMPLATE,
      to: recipient,
      subject: `فاتورة ضريبية — #${invNo} · فحم النخلة`,
      html,
      entityType: 'invoice',
      entityId: invoice.id,
      metadata: { auto: !force, grand_total_sar: invoice.grand_total_sar, status: invoice.status },
      attachments: [attachment],
      admin,
    });

    if (!result.ok) {
      return new Response(JSON.stringify({ error: result.error, details: result.details }), { status: 502, headers: jhdr });
    }
    return new Response(JSON.stringify({ ok: true, id: result.id }), { headers: jhdr });
  } catch (e: any) {
    console.error('[send-invoice-receipt] error', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers: jhdr });
  }
});
