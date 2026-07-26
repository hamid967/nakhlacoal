import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, RefreshCw, RotateCcw, Search } from 'lucide-react';

type Payment = {
  id: string;
  order_id: string;
  provider: string;
  provider_ref: string | null;
  method: string | null;
  amount_sar: number;
  status: string;
  failure_reason: string | null;
  created_at: string;
};

const STATUS_TINT: Record<string, string> = {
  paid: 'green',
  initiated: 'blue',
  failed: 'rose',
  refunded: 'gold',
  cancelled: 'slate',
  expired: 'slate',
};

export default function AdminPayments() {
  const [rows, setRows] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setRows((data as Payment[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => rows.filter((r) => {
      if (status !== 'all' && r.status !== status) return false;
      if (!q) return true;
      const hay = `${r.provider_ref ?? ''} ${r.order_id} ${r.method ?? ''}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    }),
    [rows, q, status],
  );

  async function refund(p: Payment) {
    if (p.status !== 'paid') return toast.error('يمكن استرداد المدفوعات المسدَّدة فقط');
    const raw = window.prompt(`مبلغ الاسترداد بالريال (اترك فارغًا لاسترداد كامل ${p.amount_sar}):`);
    if (raw === null) return;
    const amount = raw.trim() ? Number(raw) : undefined;
    if (raw.trim() && (!Number.isFinite(amount!) || amount! <= 0)) {
      return toast.error('مبلغ غير صالح');
    }
    const { data, error } = await supabase.functions.invoke('payments-refund', {
      body: { payment_id: p.id, amount_sar: amount },
    });
    if (error) return toast.error(error.message);
    if ((data as { error?: string })?.error) return toast.error(String((data as { error: string }).error));
    toast.success('تم إرسال طلب الاسترداد');
    load();
  }

  return (
    <div className="space-y-5">
      <header className="a-page-header flex items-center justify-between">
        <div>
          <p className="a-crumbs">المالية · المدفوعات</p>
          <h1>سجل المدفوعات</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>
            جميع محاولات الدفع عبر بوابة الدفع (Moyasar) — نجاح، فشل، استرداد.
          </p>
        </div>
        <button className="a-btn a-btn-ghost" onClick={load}><RefreshCw className="w-4 h-4" /> تحديث</button>
      </header>

      <div className="flex flex-col md:flex-row gap-2">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 flex-1" style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}>
          <Search className="h-4 w-4 opacity-60" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث برقم الدفع، الطلب، طريقة الدفع…" className="w-full bg-transparent outline-none text-sm" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border px-3 py-2 text-sm bg-transparent" style={{ borderColor: 'var(--a-border)' }}>
          <option value="all">كل الحالات</option>
          <option value="paid">مسدَّد</option>
          <option value="initiated">قيد التنفيذ</option>
          <option value="failed">فشل</option>
          <option value="refunded">مسترد</option>
          <option value="cancelled">ملغى</option>
          <option value="expired">منتهي</option>
        </select>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}>
        {loading ? (
          <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>لا توجد مدفوعات.</div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--a-surface-2)' }}>
              <tr className="text-right">
                <th className="px-3 py-2 font-medium">التاريخ</th>
                <th className="px-3 py-2 font-medium">الطلب</th>
                <th className="px-3 py-2 font-medium">مرجع البوابة</th>
                <th className="px-3 py-2 font-medium">الطريقة</th>
                <th className="px-3 py-2 font-medium">المبلغ</th>
                <th className="px-3 py-2 font-medium">الحالة</th>
                <th className="px-3 py-2 font-medium">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                  <td className="px-3 py-2 text-xs">{new Date(p.created_at).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}</td>
                  <td className="px-3 py-2 ltr-text text-xs">{p.order_id.slice(0, 8)}…</td>
                  <td className="px-3 py-2 ltr-text text-xs">{p.provider_ref || '—'}</td>
                  <td className="px-3 py-2">{p.method || '—'}</td>
                  <td className="px-3 py-2 ltr-text font-medium">{p.amount_sar.toFixed(2)}</td>
                  <td className="px-3 py-2">
                    <span className={`a-pill a-pill-${STATUS_TINT[p.status] || 'slate'}`}>{p.status}</span>
                    {p.failure_reason && <div className="text-xs opacity-70 mt-1">{p.failure_reason}</div>}
                  </td>
                  <td className="px-3 py-2">
                    {p.status === 'paid' && (
                      <button className="a-btn a-btn-sm a-btn-ghost" onClick={() => refund(p)}>
                        <RotateCcw className="w-3 h-3" /> استرداد
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
