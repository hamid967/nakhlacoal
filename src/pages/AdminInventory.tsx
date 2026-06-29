import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import { Loader2, Plus, Save, Trash2, RefreshCw, X } from 'lucide-react';
import { toast } from 'sonner';

type Tier = { minKg: number; pricePerKg: number };
type Row = {
  id: string;
  slug: string;
  label: string;
  match_pattern: string;
  in_stock_kg: number;
  min_order_kg: number;
  lead_days: number;
  tiers: Tier[];
  sort_order: number;
  active: boolean;
};

const blank = (): Omit<Row, 'id'> => ({
  slug: '', label: '', match_pattern: '', in_stock_kg: 0, min_order_kg: 1,
  lead_days: 1, tiers: [{ minKg: 0, pricePerKg: 0 }], sort_order: 99, active: true,
});

export default function AdminInventory() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState(blank());

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory_items').select('*').order('sort_order', { ascending: true });
    if (error) toast.error(error.message);
    else setRows((data as any) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function update(id: string, patch: Partial<Row>) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r));
  }

  async function save(r: Row) {
    setSaving(r.id);
    const { error } = await supabase.from('inventory_items').update({
      slug: r.slug, label: r.label, match_pattern: r.match_pattern,
      in_stock_kg: r.in_stock_kg, min_order_kg: r.min_order_kg,
      lead_days: r.lead_days, tiers: r.tiers as any, sort_order: r.sort_order, active: r.active,
    }).eq('id', r.id);
    setSaving(null);
    if (error) toast.error(error.message); else toast.success('تم الحفظ');
  }

  async function remove(id: string) {
    if (!confirm('حذف هذا الصنف؟')) return;
    const { error } = await supabase.from('inventory_items').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('تم الحذف'); load(); }
  }

  async function add() {
    if (!draft.slug || !draft.label || !draft.match_pattern) {
      toast.error('املأ المعرّف والاسم ونمط المطابقة'); return;
    }
    const { error } = await supabase.from('inventory_items').insert({
      ...draft, tiers: draft.tiers as any,
    });
    if (error) toast.error(error.message);
    else { toast.success('تمت الإضافة'); setAdding(false); setDraft(blank()); load(); }
  }

  return (
    <div className="min-h-dvh bg-background pt-24 pb-16">
      <SEO title="إدارة المخزون | فحم النخلة" description="لوحة إدارة المخزون والأسعار" path="/admin/inventory" />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">إدارة المخزون والأسعار</h1>
          <div className="flex gap-2">
            <button onClick={load} className="btn-glass px-4 py-2 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> تحديث
            </button>
            <button onClick={() => setAdding(v => !v)} className="btn-glass px-4 py-2 flex items-center gap-2">
              <Plus className="w-4 h-4" /> إضافة
            </button>
          </div>
        </div>

        {adding && (
          <div className="glass-card p-5 mb-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">صنف جديد</h2>
              <button onClick={() => setAdding(false)}><X className="w-4 h-4" /></button>
            </div>
            <Editor row={{ id: '', ...draft }} onChange={p => setDraft(d => ({ ...d, ...p }))} />
            <button onClick={add} className="btn-glass px-4 py-2 flex items-center gap-2">
              <Save className="w-4 h-4" /> حفظ الصنف
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>
        ) : (
          <div className="space-y-4">
            {rows.map(r => (
              <div key={r.id} className="glass-card p-5">
                <Editor row={r} onChange={p => update(r.id, p)} />
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={() => remove(r.id)} className="px-3 py-2 rounded bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> حذف
                  </button>
                  <button onClick={() => save(r)} disabled={saving === r.id}
                    className="btn-glass px-4 py-2 flex items-center gap-2 disabled:opacity-50">
                    {saving === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Editor({ row, onChange }: { row: Row; onChange: (patch: Partial<Row>) => void }) {
  const setTier = (i: number, patch: Partial<Tier>) => {
    const tiers = row.tiers.map((t, idx) => idx === i ? { ...t, ...patch } : t);
    onChange({ tiers });
  };
  const addTier = () => onChange({ tiers: [...row.tiers, { minKg: 0, pricePerKg: 0 }] });
  const delTier = (i: number) => onChange({ tiers: row.tiers.filter((_, idx) => idx !== i) });

  return (
    <div className="grid md:grid-cols-2 gap-3 text-sm">
      <Field label="المعرّف (slug)"><input className="lux-input" value={row.slug} onChange={e => onChange({ slug: e.target.value })} /></Field>
      <Field label="الاسم"><input className="lux-input" value={row.label} onChange={e => onChange({ label: e.target.value })} /></Field>
      <Field label="نمط المطابقة (Regex)" full>
        <input className="lux-input" value={row.match_pattern} onChange={e => onChange({ match_pattern: e.target.value })} placeholder="مثل: شواء|bbq" />
      </Field>
      <Field label="المخزون (كجم)"><input type="number" className="lux-input" value={row.in_stock_kg} onChange={e => onChange({ in_stock_kg: +e.target.value })} /></Field>
      <Field label="الحد الأدنى (كجم)"><input type="number" className="lux-input" value={row.min_order_kg} onChange={e => onChange({ min_order_kg: +e.target.value })} /></Field>
      <Field label="مدة التجهيز (أيام)"><input type="number" className="lux-input" value={row.lead_days} onChange={e => onChange({ lead_days: +e.target.value })} /></Field>
      <Field label="الترتيب"><input type="number" className="lux-input" value={row.sort_order} onChange={e => onChange({ sort_order: +e.target.value })} /></Field>
      <div className="md:col-span-2">
        <div className="flex items-center justify-between mb-2">
          <label className="font-medium">الشرائح السعرية</label>
          <button onClick={addTier} className="text-gold text-xs flex items-center gap-1"><Plus className="w-3 h-3" /> شريحة</button>
        </div>
        <div className="space-y-2">
          {row.tiers.map((t, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
              <input type="number" className="lux-input" placeholder="من كجم" value={t.minKg} onChange={e => setTier(i, { minKg: +e.target.value })} />
              <input type="number" step="0.01" className="lux-input" placeholder="ر.س / كجم" value={t.pricePerKg} onChange={e => setTier(i, { pricePerKg: +e.target.value })} />
              <button onClick={() => delTier(i)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>
      <label className="flex items-center gap-2 md:col-span-2">
        <input type="checkbox" checked={row.active} onChange={e => onChange({ active: e.target.checked })} /> مفعّل
      </label>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <label className="block text-xs text-muted-foreground mb-1">{label}</label>
      {children}
    </div>
  );
}
