import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, Award, ShoppingBag, Building2, Globe2,
  Users, Truck, Warehouse, Beaker, FileBadge, Receipt, CreditCard,
  BarChart3, Megaphone, BookOpen, Image as ImageIcon, LayoutTemplate,
  Search, ShieldCheck, KeyRound, Settings as SettingsIcon, ScrollText,
  Sparkles, ChevronLeft,
} from 'lucide-react';
import logo from '@/assets/palm-charcoal-logo.png';

type Item = { to: string; label: string; icon: any; badge?: string };
type Group = { title: string; items: Item[] };

const groups: Group[] = [
  { title: 'نظرة عامة', items: [
    { to: '/admin', label: 'لوحة القيادة', icon: LayoutDashboard },
    { to: '/admin/reports', label: 'التقارير', icon: BarChart3 },
  ]},
  { title: 'الكتالوج', items: [
    { to: '/admin/products', label: 'المنتجات', icon: Package },
    { to: '/admin/categories', label: 'التصنيفات', icon: Tag, badge: 'قريباً' },
    { to: '/admin/brands', label: 'العلامات التجارية', icon: Award, badge: 'قريباً' },
  ]},
  { title: 'العمليات', items: [
    { to: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
    { to: '/admin/wholesale', label: 'الجملة', icon: Building2, badge: 'قريباً' },
    { to: '/admin/export', label: 'التصدير', icon: Globe2, badge: 'قريباً' },
    { to: '/admin/suppliers', label: 'الموردون', icon: Truck, badge: 'قريباً' },
    { to: '/admin/warehouse', label: 'المستودع', icon: Warehouse, badge: 'قريباً' },
  ]},
  { title: 'الجودة', items: [
    { to: '/admin/quality', label: 'مراقبة الجودة', icon: Beaker, badge: 'قريباً' },
    { to: '/admin/certificates', label: 'الشهادات', icon: FileBadge, badge: 'قريباً' },
  ]},
  { title: 'العملاء', items: [
    { to: '/admin/customers', label: 'العملاء', icon: Users },
  ]},
  { title: 'المالية', items: [
    { to: '/admin/invoices', label: 'الفواتير', icon: Receipt, badge: 'قريباً' },
    { to: '/admin/payments', label: 'المدفوعات', icon: CreditCard, badge: 'قريباً' },
  ]},
  { title: 'النمو', items: [
    { to: '/admin/marketing', label: 'التسويق', icon: Megaphone, badge: 'قريباً' },
    { to: '/admin/ai-center', label: 'مركز الذكاء', icon: Sparkles, badge: 'قريباً' },
    { to: '/admin/website', label: 'محرر الموقع', icon: LayoutTemplate, badge: 'قريباً' },
    { to: '/admin/seo', label: 'السيو', icon: Search, badge: 'قريباً' },
    { to: '/admin/blog', label: 'المعرفة والمدونة', icon: BookOpen, badge: 'قريباً' },
    { to: '/admin/media', label: 'مكتبة الوسائط', icon: ImageIcon, badge: 'قريباً' },
  ]},
  { title: 'النظام', items: [
    { to: '/admin/users', label: 'المستخدمون', icon: Users, badge: 'قريباً' },
    { to: '/admin/roles', label: 'الأدوار والصلاحيات', icon: KeyRound, badge: 'قريباً' },
    { to: '/admin/logs', label: 'سجل النظام', icon: ScrollText, badge: 'قريباً' },
    { to: '/admin/security', label: 'الأمان', icon: ShieldCheck, badge: 'قريباً' },
    { to: '/admin/settings', label: 'الإعدادات', icon: SettingsIcon },
  ]},
];

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className="a-glass a-scroll shrink-0 sticky top-0 self-start h-dvh overflow-y-auto transition-all duration-300"
      style={{ width: collapsed ? 78 : 270, borderInlineEnd: '1px solid var(--a-border)' }}
    >
      <div className="flex items-center gap-2 px-4 h-16 border-b" style={{ borderColor: 'var(--a-border)' }}>
        <img src={logo} alt="Palm Charcoal" className="w-9 h-9 rounded-xl object-contain" style={{ background: 'var(--a-surface-2)' }} />
        {!collapsed && (
          <div className="leading-tight">
            <div className="a-display text-lg" style={{ color: 'var(--a-palm)' }}>فحم النخلة</div>
            <div className="text-[10px] tracking-[0.2em]" style={{ color: 'var(--a-text-muted)' }}>ADMIN · OS</div>
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
            {g.items.map((it) => (
              <NavLink
                key={it.to}
                to={it.to}
                end={it.to === '/admin'}
                className={({ isActive }) => `a-nav-item ${isActive ? 'active' : ''}`}
                title={collapsed ? it.label : undefined}
              >
                <it.icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{it.label}</span>}
                {!collapsed && it.badge && (
                  <span className="ms-auto a-pill" style={{ fontSize: 9, padding: '2px 6px' }}>{it.badge}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
        <div className="h-6" />
      </nav>
    </aside>
  );
}
