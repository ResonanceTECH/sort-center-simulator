/** SCM platform permissions — aligned with backend app.security.permissions. */

import type { AppRole } from '@/types/scm/roles';

/** Granular permissions — resource.action (same codes as backend). */
export type ScmPermission =
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'users.manage_roles'
  | 'roles.read'
  | 'roles.create'
  | 'roles.update'
  | 'roles.delete'
  | 'permissions.read'
  | 'organization.read'
  | 'organization.update'
  | 'audit.read'
  | 'network.read'
  | 'network.create'
  | 'network.update'
  | 'network.delete'
  | 'supplier.read'
  | 'supplier.create'
  | 'supplier.update'
  | 'carrier.read'
  | 'carrier.create'
  | 'carrier.update'
  | 'warehouse.read'
  | 'route.read'
  | 'route.create'
  | 'route.update'
  | 'forecast.read'
  | 'forecast.create'
  | 'forecast.update'
  | 'forecast.calculate'
  | 'supply_plan.read'
  | 'supply_plan.create'
  | 'supply_plan.update'
  | 'supply_plan.calculate'
  | 'supply_plan.submit'
  | 'supply_plan.approve'
  | 'supply_plan.activate'
  | 'inventory_plan.read'
  | 'inventory_plan.create'
  | 'inventory_plan.update'
  | 'inventory_plan.calculate'
  | 'transport_plan.read'
  | 'transport_plan.create'
  | 'transport_plan.update'
  | 'transport_plan.calculate'
  | 'transport_plan.submit'
  | 'transport_plan.approve'
  | 'shipment.read'
  | 'shipment.create'
  | 'shipment.update'
  | 'shipment.assign_carrier'
  | 'shipment.change_route'
  | 'shipment.reschedule'
  | 'shipment.cancel'
  | 'shipment.accept'
  | 'shipment.reject'
  | 'shipment.confirm_ready'
  | 'shipment.confirm_pickup'
  | 'shipment.update_tracking'
  | 'shipment.update_eta'
  | 'shipment.report_delay'
  | 'shipment.confirm_arrival'
  | 'shipment.confirm_delivery'
  | 'exception.read'
  | 'exception.create'
  | 'exception.update'
  | 'exception.resolve'
  | 'incident.read'
  | 'incident.create'
  | 'incident.update'
  | 'incident.resolve'
  | 'incident.close'
  | 'scenario.read'
  | 'scenario.create'
  | 'scenario.update'
  | 'scenario.delete'
  | 'scenario.run'
  | 'scenario.compare'
  | 'scenario.apply'
  | 'analytics.read'
  | 'analytics.export'
  | 'reports.read'
  | 'reports.create'
  | 'reports.update'
  | 'reports.delete'
  | 'documents.read'
  | 'documents.create'
  | 'documents.update'
  | 'order.read'
  | 'vehicle.read'
  | 'vehicle.create'
  | 'driver.read'
  | 'driver.create'
  | 'performance.read'
  // FE workspace markers (derived from role until /auth/me workspaces land)
  | 'admin.console'
  | 'supplier.portal'
  | 'carrier.portal';

const ADMIN: ScmPermission[] = [
  'admin.console',
  'users.read',
  'users.create',
  'users.update',
  'users.delete',
  'users.manage_roles',
  'roles.read',
  'roles.create',
  'roles.update',
  'roles.delete',
  'permissions.read',
  'organization.read',
  'organization.update',
  'audit.read',
  'network.read',
  'supplier.read',
  'carrier.read',
  'warehouse.read',
  'route.read',
  'forecast.read',
  'supply_plan.read',
  'inventory_plan.read',
  'transport_plan.read',
  'shipment.read',
  'exception.read',
  'incident.read',
  'scenario.read',
  'analytics.read',
  'reports.read',
  'documents.read',
];

const MANAGER: ScmPermission[] = [
  'network.read',
  'network.create',
  'network.update',
  'network.delete',
  'supplier.read',
  'supplier.create',
  'supplier.update',
  'carrier.read',
  'carrier.create',
  'carrier.update',
  'warehouse.read',
  'route.read',
  'route.create',
  'route.update',
  'forecast.read',
  'forecast.create',
  'forecast.update',
  'forecast.calculate',
  'supply_plan.read',
  'supply_plan.create',
  'supply_plan.update',
  'supply_plan.calculate',
  'supply_plan.submit',
  'supply_plan.approve',
  'supply_plan.activate',
  'inventory_plan.read',
  'inventory_plan.create',
  'inventory_plan.update',
  'inventory_plan.calculate',
  'transport_plan.read',
  'transport_plan.create',
  'transport_plan.update',
  'transport_plan.calculate',
  'transport_plan.submit',
  'transport_plan.approve',
  'shipment.read',
  'shipment.create',
  'shipment.update',
  'shipment.assign_carrier',
  'shipment.change_route',
  'shipment.reschedule',
  'shipment.cancel',
  'shipment.confirm_ready',
  'shipment.confirm_pickup',
  'shipment.update_tracking',
  'shipment.update_eta',
  'shipment.report_delay',
  'shipment.confirm_arrival',
  'shipment.confirm_delivery',
  'exception.read',
  'exception.create',
  'exception.update',
  'exception.resolve',
  'incident.read',
  'incident.create',
  'incident.update',
  'incident.resolve',
  'incident.close',
  'scenario.read',
  'scenario.create',
  'scenario.update',
  'scenario.delete',
  'scenario.run',
  'scenario.compare',
  'scenario.apply',
  'analytics.read',
  'analytics.export',
  'reports.read',
  'reports.create',
  'reports.update',
  'reports.delete',
  'documents.read',
  'documents.create',
  'documents.update',
];

