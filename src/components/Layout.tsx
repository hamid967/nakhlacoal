import { Outlet, useLocation } from 'react-router-dom';
import { useEffect, lazy, Suspense } from 'react';
import { LuxNav } from './LuxNav';
import { LuxFooter } from './LuxFooter';
import { PromoBanner } from './PromoBanner';
import { ImageDiagnostics } from './ImageDiagnostics';

// Lazy-load the floating AI/WhatsApp widget — heavy and not LCP-critical.
const WhatsAppFab = lazy(() =>
  import('./WhatsAppFab').then((m) => ({ default: m.WhatsAppFab })),
);

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <PromoBanner />
      <LuxNav />
      <main>
        <Outlet />
      </main>
      <LuxFooter />
      <Suspense fallback={null}>
        <WhatsAppFab />
      </Suspense>
      <ImageDiagnostics />
    </div>
  );
}

