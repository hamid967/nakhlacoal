import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type AppRole } from '@/contexts/AuthContext';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  requireRole?: AppRole;
}

export function ProtectedRoute({ children, requireRole }: Props) {
  const { user, roles, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const target = location.pathname + location.search + location.hash;
    const isPortal = location.pathname.startsWith('/portal');
    const loginPath = isPortal ? '/portal/login' : '/auth';
    return (
      <Navigate
        to={`${loginPath}?from=${encodeURIComponent(target)}`}
        state={{ from: target }}
        replace
      />
    );
  }


  if (requireRole && !roles.includes(requireRole) && !roles.includes('admin') && !roles.includes('super_admin')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-center px-4">
        <h2 className="font-serif text-2xl">صلاحيات غير كافية / Insufficient permissions</h2>
        <p className="text-muted-foreground">هذه الصفحة تتطلب دور: {requireRole}</p>
      </div>
    );
  }

  return <>{children}</>;
}
