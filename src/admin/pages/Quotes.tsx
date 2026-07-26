import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Send, Loader2, ExternalLink, RefreshCw, Search, X } from 'lucide-react';
import { logActivity } from '@/admin/lib/activity';

type QR = {
  id: string;
  full_name: string;
  company_name: string;
  phone: string;
  email: string | null;
  product: string;
  quantity: number;
  unit: string;
  destination: string | null;
  notes: string | null;
  status: string;
  quoted_price_sar: number | null;
  admin_notes: string | null;
  user_id: string | null;
  order_id: string | null;
  created_at: string;
};

const STATUS: Record<string, { label: string; tint: string }> = {
  new: { label: 'جديد', tint: 'slate' },
  under_review: { label: 'قيد المراجعة', tint: 'blue' },
  priced: { label: 'مُسعّر', tint: 'amber' },
  accepted: { label: 'مقبول', tint: 'emerald' },
  rejected: { label: 'مرفوض', tint: 'rose' },
  converted_to_order: { label: 'محوّل لطلب', tint: 'violet' },
};

export default function AdminQuotes() {
  const [rows, setRows] = useState<QR[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [query, setQuery] = useState<string>('');
  const [active, setActive] = useState<QR | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) toast.error(error.message);
    setRows((data as QR[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const normalizedQuery = query.trim();
  const digitsQuery = normalizedQuery.replace(/\D/g, '');
  const filtered = useMemo(() => {
    let list = rows;
    if (statusFilter) list = list.filter((r) => r.status === statusFilter);
    if (normalizedQuery) {
      const ql = normalizedQuery.toLowerCase();
      list = list.filter((r) => {
        const phoneDigits = (r.phone || '').replace(/\D/g, '');
        const phoneMatch = digitsQuery.length >= 3 && phoneDigits.includes(digitsQuery);
        const textMatch =
          (r.full_name || '').toLowerCase().includes(ql) ||
          (r.company_name || '').toLowerCase().includes(ql) ||
          (r.email || '').toLowerCase().includes(ql) ||
          (r.id || '').toLowerCase().startsWith(ql);
        return phoneMatch || textMatch;
      });
    }
    return list;
  }, [rows, statusFilter, normalizedQuery, digitsQuery]);

  const stats = useMemo(() => {
    const s: Record<string, number> = {};
    for (const r of rows) s[r.status] = (s[r.status] || 0) + 1;
    return s;
  }, [rows]);

  const updateStatus = async (q: QR, next: string, extra: Partial<QR> = {}) => {
    setBusy(true);
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: next, ...extra })
        .eq('id', q.id);
      if (error) throw error;
      await logActivity({
        action: 'update',
        entity_table: 'quote_requests',
        entity_id: q.id,
        summary: `تحديث حالة عرض السعر إلى ${STATUS[next]?.label || next}`,
        old_data: { status: q.status },
        new_data: { status: next, ...extra },
      });
      // Send status-change email (fire-and-forget) only when the status actually changed
      if (next !== q.status && q.email) {
        supabase.functions
          .invoke('send-quote-status-email', { body: { quoteId: q.id, status: next } })
          .then(({ error: mailErr }) => {
            if (mailErr) console.warn('quote email failed:', mailErr.message);
            else toast.success('تم إرسال إشعار بريدي للعميل');
          });
      }
      toast.success('تم التحديث');
      await load();
      setActive((a) => (a && a.id === q.id ? { ...a, status: next, ...extra } as QR : a));
    } catch (err: any) {
      toast.error(err?.message || 'فشل التحديث');
    } finally {
      setBusy(false);
    }
  };


  const convertToOrder = async (q: QR) => {
    if (q.order_id) return toast.info('تم التحويل مسبقاً');
    if (!q.quoted_price_sar) return toast.error('يرجى إدخال السعر أولاً');
    setBusy(true);
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          user_id: q.user_id,
          company_name: q.company_name,
          contact_name: q.full_name,
          phone: q.phone,
          email: q.email,
          product_type: q.product,
          quantity: q.quantity,
          unit: q.unit,
          unit_price_sar: q.quoted_price_sar,
          status: 'confirmed',
          notes: `تم التحويل من عرض سعر #${q.id.slice(0, 8)}`,
        })
        .select('id')
        .single();
      if (error) throw error;
      await supabase
        .from('quote_requests')
        .update({ status: 'converted_to_order', order_id: order.id })
        .eq('id', q.id);
      await logActivity({
        action: 'create',
        entity_table: 'orders',
        entity_id: order.id,
        summary: `تحويل عرض السعر ${q.id.slice(0, 8)} إلى طلب`,
        new_data: { quote_request_id: q.id },
      });
      toast.success('تم إنشاء الطلب بنجاح');
      await load();
      setActive(null);
    } catch (err: any) {
      toast.error(err?.message || 'فشل التحويل');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <header className="a-page-header">
        <div>
          <p className="a-crumbs">CRM · عروض الأسعار</p>
          <h1>طلبات عروض الأسعار</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>
            متابعة، تسعير، وقبول طلبات عروض الأسعار الواردة من العملاء.
          </p>
        </div>
        <button onClick={load} className="a-btn a-btn-ghost">
          <RefreshCw className="w-4 h-4" /> تحديث
        </button>
      </header>

      {/* status filter chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`a-pill ${!statusFilter ? 'a-pill-green' : ''}`}
        >
          الكل ({rows.length})
        </button>
        {Object.entries(STATUS).map(([k, v]) => (
          <button
            key={k}
            onClick={() => setStatusFilter(k)}
            className={`a-pill a-pill-${v.tint} ${statusFilter === k ? 'ring-2 ring-offset-1' : ''}`}
          >
            {v.label} ({stats[k] || 0})
          </button>
        ))}
      </div>

      <div className="a-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>
            <Loader2 className="w-5 h-5 mx-auto mb-2 animate-spin" /> جارٍ التحميل…
          </div>
        ) : !filtered.length ? (
          <div className="p-12 text-center text-sm" style={{ color: 'var(--a-text-muted)' }}>
            لا توجد طلبات عروض أسعار.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--a-surface-2)' }}>
              <tr className="text-right">
                <th className="p-3 text-xs font-semibold">العميل</th>
                <th className="p-3 text-xs font-semibold">المنتج</th>
                <th className="p-3 text-xs font-semibold">الكمية</th>
                <th className="p-3 text-xs font-semibold">السعر</th>
                <th className="p-3 text-xs font-semibold">الحالة</th>
                <th className="p-3 text-xs font-semibold">التاريخ</th>
                <th className="p-3 text-xs font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => {
                const s = STATUS[q.status] || { label: q.status, tint: 'slate' };
                return (
                  <tr key={q.id} className="border-t" style={{ borderColor: 'var(--a-border)' }}>
                    <td className="p-3">
                      <div className="font-semibold">{q.company_name}</div>
                      <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>{q.full_name} · {q.phone}</div>
                    </td>
                    <td className="p-3">{q.product}</td>
                    <td className="p-3 tabular-nums">{q.quantity} {q.unit}</td>
                    <td className="p-3 tabular-nums">{q.quoted_price_sar ? `${q.quoted_price_sar} ر.س` : '—'}</td>
                    <td className="p-3"><span className={`a-pill a-pill-${s.tint}`}>{s.label}</span></td>
                    <td className="p-3 text-[11px]" style={{ color: 'var(--a-text-muted)' }}>
                      {new Date(q.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-3">
                      <button onClick={() => setActive(q)} className="a-btn a-btn-ghost">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* drawer */}
      {active && (
        <div className="fixed inset-0 z-50 flex" dir="rtl">
          <button className="flex-1 bg-black/50" onClick={() => setActive(null)} aria-label="إغلاق" />
          <aside
            className="w-full max-w-lg h-full overflow-y-auto p-6 space-y-4"
            style={{ background: 'var(--a-surface)', borderInlineStart: '1px solid var(--a-border)' }}
          >
            <header className="flex items-start justify-between gap-2 pb-3 border-b" style={{ borderColor: 'var(--a-border)' }}>
              <div>
                <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>عرض سعر #{active.id.slice(0, 8)}</div>
                <h3 className="text-lg font-bold">{active.company_name}</h3>
              </div>
              <button onClick={() => setActive(null)} className="a-btn a-btn-ghost">إغلاق</button>
            </header>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>الاسم</div><div>{active.full_name}</div></div>
              <div><div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>الجوال</div><div dir="ltr">{active.phone}</div></div>
              <div><div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>البريد</div><div dir="ltr">{active.email || '—'}</div></div>
              <div><div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>الوجهة</div><div>{active.destination || '—'}</div></div>
              <div className="col-span-2"><div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>المنتج</div><div>{active.product} — {active.quantity} {active.unit}</div></div>
              {active.notes && (
                <div className="col-span-2">
                  <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>ملاحظات العميل</div>
                  <div className="p-2 rounded bg-black/5 text-xs">{active.notes}</div>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-3 border-t" style={{ borderColor: 'var(--a-border)' }}>
              <label className="block text-xs font-semibold">السعر المقترح (ر.س)</label>
              <input
                type="number" min={0} step="0.01"
                defaultValue={active.quoted_price_sar ?? ''}
                onBlur={(e) => {
                  const v = e.target.value ? Number(e.target.value) : null;
                  if (v !== active.quoted_price_sar) {
                    updateStatus(active, active.status === 'new' ? 'priced' : active.status, { quoted_price_sar: v });
                  }
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface-2)' }}
              />
              <label className="block text-xs font-semibold mt-2">ملاحظات داخلية</label>
              <textarea
                rows={3}
                defaultValue={active.admin_notes ?? ''}
                onBlur={(e) => {
                  if (e.target.value !== (active.admin_notes ?? '')) {
                    updateStatus(active, active.status, { admin_notes: e.target.value });
                  }
                }}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface-2)' }}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t" style={{ borderColor: 'var(--a-border)' }}>
              <button disabled={busy} onClick={() => updateStatus(active, 'under_review')} className="a-btn a-btn-ghost">
                <Send className="w-3.5 h-3.5" /> قيد المراجعة
              </button>
              <button disabled={busy} onClick={() => updateStatus(active, 'priced')} className="a-btn a-btn-gold">
                <Send className="w-3.5 h-3.5" /> إرسال السعر
              </button>
              <button disabled={busy} onClick={() => updateStatus(active, 'accepted')} className="a-btn a-btn-palm">
                <CheckCircle2 className="w-3.5 h-3.5" /> قبول العرض
              </button>
              <button disabled={busy} onClick={() => updateStatus(active, 'rejected')} className="a-btn a-btn-ghost">
                <XCircle className="w-3.5 h-3.5" /> رفض
              </button>
              <button
                disabled={busy || !!active.order_id}
                onClick={() => convertToOrder(active)}
                className="col-span-2 a-btn a-btn-palm"
              >
                {active.order_id ? 'تم التحويل لطلب' : '⇢ تحويل إلى طلب'}
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
