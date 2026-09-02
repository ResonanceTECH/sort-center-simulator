import type { AppRole } from '@/types/scm/roles';

export type RouteAccess = 'visible' | 'read' | 'hidden';

/** Routes each role can access. `hidden` = not in sidebar and blocked. */
export const ROUTE_PERMISSIONS: Record<string, Partial<Record<AppRole, RouteAccess>>> = {
  '/control-tower': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'visible',
  },
  '/network': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/suppliers': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/carriers': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/planning/demand': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/planning/supply': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/planning/inventory': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/planning/transport': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/planning/plan-fact': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/shipments': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/map': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/exceptions': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/incidents': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/analytics': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'visible',
  },
  '/scenarios': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'visible',
  },
  '/recommendations': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'visible',
  },
  '/admin/users': { ADMIN: 'visible' },
  '/admin/roles': { ADMIN: 'visible' },
  '/settings': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
  },
  '/integrations': { ADMIN: 'visible' },
  '/projects': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/reports': {
    ADMIN: 'visible',
    SUPPLY_CHAIN_MANAGER: 'visible',
    ANALYST: 'read',
  },
};

export function canAccessRoute(role: AppRole | undefined, path: string): boolean {
  if (!role) return false;

  const normalized = path.split('?')[0] ?? path;
  const exact = ROUTE_PERMISSIONS[normalized];
  if (exact?.[role]) return exact[role] !== 'hidden';

  const prefix = Object.keys(ROUTE_PERMISSIONS).find(
    (route) => normalized.startsWith(route) && route !== '/',
  );
  if (prefix) {
    const access = ROUTE_PERMISSIONS[prefix]?.[role];
    return access != null && access !== 'hidden';
  }

  return role === 'ADMIN';
}

export function getRouteAccess(role: AppRole | undefined, path: string): RouteAccess | null {
  if (!role) return null;
  const normalized = path.split('?')[0] ?? path;
  const exact = ROUTE_PERMISSIONS[normalized]?.[role];
  if (exact) return exact;

  const prefix = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => normalized.startsWith(route));
  return prefix ? (ROUTE_PERMISSIONS[prefix]?.[role] ?? null) : null;
}
