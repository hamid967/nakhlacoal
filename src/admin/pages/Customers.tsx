import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Plus, Pencil, Trash2, X, Loader2, TrendingUp, ShoppingBag, Crown, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { logActivity } from '../lib/activity';

type Customer = {
  id: string;
  company_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  address: string | null;
  commercial_register: string | null;
  vat_number: string | null;
  payment_terms_days: number;
  credit_limit_sar: number;
  balance_sar: number;
  notes: string | null;
  created_at: string;
};

const empty: Partial<Customer> = {
  company_name: '',
  contact_name: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  commercial_register: '',
  vat_number: '',
  payment_terms_days: 0,
  credit_limit_sar: 0,
  notes: '',
};

type OrderRow = {
  id: string; created_at: string; product_type: string | null;
  quantity: number | null; unit: string | null; status: string | null;
  contact_name?: string | null; phone?: string | null; email?: string | null;
  company_name?: string | null;
};

type Segment = 'vip' | 'loyal' | 'active' | 'new';
const SEGMENT_META: Record<Segment, { label: string; tint: string; icon: typeof Crown }> = {
  vip:    { label: 'VIP',     tint: 'gold',   icon: Crown },
  loyal:  { label: 'منتظم',   tint: 'green',  icon: TrendingUp },
  active: { label: 'نشط',     tint: 'blue',   icon: ShoppingBag },
  new:    { label: 'جديد',    tint: 'violet', icon: Sparkles },
};

function segmentOf(count: number, revenue: number): Segment {
  if (revenue >= 50000 || count >= 20) return 'vip';
  if (count >= 5) return 'loyal';
  if (count >= 1) return 'active';
  return 'new';
}

