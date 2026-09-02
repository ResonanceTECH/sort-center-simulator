import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { canAccessRoute, getRouteAccess } from '@/constants/routePermissions';
import type { AppRole } from '@/types/scm/roles';
import type { RouteAccess } from '@/constants/routePermissions';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;

  return useMemo(
    () => ({
      role,
      canAccessRoute: (path: string) => canAccessRoute(role, path),
      getRouteAccess: (path: string): RouteAccess | null => getRouteAccess(role, path),
      hasRole: (...roles: AppRole[]) => role != null && roles.includes(role),
      isInternal: role != null && role !== 'SUPPLIER' && role !== 'CARRIER',
      isSupplier: role === 'SUPPLIER',
      isCarrier: role === 'CARRIER',
      isAdmin: role === 'ADMIN',
      canPerformAction: (availableActions: string[] | undefined, action: string) =>
        availableActions?.includes(action) ?? false,
    }),
    [role],
  );
}
