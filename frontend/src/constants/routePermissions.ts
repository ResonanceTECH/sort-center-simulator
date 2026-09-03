import type { AppRole } from '@/types/scm/roles';

export type RouteAccess = 'visible' | 'read' | 'hidden';

type RoleAccess = Partial<Record<AppRole, RouteAccess>>;

const R_ALL_INTERNAL: RoleAccess = {
  ADMIN: 'read',
  SUPPLY_CHAIN_MANAGER: 'visible',
  SUPPLY_PLANNER: 'read',
  LOGISTICS_MANAGER: 'read',
  ANALYST: 'read',
};

/** Route → role matrix (TZ). Missing role = denied. */
export const ROUTE_PERMISSIONS: Record<string, RoleAccess> = {
  '/admin': { ADMIN: 'visible' },
  '/admin/users': { ADMIN: 'visible' },
  '/admin/roles': { ADMIN: 'visible' },
  '/admin/organizations': { ADMIN: 'visible' },
  '/admin/integrations': { ADMIN: 'visible' },
  '/admin/dictionaries': { ADMIN: 'visible' },
  '/admin/audit': { ADMIN: 'visible' },
  '/admin/system': { ADMIN: 'visible' },
  '/settings': { ADMIN: 'visible', SUPPLY_CHAIN_MANAGER: 'visible' },
  '/integrations': { ADMIN: 'visible' },

  '/home': {
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'visible',
  },
  '/control-tower': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/control-tower/alerts': {
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/control-tower/insights': {
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/network': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/facilities': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/lanes': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/suppliers': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/carriers': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/strategy/resilience': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/planning': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/planning/demand': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/planning/supply': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/planning/inventory': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/planning/transport': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/planning/plan-fact': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'visible',
  },
  '/shipments': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/map': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/exceptions': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/incidents': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'read',
  },
  '/analytics': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'visible',
  },
  '/scenarios': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'visible',
  },
  '/scenarios/compare': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'visible',
  },
  '/recommendations': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'read',
    LOGISTICS_MANAGER: 'read',
    ANALYST: 'read',
  },
  '/reports': {
    ADMIN: 'read',
    SUPPLY_CHAIN_MANAGER: 'visible',
    SUPPLY_PLANNER: 'visible',
    LOGISTICS_MANAGER: 'visible',
    ANALYST: 'visible',
  },
  '/projects': R_ALL_INTERNAL,

  '/supplier': { SUPPLIER: 'visible' },
  '/supplier/dashboard': { SUPPLIER: 'visible' },
  '/supplier/orders': { SUPPLIER: 'visible' },
  '/supplier/forecast': { SUPPLIER: 'visible' },
  '/supplier/shipments': { SUPPLIER: 'visible' },
  '/supplier/documents': { SUPPLIER: 'visible' },
  '/supplier/incidents': { SUPPLIER: 'visible' },
  '/supplier/notifications': { SUPPLIER: 'visible' },
  '/supplier/performance': { SUPPLIER: 'visible' },
  '/supplier/settings': { SUPPLIER: 'visible' },

  '/carrier': { CARRIER: 'visible' },
  '/carrier/dashboard': { CARRIER: 'visible' },
  '/carrier/shipments': { CARRIER: 'visible' },
  '/carrier/trips': { CARRIER: 'visible' },
  '/carrier/completed': { CARRIER: 'visible' },
  '/carrier/map': { CARRIER: 'visible' },
  '/carrier/vehicles': { CARRIER: 'visible' },
  '/carrier/drivers': { CARRIER: 'visible' },
  '/carrier/documents': { CARRIER: 'visible' },
  '/carrier/incidents': { CARRIER: 'visible' },
  '/carrier/notifications': { CARRIER: 'visible' },
  '/carrier/performance': { CARRIER: 'visible' },
  '/carrier/settings': { CARRIER: 'visible' },
};

export function canAccessRoute(role: AppRole | undefined, path: string): boolean {
  if (!role) return false;

  const normalized = (path.split('?')[0] ?? path);
  const exact = ROUTE_PERMISSIONS[normalized];
  if (exact?.[role]) return exact[role] !== 'hidden';

  const prefix = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => route !== '/' && (normalized === route || normalized.startsWith(`${route}/`)));

  if (prefix) {
    const access = ROUTE_PERMISSIONS[prefix]?.[role];
    return access != null && access !== 'hidden';
  }

  return false;
}

export function getRouteAccess(role: AppRole | undefined, path: string): RouteAccess | null {
  if (!role) return null;
  const normalized = path.split('?')[0] ?? path;
  const exact = ROUTE_PERMISSIONS[normalized]?.[role];
  if (exact) return exact;

  const prefix = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => normalized === route || normalized.startsWith(`${route}/`));
  return prefix ? (ROUTE_PERMISSIONS[prefix]?.[role] ?? null) : null;
}

export function isReadOnlyRoute(role: AppRole | undefined, path: string): boolean {
  return getRouteAccess(role, path) === 'read';
}
