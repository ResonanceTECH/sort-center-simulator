/** Route path → required SCM permission(s). Checked after shell ACL. */
export const ROUTE_REQUIRED_PERMISSIONS: Record<string, string | string[]> = {
  '/admin': 'users.read',
  '/admin/users': 'users.read',
  '/admin/roles': 'roles.read',
  '/admin/organizations': 'organization.read',
  '/admin/integrations': 'integrations.read',
  '/admin/audit': 'audit.read',
  '/admin/dictionaries': 'directories.read',
  '/admin/system': 'audit.read',

  '/control-tower': 'analytics.read',
  '/network': 'network.read',
  '/suppliers': 'supplier.read',
  '/carriers': 'carrier.read',
  '/facilities': 'warehouse.read',
  '/lanes': 'route.read',

  '/planning': 'supply_plan.read',
  '/planning/demand': 'forecast.read',
  '/planning/supply': 'supply_plan.read',
  '/planning/inventory': 'inventory_plan.read',
  '/planning/transport': 'transport_plan.read',
  '/planning/plan-fact': 'supply_plan.read',

  '/shipments': 'shipment.read',
  '/map': 'shipment.read',
  '/exceptions': 'exception.read',
  '/incidents': 'incident.read',

  '/analytics': 'analytics.read',
  '/scenarios': 'scenario.read',
  '/scenarios/new': 'scenario.create',
  '/scenarios/compare': 'scenario.compare',
  '/recommendations': 'scenario.read',
  '/reports': 'reports.read',

  '/supplier/dashboard': 'shipment.read',
  '/supplier/orders': 'order.read',
  '/supplier/forecast': 'forecast.read',
  '/supplier/shipments': 'shipment.read',
  '/supplier/documents': 'documents.read',
  '/supplier/incidents': 'incident.read',
  '/supplier/performance': 'performance.read',

  '/carrier/dashboard': 'shipment.read',
  '/carrier/shipments': 'shipment.read',
  '/carrier/trips': 'shipment.read',
  '/carrier/map': 'tracking.read',
  '/carrier/vehicles': 'vehicle.read',
  '/carrier/drivers': 'driver.read',
  '/carrier/documents': 'documents.read',
  '/carrier/incidents': 'incident.read',
  '/carrier/performance': 'performance.read',
};

export function getRequiredPermissionsForPath(path: string): string | string[] | null {
  const normalized = path.split('?')[0] ?? path;
  if (ROUTE_REQUIRED_PERMISSIONS[normalized]) {
    return ROUTE_REQUIRED_PERMISSIONS[normalized];
  }
  const prefix = Object.keys(ROUTE_REQUIRED_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => normalized === route || normalized.startsWith(`${route}/`));
  return prefix ? ROUTE_REQUIRED_PERMISSIONS[prefix] : null;
}
