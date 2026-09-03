import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RouteLoader } from '@/components/shared/RouteLoader';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { getRequiredPermissionsForPath } from '@/constants/routeRequiredPermissions';
import { resolveLandingPath } from '@/workspace/workspaceResolver';
import type { AppShell } from '@/types/scm/roles';

interface RoleBasedRouteProps {
  allowedShells?: AppShell[];
  requiredPath?: string;
  /** Explicit permission(s); otherwise looked up from ROUTE_REQUIRED_PERMISSIONS. */
  requiredPermissions?: string | string[];
}

export function RoleBasedRoute({
  allowedShells,
  requiredPath,
  requiredPermissions,
}: RoleBasedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { role, canAccessRoute, can, shell, workspaceAllows } = usePermissions();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated || !role || !user) {
    return <Navigate to="/login" replace />;
  }

  const landing = resolveLandingPath(user);

  if (allowedShells && !allowedShells.some((s) => workspaceAllows(s) || shell === s)) {
    return <Navigate to={landing} replace />;
  }

  const pathToCheck = requiredPath ?? location.pathname;
  if (!canAccessRoute(pathToCheck)) {
    return <Navigate to="/403" replace />;
  }

  const required =
    requiredPermissions ?? getRequiredPermissionsForPath(pathToCheck);
  if (required && !can(required)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
