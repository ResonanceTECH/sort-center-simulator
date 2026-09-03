import type { User, WorkspaceType } from '@/types/auth';
import type { AppRole, AppShell } from '@/types/scm/roles';

/** Map backend WorkspaceType → UI shell. */
export function shellFromWorkspace(workspace: WorkspaceType): AppShell {
  switch (workspace) {
    case 'ADMIN':
      return 'admin';
    case 'SUPPLIER':
      return 'supplier';
    case 'CARRIER':
      return 'carrier';
    default:
      return 'internal';
  }
}

export function workspaceFromRole(role: AppRole): WorkspaceType {
  if (role === 'ADMIN') return 'ADMIN';
  if (role === 'SUPPLIER') return 'SUPPLIER';
  if (role === 'CARRIER') return 'CARRIER';
  return 'INTERNAL';
}

/**
 * JTBD landing after login (TZ §10).
 * Prefer availableWorkspaces[0] + primary role for internal variants.
 */
export function resolveLandingPath(
  user: Pick<User, 'role' | 'roles' | 'availableWorkspaces'> | AppRole | null | undefined,
): string {
  if (!user) return '/login';

  if (typeof user === 'string') {
    return landingForRole(user);
  }

  const role = user.role ?? user.roles?.[0];
  if (!role) return '/login';

  const workspaces = user.availableWorkspaces ?? [];
  if (workspaces.length > 0) {
    const primary = workspaces[0];
    if (primary === 'ADMIN') return '/admin';
    if (primary === 'SUPPLIER') return '/supplier/dashboard';
    if (primary === 'CARRIER') return '/carrier/dashboard';
    // INTERNAL — role-specific JTBD landing
    return landingForRole(role);
  }

  return landingForRole(role);
}

export function landingForRole(role: AppRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'SUPPLY_CHAIN_MANAGER':
      return '/control-tower';
    case 'SUPPLY_PLANNER':
      return '/planning';
    case 'LOGISTICS_MANAGER':
      return '/shipments?view=board';
    case 'ANALYST':
      return '/analytics';
    case 'SUPPLIER':
      return '/supplier/dashboard';
    case 'CARRIER':
      return '/carrier/dashboard';
    default:
      return '/control-tower';
  }
}

export function resolveShell(
  user: Pick<User, 'role' | 'availableWorkspaces'> | AppRole | null | undefined,
): AppShell {
  if (!user) return 'internal';
  if (typeof user === 'string') {
    return shellFromWorkspace(workspaceFromRole(user));
  }
  const ws = user.availableWorkspaces?.[0];
  if (ws) return shellFromWorkspace(ws);
  return shellFromWorkspace(workspaceFromRole(user.role));
}

/** True if user's available workspaces include the shell. */
export function workspaceAllowsShell(
  user: Pick<User, 'availableWorkspaces' | 'role'> | null | undefined,
  shell: AppShell,
): boolean {
  if (!user) return false;
  const workspaces = user.availableWorkspaces;
  if (workspaces && workspaces.length > 0) {
    const needed = shell === 'admin' ? 'ADMIN' : shell === 'supplier' ? 'SUPPLIER' : shell === 'carrier' ? 'CARRIER' : 'INTERNAL';
    return workspaces.includes(needed);
  }
  return resolveShell(user) === shell;
}
