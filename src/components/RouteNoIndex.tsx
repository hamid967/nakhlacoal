import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

/**
 * Adds `<meta name="robots" content="noindex, nofollow">` for routes that
 * must never be indexed by crawlers, without touching each page component.
 * Mounted once at the app root; it observes location changes automatically.
 */
const NOINDEX_PREFIXES = [
  '/admin',
  '/portal',
  '/auth',
  '/login',
  '/signup',
  '/profile',
  '/reset-password',
  '/studio',
  '/compare',
  '/quotes',
  '/checkout',
];

export function RouteNoIndex() {
  const { pathname } = useLocation();
  const shouldBlock = NOINDEX_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!shouldBlock) return null;
  return (
    <Helmet>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );
}
