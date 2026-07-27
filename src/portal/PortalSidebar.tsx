import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, PlusCircle, MapPin, Receipt, CreditCard,
  FileText, Package, Award, BookOpen, BadgeCheck, Heart, Bell, Headphones,
  MessageSquare, MapPinned, User, Settings as SettingsIcon, LogOut, ChevronLeft,
  Gift, Share2,
} from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useAuth } from '@/contexts/AuthContext';

type Item = { to?: string; label: string; icon: any; badge?: string; action?: 'signout' };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  { title: 'عام', items: [
    { to: '/portal', label: 'لوحة التحكم', icon: LayoutDashboard },
  ]},
  { title: 'الطلبات', items: [
    { to: '/portal/orders', label: 'طلباتي', icon: ShoppingBag },
    { to: '/portal/orders/new', label: 'إنشاء طلب', icon: PlusCircle },
    { to: '/portal/tracking', label: 'تتبع الطلبات', icon: MapPin },
    { to: '/portal/returns', label: 'طلبات الإرجاع', icon: Package },
    { to: '/portal/quotes', label: 'العروض السعرية', icon: FileText, badge: 'قريباً' },
  ]},
  { title: 'المالية', items: [
    { to: '/portal/invoices', label: 'الفواتير', icon: Receipt, badge: 'قريباً' },
    { to: '/portal/payments', label: 'المدفوعات', icon: CreditCard, badge: 'قريباً' },
  ]},
  { title: 'الجملة', items: [
    { to: '/portal/wholesale', label: 'حساب الجملة', icon: LayoutDashboard },
    { to: '/portal/wholesale/catalog', label: 'كتالوج الجملة', icon: BookOpen },
    { to: '/portal/wholesale/bulk-order', label: 'طلب بالجملة', icon: PlusCircle },
    { to: '/portal/wholesale/statement', label: 'كشف الحساب', icon: Receipt },
  ]},
  { title: 'المنتجات', items: [
    { to: '/portal/catalog', label: 'الكتالوج', icon: BookOpen },
    { to: '/portal/products', label: 'المنتجات', icon: Package },
    { to: '/portal/trademarks', label: 'العلامات التجارية', icon: Award },
    { to: '/portal/certificates', label: 'الشهادات', icon: BadgeCheck, badge: 'قريباً' },
    { to: '/portal/favorites', label: 'المفضلة', icon: Heart },
  ]},
  { title: 'المكافآت', items: [
    { to: '/portal/loyalty', label: 'نقاط النخلة', icon: Gift },
    { to: '/portal/referrals', label: 'برنامج الإحالة', icon: Share2 },
  ]},
  { title: 'التواصل', items: [
    { to: '/portal/notifications', label: 'الإشعارات', icon: Bell, badge: 'قريباً' },
    { to: '/portal/messages', label: 'الرسائل', icon: MessageSquare, badge: 'قريباً' },
    { to: '/portal/support', label: 'الدعم الفني', icon: Headphones },
  ]},
  { title: 'الحساب', items: [
    { to: '/portal/addresses', label: 'العناوين', icon: MapPinned, badge: 'قريباً' },
    { to: '/portal/profile', label: 'الملف الشخصي', icon: User },
    { to: '/portal/settings', label: 'إعدادات الحساب', icon: SettingsIcon },
    { label: 'تسجيل الخروج', icon: LogOut, action: 'signout' },
  ]},
];

export function PortalSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <aside
      className="a-glass a-scroll shrink-0 sticky top-0 self-start h-dvh overflow-y-auto transition-all duration-300"
      style={{ width: collapsed ? 78 : 270, borderInlineEnd: '1px solid var(--a-border)' }}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b" style={{ borderColor: 'var(--a-border)' }}>
        <BrandLogo alt="Palm Charcoal" className="w-9 h-9 rounded-xl object-contain" />
        {!collapsed && (
          <div className="leading-tight">
            <div className="a-display text-lg" style={{ color: 'var(--a-palm)' }}>فحم النخلة</div>
            <div className="text-[10px] tracking-[0.2em]" style={{ color: 'var(--a-text-muted)' }}>CLIENT · PORTAL</div>
          </div>
        )}
        <button onClick={onToggle} className="ms-auto p-1.5 rounded-lg hover:bg-black/5" aria-label="toggle sidebar">
          <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="px-2 py-2">
        {groups.map((g) => (
          <div key={g.title}>
            {!collapsed && <div className="a-nav-group">{g.title}</div>}
            {g.items.map((it) =>
              it.action === 'signout' ? (
                <button
                  key="signout"
                  onClick={handleSignOut}
                  className="a-nav-item w-full text-start"
                  title={collapsed ? it.label : undefined}
                >
                  <it.icon className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{it.label}</span>}
                </button>
              ) : (
                <NavLink
                  key={it.to}
                  to={it.to!}
                  end={it.to === '/portal'}
                  className={({ isActive }) => `a-nav-item ${isActive ? 'active' : ''}`}
                  title={collapsed ? it.label : undefined}
                >
                  <it.icon className="w-[18px] h-[18px] shrink-0" />
                  {!collapsed && <span className="truncate">{it.label}</span>}
                  {!collapsed && it.badge && (
                    <span className="ms-auto a-pill" style={{ fontSize: 9, padding: '2px 6px' }}>{it.badge}</span>
                  )}
                </NavLink>
              )
            )}
          </div>
        ))}
        <div className="h-6" />
      </nav>
    </aside>
  );
}
