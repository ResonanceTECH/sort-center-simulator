import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { canAccessRoute, getRouteAccess, isReadOnlyRoute } from '@/constants/routePermissions';
import { getRolePermissions, roleHasPermission, type ScmPermission } from '@/constants/scmPermissions';
import type { AppRole } from '@/types/scm/roles';
import type { RouteAccess } from '@/constants/routePermissions';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;

  return useMemo(
    () => ({
      role,
      permissions: getRolePermissions(role),
      canAccessRoute: (path: string) => canAccessRoute(role, path),
      getRouteAccess: (path: string): RouteAccess | null => getRouteAccess(role, path),
      isReadOnly: (path: string) => isReadOnlyRoute(role, path),
      hasPermission: (permission: ScmPermission) => roleHasPermission(role, permission),
      hasRole: (...roles: AppRole[]) => role != null && roles.includes(role),
      isInternal: role != null && role !== 'SUPPLIER' && role !== 'CARRIER' && role !== 'ADMIN',
      isAdmin: role === 'ADMIN',
      isSupplier: role === 'SUPPLIER',
      isCarrier: role === 'CARRIER',
      canPerformAction: (availableActions: string[] | undefined, action: string) =>
        availableActions?.includes(action) ?? false,
    }),
    [role],
  );
}
