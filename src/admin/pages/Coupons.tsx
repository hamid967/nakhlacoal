import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Trash2, X, Search, Ticket, Copy, Check } from 'lucide-react';
import { logActivity } from '../lib/activity';

type Coupon = {
  id: string;
  code: string;
  discount_type: 'percent' | 'amount';
  discount_value: number;
  min_order_sar: number;
  max_uses: number | null;
  uses_count: number;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
};

const empty: Partial<Coupon> = {
  code: '',
  discount_type: 'percent',
  discount_value: 10,
  min_order_sar: 0,
  max_uses: null,
  starts_at: null,
  ends_at: null,
  is_active: true,
  notes: '',
};

export default function AdminCoupons() {
  const [rows, setRows] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Partial<Coupon>>(empty);
  const [copied, setCopied] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast.error(error.message);
    setRows((data as Coupon[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => rows.filter((r) => !q || r.code.toLowerCase().includes(q.toLowerCase())),
    [rows, q],
  );

  const startCreate = () => {
    setForm({ ...empty, code: randomCode() });
    setOpen(true);
  };
  const startEdit = (c: Coupon) => {
    setForm({
      ...c,
      starts_at: c.starts_at ? c.starts_at.slice(0, 16) : null,
      ends_at: c.ends_at ? c.ends_at.slice(0, 16) : null,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.code?.trim()) return toast.error('كود الكوبون مطلوب');
    if (form.discount_value == null || form.discount_value < 0) return toast.error('القيمة غير صحيحة');
    if (form.discount_type === 'percent' && Number(form.discount_value) > 100)
      return toast.error('النسبة لا تتجاوز 100');
    setSaving(true);
    const payload = {
      code: form.code!.trim().toUpperCase(),
      discount_type: form.discount_type as 'percent' | 'amount',
      discount_value: Number(form.discount_value) || 0,
      min_order_sar: Number(form.min_order_sar) || 0,
      max_uses: form.max_uses != null && `${form.max_uses}` !== '' ? Number(form.max_uses) : null,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      is_active: !!form.is_active,
      notes: form.notes || null,
    };
    const res = form.id
      ? await supabase.from('coupons').update(payload).eq('id', form.id)
      : await supabase.from('coupons').insert(payload);
    setSaving(false);
    if (res.error) return toast.error(res.error.message);
    logActivity({
      action: form.id ? 'update' : 'create',
      entity_table: 'coupons',
      entity_id: form.id ?? payload.code,
      summary: `${form.id ? 'تعديل' : 'إنشاء'} كوبون ${payload.code}`,
      new_data: payload,
    });
    toast.success(form.id ? 'تم التحديث' : 'تم الإنشاء');
    setOpen(false);
    load();
  };

  const remove = async (c: Coupon) => {
    if (!confirm(`حذف الكوبون "${c.code}"؟`)) return;
    const { error } = await supabase.from('coupons').delete().eq('id', c.id);
    if (error) return toast.error(error.message);
    logActivity({ action: 'delete', entity_table: 'coupons', entity_id: c.id, summary: `حذف كوبون ${c.code}`, old_data: c });
    toast.success('تم الحذف');
    setRows((r) => r.filter((x) => x.id !== c.id));
  };

  const toggle = async (c: Coupon) => {
    const next = !c.is_active;
    const { error } = await supabase.from('coupons').update({ is_active: next }).eq('id', c.id);
    if (error) return toast.error(error.message);
    logActivity({ action: 'update', entity_table: 'coupons', entity_id: c.id, summary: `${next ? 'تفعيل' : 'إيقاف'} ${c.code}` });
    setRows((r) => r.map((x) => (x.id === c.id ? { ...x, is_active: next } : x)));
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const set = <K extends keyof Coupon>(k: K, v: Coupon[K] | null) =>
    setForm((f) => ({ ...f, [k]: v as Coupon[K] }));

  const statusOf = (c: Coupon) => {
    const now = Date.now();
    if (!c.is_active) return { label: 'موقوف', tint: 'slate' };
    if (c.ends_at && new Date(c.ends_at).getTime() < now) return { label: 'منتهي', tint: 'rose' };
    if (c.starts_at && new Date(c.starts_at).getTime() > now) return { label: 'مجدول', tint: 'amber' };
    if (c.max_uses != null && c.uses_count >= c.max_uses) return { label: 'مستنفد', tint: 'rose' };
    return { label: 'نشط', tint: 'green' };
  };

  return (
    <div className="space-y-5">
      <header className="a-page-header">
        <div>
          <p className="a-crumbs">النمو · التسويق</p>
          <h1>الكوبونات والخصومات</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>
            أنشئ أكواد خصم بنسبة أو مبلغ ثابت مع حدود صلاحية واستخدام.
          </p>
        </div>
        <button onClick={startCreate} className="a-btn a-btn-palm">
          <Plus className="w-4 h-4" /> كوبون جديد
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
          placeholder="ابحث بكود الكوبون…"
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
            <Ticket className="h-6 w-6 mx-auto mb-2 opacity-60" />
            لا توجد كوبونات بعد
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--a-surface-2)' }}>
              <tr className="text-right">
                <th className="px-3 py-2 font-medium">الكود</th>
                <th className="px-3 py-2 font-medium">الخصم</th>
                <th className="px-3 py-2 font-medium">حد أدنى</th>
                <th className="px-3 py-2 font-medium">الاستخدام</th>
                <th className="px-3 py-2 font-medium">الصلاحية</th>
                <th className="px-3 py-2 font-medium">الحالة</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const st = statusOf(c);
                return (
                  <tr key={c.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-semibold">{c.code}</code>
                        <button
                          onClick={() => copyCode(c.code)}
                          className="p-1 rounded hover:bg-black/5"
                          title="نسخ"
                        >
                          {copied === c.code ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      {c.discount_type === 'percent'
                        ? `${Number(c.discount_value)}%`
                        : `${Number(c.discount_value).toLocaleString('ar-SA')} ر.س`}
                    </td>
                    <td className="px-3 py-2">{Number(c.min_order_sar).toLocaleString('ar-SA')} ر.س</td>
                    <td className="px-3 py-2">
                      {c.uses_count} {c.max_uses != null ? ` / ${c.max_uses}` : ''}
                    </td>
                    <td className="px-3 py-2 text-xs" style={{ color: 'var(--a-text-muted)' }}>
                      {c.starts_at ? new Date(c.starts_at).toLocaleDateString('ar-SA') : '—'}
                      {' → '}
                      {c.ends_at ? new Date(c.ends_at).toLocaleDateString('ar-SA') : '∞'}
                    </td>
                    <td className="px-3 py-2">
                      <button onClick={() => toggle(c)} className={`a-pill a-pill-${st.tint}`}>
                        {st.label}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => startEdit(c)} className="p-1.5 rounded hover:bg-black/5" title="تعديل">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => remove(c)}
                          className="p-1.5 rounded hover:bg-red-500/10 text-red-600"
                          title="حذف"
                        >
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
              <h2 className="text-lg font-semibold">{form.id ? 'تعديل كوبون' : 'كوبون جديد'}</h2>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-black/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="الكود *" value={form.code || ''} onChange={(v) => set('code', v.toUpperCase() as never)} />
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'var(--a-text-muted)' }}>
                  نوع الخصم
                </label>
                <select
                  value={form.discount_type}
                  onChange={(e) => set('discount_type', e.target.value as 'percent' | 'amount')}
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent"
                  style={{ borderColor: 'var(--a-border)' }}
                >
                  <option value="percent">نسبة %</option>
                  <option value="amount">مبلغ ثابت (ر.س)</option>
                </select>
              </div>
              <Field
                label={form.discount_type === 'percent' ? 'النسبة (%)' : 'المبلغ (ر.س)'}
                type="number"
                value={String(form.discount_value ?? '')}
                onChange={(v) => set('discount_value', Number(v) as never)}
              />
              <Field
                label="حد أدنى للطلب (ر.س)"
                type="number"
                value={String(form.min_order_sar ?? 0)}
                onChange={(v) => set('min_order_sar', Number(v) as never)}
              />
              <Field
                label="أقصى عدد استخدامات (اتركه فارغاً بلا حد)"
                type="number"
                value={form.max_uses == null ? '' : String(form.max_uses)}
                onChange={(v) => set('max_uses', v === '' ? null : (Number(v) as never))}
              />
              <div className="flex items-center gap-2 pt-6">
                <input
                  id="cp-active"
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => set('is_active', e.target.checked as never)}
                />
                <label htmlFor="cp-active" className="text-sm">
                  مفعّل
                </label>
              </div>
              <Field
                label="يبدأ في"
                type="datetime-local"
                value={form.starts_at ?? ''}
                onChange={(v) => set('starts_at', (v || null) as never)}
              />
              <Field
                label="ينتهي في"
                type="datetime-local"
                value={form.ends_at ?? ''}
                onChange={(v) => set('ends_at', (v || null) as never)}
              />
              <div className="md:col-span-2">
                <label className="text-xs mb-1 block" style={{ color: 'var(--a-text-muted)' }}>
                  ملاحظات
                </label>
                <textarea
                  value={form.notes || ''}
                  onChange={(e) => set('notes', e.target.value as never)}
                  rows={2}
                  className="w-full rounded-lg border px-3 py-2 text-sm bg-transparent outline-none"
                  style={{ borderColor: 'var(--a-border)' }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-lg text-sm border"
                style={{ borderColor: 'var(--a-border)' }}
              >
                إلغاء
              </button>
              <button onClick={save} disabled={saving} className="a-btn a-btn-palm">
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
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs mb-1 block" style={{ color: 'var(--a-text-muted)' }}>
        {label}
      </label>
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

function randomCode() {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}
