import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

type Row = {
  id: string;
  order_id: string;
  user_id: string | null;
  reason: string;
  status: string;
  refund_amount_sar: number | null;
  admin_notes: string | null;
  created_at: string;
};

const NEXT_STATUSES = ['requested', 'approved', 'received', 'refunded', 'rejected'];

export default function AdminReturns() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('requested');

  const load = async () => {
    setLoading(true);
    let q = supabase.from('return_requests').select('*').order('created_at', { ascending: false }).limit(200);
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data } = await q;
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statusFilter]);

  const update = async (id: string, patch: Partial<Row>) => {
    const { error } = await supabase.from('return_requests').update(patch).eq('id', id);
    if (error) return toast({ title: 'خطأ', description: error.message, variant: 'destructive' });
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    toast({ title: 'تم التحديث' });
  };

  return (
    <div className="a-container py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="a-display text-2xl">طلبات الإرجاع</h1>
        <select className="a-input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">الكل</option>
          {NEXT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin inline" /></div>
      ) : (
        <div className="a-card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--a-soft)' }}>
              <tr>
                <th className="p-3 text-start">الطلب</th>
                <th className="p-3 text-start">السبب</th>
                <th className="p-3 text-start">الحالة</th>
                <th className="p-3 text-start">المسترد (ر.س)</th>
                <th className="p-3 text-start">التاريخ</th>
                <th className="p-3 text-start">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                  <td className="p-3 font-mono text-xs">#{r.order_id.slice(0, 8)}</td>
                  <td className="p-3 max-w-[280px] truncate" title={r.reason}>{r.reason}</td>
                  <td className="p-3">
                    <select className="a-input text-xs" value={r.status} onChange={(e) => update(r.id, { status: e.target.value })}>
                      {NEXT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <input
                      type="number"
                      className="a-input text-xs w-24"
                      defaultValue={r.refund_amount_sar ?? ''}
                      onBlur={(e) => {
                        const v = e.target.value ? parseFloat(e.target.value) : null;
                        if (v !== r.refund_amount_sar) update(r.id, { refund_amount_sar: v });
                      }}
                    />
                  </td>
                  <td className="p-3">{new Date(r.created_at).toLocaleDateString('ar-SA')}</td>
                  <td className="p-3">
                    <input
                      className="a-input text-xs w-40"
                      placeholder="ملاحظة إدارية"
                      defaultValue={r.admin_notes ?? ''}
                      onBlur={(e) => e.target.value !== r.admin_notes && update(r.id, { admin_notes: e.target.value })}
                    />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="p-12 text-center" style={{ color: 'var(--a-text-muted)' }}>لا توجد طلبات إرجاع</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
