import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, TrendingUp, Package, DollarSign, ShoppingCart, Download, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';

type Order = {
  id: string; status: string; product_type: string;
  quantity: number; unit: string; created_at: string;
};
type InventoryItem = {
  slug: string; label: string; match_pattern: string | null;
  tiers: { min_kg: number; price_sar: number }[] | any;
};

const PERIODS = [
  { value: 7, label: '٧ أيام' },
  { value: 30, label: '٣٠ يوم' },
  { value: 90, label: '٩٠ يوم' },
  { value: 365, label: 'سنة' },
  { value: 0, label: 'الكل' },
];

const STATUS_LABEL: Record<string, string> = {
  new: 'جديد', contacted: 'تم التواصل', confirmed: 'مؤكد',
  shipped: 'تم الشحن', completed: 'مكتمل', cancelled: 'ملغي',
};

const COLORS = ['#1A4A00', '#C9A227', '#0E2A1A', '#7A6A2A', '#3F6B2A', '#8B5A2B'];

const toKg = (q: number, unit: string) => {
  const u = (unit || '').toLowerCase();
  if (u.includes('ton') || u.includes('طن')) return q * 1000;
  if (u.includes('box') || u.includes('كرت') || u.includes('صند')) return q * 10;
  return q;
};

const matchInventory = (productType: string, items: InventoryItem[]) => {
  const pt = (productType || '').toLowerCase();
  return items.find((i) => {
    try {
      const pat = i.match_pattern || i.slug;
      return new RegExp(pat, 'i').test(pt) || pt.includes(i.label.toLowerCase());
    } catch { return pt.includes(i.slug.toLowerCase()); }
  });
};

const unitPrice = (item?: InventoryItem) => {
  if (!item) return 0;
  const tiers = Array.isArray(item.tiers) ? item.tiers : [];
  if (!tiers.length) return 0;
  return Math.min(...tiers.map((t: any) => Number(t.price_sar) || 0).filter(Boolean)) || 0;
};

