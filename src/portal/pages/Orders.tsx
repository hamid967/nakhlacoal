import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Plus, Eye, RotateCcw, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const statusTint: Record<string, string> = {
  new: 'amber', contacted: 'blue', preparing: 'gold', shipped: 'violet',
  delivered: 'green', completed: 'green', cancelled: 'rose',
};

export default function PortalOrders() {
  const { user } = useAuth();
  const [rows, setRows] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('orders').select('*')
        .eq('user_id', user.id).order('created_at', { ascending: false });
      setRows(data || []);
    })();
  }, [user]);

  const filtered = useMemo(() => rows.filter((r) =>
    (!status || r.status === status) &&
    (!q || `${r.product_type} ${r.company_name} ${r.id}`.toLowerCase().includes(q.toLowerCase()))
  ), [rows, q, status]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>CUSTOMER · ORDERS</p>
          <h1 className="a-display text-4xl md:text-5xl mt-1">طلباتي</h1>
        </div>
        <Link to="/portal/orders/new" className="a-btn a-btn-palm"><Plus className="w-4 h-4" /> طلب جديد</Link>
      </header>

      <div className="a-card p-5 space-y-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3" style={{ color: 'var(--a-text-muted)' }} />
            <input className="a-input ps-9" placeholder="ابحث في طلباتي…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="a-input max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">كل الحالات</option>
            {['new','contacted','preparing','shipped','delivered','cancelled'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-start" style={{ color: 'var(--a-text-muted)' }}>
                <th className="text-start py-2">رقم الطلب</th>
                <th className="text-start py-2">التاريخ</th>
                <th className="text-start py-2">المنتج</th>
                <th className="text-start py-2">الكمية</th>
                <th className="text-start py-2">الحالة</th>
                <th className="text-start py-2">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o, i) => (
                <motion.tr key={o.id}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                  <td className="py-3 font-mono text-xs">#{o.id.slice(0, 8)}</td>
                  <td className="py-3">{new Date(o.created_at).toLocaleDateString('ar-SA')}</td>
                  <td className="py-3">{o.product_type}</td>
                  <td className="py-3">{o.quantity} {o.unit}</td>
                  <td className="py-3"><span className={`a-pill a-pill-${statusTint[o.status] || 'amber'}`}>{o.status}</span></td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <Link to={`/portal/orders/${o.id}`} className="a-btn a-btn-ghost" title="عرض"><Eye className="w-3.5 h-3.5" /></Link>
                      <Link to="/portal/orders/new" className="a-btn a-btn-ghost" title="إعادة الطلب"><RotateCcw className="w-3.5 h-3.5" /></Link>
                      <button className="a-btn a-btn-ghost" title="الفاتورة"><Download className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {!filtered.length && (
                <tr><td colSpan={6} className="py-10 text-center" style={{ color: 'var(--a-text-muted)' }}>لا توجد طلبات.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
