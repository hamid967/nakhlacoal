import type { AppRole } from '@/contexts/AuthContext';

/**
 * Maps the highest-privilege role in the user's role set to its landing route.
 * Order matters — first match wins.
 */
const ROLE_ROUTE: ReadonlyArray<readonly [AppRole, string]> = [
  ['super_admin', '/admin'],
  ['admin', '/admin'],
  ['sales', '/admin/orders'],
  ['warehouse', '/admin/inventory'],
  ['accountant', '/admin/reports'],
  ['distributor', '/portal'],
  ['wholesale', '/portal'],
  ['customer', '/portal'],
  ['user', '/portal'],
];

export function resolveRoleRoute(roles: ReadonlyArray<AppRole>): string {
  for (const [role, route] of ROLE_ROUTE) {
    if (roles.includes(role)) return route;
  }
  return '/portal';
}

/**
 * Only same-origin relative paths are allowed; anything else collapses to `/`.
 */
export function sanitizeFrom(raw: string | null | undefined): string | null {
  if (!raw) return null;
  if (!raw.startsWith('/') || raw.startsWith('//')) return null;
  try {
    const u = new URL(raw, window.location.origin);
    if (u.origin !== window.location.origin) return null;
    if (u.pathname === '/auth') return null;
    return u.pathname + u.search + u.hash;
  } catch {
    return null;
  }
}
