import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PortalSidebar } from './PortalSidebar';
import { PortalTopbar } from './PortalTopbar';
import '@/admin/admin.css';

export default function PortalLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (typeof localStorage !== 'undefined' && (localStorage.getItem('portal-theme') as any)) || 'light'
  );
  const location = useLocation();

  useEffect(() => { localStorage.setItem('portal-theme', theme); }, [theme]);

  return (
    <div className="admin-shell" data-theme={theme} dir="rtl">
      <div className="flex">
        <PortalSidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
        <div className="flex-1 min-w-0">
          <PortalTopbar theme={theme} onThemeToggle={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />
          <AnimatePresence mode="wait">
            <motion.main
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35, ease: [0.2, 0.7, 0.2, 1] }}
              className="p-6 md:p-8 max-w-[1600px] mx-auto"
            >
              <Outlet />
            </motion.main>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
