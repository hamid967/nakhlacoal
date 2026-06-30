import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Plus, Search, Eye, Loader2, X, Download, Printer, CheckCircle2 } from 'lucide-react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { buildZatcaQr } from '@/lib/zatca';

type Invoice = {
  id: string;
  invoice_no: string;
  issue_date: string;
  due_date: string | null;
  buyer_name: string;
  buyer_vat_number: string | null;
  buyer_address: string | null;
  seller_name: string;
  seller_vat_number: string;
  subtotal_sar: number;
  vat_rate: number;
  vat_amount_sar: number;
  grand_total_sar: number;
  status: 'draft' | 'issued' | 'paid' | 'void';
  qr_payload: string | null;
  notes: string | null;
  order_id: string | null;
  created_at: string;
};
type InvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price_sar: number;
  line_total_sar: number;
};
type Order = {
  id: string;
  product_type: string;
  quantity: number;
  unit: string;
  unit_price_sar: number | null;
  company_name: string;
  contact_name: string;
  address: string | null;
  city: string | null;
  commercial_register: string | null;
  user_id: string | null;
  created_at: string;
};

const statusColor: Record<string, string> = {
  draft: '#9ca3af',
  issued: '#2563eb',
  paid: '#16a34a',
  void: '#dc2626',
};
const statusLabel: Record<string, string> = {
  draft: 'مسودة',
  issued: 'مُصدرة',
  paid: 'مدفوعة',
  void: 'ملغاة',
};

