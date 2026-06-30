import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Eye, Phone, Mail, Calendar, MapPin, X, RefreshCw, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

type SortKey = 'id' | 'company_name' | 'product_type' | 'quantity' | 'status' | 'created_at';
type SortDir = 'asc' | 'desc';
const PAGE_SIZE = 10;

const STATUSES = ['new', 'contacted', 'confirmed', 'shipped', 'completed', 'cancelled'] as const;
const LABEL: Record<string, string> = {
  new: 'جديد', contacted: 'تم التواصل', confirmed: 'مؤكد',
  shipped: 'تم الشحن', completed: 'مكتمل', cancelled: 'ملغي',
};
const TINT: Record<string, string> = {
  new: 'a-pill-blue', contacted: 'a-pill-amber', confirmed: 'a-pill-green',
  shipped: 'a-pill-violet', completed: 'a-pill-green', cancelled: 'a-pill-rose',
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [active, setActive] = useState<any | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message); else setOrders(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => orders.filter((o) => {
    if (status !== 'all' && o.status !== status) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    return [o.company_name, o.contact_name, o.phone, o.email, o.product_type, o.city]
      .filter(Boolean).some((v: string) => v.toLowerCase().includes(s));
  }), [orders, q, status]);

  async function update(id: string, patch: any) {
    const { error } = await supabase.from('orders').update(patch).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setOrders((p) => p.map((o) => o.id === id ? { ...o, ...patch } : o));
    toast.success('تم الحفظ');
    if (patch.status) {
      const { error: mailErr } = await supabase.functions.invoke('send-order-status-email', {
        body: { orderId: id, status: patch.status },
      });
      if (mailErr) toast.error('تعذر إرسال الإشعار البريدي');
      else toast.success('تم إرسال إشعار بريدي للعميل');
    }
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>OPERATIONS</p>
          <h1 className="a-display text-4xl mt-1">الطلبات</h1>
          <p className="text-sm" style={{ color: 'var(--a-text-muted)' }}>{orders.length} طلب إجمالي · {filtered.length} مطابق</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="a-btn a-btn-ghost"><RefreshCw className="w-4 h-4" /> تحديث</button>
          <button className="a-btn a-btn-gold"><Download className="w-4 h-4" /> تصدير CSV</button>
        </div>
      </header>

      <div className="a-card p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3" style={{ color: 'var(--a-text-muted)' }} />
          <input className="a-input ps-9" placeholder="ابحث باسم العميل، الهاتف، المنتج…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="flex items-center gap-1 p-1 rounded-full" style={{ background: 'var(--a-surface-2)' }}>
          {['all', ...STATUSES].map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs transition ${status === s ? 'bg-white shadow font-semibold' : 'opacity-70 hover:opacity-100'}`}
              style={status === s ? { color: 'var(--a-palm)' } : undefined}>
              {s === 'all' ? 'الكل' : LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="a-card overflow-hidden">
        <div className="overflow-x-auto a-scroll">
          <table className="a-table">
            <thead>
              <tr>
                <th>الطلب</th><th>العميل</th><th>المنتج</th><th>الكمية</th>
                <th>الحالة</th><th>التاريخ</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--a-text-muted)' }}>جاري التحميل…</td></tr>}
              {!loading && !filtered.length && <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--a-text-muted)' }}>لا توجد نتائج</td></tr>}
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td>
                    <div className="font-semibold">#{o.id.slice(0, 8)}</div>
                    <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>{o.business_type || '—'}</div>
                  </td>
                  <td>
                    <div className="font-medium">{o.company_name}</div>
                    <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>{o.contact_name} · {o.phone}</div>
                  </td>
                  <td>{o.product_type}</td>
                  <td>{o.quantity} {o.unit}</td>
                  <td>
                    <select value={o.status} onChange={(e) => update(o.id, { status: e.target.value })}
                      className={`a-pill ${TINT[o.status] || ''}`} style={{ paddingInlineEnd: 20 }}>
                      {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                    </select>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--a-text-muted)' }}>
                    {new Date(o.created_at).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}
                  </td>
                  <td>
                    <button onClick={() => setActive(o)} className="a-btn a-btn-ghost py-1 px-2">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <>
            <motion.div className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActive(null)} />
            <motion.aside className="fixed inset-y-0 end-0 w-full max-w-md a-glass z-50 overflow-y-auto a-scroll p-6"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              style={{ background: 'var(--a-surface)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[11px] tracking-widest" style={{ color: 'var(--a-text-muted)' }}>ORDER</div>
                  <div className="a-display text-2xl">#{active.id.slice(0, 8)}</div>
                </div>
                <button onClick={() => setActive(null)} className="a-btn a-btn-ghost p-2"><X className="w-4 h-4" /></button>
              </div>

              <div className="space-y-4 text-sm">
                <Section title="العميل">
                  <div className="font-semibold">{active.company_name}</div>
                  <div>{active.contact_name}</div>
                  <a href={`tel:${active.phone}`} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--a-palm)' }}>
                    <Phone className="w-3.5 h-3.5" /> {active.phone}
                  </a>
                  {active.email && <a href={`mailto:${active.email}`} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--a-palm)' }}>
                    <Mail className="w-3.5 h-3.5" /> {active.email}
                  </a>}
                </Section>
                <Section title="المنتج">
                  <div className="flex items-center justify-between"><span>{active.product_type}</span><b>{active.quantity} {active.unit}</b></div>
                </Section>
                {(active.city || active.address) && <Section title="الموقع">
                  <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {[active.city, active.address].filter(Boolean).join(' — ')}</div>
                </Section>}
                {active.delivery_date && <Section title="موعد التسليم">
                  <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {active.delivery_date}</div>
                </Section>}
                {active.notes && <Section title="ملاحظات"><p className="text-[13px]">{active.notes}</p></Section>}
                {active.ai_summary && <Section title="ملخص AI"><p className="italic text-[13px]">"{active.ai_summary}"</p></Section>}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="a-card p-4" style={{ background: 'var(--a-surface-2)' }}>
      <div className="text-[10px] tracking-widest mb-1.5" style={{ color: 'var(--a-text-muted)' }}>{title.toUpperCase()}</div>
      {children}
    </div>
  );
}
