import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Mail, Phone } from 'lucide-react';

type Profile = { id: string; full_name: string | null; phone: string | null; email?: string | null; created_at: string };

export default function AdminCustomers() {
  const [rows, setRows] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [p, o] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('email,phone,company_name,quantity,unit'),
      ]);
      setRows((p.data as any) || []);
      setOrders(o.data || []);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    const m = new Map<string, { count: number; kg: number }>();
    orders.forEach((o) => {
      const k = (o.phone || o.email || '').toLowerCase();
      if (!k) return;
      const e = m.get(k) || { count: 0, kg: 0 };
      e.count += 1; e.kg += Number(o.quantity) || 0;
      m.set(k, e);
    });
    return m;
  }, [orders]);

  const filtered = rows.filter((r) =>
    !q || (r.full_name || '').toLowerCase().includes(q.toLowerCase()) || (r.phone || '').includes(q)
  );

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>CRM</p>
          <h1 className="a-display text-4xl mt-1">العملاء</h1>
          <p className="text-sm" style={{ color: 'var(--a-text-muted)' }}>{rows.length} عميل مسجّل</p>
        </div>
      </header>

      <div className="a-card p-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3" style={{ color: 'var(--a-text-muted)' }} />
          <input className="a-input ps-9" placeholder="بحث بالاسم أو الجوال…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="a-card p-5 h-36 animate-pulse" style={{ background: 'var(--a-surface-2)' }} />
        ))}
        {!loading && filtered.map((r) => {
          const k = (r.phone || '').toLowerCase();
          const s = stats.get(k);
          const initial = (r.full_name || '?')[0];
          return (
            <div key={r.id} className="a-card a-card-hover p-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full grid place-items-center font-bold"
                  style={{ background: 'linear-gradient(135deg, var(--a-palm), var(--a-gold))', color: '#fff' }}>{initial}</div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{r.full_name || 'بدون اسم'}</div>
                  <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>
                    عضو منذ {new Date(r.created_at).toLocaleDateString('ar-SA', { dateStyle: 'medium' })}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-sm">
                {r.phone && <a href={`tel:${r.phone}`} className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {r.phone}</a>}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: 'var(--a-border)' }}>
                <span>{s?.count || 0} طلب</span>
                <span style={{ color: 'var(--a-palm)' }}>{s?.kg.toLocaleString('ar-SA') || 0} وحدة</span>
              </div>
            </div>
          );
        })}
        {!loading && !filtered.length && (
          <div className="a-card p-10 text-center col-span-full" style={{ color: 'var(--a-text-muted)' }}>
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            لا يوجد عملاء مطابقون.
          </div>
        )}
      </div>
    </div>
  );
}
