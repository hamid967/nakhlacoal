import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Truck, Plus, Search, X, Loader2, Pencil, Trash2, ExternalLink } from 'lucide-react';

type Shipment = {
  id: string;
  order_id: string | null;
  customer_user_id: string | null;
  carrier: string;
  tracking_no: string | null;
  tracking_url: string | null;
  status: 'preparing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled';
  weight_kg: number | null;
  shipping_cost_sar: number | null;
  origin_city: string | null;
  destination_city: string | null;
  destination_address: string | null;
  recipient_name: string | null;
  recipient_phone: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
};
type Order = {
  id: string;
  company_name: string;
  contact_name: string;
  phone: string;
  city: string | null;
  address: string | null;
  user_id: string | null;
  product_type: string;
  quantity: number;
  unit: string;
};

const STATUSES: Shipment['status'][] = [
  'preparing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'returned',
  'cancelled',
];
const statusLabel: Record<string, string> = {
  preparing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  out_for_delivery: 'خارج للتوصيل',
  delivered: 'تم التسليم',
  returned: 'مرتجعة',
  cancelled: 'ملغاة',
};
const statusColor: Record<string, string> = {
  preparing: '#9ca3af',
  shipped: '#2563eb',
  out_for_delivery: '#d97706',
  delivered: '#16a34a',
  returned: '#dc2626',
  cancelled: '#6b7280',
};

const CARRIERS = ['Aramex', 'SMSA', 'DHL', 'FedEx', 'SPL', 'Naqel', 'Other'];

const empty: Partial<Shipment> = {
  carrier: 'Aramex',
  status: 'preparing',
  origin_city: 'جدة',
  shipping_cost_sar: 0,
};

