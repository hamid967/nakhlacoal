import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, PackageX, Plus } from 'lucide-react';

type ReturnRow = {
  id: string;
  order_id: string;
  reason: string;
  status: string;
  refund_amount_sar: number | null;
  admin_notes: string | null;
  created_at: string;
};

type EligibleOrder = { id: string; created_at: string; grand_total_sar: number | null };

const STATUS_LABEL: Record<string, string> = {
  requested: 'قيد المراجعة',
  approved: 'موافق عليه',
  received: 'تم الاستلام',
  refunded: 'تم الاسترداد',
  rejected: 'مرفوض',
  cancelled: 'ملغي',
};

export default function Returns() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ReturnRow[]>([]);
  const [orders, setOrders] = useState<EligibleOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ order_id: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: rets }, { data: ords }] = await Promise.all([
        supabase
          .from('return_requests')
          .select('id,order_id,reason,status,refund_amount_sar,admin_notes,created_at')
          .order('created_at', { ascending: false }),
        supabase
          .from('orders')
          .select('id,created_at,grand_total_sar,status,updated_at')
          .eq('user_id', user.id)
          .eq('status', 'delivered')
          .gte('updated_at', new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString())
          .order('updated_at', { ascending: false }),
      ]);
      setRows(rets ?? []);
      setOrders((ords ?? []).map((o) => ({ id: o.id, created_at: o.created_at, grand_total_sar: o.grand_total_sar })));
      setLoading(false);
    })();
  }, [user]);

  const submit = async () => {
    if (!user || !form.order_id || !form.reason.trim()) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('return_requests')
      .insert({ user_id: user.id, order_id: form.order_id, reason: form.reason.trim() })
      .select('id,order_id,reason,status,refund_amount_sar,admin_notes,created_at')
      .single();
    if (error || !data) {
      toast({ title: 'تعذر إنشاء طلب الإرجاع', description: error?.message, variant: 'destructive' });
    } else {
      setRows([data, ...rows]);
      setShowNew(false);
      setForm({ order_id: '', reason: '' });
      toast({ title: 'تم استلام طلب الإرجاع', description: 'سنراجعه خلال 24 ساعة.' });
    }
    setSubmitting(false);
  };

  return (
    <div className="a-container py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="a-display text-2xl">طلبات الإرجاع</h1>
          <p className="text-sm" style={{ color: 'var(--a-text-muted)' }}>
            يمكنك طلب إرجاع أي طلب مسلَّم خلال 14 يومًا من التسليم
          </p>
        </div>
        <button className="a-btn a-btn-primary" onClick={() => setShowNew(true)} disabled={orders.length === 0}>
          <Plus className="w-4 h-4" /> طلب إرجاع جديد
        </button>
      </div>

      {showNew && (
        <div className="a-card p-4 mb-6 space-y-3">
          <select className="a-input w-full" value={form.order_id} onChange={(e) => setForm({ ...form, order_id: e.target.value })}>
            <option value="">اختر الطلب…</option>
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                طلب #{o.id.slice(0, 8)} — {new Date(o.created_at).toLocaleDateString('ar-SA')} — {o.grand_total_sar} ر.س
              </option>
            ))}
          </select>
          <textarea
            className="a-input w-full min-h-[100px]"
            placeholder="سبب الإرجاع…"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
          />
          <div className="flex gap-2 justify-end">
            <button className="a-btn" onClick={() => setShowNew(false)}>إلغاء</button>
            <button className="a-btn a-btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إرسال الطلب'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center"><Loader2 className="w-6 h-6 animate-spin inline" /></div>
      ) : rows.length === 0 ? (
        <div className="a-card p-12 text-center" style={{ color: 'var(--a-text-muted)' }}>
          <PackageX className="w-10 h-10 mx-auto mb-3 opacity-50" />
          لا توجد طلبات إرجاع
        </div>
      ) : (
        <div className="a-card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--a-soft)' }}>
              <tr>
                <th className="p-3 text-start">الطلب</th>
                <th className="p-3 text-start">السبب</th>
                <th className="p-3 text-start">الحالة</th>
                <th className="p-3 text-start">المسترد</th>
                <th className="p-3 text-start">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                  <td className="p-3 font-mono text-xs">#{r.order_id.slice(0, 8)}</td>
                  <td className="p-3 max-w-[300px] truncate">{r.reason}</td>
                  <td className="p-3"><span className="a-pill">{STATUS_LABEL[r.status] ?? r.status}</span></td>
                  <td className="p-3">{r.refund_amount_sar ? `${r.refund_amount_sar} ر.س` : '—'}</td>
                  <td className="p-3">{new Date(r.created_at).toLocaleDateString('ar-SA')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
