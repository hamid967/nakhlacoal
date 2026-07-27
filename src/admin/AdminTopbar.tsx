import { Search, Sun, Moon, Globe } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { NotificationBell } from '@/admin/components/NotificationBell';


export function AdminTopbar({ theme, onThemeToggle }: { theme: 'light' | 'dark'; onThemeToggle: () => void }) {
  const { user } = useAuth();
  const initial = (user?.email || 'A')[0].toUpperCase();
  return (
    <header
      className="a-glass sticky top-0 z-30 h-16 flex items-center gap-3 px-5 border-b"
      style={{ borderColor: 'var(--a-border)' }}
    >
      <div className="relative flex-1 max-w-xl">
        <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 start-3" style={{ color: 'var(--a-text-muted)' }} />
        <input className="a-input ps-9" placeholder="بحث في الطلبات والمنتجات والعملاء…" />
      </div>
      <button className="a-btn a-btn-ghost" title="اللغة">
        <Globe className="w-4 h-4" />
      </button>
      <button onClick={onThemeToggle} className="a-btn a-btn-ghost" title="تبديل الثيم">
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
      <NotificationBell />

      <Link to="/profile" className="flex items-center gap-2 ps-3 border-s" style={{ borderColor: 'var(--a-border)' }}>
        <div className="w-9 h-9 rounded-full grid place-items-center text-sm font-semibold"
             style={{ background: 'linear-gradient(135deg, var(--a-palm), var(--a-palm-2))', color: '#fff' }}>
          {initial}
        </div>
        <div className="hidden md:block leading-tight">
          <div className="text-[13px] font-medium">{user?.email?.split('@')[0] || 'Admin'}</div>
          <div className="text-[10px]" style={{ color: 'var(--a-text-muted)' }}>المالك</div>
        </div>
      </Link>
    </header>
  );
}
