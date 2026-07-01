import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type AppRole } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requireRole?: AppRole;
  requireAnyRole?: AppRole[];
}

const ADMIN_ROLES: AppRole[] = ['admin', 'super_admin'];

export function ProtectedRoute({ children, requireRole, requireAnyRole }: Props) {
  const { user, roles, loading } = useAuth();
  const location = useLocation();

  const isPortal = location.pathname.startsWith('/portal');
  const needsRole = !!requireRole || (requireAnyRole && requireAnyRole.length > 0);

  // Wait for auth (and roles if a role gate exists — roles load async after user)
  if (loading || (needsRole && user && roles.length === 0)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const target = location.pathname + location.search + location.hash;
    const loginPath = isPortal ? '/portal/login' : '/auth';
    return (
      <Navigate
        to={`${loginPath}?from=${encodeURIComponent(target)}`}
        state={{ from: target }}
        replace
      />
    );
  }

  const isAdmin = roles.some((r) => ADMIN_ROLES.includes(r));
  const roleOk =
    (!requireRole || roles.includes(requireRole) || isAdmin) &&
    (!requireAnyRole || requireAnyRole.some((r) => roles.includes(r)) || isAdmin);

  if (!roleOk) {
    if (isPortal) {
      return <Navigate to="/portal/login" replace />;
    }
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <h2 className="font-serif text-2xl">صلاحيات غير كافية / Insufficient permissions</h2>
        <p className="text-muted-foreground">
          هذه الصفحة تتطلب دور: {requireRole ?? requireAnyRole?.join(' / ')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