export default function AdminCustomers() {
  const [rows, setRows] = useState<Customer[]>([]);
  const [allOrders, setAllOrders] = useState<OrderRow[]>([]);
  const [inv, setInv] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Customer>>(empty);
  const [detail, setDetail] = useState<Customer | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: cs, error }, { data: os }, { data: iv }] = await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('id, created_at, product_type, quantity, unit, status, contact_name, phone, email, company_name').order('created_at', { ascending: false }).limit(2000),
      supabase.from('inventory_items').select('*'),
    ]);
    if (error) toast.error(error.message);
    setRows((cs as Customer[]) || []);
    setAllOrders((os as OrderRow[]) || []);
    setInv(iv || []);
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
          r.company_name.toLowerCase().includes(q.toLowerCase()) ||
          (r.contact_name || '').toLowerCase().includes(q.toLowerCase()) ||
          (r.phone || '').includes(q) ||
          (r.email || '').toLowerCase().includes(q.toLowerCase()),
      ),
    [rows, q],
  );

  const startCreate = () => {
    setForm(empty);
    setOpen(true);
  };
  const startEdit = (c: Customer) => {
    setForm(c);
    setOpen(true);
  };

  const save = async () => {
    if (!form.company_name?.trim()) {
      toast.error('اسم الشركة مطلوب');
      return;
    }
    setSaving(true);
    const payload = {
      company_name: form.company_name!.trim(),
      contact_name: form.contact_name || null,
      phone: form.phone || null,
      email: form.email || null,
      city: form.city || null,
      address: form.address || null,
      commercial_register: form.commercial_register || null,
      vat_number: form.vat_number || null,
      payment_terms_days: Number(form.payment_terms_days) || 0,
      credit_limit_sar: Number(form.credit_limit_sar) || 0,
      notes: form.notes || null,
    };
    const res = form.id
      ? await supabase.from('customers').update(payload).eq('id', form.id)
      : await supabase.from('customers').insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    logActivity({
      action: form.id ? 'update' : 'create',
      entity_table: 'customers',
      entity_id: form.id ?? null,
      summary: `${form.id ? 'تعديل' : 'إنشاء'} عميل: ${payload.company_name}`,
      new_data: payload,
    });
    toast.success(form.id ? 'تم التحديث' : 'تم الإنشاء');
    setOpen(false);
    load();
  };

  const remove = async (c: Customer) => {
    if (!confirm(`حذف العميل "${c.company_name}"؟`)) return;
    const { error } = await supabase.from('customers').delete().eq('id', c.id);
    if (error) return toast.error(error.message);
    logActivity({ action: 'delete', entity_table: 'customers', entity_id: c.id, summary: `حذف عميل: ${c.company_name}`, old_data: c });
    toast.success('تم الحذف');
    setRows((r) => r.filter((x) => x.id !== c.id));
  };

  // Match orders to a customer by phone/email/company_name and compute LTV metrics
  const priceOf = (o: OrderRow) => {
    const u = (o.unit || '').toLowerCase();
    const q = Number(o.quantity) || 0;
    const kg = u.includes('ton') || u.includes('طن') ? q * 1000 : u.includes('box') || u.includes('كرت') ? q * 10 : q;
    const item = inv.find((it) => {
      try { return new RegExp(it.match_pattern || it.slug, 'i').test(o.product_type || ''); } catch { return false; }
    });
    const tiers = Array.isArray(item?.tiers) ? item!.tiers : [];
    const price = tiers.length ? Math.min(...tiers.map((t: any) => Number(t.pricePerKg ?? t.price_sar) || 0).filter(Boolean)) : 0;
    return kg * price;
  };
  const ordersOf = (c: Customer): OrderRow[] => {
    const phone = (c.phone || '').replace(/\s+/g, '');
    const email = (c.email || '').toLowerCase();
    const name = (c.company_name || '').toLowerCase();
    return allOrders.filter((o) =>
      (phone && (o.phone || '').replace(/\s+/g, '').endsWith(phone.slice(-8))) ||
      (email && (o.email || '').toLowerCase() === email) ||
      (name && (o.company_name || '').toLowerCase() === name)
    );
  };
  const metricsOf = (c: Customer) => {
    const os = ordersOf(c);
    const revenue = os.reduce((s, o) => s + priceOf(o), 0);
    return { count: os.length, revenue, segment: segmentOf(os.length, revenue), lastAt: os[0]?.created_at ?? null, orders: os };
  };

  const set = (k: keyof Customer, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <header className="a-page-header">
        <div>
          <p className="a-crumbs">CRM</p>
          <h1>العملاء</h1>
          <p>{rows.length} عميل</p>
        </div>
        <button
          onClick={startCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'var(--a-accent)', color: '#fff' }}
        >
          <Plus className="h-4 w-4" /> عميل جديد
        </button>
      </header>

      <div className="flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}>
        <Search className="h-4 w-4 opacity-60" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالاسم، الجوال، البريد..."
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>

      <div className="rounded-xl border overflow-hidden"
        style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}>
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>
            <Users className="h-6 w-6 mx-auto mb-2 opacity-60" />
            لا يوجد عملاء
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--a-surface-2)' }}>
              <tr className="text-right">
                <th className="px-3 py-2 font-medium">الشركة</th>
                <th className="px-3 py-2 font-medium">المسؤول</th>
                <th className="px-3 py-2 font-medium">الجوال</th>
                <th className="px-3 py-2 font-medium">البريد</th>
                <th className="px-3 py-2 font-medium">المدينة</th>
                <th className="px-3 py-2 font-medium">الرصيد</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                  <td className="px-3 py-2 font-medium">{c.company_name}</td>
                  <td className="px-3 py-2">{c.contact_name || '—'}</td>
                  <td className="px-3 py-2 ltr-text">{c.phone || '—'}</td>
                  <td className="px-3 py-2 ltr-text">{c.email || '—'}</td>
                  <td className="px-3 py-2">{c.city || '—'}</td>
                  <td className="px-3 py-2">{Number(c.balance_sar).toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => startEdit(c)}
                        className="p-1.5 rounded hover:bg-black/5" title="تعديل">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(c)}
                        className="p-1.5 rounded hover:bg-red-500/10 text-red-600" title="حذف">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onClick={() => setOpen(false)}>
          <div onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-xl border p-5 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--a-surface)', borderColor: 'var(--a-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{form.id ? 'تعديل عميل' : 'عميل جديد'}</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-black/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="اسم الشركة *" value={form.company_name || ''} onChange={(v) => set('company_name', v)} />
              <Field label="اسم المسؤول" value={form.contact_name || ''} onChange={(v) => set('contact_name', v)} />
              <Field label="الجوال" value={form.phone || ''} onChange={(v) => set('phone', v)} />
              <Field label="البريد" type="email" value={form.email || ''} onChange={(v) => set('email', v)} />
              <Field label="المدينة" value={form.city || ''} onChange={(v) => set('city', v)} />
              <Field label="العنوان" value={form.address || ''} onChange={(v) => set('address', v)} />
              <Field label="السجل التجاري" value={form.commercial_register || ''} onChange={(v) => set('commercial_register', v)} />
              <Field label="الرقم الضريبي" value={form.vat_number || ''} onChange={(v) => set('vat_number', v)} />
              <Field label="مهلة السداد (يوم)" type="number" value={String(form.payment_terms_days ?? 0)} onChange={(v) => set('payment_terms_days', v)} />
              <Field label="الحد الائتماني (ر.س)" type="number" value={String(form.credit_limit_sar ?? 0)} onChange={(v) => set('credit_limit_sar', v)} />
              <div className="md:col-span-2">
                <label className="text-xs mb-1 block" style={{ color: 'var(--a-text-muted)' }}>ملاحظات</label>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) => set('notes', e.target.value)}
                  rows={3}
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

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
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
