import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Tier = {
  id: string; account_id: string; variant_id: string | null; category_id: string | null;
  discount_pct: number | null; fixed_price_sar: number | null; min_qty: number; valid_until: string | null;
};
type Account = { id: string; company_name: string };
type Variant = { id: string; sku: string; label_ar: string };

export default function AdminPriceTiers() {
  const [accts, setAccts] = useState<Account[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [form, setForm] = useState<Partial<Tier>>({ min_qty: 1 });

  useEffect(() => {
    (async () => {
      const [a, v] = await Promise.all([
        supabase.from('wholesale_accounts').select('id, company_name').order('company_name'),
        supabase.from('product_variants').select('id, sku, label_ar').eq('is_active', true).order('sku').limit(500),
      ]);
      setAccts((a.data ?? []) as Account[]);
      setVariants((v.data ?? []) as Variant[]);
    })();
  }, []);

  useEffect(() => {
    if (!selected) { setTiers([]); return; }
    (async () => {
      const { data } = await supabase.from('wholesale_price_tiers').select('*').eq('account_id', selected).order('created_at', { ascending: false });
      setTiers((data ?? []) as Tier[]);
    })();
  }, [selected]);

  const add = async () => {
    if (!selected) return toast({ title: 'اختر حسابًا', variant: 'destructive' });
    if (!form.variant_id && !form.category_id) return toast({ title: 'اختر منتجًا', variant: 'destructive' });
    if (form.discount_pct == null && form.fixed_price_sar == null) return toast({ title: 'أدخل خصمًا أو سعرًا ثابتًا', variant: 'destructive' });

    const { error } = await supabase.from('wholesale_price_tiers').insert({
      account_id: selected,
      variant_id: form.variant_id ?? null,
      discount_pct: form.discount_pct ?? null,
      fixed_price_sar: form.fixed_price_sar ?? null,
      min_qty: form.min_qty ?? 1,
    });
    if (error) return toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    setForm({ min_qty: 1 });
    const { data } = await supabase.from('wholesale_price_tiers').select('*').eq('account_id', selected).order('created_at', { ascending: false });
    setTiers((data ?? []) as Tier[]);
  };

  const remove = async (id: string) => {
    if (!confirm('حذف؟')) return;
    await supabase.from('wholesale_price_tiers').delete().eq('id', id);
    setTiers((t) => t.filter((x) => x.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">قواعد تسعير الجملة</h1>

      <div>
        <label className="block text-sm mb-1">الحساب</label>
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="p-2 rounded border min-w-[280px]">
          <option value="">— اختر —</option>
          {accts.map((a) => <option key={a.id} value={a.id}>{a.company_name}</option>)}
        </select>
      </div>

      {selected && (
        <>
          <div className="a-glass p-4 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-3 items-end">
            <label className="text-sm col-span-2">
              المنتج (variant)
              <select value={form.variant_id ?? ''} onChange={(e) => setForm({ ...form, variant_id: e.target.value || null })} className="w-full mt-1 p-2 rounded border">
                <option value="">—</option>
                {variants.map((v) => <option key={v.id} value={v.id}>{v.sku} — {v.label_ar}</option>)}
              </select>
            </label>
            <label className="text-sm">
              خصم %
              <input type="number" step="0.5" value={form.discount_pct ?? ''} onChange={(e) => setForm({ ...form, discount_pct: e.target.value === '' ? null : parseFloat(e.target.value) })} className="w-full mt-1 p-2 rounded border" />
            </label>
            <label className="text-sm">
              سعر ثابت
              <input type="number" step="0.01" value={form.fixed_price_sar ?? ''} onChange={(e) => setForm({ ...form, fixed_price_sar: e.target.value === '' ? null : parseFloat(e.target.value) })} className="w-full mt-1 p-2 rounded border" />
            </label>
            <label className="text-sm">
              حد أدنى للكمية
              <input type="number" value={form.min_qty ?? 1} onChange={(e) => setForm({ ...form, min_qty: parseInt(e.target.value) || 1 })} className="w-full mt-1 p-2 rounded border" />
            </label>
            <button onClick={add} className="md:col-span-5 py-2 rounded-lg bg-primary text-primary-foreground">إضافة قاعدة</button>
          </div>

          <div className="overflow-x-auto a-glass rounded-xl">
            <table className="w-full text-sm">
              <thead><tr className="border-b">
                <th className="p-3">Variant</th><th className="p-3">خصم %</th><th className="p-3">سعر ثابت</th><th className="p-3">حد أدنى</th><th className="p-3"></th>
              </tr></thead>
              <tbody>
                {tiers.map((t) => {
                  const v = variants.find((x) => x.id === t.variant_id);
                  return (
                    <tr key={t.id} className="border-b">
                      <td className="p-3">{v ? `${v.sku} — ${v.label_ar}` : t.variant_id ?? '(category)'}</td>
                      <td className="p-3 text-center">{t.discount_pct ?? '—'}</td>
                      <td className="p-3 text-center">{t.fixed_price_sar ?? '—'}</td>
                      <td className="p-3 text-center">{t.min_qty}</td>
                      <td className="p-3 text-center"><button onClick={() => remove(t.id)} className="text-xs text-red-600">حذف</button></td>
                    </tr>
                  );
                })}
                {!tiers.length && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">لا توجد قواعد</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
