import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Warehouse as WhIcon } from 'lucide-react';

type Wh = { id: string; name: string; city: string | null; address: string | null; is_default: boolean; active: boolean };
type Movement = { id: string; warehouse_id: string; variant_id: string; type: string; qty: number; note: string | null; created_at: string };

export default function AdminWarehouses() {
  const [rows, setRows] = useState<Wh[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', city: '', address: '' });

  const load = async () => {
    const [{ data: whs }, { data: mvs }] = await Promise.all([
      supabase.from('warehouses').select('*').order('created_at'),
      supabase.from('stock_movements').select('*').order('created_at', { ascending: false }).limit(50),
    ]);
    setRows((whs ?? []) as Wh[]);
    setMovements((mvs ?? []) as Movement[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.name.trim()) return;
    const { error } = await supabase.from('warehouses').insert({ name: form.name, city: form.city || null, address: form.address || null });
    if (error) return toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    setForm({ name: '', city: '', address: '' });
    load();
  };

  const toggleActive = async (w: Wh) => {
    await supabase.from('warehouses').update({ active: !w.active }).eq('id', w.id);
    load();
  };

  return (
    <div className="a-container py-6">
      <h1 className="a-display text-2xl mb-4"><WhIcon className="inline w-6 h-6 me-2" />إدارة المستودعات</h1>

      <div className="a-card p-4 mb-6">
        <h2 className="font-semibold mb-3">إضافة مستودع</h2>
        <div className="grid md:grid-cols-4 gap-2">
          <input className="a-input" placeholder="الاسم" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="a-input" placeholder="المدينة" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <input className="a-input" placeholder="العنوان" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <button className="a-btn a-btn-primary" onClick={create}><Plus className="w-4 h-4" />إضافة</button>
        </div>
      </div>

      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
        <>
          <div className="a-card overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--a-soft)' }}>
                <tr><th className="p-3 text-start">الاسم</th><th className="p-3 text-start">المدينة</th><th className="p-3 text-start">افتراضي</th><th className="p-3 text-start">نشط</th></tr>
              </thead>
              <tbody>
                {rows.map((w) => (
                  <tr key={w.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                    <td className="p-3 font-medium">{w.name}</td>
                    <td className="p-3">{w.city ?? '—'}</td>
                    <td className="p-3">{w.is_default ? '✓' : ''}</td>
                    <td className="p-3"><button className="a-btn text-xs" onClick={() => toggleActive(w)}>{w.active ? 'تعطيل' : 'تفعيل'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="a-card p-4">
            <h2 className="font-semibold mb-3">آخر 50 حركة مخزون</h2>
            {movements.length === 0 ? (
              <div className="p-6 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>لا توجد حركات بعد</div>
            ) : (
              <table className="w-full text-sm">
                <thead><tr><th className="p-2 text-start">النوع</th><th className="p-2 text-start">الكمية</th><th className="p-2 text-start">ملاحظة</th><th className="p-2 text-start">التاريخ</th></tr></thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                      <td className="p-2"><span className="a-pill text-xs">{m.type}</span></td>
                      <td className="p-2 font-mono">{m.qty}</td>
                      <td className="p-2">{m.note ?? '—'}</td>
                      <td className="p-2">{new Date(m.created_at).toLocaleString('ar-SA')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