export default function AdminReports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [ord, inv] = await Promise.all([
        supabase.from('orders').select('id,status,product_type,quantity,unit,created_at').order('created_at', { ascending: false }).limit(2000),
        supabase.from('inventory_items').select('slug,label,match_pattern,tiers'),
      ]);
      setOrders((ord.data as Order[]) || []);
      setInventory((inv.data as InventoryItem[]) || []);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!days) return orders;
    const cutoff = Date.now() - days * 86400000;
    return orders.filter((o) => new Date(o.created_at).getTime() >= cutoff);
  }, [orders, days]);

  const stats = useMemo(() => {
    let totalKg = 0; let revenue = 0;
    const byProduct: Record<string, { label: string; qty: number; revenue: number; count: number }> = {};
    const byDay: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    filtered.forEach((o) => {
      const kg = toKg(Number(o.quantity) || 0, o.unit);
      totalKg += kg;
      const item = matchInventory(o.product_type, inventory);
      const price = unitPrice(item);
      const rev = kg * price; revenue += rev;
      const key = item?.label || o.product_type || 'غير محدد';
      if (!byProduct[key]) byProduct[key] = { label: key, qty: 0, revenue: 0, count: 0 };
      byProduct[key].qty += kg; byProduct[key].revenue += rev; byProduct[key].count += 1;
      const day = new Date(o.created_at).toISOString().slice(0, 10);
      byDay[day] = (byDay[day] || 0) + 1;
      const s = o.status || 'new';
      byStatus[s] = (byStatus[s] || 0) + 1;
    });
    const topProducts = Object.values(byProduct).sort((a, b) => b.qty - a.qty).slice(0, 6);
    const timeline = Object.entries(byDay).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
    const statusData = Object.entries(byStatus).map(([k, v]) => ({ name: STATUS_LABEL[k] || k, value: v }));
    return { totalOrders: filtered.length, totalKg, revenue, topProducts, timeline, statusData };
  }, [filtered, inventory]);

  return (
    <div className="space-y-5">
      <header className="a-page-header">
        <div>
          <p className="a-crumbs">INTELLIGENCE · REPORTS</p>
          <h1>التقارير والتحليلات</h1>
          <p>رحلة المستخدم مع تقارير فحم النخلة عبر الفترة المختارة.</p>
        </div>
        <div className="a-segmented" role="tablist" aria-label="الفترة">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              role="tab"
              aria-selected={days === p.value}
              onClick={() => setDays(p.value)}
              className={days === p.value ? 'is-active' : ''}
            >{p.label}</button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin" style={{ color: 'var(--a-palm)' }} /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={ShoppingCart} label="إجمالي الطلبات" value={stats.totalOrders.toLocaleString('ar-SA')} />
            <StatCard icon={Package} label="الكمية (كجم)" value={stats.totalKg.toLocaleString('ar-SA', { maximumFractionDigits: 0 })} />
            <StatCard icon={DollarSign} label="الإيرادات التقديرية" value={`${stats.revenue.toLocaleString('ar-SA', { maximumFractionDigits: 0 })} ر.س`} />
            <StatCard icon={TrendingUp} label="متوسط الطلب" value={stats.totalOrders ? `${Math.round(stats.totalKg / stats.totalOrders)} كجم` : '—'} />
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            <ChartCard title="الطلبات عبر الزمن" className="lg:col-span-2">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={stats.timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#1A4A00" strokeWidth={2.5} dot={{ r: 3, fill: '#C9A227' }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="حالات الطلبات">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.statusData} dataKey="value" nameKey="name" outerRadius={80} label={{ fontSize: 11 }}>
                    {stats.statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <ChartCard title="أعلى المنتجات طلباً">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="label" tick={{ fontSize: 11 }} width={140} />
                <Tooltip formatter={(v: any, n) => n === 'qty' ? `${v} كجم` : v} />
                <Bar dataKey="qty" name="الكمية (كجم)" fill="#1A4A00" radius={[0, 6, 6, 0]} />
                <Bar dataKey="revenue" name="إيرادات (ر.س)" fill="#C9A227" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs" style={{ color: 'var(--a-text-muted)', borderBottom: '1px solid var(--a-border)' }}>
                  <tr><th className="text-right py-2">المنتج</th><th className="text-right">عدد الطلبات</th><th className="text-right">الكمية (كجم)</th><th className="text-right">الإيرادات (ر.س)</th></tr>
                </thead>
                <tbody>
                  {stats.topProducts.map((p) => (
                    <tr key={p.label} style={{ borderBottom: '1px solid var(--a-border)' }}>
                      <td className="py-2 font-medium">{p.label}</td>
                      <td>{p.count}</td>
                      <td>{p.qty.toLocaleString('ar-SA', { maximumFractionDigits: 0 })}</td>
                      <td>{p.revenue.toLocaleString('ar-SA', { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                  {!stats.topProducts.length && <tr><td colSpan={4} className="py-6 text-center" style={{ color: 'var(--a-text-muted)' }}>لا توجد بيانات في الفترة المختارة.</td></tr>}
                </tbody>
              </table>
            </div>
          </ChartCard>

          <p className="text-xs text-center" style={{ color: 'var(--a-text-muted)' }}>
            * الإيرادات تقديرية بناءً على أدنى سعر شريحة في المخزون مطابق لنوع المنتج.
          </p>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="a-card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs" style={{ color: 'var(--a-text-muted)' }}>{label}</span>
        <Icon className="w-4 h-4" style={{ color: 'var(--a-palm)' }} />
      </div>
      <div className="mt-2 text-2xl a-display">{value}</div>
    </div>
  );
}

function ChartCard({ title, children, className = '' }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`a-card p-5 ${className}`}>
      <h3 className="text-sm font-medium mb-4 tracking-wide">{title}</h3>
      {children}
    </div>
  );
}
