import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LuxNav } from './LuxNav';
import { LuxFooter } from './LuxFooter';

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LuxNav />
      <main>
        <Outlet />
      </main>
      <LuxFooter />
    </div>
  );
}
