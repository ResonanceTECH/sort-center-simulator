import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RouteLoader } from '@/components/shared/RouteLoader';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { getAppShell, getDefaultRoute } from '@/types/scm/roles';
import type { AppShell } from '@/types/scm/roles';

interface RoleBasedRouteProps {
  allowedShells?: AppShell[];
  requiredPath?: string;
}

export function RoleBasedRoute({ allowedShells, requiredPath }: RoleBasedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { role, canAccessRoute } = usePermissions();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace />;
  }

  const shell = getAppShell(role);

  if (allowedShells && !allowedShells.includes(shell)) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  const pathToCheck = requiredPath ?? location.pathname;
  if (!canAccessRoute(pathToCheck)) {
    return <Navigate to={getDefaultRoute(role)} replace />;
  }

  return <Outlet />;
}
