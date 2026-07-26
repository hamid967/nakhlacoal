import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Row = {
  id: string; company_name: string; contact_email: string | null; contact_phone: string | null;
  credit_limit_sar: number; payment_terms: string; status: string; approved_at: string | null;
};

const TERMS = ['prepaid','net15','net30','net45','net60'];
const STATUSES = ['pending','active','suspended','closed'];

export default function AdminWholesaleAccounts() {
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from('wholesale_accounts')
      .select('id, company_name, contact_email, contact_phone, credit_limit_sar, payment_terms, status, approved_at')
      .order('created_at', { ascending: false });
    setRows((data ?? []) as Row[]);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing) return;
    const { error } = await supabase.from('wholesale_accounts').update({
      credit_limit_sar: editing.credit_limit_sar,
      payment_terms: editing.payment_terms,
      status: editing.status,
    }).eq('id', editing.id);
    if (error) toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    else { toast({ title: 'تم الحفظ' }); setEditing(null); load(); }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">حسابات الجملة</h1>

      <div className="overflow-x-auto a-glass rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-start">الشركة</th>
              <th className="p-3">تواصل</th>
              <th className="p-3">الحد الائتماني</th>
              <th className="p-3">شروط الدفع</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-3">{r.company_name}</td>
                <td className="p-3 text-xs">{r.contact_email}<br/>{r.contact_phone}</td>
                <td className="p-3 text-center">{r.credit_limit_sar.toFixed(2)}</td>
                <td className="p-3 text-center">{r.payment_terms}</td>
                <td className="p-3 text-center"><span className="a-pill">{r.status}</span></td>
                <td className="p-3 text-center">
                  <button onClick={() => setEditing(r)} className="px-3 py-1 rounded border text-xs">تعديل</button>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">لا توجد حسابات</td></tr>}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setEditing(null)}>
          <div className="a-glass rounded-2xl p-6 w-full max-w-md space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold">{editing.company_name}</h2>
            <label className="block text-sm">
              الحد الائتماني (SAR)
              <input type="number" className="w-full mt-1 p-2 rounded border" value={editing.credit_limit_sar}
                onChange={(e) => setEditing({ ...editing, credit_limit_sar: parseFloat(e.target.value) || 0 })} />
            </label>
            <label className="block text-sm">
              شروط الدفع
              <select className="w-full mt-1 p-2 rounded border" value={editing.payment_terms}
                onChange={(e) => setEditing({ ...editing, payment_terms: e.target.value })}>
                {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label className="block text-sm">
              الحالة
              <select className="w-full mt-1 p-2 rounded border" value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <div className="flex gap-2">
              <button onClick={save} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground">حفظ</button>
              <button onClick={() => setEditing(null)} className="flex-1 py-2 rounded-lg border">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