const PLANNER: ScmPermission[] = [
  'network.read',
  'network.update',
  'supplier.read',
  'supplier.update',
  'route.read',
  'route.create',
  'route.update',
  'warehouse.read',
  'forecast.read',
  'forecast.create',
  'forecast.update',
  'forecast.calculate',
  'supply_plan.read',
  'supply_plan.create',
  'supply_plan.update',
  'supply_plan.calculate',
  'supply_plan.submit',
  'inventory_plan.read',
  'inventory_plan.create',
  'inventory_plan.update',
  'inventory_plan.calculate',
  'transport_plan.read',
  'transport_plan.create',
  'transport_plan.update',
  'transport_plan.calculate',
  'shipment.read',
  'exception.read',
  'incident.read',
  'scenario.read',
  'scenario.create',
  'scenario.update',
  'scenario.delete',
  'scenario.run',
  'scenario.compare',
  'analytics.read',
  'reports.read',
  'reports.create',
  'reports.update',
];

const LOGISTICS: ScmPermission[] = [
  'transport_plan.read',
  'transport_plan.create',
  'transport_plan.update',
  'transport_plan.calculate',
  'transport_plan.submit',
  'transport_plan.approve',
  'carrier.read',
  'carrier.create',
  'carrier.update',
  'route.read',
  'route.create',
  'route.update',
  'shipment.read',
  'shipment.create',
  'shipment.update',
  'shipment.assign_carrier',
  'shipment.change_route',
  'shipment.reschedule',
  'shipment.cancel',
  'shipment.confirm_arrival',
  'shipment.confirm_delivery',
  'shipment.update_tracking',
  'shipment.update_eta',
  'shipment.report_delay',
  'exception.read',
  'exception.create',
  'exception.update',
  'exception.resolve',
  'incident.read',
  'incident.create',
  'incident.update',
  'incident.resolve',
  'incident.close',
  'scenario.read',
  'scenario.create',
  'scenario.update',
  'scenario.run',
  'analytics.read',
  'reports.read',
  'reports.create',
  'reports.update',
  'documents.read',
  'documents.create',
  'documents.update',
  'network.read',
  'supplier.read',
  'warehouse.read',
];

const ANALYST: ScmPermission[] = [
  'network.read',
  'supplier.read',
  'carrier.read',
  'warehouse.read',
  'route.read',
  'forecast.read',
  'forecast.create',
  'forecast.update',
  'forecast.calculate',
  'supply_plan.read',
  'inventory_plan.read',
  'transport_plan.read',
  'shipment.read',
  'exception.read',
  'incident.read',
  'scenario.read',
  'scenario.create',
  'scenario.update',
  'scenario.delete',
  'scenario.run',
  'scenario.compare',
  'analytics.read',
  'analytics.export',
  'reports.read',
  'reports.create',
  'reports.update',
  'reports.delete',
  'documents.read',
];

export const PERMISSIONS_BY_ROLE: Record<AppRole, readonly ScmPermission[]> = {
  ADMIN,
  SUPPLY_CHAIN_MANAGER: MANAGER,
  SUPPLY_PLANNER: PLANNER,
  LOGISTICS_MANAGER: LOGISTICS,
  ANALYST,
  SUPPLIER: [
    'supplier.portal',
    'organization.read',
    'organization.update',
    'order.read',
    'forecast.read',
    'supply_plan.read',
    'shipment.read',
    'shipment.confirm_ready',
    'documents.read',
    'documents.create',
    'documents.update',
    'incident.read',
    'incident.create',
    'incident.update',
    'analytics.read',
    'performance.read',
    'exception.read',
  ],
  CARRIER: [
    'carrier.portal',
    'organization.read',
    'organization.update',
    'shipment.read',
    'shipment.accept',
    'shipment.reject',
    'shipment.confirm_pickup',
    'shipment.update_tracking',
    'shipment.update_eta',
    'shipment.report_delay',
    'shipment.confirm_arrival',
    'shipment.confirm_delivery',
    'vehicle.read',
    'vehicle.create',
    'driver.read',
    'driver.create',
    'documents.read',
    'documents.create',
    'documents.update',
    'incident.read',
    'incident.create',
    'incident.update',
    'analytics.read',
    'performance.read',
    'exception.read',
  ],
};

export function roleHasPermission(role: AppRole | undefined, permission: ScmPermission): boolean {
  if (!role) return false;
  return PERMISSIONS_BY_ROLE[role].includes(permission);
}

export function getRolePermissions(role: AppRole | undefined): readonly ScmPermission[] {
  if (!role) return [];
  return PERMISSIONS_BY_ROLE[role];
}
