import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  ShoppingBag, Clock, CheckCircle2, Receipt, Heart, Wallet, Sparkles, Tag,
  Plus, MapPin, FileText, Headphones, Activity, ArrowUpRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ProductRecommender } from '@/components/ProductRecommender';

const PALETTE = ['#1A4A00', '#C9A84C', '#2F6A12', '#B58E2E', '#3F6B2A', '#8B5A2B'];

export default function PortalDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [o, p] = await Promise.all([
        supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(200),
        supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      ]);
      setOrders(o.data || []);
      setProfile(p.data || null);
    })();
  }, [user]);

  const favCount = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('palm-favorites') || '[]').length; } catch { return 0; }
  }, []);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => ['new', 'contacted', 'preparing'].includes(o.status));
    const completed = orders.filter((o) => ['delivered', 'completed'].includes(o.status));
    const byDay: Record<string, { date: string; orders: number }> = {};
    for (let d = 13; d >= 0; d--) {
      const k = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
      byDay[k] = { date: k.slice(5), orders: 0 };
    }
    orders.forEach((o) => {
      const k = o.created_at?.slice(0, 10);
      if (byDay[k]) byDay[k].orders += 1;
    });
    const byStatus: Record<string, number> = {};
    orders.forEach((o) => { byStatus[o.status || 'new'] = (byStatus[o.status || 'new'] || 0) + 1; });
    return {
      total: orders.length,
      pending: pending.length,
      completed: completed.length,
      timeline: Object.values(byDay),
      statusData: Object.entries(byStatus).map(([k, v]) => ({ name: k, value: v })),
      loyalty: orders.length * 10,
    };
  }, [orders]);

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'عميلنا الكريم';

  const cards = [
    { label: 'إجمالي الطلبات', value: stats.total, icon: ShoppingBag, tint: 'green' },
    { label: 'قيد التنفيذ', value: stats.pending, icon: Clock, tint: 'amber' },
    { label: 'مكتملة', value: stats.completed, icon: CheckCircle2, tint: 'green' },
    { label: 'الفواتير المستحقة', value: 0, icon: Receipt, tint: 'rose' },
    { label: 'نقاط الولاء', value: stats.loyalty.toLocaleString('ar-SA'), icon: Sparkles, tint: 'gold' },
    { label: 'رصيد المحفظة', value: '0 ر.س', icon: Wallet, tint: 'blue' },
    { label: 'منتجاتي المفضلة', value: favCount, icon: Heart, tint: 'rose' },
    { label: 'آخر عرض ساري', value: '—', icon: Tag, tint: 'violet' },
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] tracking-[0.3em]" style={{ color: 'var(--a-text-muted)' }}>
            CUSTOMER · {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="a-display text-4xl md:text-5xl mt-1">مرحباً، {displayName} ✦</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--a-text-muted)' }}>
            نظرة شاملة على طلباتك ومنتجاتك مع فحم النخلة.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/portal/orders/new" className="a-btn a-btn-palm"><Plus className="w-4 h-4" /> طلب جديد</Link>
          <Link to="/portal/tracking" className="a-btn a-btn-ghost"><MapPin className="w-4 h-4" /> تتبع</Link>
          <Link to="/portal/support" className="a-btn a-btn-gold"><Headphones className="w-4 h-4" /> دعم</Link>
        </div>
      </header>

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
              <div className={`a-pill a-pill-${c.tint}`}>
                <c.icon className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="a-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">طلباتي — آخر 14 يوم</h3>
            <span className="a-pill a-pill-green">مباشر</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={stats.timeline}>
              <defs>
                <linearGradient id="pg1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A4A00" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#1A4A00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.06)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="orders" stroke="#1A4A00" strokeWidth={2.5} fill="url(#pg1)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="a-card p-5">
          <h3 className="font-semibold mb-3">حالات طلباتي</h3>
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
          <ProductRecommender />
        </div>

        <div className="a-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> آخر الطلبات</h3>
          <ul className="space-y-3">
            {orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full grid place-items-center text-xs font-semibold shrink-0"
                     style={{ background: 'var(--a-surface-2)', color: 'var(--a-palm)' }}>
                  #{(o.id || '').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm truncate"><b>{o.product_type}</b></div>
                  <div className="text-[11px]" style={{ color: 'var(--a-text-muted)' }}>
                    {o.quantity} {o.unit} · {new Date(o.created_at).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                </div>
                <span className="a-pill">{o.status}</span>
              </li>
            ))}
            {!orders.length && <li className="text-sm text-center py-6" style={{ color: 'var(--a-text-muted)' }}>لا توجد طلبات بعد.</li>}
          </ul>
          <Link to="/portal/orders" className="mt-4 inline-flex items-center gap-1 text-xs" style={{ color: 'var(--a-palm)' }}>
            عرض كل الطلبات <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="a-card p-5">
        <h3 className="font-semibold mb-4">اختصارات سريعة</h3>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/portal/orders/new', label: 'إنشاء طلب', icon: Plus },
            { to: '/portal/tracking', label: 'تتبع شحنة', icon: MapPin },
            { to: '/portal/invoices', label: 'الفواتير', icon: FileText },
            { to: '/portal/support', label: 'الدعم الفني', icon: Headphones },
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
