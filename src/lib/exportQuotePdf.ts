// Brand-styled PDF export for quote payloads.
// Uses html2canvas to render an off-screen RTL invoice card, then embeds it in jsPDF (A4).
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logoUrl from '@/assets/palm-charcoal-logo.png';
import { products } from '@/data/products';

export type QuotePdfLine = { slug: string; qty: number; unit: 'kg' | 'carton' | 'ton'; unitPrice: number; lineTotal: number };
export type QuotePdfPayload = {
  customer: { name: string; phone: string; email?: string; company?: string; city?: string };
  items: QuotePdfLine[];
  subtotal: number;
  vat: number;
  total: number;
  createdAt?: number;
  quoteId?: string;
};

const fmt = (n: number) => new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 2 }).format(n);
const labelOf = (slug: string) => products.find((p) => p.slug === slug)?.nameAr || slug;
const unitAr = (u: string) => ({ kg: 'كجم', carton: 'كرتون', ton: 'طن' }[u] || u);

function buildHtml(p: QuotePdfPayload): string {
  const date = new Date(p.createdAt || Date.now()).toLocaleDateString('ar-SA');
  const ref = (p.quoteId || crypto.randomUUID()).slice(0, 8).toUpperCase();
  const rows = p.items
    .map(
      (i, idx) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #e6e2d6;text-align:center;color:#6b6754;">${idx + 1}</td>
        <td style="padding:10px;border-bottom:1px solid #e6e2d6;font-weight:600;color:#1a1a1a;">${labelOf(i.slug)}</td>
        <td style="padding:10px;border-bottom:1px solid #e6e2d6;text-align:center;color:#3a3a3a;">${i.qty} ${unitAr(i.unit)}</td>
        <td style="padding:10px;border-bottom:1px solid #e6e2d6;text-align:center;color:#3a3a3a;">${fmt(i.unitPrice)} ر.س</td>
        <td style="padding:10px;border-bottom:1px solid #e6e2d6;text-align:left;font-weight:700;color:#9a7b2e;">${fmt(i.lineTotal)} ر.س</td>
      </tr>`,
    )
    .join('');

  return `
  <div dir="rtl" style="width:794px;padding:48px;background:#fbf8ef;font-family:'Reem Kufi','IBM Plex Sans Arabic',system-ui,sans-serif;color:#1a1a1a;box-sizing:border-box;">
    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #c9a96a;padding-bottom:20px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;gap:14px;">
        <img src="${logoUrl}" crossorigin="anonymous" style="width:64px;height:64px;object-fit:contain;" />
        <div>
          <div style="font-size:22px;font-weight:800;color:#1a1a1a;">فحم النخلة</div>
          <div style="font-size:12px;color:#6b6754;letter-spacing:1px;">PALM CHARCOAL · جدة، المملكة العربية السعودية</div>
        </div>
      </div>
      <div style="text-align:left;font-size:11px;color:#6b6754;">
        <div style="font-size:18px;font-weight:700;color:#9a7b2e;">عرض سعر</div>
        <div>المرجع: <strong>#${ref}</strong></div>
        <div>التاريخ: ${date}</div>
      </div>
    </div>

    <!-- Customer -->
    <div style="background:#fff;border:1px solid #ece7d4;border-radius:12px;padding:16px;margin-bottom:20px;">
      <div style="font-size:11px;color:#9a7b2e;font-weight:700;letter-spacing:2px;margin-bottom:8px;">بيانات العميل</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;">
        <div><strong>الاسم:</strong> ${p.customer.name || '—'}</div>
        <div><strong>الجوال:</strong> ${p.customer.phone || '—'}</div>
        ${p.customer.email ? `<div><strong>البريد:</strong> ${p.customer.email}</div>` : ''}
        ${p.customer.company ? `<div><strong>المنشأة:</strong> ${p.customer.company}</div>` : ''}
        ${p.customer.city ? `<div><strong>المدينة:</strong> ${p.customer.city}</div>` : ''}
      </div>
    </div>

    <!-- Table -->
    <table style="width:100%;border-collapse:collapse;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ece7d4;">
      <thead>
        <tr style="background:linear-gradient(90deg,#9a7b2e,#c9a96a);color:#fff;">
          <th style="padding:12px;text-align:center;font-size:12px;">#</th>
          <th style="padding:12px;text-align:right;font-size:12px;">المنتج</th>
          <th style="padding:12px;text-align:center;font-size:12px;">الكمية</th>
          <th style="padding:12px;text-align:center;font-size:12px;">السعر</th>
          <th style="padding:12px;text-align:left;font-size:12px;">الإجمالي</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;margin-top:20px;">
      <div style="min-width:280px;background:#fff;border:1px solid #ece7d4;border-radius:12px;padding:16px;font-size:13px;">
        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>الإجمالي قبل الضريبة</span><span>${fmt(p.subtotal)} ر.س</span></div>
        <div style="display:flex;justify-content:space-between;padding:4px 0;color:#6b6754;"><span>الضريبة (15%)</span><span>${fmt(p.vat)} ر.س</span></div>
        <div style="display:flex;justify-content:space-between;padding:10px 0 0;margin-top:6px;border-top:2px solid #c9a96a;font-size:16px;font-weight:800;color:#9a7b2e;">
          <span>الإجمالي</span><span>${fmt(p.total)} ر.س</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div style="margin-top:36px;padding-top:16px;border-top:1px solid #ece7d4;font-size:10px;color:#6b6754;text-align:center;line-height:1.7;">
      عرض السعر صالح لمدة 7 أيام من تاريخ الإصدار. الأسعار تشمل ضريبة القيمة المضافة (15%).<br/>
      للتواصل: +966 54 006 0085 · nakhlacoal@gmail.com · alnakhlacoal.com
    </div>
  </div>`;
}

export async function exportQuoteToPdf(payload: QuotePdfPayload, filename = 'palm-charcoal-quote.pdf') {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;z-index:-1;';
  host.innerHTML = buildHtml(payload);
  document.body.appendChild(host);
  // ensure logo image is loaded
  const img = host.querySelector('img');
  if (img && !img.complete) {
    await new Promise((res) => {
      img.addEventListener('load', res, { once: true });
      img.addEventListener('error', res, { once: true });
    });
  }
  try {
    const canvas = await html2canvas(host.firstElementChild as HTMLElement, {
      scale: 2,
      backgroundColor: '#fbf8ef',
      useCORS: true,
      logging: false,
    });
    const pdf = new jsPDF({ unit: 'pt', format: 'a4', orientation: 'portrait' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    if (imgH <= pageH) {
      pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH);
    } else {
      // paginate
      let remaining = imgH;
      let y = 0;
      while (remaining > 0) {
        pdf.addImage(imgData, 'JPEG', 0, y === 0 ? 0 : -y, imgW, imgH);
        remaining -= pageH;
        y += pageH;
        if (remaining > 0) pdf.addPage();
      }
    }
    pdf.save(filename);
  } finally {
    host.remove();
  }
}
