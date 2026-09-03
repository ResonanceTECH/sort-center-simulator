import { useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { canAccessRoute, getRouteAccess, isReadOnlyRoute } from '@/constants/routePermissions';
import { getRolePermissions, roleHasPermission, type ScmPermission } from '@/constants/scmPermissions';
import { can as canPerm, canAny as canAnyPerm } from '@/utils/can';
import { resolveShell, workspaceAllowsShell } from '@/workspace/workspaceResolver';
import type { AppRole, AppShell } from '@/types/scm/roles';
import type { RouteAccess } from '@/constants/routePermissions';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role;
  const backendPermissions = user?.permissions;

  return useMemo(() => {
    const permissions =
      backendPermissions && backendPermissions.length > 0
        ? backendPermissions
        : [...getRolePermissions(role)];

    const can = (permission: ScmPermission | string | readonly string[]) =>
      canPerm(permissions, permission);

    const canAnyPermission = (permission: ScmPermission | string | readonly string[]) =>
      canAnyPerm(permissions, permission);

    const hasPermission = (permission: ScmPermission | string) => {
      if (backendPermissions && backendPermissions.length > 0) {
        return can(permission);
      }
      if (typeof permission === 'string') {
        return roleHasPermission(role, permission as ScmPermission) || can(permission);
      }
      return can(permission);
    };

    const shell: AppShell = resolveShell(user);

    return {
      role,
      roles: user?.roles ?? (role ? [role] : []),
      permissions,
      availableWorkspaces: user?.availableWorkspaces ?? [],
      shell,
      canAccessRoute: (path: string) => canAccessRoute(role, path),
      getRouteAccess: (path: string): RouteAccess | null => getRouteAccess(role, path),
      isReadOnly: (path: string) => isReadOnlyRoute(role, path),
      hasPermission,
      can,
      canAnyPermission,
      hasRole: (...roles: AppRole[]) =>
        (user?.roles ?? (role ? [role] : [])).some((r) => roles.includes(r)),
      workspaceAllows: (s: AppShell) => workspaceAllowsShell(user, s),
      isInternal: shell === 'internal',
      isAdmin: shell === 'admin',
      isSupplier: shell === 'supplier',
      isCarrier: shell === 'carrier',
      canPerformAction: (availableActions: string[] | undefined, action: string) =>
        availableActions?.includes(action) ?? false,
    };
  }, [role, backendPermissions, user]);
}