export default function AdminInvoices() {
  const [rows, setRows] = useState<Invoice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [inv, ord] = await Promise.all([
      supabase.from('invoices').select('*').order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('id,product_type,quantity,unit,unit_price_sar,company_name,contact_name,address,city,commercial_register,user_id,created_at')
        .order('created_at', { ascending: false })
        .limit(200),
    ]);
    if (inv.error) toast.error(inv.error.message);
    setRows((inv.data as Invoice[]) || []);
    setOrders((ord.data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          !q ||
          r.invoice_no.toLowerCase().includes(q.toLowerCase()) ||
          r.buyer_name.toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q],
  );

  const updateStatus = async (inv: Invoice, status: Invoice['status']) => {
    const patch: any = { status };
    if (status === 'issued' && !inv.qr_payload) {
      patch.qr_payload = buildZatcaQr({
        sellerName: inv.seller_name,
        vatNumber: inv.seller_vat_number,
        timestamp: new Date().toISOString(),
        total: Number(inv.grand_total_sar),
        vatAmount: Number(inv.vat_amount_sar),
      });
    }
    const { error } = await supabase.from('invoices').update(patch).eq('id', inv.id);
    if (error) return toast.error(error.message);
    toast.success('تم التحديث');
    load();
  };

  const remove = async (inv: Invoice) => {
    if (!confirm(`حذف الفاتورة ${inv.invoice_no}؟`)) return;
    const { error } = await supabase.from('invoices').delete().eq('id', inv.id);
    if (error) return toast.error(error.message);
    toast.success('تم الحذف');
    setRows((r) => r.filter((x) => x.id !== inv.id));
  };

  return (
    <div className="space-y-5">
      <header className="a-page-header">
        <div>
          <p className="a-crumbs">FINANCE</p>
          <h1>الفواتير</h1>
          <p>
            {rows.length} فاتورة · متوافقة مع ZATCA المرحلة الأولى
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--a-accent)', color: '#fff' }}
        >
          <Plus className="h-4 w-4" /> فاتورة من طلب
        </button>
      </header>

      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}
      >
        <Search className="h-4 w-4 opacity-60" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث برقم الفاتورة أو اسم العميل..."
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}
      >
        {loading ? (
          <div className="p-10 text-center">
            <Loader2 className="h-5 w-5 animate-spin inline" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>
            <FileText className="h-6 w-6 mx-auto mb-2 opacity-60" />
            لا توجد فواتير
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--a-surface-2)' }}>
              <tr className="text-right">
                <th className="px-3 py-2 font-medium">رقم</th>
                <th className="px-3 py-2 font-medium">التاريخ</th>
                <th className="px-3 py-2 font-medium">العميل</th>
                <th className="px-3 py-2 font-medium">الإجمالي</th>
                <th className="px-3 py-2 font-medium">الضريبة</th>
                <th className="px-3 py-2 font-medium">الحالة</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                  <td className="px-3 py-2 font-mono text-xs">{i.invoice_no}</td>
                  <td className="px-3 py-2">{i.issue_date}</td>
                  <td className="px-3 py-2">{i.buyer_name}</td>
                  <td className="px-3 py-2">{Number(i.grand_total_sar).toFixed(2)} ر.س</td>
                  <td className="px-3 py-2">{Number(i.vat_amount_sar).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <span
                      className="px-2 py-0.5 rounded text-xs text-white"
                      style={{ background: statusColor[i.status] }}
                    >
                      {statusLabel[i.status]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPreviewId(i.id)}
                        className="p-1.5 rounded hover:bg-black/5"
                        title="معاينة"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {i.status === 'draft' && (
                        <button
                          onClick={() => updateStatus(i, 'issued')}
                          className="p-1.5 rounded hover:bg-blue-500/10 text-blue-600"
                          title="إصدار"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                      {i.status === 'issued' && (
                        <button
                          onClick={() => updateStatus(i, 'paid')}
                          className="px-2 py-1 rounded text-[11px] bg-green-600/10 text-green-700"
                        >
                          تحديد كمدفوعة
                        </button>
                      )}
                      <button
                        onClick={() => remove(i)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-600 text-xs"
                        title="حذف"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {createOpen && (
        <CreateFromOrderModal
          orders={orders}
          onClose={() => setCreateOpen(false)}
          onCreated={() => {
            setCreateOpen(false);
            load();
          }}
        />
      )}

      {previewId && <InvoicePreview id={previewId} onClose={() => setPreviewId(null)} />}
    </div>
  );
}

function CreateFromOrderModal({
  orders,
  onClose,
  onCreated,
}: {
  orders: Order[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [orderId, setOrderId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const order = orders.find((o) => o.id === orderId);

  const create = async () => {
    if (!order) return toast.error('اختر طلبًا');
    setSaving(true);
    const unitPrice = Number(order.unit_price_sar) || 0;
    const { data: inv, error } = await supabase
      .from('invoices')
      .insert({
        order_id: order.id,
        buyer_name: order.company_name,
        buyer_address: [order.address, order.city].filter(Boolean).join('، ') || null,
        buyer_vat_number: order.commercial_register || null,
        customer_user_id: order.user_id,
        status: 'draft',
      })
      .select()
      .single();
    if (error || !inv) {
      setSaving(false);
      return toast.error(error?.message || 'فشل الإنشاء');
    }
    const { error: itemErr } = await supabase.from('invoice_items').insert({
      invoice_id: inv.id,
      description: order.product_type,
      quantity: order.quantity,
      unit: order.unit,
      unit_price_sar: unitPrice,
    });
    setSaving(false);
    if (itemErr) return toast.error(itemErr.message);
    toast.success(`تم إنشاء الفاتورة ${inv.invoice_no}`);
    onCreated();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-xl border p-5"
        style={{ background: 'var(--a-surface)', borderColor: 'var(--a-border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">فاتورة من طلب</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-black/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <label className="text-xs mb-1 block" style={{ color: 'var(--a-text-muted)' }}>
          اختر الطلب
        </label>
        <select
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
          style={{ borderColor: 'var(--a-border)' }}
        >
          <option value="">— اختر —</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.company_name} · {o.product_type} · {o.quantity}
              {o.unit}
            </option>
          ))}
        </select>
        {order && (
          <div className="mt-3 text-xs rounded-lg border p-3 space-y-1" style={{ borderColor: 'var(--a-border)' }}>
            <div>العميل: {order.company_name}</div>
            <div>المنتج: {order.product_type}</div>
            <div>
              الكمية: {order.quantity} {order.unit}
            </div>
            <div>سعر الوحدة: {Number(order.unit_price_sar || 0).toFixed(2)} ر.س</div>
            <div className="font-medium">
              الإجمالي قبل الضريبة:{' '}
              {((Number(order.unit_price_sar) || 0) * Number(order.quantity)).toFixed(2)} ر.س
            </div>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm border"
            style={{ borderColor: 'var(--a-border)' }}
          >
            إلغاء
          </button>
          <button
            onClick={create}
            disabled={saving || !order}
            className="px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 disabled:opacity-50"
            style={{ background: 'var(--a-accent)', color: '#fff' }}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            إنشاء
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoicePreview({ id, onClose }: { id: string; onClose: () => void }) {
  const [inv, setInv] = useState<Invoice | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [qr, setQr] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [i, it] = await Promise.all([
        supabase.from('invoices').select('*').eq('id', id).single(),
        supabase.from('invoice_items').select('*').eq('invoice_id', id),
      ]);
      const invoice = i.data as Invoice | null;
      setInv(invoice);
      setItems((it.data as InvoiceItem[]) || []);
      if (invoice) {
        const payload =
          invoice.qr_payload ||
          buildZatcaQr({
            sellerName: invoice.seller_name,
            vatNumber: invoice.seller_vat_number,
            timestamp: new Date(invoice.created_at).toISOString(),
            total: Number(invoice.grand_total_sar),
            vatAmount: Number(invoice.vat_amount_sar),
          });
        const dataUrl = await QRCode.toDataURL(payload, { margin: 1, width: 180 });
        setQr(dataUrl);
      }
      setLoading(false);
    })();
  }, [id]);

  const downloadPdf = async () => {
    if (!inv) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('TAX INVOICE', 40, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${inv.invoice_no}`, 40, 72);
    doc.text(`Date: ${inv.issue_date}`, 40, 86);
    doc.text(`Seller: ${inv.seller_name}`, 40, 110);
    doc.text(`VAT: ${inv.seller_vat_number}`, 40, 124);
    doc.text(`Buyer: ${inv.buyer_name}`, 40, 148);
    if (inv.buyer_vat_number) doc.text(`Buyer VAT/CR: ${inv.buyer_vat_number}`, 40, 162);

    autoTable(doc, {
      startY: 190,
      head: [['#', 'Description', 'Qty', 'Unit', 'Price', 'Total']],
      body: items.map((it, idx) => [
        idx + 1,
        it.description,
        Number(it.quantity).toFixed(2),
        it.unit,
        Number(it.unit_price_sar).toFixed(2),
        Number(it.line_total_sar).toFixed(2),
      ]),
      theme: 'grid',
      headStyles: { fillColor: [22, 78, 60] },
    });

    const endY = (doc as any).lastAutoTable.finalY + 20;
    doc.text(`Subtotal: ${Number(inv.subtotal_sar).toFixed(2)} SAR`, 360, endY);
    doc.text(`VAT (${(Number(inv.vat_rate) * 100).toFixed(0)}%): ${Number(inv.vat_amount_sar).toFixed(2)} SAR`, 360, endY + 16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: ${Number(inv.grand_total_sar).toFixed(2)} SAR`, 360, endY + 36);

    if (qr) doc.addImage(qr, 'PNG', 40, endY, 110, 110);
    doc.save(`${inv.invoice_no}.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-xl border max-h-[92vh] overflow-y-auto"
        style={{ background: '#fff', borderColor: 'var(--a-border)' }}
      >
        <div className="sticky top-0 flex items-center justify-between p-3 border-b bg-white/95 backdrop-blur z-10">
          <h2 className="text-base font-semibold">معاينة الفاتورة</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded border"
            >
              <Printer className="h-3.5 w-3.5" /> طباعة
            </button>
            <button
              onClick={downloadPdf}
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded text-white"
              style={{ background: 'var(--a-accent)' }}
            >
              <Download className="h-3.5 w-3.5" /> تنزيل PDF
            </button>
            <button onClick={onClose} className="p-1 rounded hover:bg-black/5">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {loading || !inv ? (
          <div className="p-10 text-center">
            <Loader2 className="h-5 w-5 animate-spin inline" />
          </div>
        ) : (
          <div id="invoice-print" className="p-8 text-sm text-neutral-900 bg-white" dir="rtl">
            <div className="flex items-start justify-between border-b pb-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold">فاتورة ضريبية</h1>
                <p className="text-xs text-neutral-500 mt-1">TAX INVOICE</p>
              </div>
              <div className="text-left text-xs space-y-1">
                <div>
                  <span className="text-neutral-500">رقم: </span>
                  <span className="font-mono">{inv.invoice_no}</span>
                </div>
                <div>
                  <span className="text-neutral-500">التاريخ: </span>
                  {inv.issue_date}
                </div>
                <div>
                  <span className="text-neutral-500">الحالة: </span>
                  {statusLabel[inv.status]}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="rounded border p-3">
                <p className="text-[11px] text-neutral-500 mb-1">البائع</p>
                <p className="font-semibold">{inv.seller_name}</p>
                <p className="text-xs">الرقم الضريبي: {inv.seller_vat_number}</p>
              </div>
              <div className="rounded border p-3">
                <p className="text-[11px] text-neutral-500 mb-1">المشتري</p>
                <p className="font-semibold">{inv.buyer_name}</p>
                {inv.buyer_vat_number && <p className="text-xs">الرقم الضريبي: {inv.buyer_vat_number}</p>}
                {inv.buyer_address && <p className="text-xs">{inv.buyer_address}</p>}
              </div>
            </div>

            <table className="w-full text-sm border-collapse mb-5">
              <thead className="bg-neutral-100 text-right">
                <tr>
                  <th className="border px-2 py-1">#</th>
                  <th className="border px-2 py-1">الوصف</th>
                  <th className="border px-2 py-1">الكمية</th>
                  <th className="border px-2 py-1">الوحدة</th>
                  <th className="border px-2 py-1">السعر</th>
                  <th className="border px-2 py-1">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={it.id}>
                    <td className="border px-2 py-1">{idx + 1}</td>
                    <td className="border px-2 py-1">{it.description}</td>
                    <td className="border px-2 py-1">{Number(it.quantity).toFixed(2)}</td>
                    <td className="border px-2 py-1">{it.unit}</td>
                    <td className="border px-2 py-1">{Number(it.unit_price_sar).toFixed(2)}</td>
                    <td className="border px-2 py-1">{Number(it.line_total_sar).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-start justify-between gap-6">
              <div className="shrink-0">
                {qr && <img src={qr} alt="ZATCA QR" className="w-32 h-32 border rounded" />}
                <p className="text-[10px] text-neutral-500 mt-1 text-center">ZATCA QR</p>
              </div>
              <div className="text-sm space-y-1 min-w-[220px]">
                <div className="flex justify-between">
                  <span>المجموع قبل الضريبة</span>
                  <span>{Number(inv.subtotal_sar).toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span>الضريبة ({(Number(inv.vat_rate) * 100).toFixed(0)}%)</span>
                  <span>{Number(inv.vat_amount_sar).toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between border-t pt-1 font-bold text-base">
                  <span>الإجمالي</span>
                  <span>{Number(inv.grand_total_sar).toFixed(2)} ر.س</span>
                </div>
              </div>
            </div>

            {inv.notes && (
              <div className="mt-4 text-xs text-neutral-600">
                <strong>ملاحظات: </strong>
                {inv.notes}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
