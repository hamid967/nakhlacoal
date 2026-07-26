import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Lead = {
  id: string; company: string; contact_name: string; email: string; phone: string | null;
  city: string | null; monthly_volume_kg: number | null; status: string; created_at: string;
};

export default function AdminWholesaleLeads() {
  const [rows, setRows] = useState<Lead[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from('wholesale_leads')
      .select('id, company, contact_name, email, phone, city, monthly_volume_kg, status, created_at')
      .order('created_at', { ascending: false });
    setRows((data ?? []) as Lead[]);
  };

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: 'approved' | 'rejected') => {
    setBusy(id);
    const { error } = await supabase.from('wholesale_leads').update({ status }).eq('id', id);
    if (error) toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    else toast({ title: status === 'approved' ? 'تم الاعتماد وإنشاء حساب جملة' : 'تم الرفض' });
    setBusy(null);
    load();
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">طلبات الجملة</h1>
      <div className="overflow-x-auto a-glass rounded-xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-start">الشركة</th>
              <th className="p-3 text-start">جهة الاتصال</th>
              <th className="p-3">الحجم/شهر (كجم)</th>
              <th className="p-3">المدينة</th>
              <th className="p-3">الحالة</th>
              <th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-b">
                <td className="p-3">{l.company}</td>
                <td className="p-3">
                  <div>{l.contact_name}</div>
                  <div className="text-xs text-muted-foreground">{l.email} · {l.phone}</div>
                </td>
                <td className="p-3 text-center">{l.monthly_volume_kg ?? '—'}</td>
                <td className="p-3 text-center">{l.city ?? '—'}</td>
                <td className="p-3 text-center"><span className="a-pill">{l.status}</span></td>
                <td className="p-3 text-center">
                  <div className="flex gap-2 justify-center">
                    <button disabled={busy===l.id || l.status==='approved'} onClick={() => setStatus(l.id,'approved')} className="px-3 py-1 rounded bg-primary text-primary-foreground text-xs disabled:opacity-50">اعتماد</button>
                    <button disabled={busy===l.id || l.status==='rejected'} onClick={() => setStatus(l.id,'rejected')} className="px-3 py-1 rounded border text-xs disabled:opacity-50">رفض</button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">لا توجد طلبات</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