export default function AdminShipments() {
  const [rows, setRows] = useState<Shipment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Shipment>>(empty);

  const load = async () => {
    setLoading(true);
    const [s, o] = await Promise.all([
      supabase.from('shipments').select('*').order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('id,company_name,contact_name,phone,city,address,user_id,product_type,quantity,unit')
        .order('created_at', { ascending: false })
        .limit(300),
    ]);
    if (s.error) toast.error(s.error.message);
    setRows((s.data as Shipment[]) || []);
    setOrders((o.data as Order[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const orderMap = useMemo(() => new Map(orders.map((o) => [o.id, o])), [orders]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (filter !== 'all' && r.status !== filter) return false;
        if (!q) return true;
        const ord = r.order_id ? orderMap.get(r.order_id) : null;
        const hay = [
          r.tracking_no,
          r.carrier,
          r.recipient_name,
          r.recipient_phone,
          r.destination_city,
          ord?.company_name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(q.toLowerCase());
      }),
    [rows, q, filter, orderMap],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    STATUSES.forEach((s) => (c[s] = 0));
    rows.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
    return c;
  }, [rows]);

  const startCreate = () => {
    setForm(empty);
    setOpen(true);
  };
  const startEdit = (s: Shipment) => {
    setForm(s);
    setOpen(true);
  };

  const onOrderPick = (orderId: string) => {
    const o = orderMap.get(orderId);
    if (!o) {
      setForm((f) => ({ ...f, order_id: orderId }));
      return;
    }
    setForm((f) => ({
      ...f,
      order_id: orderId,
      customer_user_id: o.user_id,
      recipient_name: f.recipient_name || o.contact_name,
      recipient_phone: f.recipient_phone || o.phone,
      destination_city: f.destination_city || o.city || '',
      destination_address: f.destination_address || o.address || '',
      weight_kg: f.weight_kg ?? (o.unit === 'kg' ? Number(o.quantity) : null),
    }));
  };

  const updateStatus = async (s: Shipment, status: Shipment['status']) => {
    const patch: any = { status };
    if (status === 'shipped' && !s.shipped_at) patch.shipped_at = new Date().toISOString();
    if (status === 'delivered' && !s.delivered_at) patch.delivered_at = new Date().toISOString();
    const { error } = await supabase.from('shipments').update(patch).eq('id', s.id);
    if (error) return toast.error(error.message);
    toast.success('تم التحديث');
    setRows((r) => r.map((x) => (x.id === s.id ? { ...x, ...patch } : x)));
  };

  const save = async () => {
    if (!form.carrier) return toast.error('الناقل مطلوب');
    setSaving(true);
    const payload: any = {
      order_id: form.order_id || null,
      customer_user_id: form.customer_user_id || null,
      carrier: form.carrier,
      tracking_no: form.tracking_no || null,
      tracking_url: form.tracking_url || null,
      status: form.status || 'preparing',
      weight_kg: form.weight_kg != null && form.weight_kg !== ('' as any) ? Number(form.weight_kg) : null,
      shipping_cost_sar: Number(form.shipping_cost_sar) || 0,
      origin_city: form.origin_city || null,
      destination_city: form.destination_city || null,
      destination_address: form.destination_address || null,
      recipient_name: form.recipient_name || null,
      recipient_phone: form.recipient_phone || null,
      notes: form.notes || null,
    };
    const res = form.id
      ? await supabase.from('shipments').update(payload).eq('id', form.id)
      : await supabase.from('shipments').insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    toast.success(form.id ? 'تم التحديث' : 'تم الإنشاء');
    setOpen(false);
    load();
  };

  const remove = async (s: Shipment) => {
    if (!confirm('حذف الشحنة؟')) return;
    const { error } = await supabase.from('shipments').delete().eq('id', s.id);
    if (error) return toast.error(error.message);
    toast.success('تم الحذف');
    setRows((r) => r.filter((x) => x.id !== s.id));
  };

  const set = (k: keyof Shipment, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <header className="a-page-header">
        <div>
          <p className="a-crumbs">LOGISTICS</p>
          <h1>الشحنات</h1>
          <p>{rows.length} شحنة</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--a-accent)', color: '#fff' }}
        >
          <Plus className="h-4 w-4" /> شحنة جديدة
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {(['all', ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs border ${filter === s ? 'font-semibold' : ''}`}
            style={{
              borderColor: filter === s ? 'var(--a-accent)' : 'var(--a-border)',
              background: filter === s ? 'var(--a-accent)' : 'transparent',
              color: filter === s ? '#fff' : 'inherit',
            }}
          >
            {s === 'all' ? 'الكل' : statusLabel[s]} ({counts[s] || 0})
          </button>
        ))}
      </div>

      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}
      >
        <Search className="h-4 w-4 opacity-60" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="رقم التتبع، العميل، الناقل، المدينة..."
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>

      <div
        className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}
      >
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>
            <Truck className="h-6 w-6 mx-auto mb-2 opacity-60" />
            لا توجد شحنات
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--a-surface-2)' }}>
              <tr className="text-right">
                <th className="px-3 py-2 font-medium">التتبع</th>
                <th className="px-3 py-2 font-medium">الطلب / العميل</th>
                <th className="px-3 py-2 font-medium">الناقل</th>
                <th className="px-3 py-2 font-medium">الوجهة</th>
                <th className="px-3 py-2 font-medium">الحالة</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const ord = s.order_id ? orderMap.get(s.order_id) : null;
                return (
                  <tr key={s.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                    <td className="px-3 py-2">
                      {s.tracking_no ? (
                        <div className="flex items-center gap-1 font-mono text-xs">
                          {s.tracking_no}
                          {s.tracking_url && (
                            <a href={s.tracking_url} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-3 w-3 opacity-60" />
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs opacity-60">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {ord ? (
                        <div>
                          <div className="font-medium">{ord.company_name}</div>
                          <div className="text-[11px] opacity-60">
                            {ord.product_type} · {ord.quantity}{ord.unit}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs opacity-60">{s.recipient_name || '—'}</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{s.carrier}</td>
                    <td className="px-3 py-2 text-xs">{s.destination_city || '—'}</td>
                    <td className="px-3 py-2">
                      <select
                        value={s.status}
                        onChange={(e) => updateStatus(s, e.target.value as Shipment['status'])}
                        className="text-xs px-2 py-1 rounded text-white border-0 outline-none"
                        style={{ background: statusColor[s.status] }}
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st} className="text-black">
                            {statusLabel[st]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(s)} className="p-1.5 rounded hover:bg-black/5" title="تعديل">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => remove(s)} className="p-1.5 rounded hover:bg-red-500/10 text-red-600" title="حذف">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-xl border p-5 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--a-surface)', borderColor: 'var(--a-border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{form.id ? 'تعديل شحنة' : 'شحنة جديدة'}</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-black/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs mb-1 block" style={{ color: 'var(--a-text-muted)' }}>الطلب المرتبط</label>
                <select
                  value={form.order_id || ''}
                  onChange={(e) => onOrderPick(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
                  style={{ borderColor: 'var(--a-border)' }}
                >
                  <option value="">— بدون طلب —</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.company_name} · {o.product_type} · {o.quantity}{o.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--a-text-muted)' }}>الناقل *</label>
                <select
                  value={form.carrier || 'Aramex'}
                  onChange={(e) => set('carrier', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
                  style={{ borderColor: 'var(--a-border)' }}
                >
                  {CARRIERS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--a-text-muted)' }}>الحالة</label>
                <select
                  value={form.status || 'preparing'}
                  onChange={(e) => set('status', e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
                  style={{ borderColor: 'var(--a-border)' }}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
              </div>

              <Field label="رقم التتبع" value={form.tracking_no || ''} onChange={(v) => set('tracking_no', v)} />
              <Field label="رابط التتبع" value={form.tracking_url || ''} onChange={(v) => set('tracking_url', v)} />

              <Field label="اسم المستلم" value={form.recipient_name || ''} onChange={(v) => set('recipient_name', v)} />
              <Field label="جوال المستلم" value={form.recipient_phone || ''} onChange={(v) => set('recipient_phone', v)} />

              <Field label="مدينة المصدر" value={form.origin_city || ''} onChange={(v) => set('origin_city', v)} />
              <Field label="مدينة الوجهة" value={form.destination_city || ''} onChange={(v) => set('destination_city', v)} />

              <div className="md:col-span-2">
                <Field label="عنوان التسليم" value={form.destination_address || ''} onChange={(v) => set('destination_address', v)} />
              </div>

              <Field label="الوزن (كجم)" type="number" value={String(form.weight_kg ?? '')} onChange={(v) => set('weight_kg', v)} />
              <Field label="تكلفة الشحن (ر.س)" type="number" value={String(form.shipping_cost_sar ?? 0)} onChange={(v) => set('shipping_cost_sar', v)} />

              <div className="md:col-span-2">
                <label className="text-xs mb-1 block" style={{ color: 'var(--a-text-muted)' }}>ملاحظات</label>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
                  style={{ borderColor: 'var(--a-border)' }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm border"
                style={{ borderColor: 'var(--a-border)' }}>إلغاء</button>
              <button onClick={save} disabled={saving}
                className="px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2"
                style={{ background: 'var(--a-accent)', color: '#fff' }}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text',
}: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: 'var(--a-text-muted)' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
        style={{ borderColor: 'var(--a-border)' }}
      />
    </div>
  );
}
