import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type Row = {
  id: string;
  period_start: string;
  period_end: string;
  opening_balance_sar: number;
  invoiced_sar: number;
  paid_sar: number;
  closing_balance_sar: number;
  pdf_url: string | null;
};

export default function WholesaleStatement() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: acct } = await supabase
        .from('wholesale_accounts').select('id').eq('user_id', user.id).maybeSingle();
      if (!acct) { setLoading(false); return; }
      const { data } = await supabase
        .from('wholesale_statements')
        .select('*')
        .eq('account_id', acct.id)
        .order('period_start', { ascending: false });
      setRows((data ?? []) as Row[]);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <div className="p-6">جاري التحميل…</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">كشف الحساب</h1>
      {!rows.length ? (
        <p className="text-muted-foreground">لا توجد كشوف حساب بعد.</p>
      ) : (
        <div className="overflow-x-auto a-glass rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="p-3">الفترة</th>
                <th className="p-3">رصيد افتتاحي</th>
                <th className="p-3">فواتير</th>
                <th className="p-3">مدفوع</th>
                <th className="p-3">رصيد ختامي</th>
                <th className="p-3">PDF</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-3 text-center">{r.period_start} → {r.period_end}</td>
                  <td className="p-3 text-center">{r.opening_balance_sar.toFixed(2)}</td>
                  <td className="p-3 text-center">{r.invoiced_sar.toFixed(2)}</td>
                  <td className="p-3 text-center">{r.paid_sar.toFixed(2)}</td>
                  <td className="p-3 text-center font-bold">{r.closing_balance_sar.toFixed(2)}</td>
                  <td className="p-3 text-center">
                    {r.pdf_url ? <a href={r.pdf_url} target="_blank" className="text-primary underline">تحميل</a> : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
