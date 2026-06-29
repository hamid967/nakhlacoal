import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import {
  ShoppingBag, DollarSign, Clock, Building2, Globe2, Users, Package, Warehouse,
  Plus, FileText, UserPlus, Download, ArrowUpRight, Activity,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PALETTE = ['#1A4A00', '#C9A84C', '#2F6A12', '#B58E2E', '#3F6B2A', '#8B5A2B'];

const toKg = (q: number, unit: string) => {
  const u = (unit || '').toLowerCase();
  if (u.includes('ton') || u.includes('طن')) return q * 1000;
  if (u.includes('box') || u.includes('كرت') || u.includes('صند')) return q * 10;
  return q;
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [inv, setInv] = useState<any[]>([]);
  const [customers, setCustomers] = useState(0);

  useEffect(() => {
    (async () => {
      const [o, i, c] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500),
        supabase.from('inventory_items').select('*'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);
      setOrders(o.data || []);
      setInv(i.data || []);
      setCustomers(c.count || 0);
    })();
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const todays = orders.filter((o) => o.created_at?.startsWith(today));
    const yesterdays = orders.filter((o) => o.created_at?.startsWith(yest));
    const pending = orders.filter((o) => ['new', 'contacted'].includes(o.status));
    const wholesale = orders.filter((o) => /جمل|whole/i.test(o.business_type || ''));
    const exportO = orders.filter((o) => /export|تصدير/i.test(o.business_type || ''));

    const revenueOf = (list: any[]) => list.reduce((s, o) => {
      const kg = toKg(Number(o.quantity) || 0, o.unit);
      const item = inv.find((it) => {
        try { return new RegExp(it.match_pattern || it.slug, 'i').test(o.product_type || ''); } catch { return false; }
      });
      const tiers = Array.isArray(item?.tiers) ? item!.tiers : [];
      const price = tiers.length ? Math.min(...tiers.map((t: any) => Number(t.pricePerKg ?? t.price_sar) || 0).filter(Boolean)) : 0;
      return s + kg * price;
    }, 0);
    const revenue = revenueOf(orders);
    const revToday = revenueOf(todays);
    const revYest = revenueOf(yesterdays);

    const pct = (cur: number, prev: number) => {
      if (!prev) return cur ? '+100%' : '';
      const d = ((cur - prev) / prev) * 100;
      return `${d >= 0 ? '+' : ''}${d.toFixed(0)}%`;
    };
    const ordersDelta = pct(todays.length, yesterdays.length);
    const revenueDelta = pct(revToday, revYest);

    const stockKg = inv.reduce((s, i) => s + (Number(i.in_stock_kg) || 0), 0);

    const byDay: Record<string, { date: string; orders: number; revenue: number }> = {};
    for (let d = 13; d >= 0; d--) {
      const k = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
      byDay[k] = { date: k.slice(5), orders: 0, revenue: 0 };
    }
    orders.forEach((o) => {
      const k = o.created_at?.slice(0, 10);
      if (byDay[k]) byDay[k].orders += 1;
    });

    const byProd: Record<string, number> = {};
    orders.forEach((o) => { byProd[o.product_type] = (byProd[o.product_type] || 0) + toKg(Number(o.quantity) || 0, o.unit); });
    const topProducts = Object.entries(byProd).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n, v]) => ({ name: n, kg: v }));

    const byStatus: Record<string, number> = {};
    orders.forEach((o) => { byStatus[o.status || 'new'] = (byStatus[o.status || 'new'] || 0) + 1; });
    const statusData = Object.entries(byStatus).map(([k, v]) => ({ name: k, value: v }));

    return {
      todays: todays.length, pending: pending.length, wholesale: wholesale.length, exportO: exportO.length,
      revenue, stockKg, timeline: Object.values(byDay), topProducts, statusData,
      ordersDelta, revenueDelta,
    };
  }, [orders, inv]);

  const cards = [
    { label: 'طلبات اليوم', value: stats.todays.toLocaleString('ar-SA'), icon: ShoppingBag, tint: 'green', delta: stats.ordersDelta },
    { label: 'الإيرادات', value: `${Math.round(stats.revenue).toLocaleString('ar-SA')} ر.س`, icon: DollarSign, tint: 'gold', delta: stats.revenueDelta },
    { label: 'طلبات معلقة', value: stats.pending, icon: Clock, tint: 'amber', delta: '' },
    { label: 'طلبات الجملة', value: stats.wholesale, icon: Building2, tint: 'blue', delta: '' },
    { label: 'طلبات التصدير', value: stats.exportO, icon: Globe2, tint: 'violet', delta: '' },
    { label: 'العملاء', value: customers.toLocaleString('ar-SA'), icon: Users, tint: 'green', delta: '' },
    { label: 'المنتجات', value: inv.length, icon: Package, tint: 'gold', delta: '' },
    { label: 'المخزون (كجم)', value: stats.stockKg.toLocaleString('ar-SA'), icon: Warehouse, tint: 'rose', delta: '' },
  ];


  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>OVERVIEW · {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h1 className="a-display text-4xl md:text-5xl mt-1">أهلاً بعودتك ✦</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>نظرة شاملة على عمليات فحم النخلة اليوم.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products" className="a-btn a-btn-ghost"><Plus className="w-4 h-4" /> منتج جديد</Link>
          <Link to="/admin/orders" className="a-btn a-btn-palm"><FileText className="w-4 h-4" /> طلب جديد</Link>
          <button className="a-btn a-btn-gold"><Download className="w-4 h-4" /> تقرير</button>
        </div>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="a-card a-card-hover p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>{c.label}</div>
                <div className="a-display text-3xl mt-1.5">{c.value}</div>
              </div>
              <div className={`a-pill a-pill-${c.tint === 'green' ? 'green' : c.tint === 'gold' ? 'gold' : c.tint === 'amber' ? 'amber' : c.tint === 'blue' ? 'blue' : c.tint === 'violet' ? 'violet' : 'rose'}`}>
                <c.icon className="w-3.5 h-3.5" />
              </div>
            </div>
            {c.delta && (
              <div className="mt-3 inline-flex items-center gap-1 text-xs" style={{ color: 'var(--a-palm)' }}>
                <ArrowUpRight className="w-3 h-3" /> {c.delta} مقارنة بالأمس
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="a-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">حركة الطلبات — آخر 14 يوم</h3>
            <span className="a-pill a-pill-green">مباشر</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.timeline}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A4A00" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1A4A00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="orders" stroke="#1A4A00" strokeWidth={2.5} fill="url(#g1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="a-card p-5">
          <h3 className="font-semibold mb-3">حالات الطلبات</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats.statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {stats.statusData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="a-card p-5 lg:col-span-2">
          <h3 className="font-semibold mb-3">أعلى المنتجات طلباً</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={stats.topProducts} layout="vertical" margin={{ left: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
              <Tooltip />
              <Bar dataKey="kg" name="كجم" fill="#C9A84C" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="a-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> آخر الأنشطة</h3>
          <ul className="space-y-3">
            {orders.slice(0, 7).map((o) => (
              <li key={o.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full grid place-items-center text-xs font-semibold shrink-0"
                     style={{ background: 'var(--a-surface-2)', color: 'var(--a-palm)' }}>
                  {(o.company_name || '?')[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate"><b>{o.company_name}</b> — {o.product_type}</div>
                  <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>
                    {o.quantity} {o.unit} · {new Date(o.created_at).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
                <span className="a-pill">{o.status}</span>
              </li>
            ))}
            {!orders.length && <li className="text-sm text-center py-6" style={{ color: 'var(--a-text-muted)' }}>لا توجد طلبات بعد.</li>}
          </ul>
        </div>
      </div>

      {/* Quick actions */}
      <div className="a-card p-5">
        <h3 className="font-semibold mb-4">اختصارات سريعة</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/admin/products', label: 'منتج جديد', icon: Plus },
            { to: '/admin/orders', label: 'إنشاء طلب', icon: FileText },
            { to: '/admin/customers', label: 'إضافة عميل', icon: UserPlus },
            { to: '/admin/reports', label: 'تصدير تقرير', icon: Download },
          ].map((q) => (
            <Link key={q.to} to={q.to} className="a-card a-card-hover p-4 flex items-center gap-3"
                  style={{ background: 'var(--a-surface-2)' }}>
              <div className="w-10 h-10 rounded-xl grid place-items-center"
                   style={{ background: 'var(--a-surface)', color: 'var(--a-palm)' }}>
                <q.icon className="w-5 h-5" />
              </div>
              <div className="text-sm font-medium">{q.label}</div>
              <ArrowUpRight className="w-4 h-4 ms-auto opacity-50" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
