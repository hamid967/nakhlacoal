import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [sp, setSp] = useSearchParams();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(() => sp.get('q') ?? '');
  const [qDebounced, setQDebounced] = useState(() => sp.get('q') ?? '');
  const [status, setStatus] = useState<string>(() => sp.get('status') ?? 'all');
  const [active, setActive] = useState<any | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>(() => (sp.get('sk') as SortKey) || 'created_at');
  const [sortDir, setSortDir] = useState<SortDir>(() => (sp.get('sd') as SortDir) || 'desc');
  const [page, setPage] = useState(() => Math.max(1, parseInt(sp.get('p') || '1', 10) || 1));

  useEffect(() => { const t = setTimeout(() => setQDebounced(q), 250); return () => clearTimeout(t); }, [q]);
  useEffect(() => { setPage(1); }, [qDebounced, status, sortKey, sortDir]);

  // Sync state -> URL (omit defaults to keep it clean)
  useEffect(() => {
    const next = new URLSearchParams(sp);
    const set = (k: string, v: string, def = '') => { v && v !== def ? next.set(k, v) : next.delete(k); };
    set('q', qDebounced);
    set('status', status, 'all');
    set('sk', sortKey, 'created_at');
    set('sd', sortDir, 'desc');
    set('p', page > 1 ? String(page) : '', '');
    if (next.toString() !== sp.toString()) setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qDebounced, status, sortKey, sortDir, page]);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message); else setOrders(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = qDebounced.toLowerCase().trim();
    const list = orders.filter((o) => {
      if (status !== 'all' && o.status !== status) return false;
      if (!s) return true;
      return [o.company_name, o.contact_name, o.phone, o.email, o.product_type, o.city]
        .filter(Boolean).some((v: string) => v.toLowerCase().includes(s));
    });
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[sortKey] ?? ''; const bv = b[sortKey] ?? '';
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), 'ar') * dir;
    });
  }, [orders, qDebounced, status, sortKey, sortDir]);

  // Counts per status respect the current search (but not status itself).
  const counts = useMemo(() => {
    const s = qDebounced.toLowerCase().trim();
    const matchSearch = (o: any) => !s || [o.company_name, o.contact_name, o.phone, o.email, o.product_type, o.city]
      .filter(Boolean).some((v: string) => v.toLowerCase().includes(s));
    const base = orders.filter(matchSearch);
    const out: Record<string, number> = { all: base.length };
    STATUSES.forEach((k) => { out[k] = 0; });
    base.forEach((o) => { if (out[o.status] !== undefined) out[o.status]++; });
    return out;
  }, [orders, qDebounced]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Highlight handling: when arriving from a realtime toast (?highlight=<id>),
  // clear filters, jump to the row's page, scroll it into view, and pulse it.
  const highlightId = sp.get('highlight');
  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [pulseId, setPulseId] = useState<string | null>(null);
  useEffect(() => {
    if (!highlightId || loading) return;
    const idx = filtered.findIndex((o) => o.id === highlightId);
    if (idx < 0) {
      // Row may be filtered out — reset filters so it becomes visible.
      if (status !== 'all' || qDebounced) { setStatus('all'); setQ(''); }
      return;
    }
    const targetPage = Math.floor(idx / PAGE_SIZE) + 1;
    if (page !== targetPage) { setPage(targetPage); return; }
    setPulseId(highlightId);
    requestAnimationFrame(() => {
      rowRefs.current[highlightId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    const t = setTimeout(() => {
      setPulseId(null);
      const next = new URLSearchParams(sp); next.delete('highlight'); setSp(next, { replace: true });
    }, 3200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightId, loading, filtered, page]);

  function toggleSort(k: SortKey) {
    if (sortKey === k) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(k); setSortDir('asc'); }
  }

  function exportCsv() {
    const headers = ['id','company_name','contact_name','phone','email','product_type','quantity','unit','status','city','created_at'];
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = [headers.join(','), ...filtered.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `orders-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('تم تصدير CSV');
  }


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
      <header className="a-page-header">
        <div>
          <p className="a-crumbs">OPERATIONS</p>
          <h1>الطلبات</h1>
          <p>{orders.length} طلب إجمالي · {filtered.length} مطابق</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="a-btn a-btn-ghost"><RefreshCw className="w-4 h-4" /> تحديث</button>
          <button onClick={exportCsv} className="a-btn a-btn-gold"><Download className="w-4 h-4" /> تصدير CSV</button>
        </div>
      </header>

      <div className="space-y-3">
        {/* Quick status filters as Untitled UI tab-pills with counts */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', ...STATUSES] as const).map((s) => {
            const isActive = status === s;
            const n = counts[s] ?? 0;
            return (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-medium border transition"
                style={{
                  background: isActive ? 'var(--a-surface)' : 'transparent',
                  borderColor: isActive ? 'var(--a-palm)' : 'var(--a-border)',
                  color: isActive ? 'var(--a-palm)' : 'var(--a-text-muted)',
                  boxShadow: isActive ? '0 0 0 3px rgba(4,120,87,.08)' : 'none',
                }}
              >
                {s === 'all' ? 'الكل' : LABEL[s]}
                <span
                  className="text-[11px] px-1.5 py-0.5 rounded-md"
                  style={{
                    background: isActive ? 'rgba(4,120,87,.1)' : 'var(--a-surface-2)',
                    color: isActive ? 'var(--a-palm)' : 'var(--a-text-muted)',
                  }}
                >
                  {n}
                </span>
              </button>
            );
          })}
          {(status !== 'all' || q) && (
            <button
              onClick={() => { setStatus('all'); setQ(''); }}
              className="ms-auto inline-flex items-center gap-1 text-[12px]"
              style={{ color: 'var(--a-text-muted)' }}
            >
              <X className="w-3.5 h-3.5" /> مسح الفلاتر
            </button>
          )}
        </div>

        {/* Search */}
        <div className="a-card p-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3" style={{ color: 'var(--a-text-muted)' }} />
            <input className="a-input ps-9" placeholder="ابحث باسم العميل، الهاتف، المنتج…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="a-card overflow-hidden">
        <div className="overflow-x-auto a-scroll">
          <table className="a-table">
            <thead>
              <tr>
                <th><SortTh label="الطلب" k="id" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} /></th>
                <th><SortTh label="العميل" k="company_name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} /></th>
                <th><SortTh label="المنتج" k="product_type" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} /></th>
                <th><SortTh label="الكمية" k="quantity" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} /></th>
                <th><SortTh label="الحالة" k="status" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} /></th>
                <th><SortTh label="التاريخ" k="created_at" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} /></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--a-text-muted)' }}>جاري التحميل…</td></tr>}
              {!loading && !filtered.length && <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--a-text-muted)' }}>لا توجد نتائج</td></tr>}
              {pageRows.map((o) => (
                <tr
                  key={o.id}
                  ref={(el) => { rowRefs.current[o.id] = el; }}
                  className={`a-fade-up cursor-pointer ${pulseId === o.id ? 'a-row-highlight' : ''}`}
                  onClick={() => setActive(o)}
                  data-active={active?.id === o.id}
                  data-highlight={pulseId === o.id || undefined}
                >
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
                  <td onClick={(e) => e.stopPropagation()}>
                    <select value={o.status} onChange={(e) => update(o.id, { status: e.target.value })}
                      className={`a-pill ${TINT[o.status] || ''}`} style={{ paddingInlineEnd: 20 }}>
                      {STATUSES.map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}
                    </select>
                  </td>
                  <td className="text-xs" style={{ color: 'var(--a-text-muted)' }}>
                    {new Date(o.created_at).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => setActive(o)} className="a-btn a-btn-ghost py-1 px-2" aria-label="عرض التفاصيل">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-4 py-3 border-t" style={{ borderColor: 'var(--a-border)' }}>
            <div className="text-xs" style={{ color: 'var(--a-text-muted)' }}>
              عرض {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} من {filtered.length}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </div>
        )}
      </div>


      <AnimatePresence>
        {active && (() => {
          const live = orders.find((o) => o.id === active.id) || active;
          return (
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
                    <div className="a-display text-2xl">#{live.id.slice(0, 8)}</div>
                  </div>
                  <button onClick={() => setActive(null)} className="a-btn a-btn-ghost p-2" aria-label="إغلاق"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-4 text-sm">
                  <Section title="الحالة">
                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.map((s) => (
                        <button key={s} onClick={() => update(live.id, { status: s })}
                          className={`a-pill ${live.status === s ? TINT[s] : ''}`}
                          style={live.status !== s ? { opacity: .6 } : undefined}>
                          {LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </Section>

                  <Section title="العميل">
                    <div className="font-semibold">{live.company_name}</div>
                    <div>{live.contact_name}</div>
                    <a href={`tel:${live.phone}`} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--a-palm)' }}>
                      <Phone className="w-3.5 h-3.5" /> {live.phone}
                    </a>
                    {live.email && <a href={`mailto:${live.email}`} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--a-palm)' }}>
                      <Mail className="w-3.5 h-3.5" /> {live.email}
                    </a>}
                  </Section>

                  <Section title="المنتج">
                    <div className="flex items-center justify-between"><span>{live.product_type}</span><b>{live.quantity} {live.unit}</b></div>
                  </Section>

                  {(live.city || live.address) && <Section title="الموقع">
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {[live.city, live.address].filter(Boolean).join(' — ')}</div>
                  </Section>}

                  {live.delivery_date && <Section title="موعد التسليم">
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> {live.delivery_date}</div>
                  </Section>}

                  <Section title="ملاحظات داخلية">
                    <NotesEditor key={live.id} initial={live.notes || ''} onSave={(v) => update(live.id, { notes: v })} />
                  </Section>

                  {live.ai_summary && <Section title="ملخص AI"><p className="italic text-[13px]">"{live.ai_summary}"</p></Section>}
                </div>
              </motion.aside>
            </>
          );
        })()}
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

function NotesEditor({ initial, onSave }: { initial: string; onSave: (v: string) => void }) {
  const [val, setVal] = useState(initial);
  const dirty = val !== initial;
  return (
    <div className="space-y-2">
      <textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={3}
        className="a-input"
        placeholder="أضف ملاحظة داخلية حول الطلب…"
      />
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!dirty}
          onClick={() => onSave(val)}
          className="a-btn a-btn-palm"
          style={!dirty ? { opacity: .5, cursor: 'not-allowed' } : undefined}
        >
          حفظ
        </button>
      </div>
    </div>
  );
}

function SortTh({ label, k, sortKey, sortDir, onSort }: {
  label: string; k: SortKey; sortKey: SortKey; sortDir: SortDir; onSort: (k: SortKey) => void;
}) {
  const active = sortKey === k;
  return (
    <button type="button" className="a-th-sort" data-active={active} data-dir={active ? sortDir : undefined} onClick={() => onSort(k)}>
      {label}
      <ChevronUp />
    </button>
  );
}

function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  const pages: (number | '…')[] = [];
  const push = (v: number | '…') => pages.push(v);
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) push(i);
  } else {
    push(1);
    if (page > 3) push('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) push(i);
    if (page < totalPages - 2) push('…');
    push(totalPages);
  }
  return (
    <div className="flex items-center gap-1">
      <button className="a-page-btn" disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="السابق">
        <ChevronRight className="w-4 h-4" />
      </button>
      {pages.map((p, i) => p === '…' ? (
        <span key={`e${i}`} className="px-1 text-sm" style={{ color: 'var(--a-text-muted)' }}>…</span>
      ) : (
        <button key={p} className="a-page-btn" data-active={p === page} onClick={() => onChange(p)}>{p}</button>
      ))}
      <button className="a-page-btn" disabled={page === totalPages} onClick={() => onChange(page + 1)} aria-label="التالي">
        <ChevronLeft className="w-4 h-4" />
      </button>
    </div>
  );
}
