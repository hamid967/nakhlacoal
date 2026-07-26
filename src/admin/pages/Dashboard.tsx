import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';
import {
  ShoppingBag, DollarSign, Clock, Building2, Globe2, Users, Package, Warehouse,
  Plus, FileText, UserPlus, Download, ArrowUpRight, Activity, Calendar, Award,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PALETTE = ['#1A4A00', '#C9A84C', '#2F6A12', '#B58E2E', '#3F6B2A', '#8B5A2B'];

const toKg = (q: number, unit: string) => {
  const u = (unit || '').toLowerCase();
  if (u.includes('ton') || u.includes('طن')) return q * 1000;
  if (u.includes('box') || u.includes('كرت') || u.includes('صند')) return q * 10;
  return q;
};

type Period = 'day' | 'week' | 'month';

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [inv, setInv] = useState<any[]>([]);
  const [customers, setCustomers] = useState(0);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [trademarks, setTrademarks] = useState<any[]>([]);
  const [period, setPeriod] = useState<Period>('day');

  useEffect(() => {
    (async () => {
      const [o, i, c, q, t] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(2000),
        supabase.from('inventory_items').select('*'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('quote_requests').select('id,status,quoted_price_sar,created_at').order('created_at', { ascending: false }).limit(500),
        supabase.from('trademarks').select('id,name_ar,registration_no,expires_hijri,is_active').eq('is_active', true),
      ]);
      setOrders(o.data || []);
      setInv(i.data || []);
      setCustomers(c.count || 0);
      setQuotes(q.data || []);
      setTrademarks(t.data || []);
    })();
  }, []);

  const priceOf = useMemo(() => {
    return (o: any) => {
      const kg = toKg(Number(o.quantity) || 0, o.unit);
      const item = inv.find((it) => {
        try { return new RegExp(it.match_pattern || it.slug, 'i').test(o.product_type || ''); } catch { return false; }
      });
      const tiers = Array.isArray(item?.tiers) ? item!.tiers : [];
      const price = tiers.length ? Math.min(...tiers.map((t: any) => Number(t.pricePerKg ?? t.price_sar) || 0).filter(Boolean)) : 0;
      return kg * price;
    };
  }, [inv]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const todays = orders.filter((o) => o.created_at?.startsWith(today));
    const yesterdays = orders.filter((o) => o.created_at?.startsWith(yest));
    const pending = orders.filter((o) => ['new', 'contacted'].includes(o.status));
    const wholesale = orders.filter((o) => /جمل|whole/i.test(o.business_type || ''));
    const exportO = orders.filter((o) => /export|تصدير/i.test(o.business_type || ''));

    const revenueOf = (list: any[]) => list.reduce((s, o) => s + priceOf(o), 0);
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

    // Bucketed timeline by selected period
    type Bucket = { date: string; orders: number; revenue: number; key: string };
    const buckets = new Map<string, Bucket>();
    const now = new Date();
    const spans = period === 'day' ? 14 : period === 'week' ? 8 : 6;

    for (let i = spans - 1; i >= 0; i--) {
      let key: string; let label: string;
      if (period === 'day') {
        const d = new Date(now.getTime() - i * 86400000);
        key = d.toISOString().slice(0, 10);
        label = key.slice(5);
      } else if (period === 'week') {
        const d = new Date(now.getTime() - i * 7 * 86400000);
        const y = d.getFullYear();
        const onejan = new Date(y, 0, 1);
        const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
        key = `${y}-W${String(week).padStart(2, '0')}`;
        label = `أسبوع ${week}`;
      } else {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        label = d.toLocaleDateString('ar-SA', { month: 'short' });
      }
      buckets.set(key, { date: label, orders: 0, revenue: 0, key });
    }
    orders.forEach((o) => {
      if (!o.created_at) return;
      const d = new Date(o.created_at);
      let key: string;
      if (period === 'day') key = d.toISOString().slice(0, 10);
      else if (period === 'week') {
        const y = d.getFullYear();
        const onejan = new Date(y, 0, 1);
        const week = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
        key = `${y}-W${String(week).padStart(2, '0')}`;
      } else key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const b = buckets.get(key);
      if (b) { b.orders += 1; b.revenue += priceOf(o); }
    });
    const timeline = Array.from(buckets.values());

    const byProd: Record<string, number> = {};
    orders.forEach((o) => { byProd[o.product_type] = (byProd[o.product_type] || 0) + toKg(Number(o.quantity) || 0, o.unit); });
    const topProducts = Object.entries(byProd).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n, v]) => ({ name: n, kg: v }));

    const STATUS_KEYS = ['new', 'contacted', 'confirmed', 'shipped', 'completed', 'cancelled'];
    const byStatus: Record<string, number> = Object.fromEntries(STATUS_KEYS.map((k) => [k, 0]));
    orders.forEach((o) => { const k = o.status || 'new'; byStatus[k] = (byStatus[k] || 0) + 1; });
    const statusData = Object.entries(byStatus).map(([k, v]) => ({ name: k, value: v }));

    return {
      todays: todays.length, pending: pending.length, wholesale: wholesale.length, exportO: exportO.length,
      revenue, stockKg, timeline, topProducts, statusData, byStatus,
      totalOrders: orders.length,
      ordersDelta, revenueDelta,
    };
  }, [orders, inv, period, priceOf]);

  const STATUS_LABEL: Record<string, string> = {
    new: 'جديد', contacted: 'تم التواصل', confirmed: 'مؤكد',
    shipped: 'تم الشحن', completed: 'مكتمل', cancelled: 'ملغي',
  };
  const STATUS_DOT: Record<string, string> = {
    new: 'slate', contacted: 'amber', confirmed: 'emerald',
    shipped: 'emerald', completed: 'emerald', cancelled: 'rose',
  };

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
      <header className="a-page-header">
        <div>
          <p className="a-crumbs">OVERVIEW · {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h1>أهلاً بعودتك ✦</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>نظرة شاملة على عمليات فحم النخلة اليوم.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products" className="a-btn a-btn-ghost"><Plus className="w-4 h-4" /> منتج جديد</Link>
          <Link to="/admin/orders" className="a-btn a-btn-palm"><FileText className="w-4 h-4" /> طلب جديد</Link>
          <button className="a-btn a-btn-gold"><Download className="w-4 h-4" /> تقرير</button>
        </div>
      </header>




      {/* KPI — Total orders + per-status breakdown (Untitled UI a-metric) */}
      <section aria-label="نظرة عامة على الطلبات" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="a-metric lg:col-span-1">
          <div className="a-metric-label">إجمالي الطلبات</div>
          <div className="a-metric-value">{stats.totalOrders.toLocaleString('ar-SA')}</div>
          {stats.ordersDelta && (
            <span className={`a-metric-trend ${stats.ordersDelta.startsWith('-') ? 'down' : 'up'}`}>
              <ArrowUpRight className="w-3 h-3" /> {stats.ordersDelta} اليوم
            </span>
          )}
        </div>
        {(['new','contacted','confirmed','shipped','completed','cancelled'] as const).map((k) => {
          const n = stats.byStatus[k] || 0;
          const pct = stats.totalOrders ? Math.round((n / stats.totalOrders) * 100) : 0;
          return (
            <Link key={k} to={`/admin/orders?status=${k}`} className="a-metric block hover:border-[var(--a-border-strong)] transition-colors">
              <div className="a-metric-label inline-flex items-center gap-1.5">
                <span className={`a-dot ${STATUS_DOT[k]}`} /> {STATUS_LABEL[k]}
              </div>
              <div className="a-metric-value">{n.toLocaleString('ar-SA')}</div>
              <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>{pct}% من الإجمالي</div>
            </Link>
          );
        })}
      </section>

      {/* This-month band + Quotes + Trademark renewals */}
      <MonthBand orders={orders} quotes={quotes} trademarks={trademarks} priceOf={priceOf} />

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
          <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
            <h3 className="font-semibold">
              الأداء — {period === 'day' ? 'يومي (14 يوم)' : period === 'week' ? 'أسبوعي (8 أسابيع)' : 'شهري (6 أشهر)'}
            </h3>
            <div className="inline-flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--a-border)' }}>
              {(['day','week','month'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1.5 text-xs font-medium transition"
                  style={{
                    background: period === p ? 'var(--a-palm)' : 'transparent',
                    color: period === p ? '#fff' : 'var(--a-text-muted)',
                  }}
                >
                  {p === 'day' ? 'يومي' : p === 'week' ? 'أسبوعي' : 'شهري'}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.timeline}>
              <defs>
                <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A4A00" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1A4A00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C9A84C" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#C9A84C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} allowDecimals={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number, n: string) => n === 'الإيرادات' ? `${Math.round(v).toLocaleString('ar-SA')} ر.س` : v} />
              <Area yAxisId="left" type="monotone" name="الطلبات" dataKey="orders" stroke="#1A4A00" strokeWidth={2.5} fill="url(#g1)" />
              <Area yAxisId="right" type="monotone" name="الإيرادات" dataKey="revenue" stroke="#C9A84C" strokeWidth={2} fill="url(#g2)" />
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

function MonthBand({
  orders, quotes, trademarks, priceOf,
}: { orders: any[]; quotes: any[]; trademarks: any[]; priceOf: (o: any) => number }) {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthOrders = orders.filter((o) => (o.created_at || '').startsWith(monthKey));
  const monthRevenue = monthOrders.reduce((s, o) => s + priceOf(o), 0);
  const monthQuotes = quotes.filter((q) => (q.created_at || '').startsWith(monthKey));
  const pendingQuotes = quotes.filter((q) => ['new', 'under_review'].includes(q.status));
  const pricedQuotes = quotes.filter((q) => q.status === 'priced');
  const convertedQuotes = quotes.filter((q) => q.status === 'converted_to_order').length;
  const acceptanceRate = quotes.length
    ? Math.round((convertedQuotes / quotes.length) * 100)
    : 0;

  // Trademark renewals: extract 4-digit year from expires_hijri, flag those expiring within next 12 hijri months
  const currentHY = 1447; // approximate current hijri year (2026)
  const renewals = trademarks
    .map((t) => {
      const m = String(t.expires_hijri || '').match(/(\d{4})/);
      const y = m ? Number(m[1]) : null;
      return { ...t, expiryYear: y, yearsLeft: y ? y - currentHY : null };
    })
    .filter((t) => t.yearsLeft !== null && t.yearsLeft <= 1)
    .sort((a, b) => (a.yearsLeft ?? 99) - (b.yearsLeft ?? 99))
    .slice(0, 6);

  const monthLabel = now.toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' });

  return (
    <section className="grid lg:grid-cols-3 gap-5">
      {/* This month */}
      <div className="a-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--a-palm)' }} /> ملخص {monthLabel}
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3" style={{ background: 'var(--a-surface-2)' }}>
            <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>الطلبات</div>
            <div className="a-display text-2xl mt-1">{monthOrders.length.toLocaleString('ar-SA')}</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--a-surface-2)' }}>
            <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>الإيرادات</div>
            <div className="a-display text-2xl mt-1">{Math.round(monthRevenue).toLocaleString('ar-SA')} <span className="text-xs">ر.س</span></div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--a-surface-2)' }}>
            <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>عروض السعر</div>
            <div className="a-display text-2xl mt-1">{monthQuotes.length.toLocaleString('ar-SA')}</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: 'var(--a-surface-2)' }}>
            <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>معدل التحويل</div>
            <div className="a-display text-2xl mt-1">{acceptanceRate}%</div>
          </div>
        </div>
      </div>

      {/* Quotes pipeline */}
      <div className="a-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" style={{ color: 'var(--a-palm)' }} /> خط أنابيب العروض
          </h3>
          <Link to="/admin/quotes" className="text-xs" style={{ color: 'var(--a-palm)' }}>
            عرض الكل ↗
          </Link>
        </div>
        <div className="space-y-2">
          <PipeRow label="بانتظار المراجعة" count={pendingQuotes.length} total={quotes.length || 1} tint="amber" to="/admin/quotes?status=new" />
          <PipeRow label="مُسعّرة — بانتظار الموافقة" count={pricedQuotes.length} total={quotes.length || 1} tint="blue" to="/admin/quotes?status=priced" />
          <PipeRow label="محوّلة إلى طلبات" count={convertedQuotes} total={quotes.length || 1} tint="green" to="/admin/quotes?status=converted_to_order" />
        </div>
        {!quotes.length && (
          <p className="text-xs text-center pt-4" style={{ color: 'var(--a-text-muted)' }}>لا توجد عروض بعد.</p>
        )}
      </div>

      {/* Trademark renewals */}
      <div className="a-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Award className="w-4 h-4" style={{ color: 'var(--a-palm)' }} /> تجديد العلامات التجارية
          </h3>
          <Link to="/admin/trademarks" className="text-xs" style={{ color: 'var(--a-palm)' }}>إدارة ↗</Link>
        </div>
        {renewals.length ? (
          <ul className="space-y-2">
            {renewals.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 p-2 rounded-lg" style={{ background: 'var(--a-surface-2)' }}>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{t.name_ar}</div>
                  <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>سجل #{t.registration_no}</div>
                </div>
                <span className={`a-pill ${(t.yearsLeft ?? 0) <= 0 ? 'a-pill-rose' : 'a-pill-amber'}`}>
                  {(t.yearsLeft ?? 0) <= 0 ? 'منتهية' : `${t.expires_hijri}`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-center py-6" style={{ color: 'var(--a-text-muted)' }}>
            لا توجد علامات تحتاج تجديد خلال السنة القادمة.
          </p>
        )}
      </div>
    </section>
  );
}

function PipeRow({ label, count, total, tint, to }: { label: string; count: number; total: number; tint: string; to: string }) {
  const pct = Math.round((count / total) * 100);
  return (
    <Link to={to} className="block">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: 'var(--a-text-muted)' }}>{label}</span>
        <span className="font-semibold">{count.toLocaleString('ar-SA')}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--a-surface-2)' }}>
        <div className={`h-full a-pill-${tint}`} style={{ width: `${pct}%`, opacity: 0.9 }} />
      </div>
    </Link>
  );
}

