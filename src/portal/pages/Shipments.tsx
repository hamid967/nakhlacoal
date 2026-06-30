import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Truck, Search, ExternalLink, Package, CheckCircle2, Clock, XCircle, RotateCcw, Loader2 } from 'lucide-react';

type Shipment = {
  id: string;
  order_id: string | null;
  carrier: string;
  tracking_no: string | null;
  tracking_url: string | null;
  status: 'preparing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'returned' | 'cancelled';
  weight_kg: number | null;
  origin_city: string | null;
  destination_city: string | null;
  destination_address: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
};

const STATUSES = ['preparing', 'shipped', 'out_for_delivery', 'delivered', 'returned', 'cancelled'] as const;
const statusLabel: Record<string, string> = {
  preparing: 'قيد التجهيز',
  shipped: 'تم الشحن',
  out_for_delivery: 'خارج للتوصيل',
  delivered: 'تم التسليم',
  returned: 'مرتجعة',
  cancelled: 'ملغاة',
};
const statusColor: Record<string, string> = {
  preparing: '#9ca3af',
  shipped: '#2563eb',
  out_for_delivery: '#d97706',
  delivered: '#16a34a',
  returned: '#dc2626',
  cancelled: '#6b7280',
};
const statusIcon: Record<string, any> = {
  preparing: Package,
  shipped: Truck,
  out_for_delivery: Truck,
  delivered: CheckCircle2,
  returned: RotateCcw,
  cancelled: XCircle,
};

const STEPS: Shipment['status'][] = ['preparing', 'shipped', 'out_for_delivery', 'delivered'];

export default function PortalShipments() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('shipments')
        .select('*')
        .eq('customer_user_id', user.id)
        .order('created_at', { ascending: false });
      setRows((data as Shipment[]) || []);
      setLoading(false);
    })();
  }, [user]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (filter !== 'all' && r.status !== filter) return false;
        if (!q) return true;
        return [r.tracking_no, r.carrier, r.destination_city].filter(Boolean).join(' ').toLowerCase().includes(q.toLowerCase());
      }),
    [rows, q, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    STATUSES.forEach((s) => (c[s] = 0));
    rows.forEach((r) => (c[r.status] = (c[r.status] || 0) + 1));
    return c;
  }, [rows]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>CUSTOMER · SHIPMENTS</p>
        <h1 className="a-display text-4xl md:text-5xl mt-1">شحناتي</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>
          {rows.length} شحنة · تتبّع التسليم لحظة بلحظة
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {(['all', ...STATUSES] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-full text-xs border transition"
            style={{
              borderColor: filter === s ? 'var(--a-accent)' : 'var(--a-border)',
              background: filter === s ? 'var(--a-accent)' : 'transparent',
              color: filter === s ? '#fff' : 'inherit',
            }}
          >
            {s === 'all' ? 'الكل' : statusLabel[s]} ({counts[s] || 0})
          </button>
        ))}
      </div>

      <div
        className="flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}
      >
        <Search className="h-4 w-4 opacity-60" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث برقم التتبع، الناقل، أو الوجهة..."
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>

      {loading ? (
        <div className="p-10 text-center"><Loader2 className="h-5 w-5 animate-spin inline" /></div>
      ) : filtered.length === 0 ? (
        <div
          className="p-10 text-center rounded-xl border text-sm"
          style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)', color: 'var(--a-text-muted)' }}
        >
          <Truck className="h-7 w-7 mx-auto mb-2 opacity-60" />
          لا توجد شحنات بعد
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((s) => {
            const Icon = statusIcon[s.status] || Package;
            const stepIndex = STEPS.indexOf(s.status as any);
            const isTerminalBad = s.status === 'returned' || s.status === 'cancelled';
            return (
              <article
                key={s.id}
                className="rounded-2xl border p-5"
                style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface)' }}
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl grid place-items-center text-white"
                      style={{ background: statusColor[s.status] }}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{s.carrier}</div>
                      <div className="text-xs" style={{ color: 'var(--a-text-muted)' }}>
                        {s.tracking_no ? (
                          <span className="font-mono">{s.tracking_no}</span>
                        ) : (
                          'بدون رقم تتبع بعد'
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-3 py-1 rounded-full text-xs text-white"
                      style={{ background: statusColor[s.status] }}
                    >
                      {statusLabel[s.status]}
                    </span>
                    {s.tracking_url && (
                      <a
                        href={s.tracking_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full border"
                        style={{ borderColor: 'var(--a-border)' }}
                      >
                        تتبع <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {!isTerminalBad && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] mb-2" style={{ color: 'var(--a-text-muted)' }}>
                      {STEPS.map((st) => (
                        <span key={st} className={stepIndex >= STEPS.indexOf(st) ? 'font-semibold text-foreground' : ''}>
                          {statusLabel[st]}
                        </span>
                      ))}
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--a-border)' }}>
                      <div
                        className="h-full transition-all duration-700"
                        style={{
                          width: `${((stepIndex + 1) / STEPS.length) * 100}%`,
                          background: statusColor[s.status],
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <Info label="الوجهة" value={s.destination_city || '—'} />
                  <Info label="الوزن" value={s.weight_kg ? `${s.weight_kg} كجم` : '—'} />
                  <Info
                    label="تاريخ الشحن"
                    value={s.shipped_at ? new Date(s.shipped_at).toLocaleDateString('ar-SA') : '—'}
                    icon={<Clock className="h-3 w-3" />}
                  />
                  <Info
                    label="تاريخ التسليم"
                    value={s.delivered_at ? new Date(s.delivered_at).toLocaleDateString('ar-SA') : '—'}
                    icon={<CheckCircle2 className="h-3 w-3" />}
                  />
                </div>

                {s.destination_address && (
                  <p className="mt-3 text-xs" style={{ color: 'var(--a-text-muted)' }}>
                    العنوان: {s.destination_address}
                  </p>
                )}
                {s.notes && (
                  <p className="mt-2 text-xs italic" style={{ color: 'var(--a-text-muted)' }}>
                    {s.notes}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface-2)' }}
    >
      <div className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--a-text-muted)' }}>
        {icon}
        {label}
      </div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
