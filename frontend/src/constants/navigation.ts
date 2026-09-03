import type { AppRole } from '@/types/scm/roles';
import { NAV_LABELS, PLATFORM_BRAND } from '@/constants/platformRu';

export interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: string;
  badgeKey?: 'exceptions' | 'incidents';
  /** Atomic permission(s) — item hidden unless can(). */
  permission?: string | string[];
  /** If true, any of the permissions is enough. */
  requireAnyPermission?: boolean;
}

export interface NavGroupConfig {
  id: string;
  label: string;
  items: NavItemConfig[];
  collapsible?: boolean;
}

/** Page Map sidebars — one workspace tree per role (docs/scm-page-map.md). */

const SCM_MANAGER_NAV: NavGroupConfig[] = [
  {
    id: 'overview',
    label: 'Обзор',
    items: [
      { id: 'control-tower', label: NAV_LABELS.controlTower, path: '/control-tower', icon: 'DashboardOutlined', permission: 'analytics.read' },
    ],
  },
  {
    id: 'strategy',
    label: 'Стратегия',
    items: [
      { id: 'network', label: NAV_LABELS.supplyNetwork, path: '/network', icon: 'HubOutlined' , permission: 'network.read' },
      { id: 'suppliers', label: 'Поставщики', path: '/suppliers', icon: 'StoreOutlined' , permission: 'supplier.read' },
      { id: 'carriers', label: 'Перевозчики', path: '/carriers', icon: 'LocalShippingOutlined' , permission: 'carrier.read' },
      { id: 'facilities', label: 'Склады / хабы', path: '/facilities', icon: 'WarehouseOutlined' , permission: 'warehouse.read' },
      { id: 'lanes', label: 'Маршруты', path: '/lanes', icon: 'RouteOutlined' , permission: 'route.read' },
      { id: 'resilience', label: 'Устойчивость', path: '/strategy/resilience', icon: 'ShieldOutlined' , permission: 'network.read' },
    ],
  },
  {
    id: 'planning',
    label: 'Планирование',
    collapsible: true,
    items: [
      { id: 'demand', label: NAV_LABELS.demandForecast, path: '/planning/demand', icon: 'TrendingUpOutlined' , permission: 'forecast.read' },
      { id: 'supply', label: NAV_LABELS.supplyPlan, path: '/planning/supply', icon: 'InventoryOutlined' , permission: 'supply_plan.read' },
      { id: 'inventory', label: NAV_LABELS.inventoryPlan, path: '/planning/inventory', icon: 'WarehouseOutlined' , permission: 'inventory_plan.read' },
      { id: 'transport', label: NAV_LABELS.transportPlan, path: '/planning/transport', icon: 'RouteOutlined' , permission: 'transport_plan.read' },
      { id: 'plan-fact', label: NAV_LABELS.planFact, path: '/planning/plan-fact', icon: 'CompareArrowsOutlined' , permission: 'supply_plan.read' },
    ],
  },
  {
    id: 'execution',
    label: 'Исполнение',
    items: [
      { id: 'shipments', label: 'Поставки', path: '/shipments', icon: 'Inventory2Outlined' , permission: 'shipment.read' },
      { id: 'map', label: NAV_LABELS.liveMap, path: '/map', icon: 'MapOutlined' , permission: 'shipment.read' },
      { id: 'exceptions', label: 'Отклонения', path: '/exceptions', icon: 'WarningAmberOutlined', badgeKey: 'exceptions' , permission: 'exception.read' },
      { id: 'incidents', label: 'Инциденты', path: '/incidents', icon: 'ReportProblemOutlined', badgeKey: 'incidents' , permission: 'incident.read' },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    items: [{ id: 'analytics', label: 'Аналитика', path: '/analytics', icon: 'AnalyticsOutlined' , permission: 'analytics.read' }],
  },
  {
    id: 'scenarios',
    label: 'Сценарии',
    items: [
      { id: 'scenarios', label: 'Сценарии', path: '/scenarios', icon: 'ScienceOutlined' , permission: 'scenario.read' },
      { id: 'recommendations', label: 'Рекомендации', path: '/recommendations', icon: 'LightbulbOutlined' , permission: 'scenario.read' },
    ],
  },
  {
    id: 'reports',
    label: 'Отчёты',
    items: [{ id: 'reports', label: 'Отчёты', path: '/reports', icon: 'AssessmentOutlined' , permission: 'reports.read' }],
  },
];

const PLANNER_NAV: NavGroupConfig[] = [
  {
    id: 'overview',
    label: 'Обзор',
    items: [
      { id: 'planning-home', label: 'Planning Overview', path: '/planning', icon: 'DashboardOutlined' , permission: 'supply_plan.read' },
    ],
  },
  {
    id: 'planning',
    label: 'Планирование',
    collapsible: true,
    items: [
      { id: 'demand', label: NAV_LABELS.demandForecast, path: '/planning/demand', icon: 'TrendingUpOutlined' , permission: 'forecast.read' },
      { id: 'supply', label: NAV_LABELS.supplyPlan, path: '/planning/supply', icon: 'InventoryOutlined' , permission: 'supply_plan.read' },
      { id: 'inventory', label: NAV_LABELS.inventoryPlan, path: '/planning/inventory', icon: 'WarehouseOutlined' , permission: 'inventory_plan.read' },
      { id: 'transport', label: NAV_LABELS.transportPlan, path: '/planning/transport', icon: 'RouteOutlined' , permission: 'transport_plan.read' },
      { id: 'plan-fact', label: NAV_LABELS.planFact, path: '/planning/plan-fact', icon: 'CompareArrowsOutlined' , permission: 'supply_plan.read' },
    ],
  },
  {
    id: 'data',
    label: 'Данные',
    items: [
      { id: 'network', label: NAV_LABELS.supplyNetwork, path: '/network', icon: 'HubOutlined' , permission: 'network.read' },
      { id: 'suppliers', label: 'Поставщики', path: '/suppliers', icon: 'StoreOutlined' , permission: 'supplier.read' },
      { id: 'lanes', label: 'Маршруты', path: '/lanes', icon: 'RouteOutlined' , permission: 'route.read' },
    ],
  },
  {
    id: 'scenarios',
    label: 'Сценарии',
    items: [
      { id: 'scenarios', label: 'Сценарии', path: '/scenarios', icon: 'ScienceOutlined' , permission: 'scenario.read' },
      { id: 'compare', label: 'Сравнение', path: '/scenarios/compare', icon: 'CompareArrowsOutlined' , permission: 'scenario.compare' },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    items: [{ id: 'analytics', label: 'Аналитика', path: '/analytics', icon: 'AnalyticsOutlined' , permission: 'analytics.read' }],
  },
  {
    id: 'reports',
    label: 'Отчёты',
    items: [{ id: 'reports', label: 'Отчёты', path: '/reports', icon: 'AssessmentOutlined' , permission: 'reports.read' }],
  },
];

const LOGISTICS_NAV: NavGroupConfig[] = [
  {
    id: 'overview',
    label: 'Обзор',
    items: [
      {
        id: 'ops',
        label: 'Операционный центр',
        path: '/shipments?view=board',
        icon: 'DashboardOutlined',
        permission: 'shipment.read',
      },
    ],
  },
  {
    id: 'transport',
    label: 'Транспорт',
    items: [
      { id: 'shipments', label: 'Поставки', path: '/shipments?view=table', icon: 'Inventory2Outlined', permission: 'shipment.read' },
      { id: 'map', label: 'Карта', path: '/shipments?view=map', icon: 'MapOutlined', permission: 'shipment.read' },
      { id: 'schedule', label: 'Расписание', path: '/planning/transport', icon: 'RouteOutlined', permission: 'transport_plan.read' },
      { id: 'carriers', label: 'Перевозчики', path: '/carriers', icon: 'LocalShippingOutlined', permission: 'carrier.read' },
      { id: 'lanes', label: 'Маршруты', path: '/lanes', icon: 'RouteOutlined', permission: 'route.read' },
    ],
  },
  {
    id: 'control',
    label: 'Контроль',
    items: [
      { id: 'exceptions', label: 'Отклонения', path: '/exceptions', icon: 'WarningAmberOutlined', badgeKey: 'exceptions', permission: 'exception.read' },
      { id: 'incidents', label: 'Инциденты', path: '/incidents', icon: 'ReportProblemOutlined', badgeKey: 'incidents', permission: 'incident.read' },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    collapsible: true,
    items: [
      { id: 'analytics-transport', label: 'Транспортная аналитика', path: '/analytics/carriers', icon: 'LocalShippingOutlined', permission: 'analytics.read' },
      { id: 'analytics-routes', label: NAV_LABELS.analyticsRoutes, path: '/analytics/routes', icon: 'RouteOutlined', permission: 'analytics.read' },
    ],
  },
  {
    id: 'scenarios',
    label: 'Сценарии',
    items: [
      { id: 'scenarios', label: 'Операционные сценарии', path: '/scenarios', icon: 'ScienceOutlined', permission: 'scenario.read' },
    ],
  },
];

const ANALYST_NAV: NavGroupConfig[] = [
  {
    id: 'analytics',
    label: 'Аналитика',
    collapsible: true,
    items: [
      { id: 'analytics', label: NAV_LABELS.analyticsOverview, path: '/analytics', icon: 'AnalyticsOutlined', permission: 'analytics.read' },
      { id: 'analytics-service', label: NAV_LABELS.serviceLevel, path: '/analytics/service', icon: 'SpeedOutlined', permission: 'analytics.read' },
      { id: 'analytics-suppliers', label: NAV_LABELS.analyticsSuppliers, path: '/analytics/suppliers', icon: 'StoreOutlined', permission: 'analytics.read' },
      { id: 'analytics-carriers', label: NAV_LABELS.analyticsCarriers, path: '/analytics/carriers', icon: 'LocalShippingOutlined', permission: 'analytics.read' },
      { id: 'analytics-routes', label: NAV_LABELS.analyticsRoutes, path: '/analytics/routes', icon: 'RouteOutlined', permission: 'analytics.read' },
      { id: 'analytics-inventory', label: NAV_LABELS.analyticsInventory, path: '/analytics/inventory', icon: 'WarehouseOutlined', permission: 'analytics.read' },
      { id: 'analytics-risks', label: NAV_LABELS.analyticsRisks, path: '/analytics/risks', icon: 'ShieldOutlined', permission: 'analytics.read' },
    ],
  },
  {
    id: 'scenarios',
    label: 'Сценарии',
    items: [
      { id: 'scenarios', label: 'Все сценарии', path: '/scenarios', icon: 'ScienceOutlined' , permission: 'scenario.read' },
      { id: 'new-scenario', label: 'Новый сценарий', path: '/scenarios/new', icon: 'ScienceOutlined' , permission: 'scenario.create' },
      { id: 'compare', label: 'Сравнение', path: '/scenarios/compare', icon: 'CompareArrowsOutlined' , permission: 'scenario.compare' },
    ],
  },
  {
    id: 'data',
    label: 'Данные',
    items: [
      { id: 'network', label: NAV_LABELS.supplyNetwork, path: '/network', icon: 'HubOutlined' , permission: 'network.read' },
      { id: 'suppliers', label: 'Поставщики', path: '/suppliers', icon: 'StoreOutlined' , permission: 'supplier.read' },
      { id: 'carriers', label: 'Перевозчики', path: '/carriers', icon: 'LocalShippingOutlined' , permission: 'carrier.read' },
      { id: 'shipments', label: 'Поставки', path: '/shipments', icon: 'Inventory2Outlined' , permission: 'shipment.read' },
      { id: 'plan-fact', label: NAV_LABELS.planFact, path: '/planning/plan-fact', icon: 'CompareArrowsOutlined' , permission: 'supply_plan.read' },
    ],
  },
  {
    id: 'reports',
    label: 'Отчёты',
    items: [{ id: 'reports', label: 'Отчёты', path: '/reports', icon: 'AssessmentOutlined' , permission: 'reports.read' }],
  },
];

const ADMIN_NAV: NavGroupConfig[] = [
  {
    id: 'admin',
    label: 'Администрирование',
    items: [
      { id: 'admin-home', label: 'Обзор', path: '/admin', icon: 'DashboardOutlined' , permission: 'users.read' },
      { id: 'users', label: 'Пользователи', path: '/admin/users', icon: 'PeopleOutlined' , permission: 'users.read' },
      { id: 'roles', label: 'Роли и права', path: '/admin/roles', icon: 'AdminPanelSettingsOutlined' , permission: 'roles.read' },
      { id: 'organizations', label: 'Организации', path: '/admin/organizations', icon: 'BusinessOutlined' , permission: 'organization.read' },
      { id: 'integrations', label: 'Интеграции', path: '/admin/integrations', icon: 'ExtensionOutlined' , permission: 'integrations.read' },
      { id: 'dictionaries', label: 'Справочники', path: '/admin/dictionaries', icon: 'MenuBookOutlined' , permission: 'directories.read' },
      { id: 'audit', label: 'Audit Log', path: '/admin/audit', icon: 'HistoryOutlined' , permission: 'audit.read' },
      { id: 'system', label: 'System Health', path: '/admin/system', icon: 'SettingsOutlined' , permission: 'audit.read' },
      { id: 'settings', label: 'Настройки', path: '/settings', icon: 'SettingsOutlined' , permission: 'organization.read' },
    ],
  },
];

const SUPPLIER_NAV: NavGroupConfig[] = [
  {
    id: 'home',
    label: 'Главная',
    items: [{ id: 'supplier-dashboard', label: 'Обзор', path: '/supplier/dashboard', icon: 'DashboardOutlined' , permission: 'shipment.read' }],
  },
  {
    id: 'orders',
    label: 'Заказы',
    items: [{ id: 'supplier-orders', label: 'Заказы', path: '/supplier/orders', icon: 'ReceiptLongOutlined' , permission: 'order.read' }],
  },
  {
    id: 'planning',
    label: 'Планирование',
    items: [{ id: 'supplier-forecast', label: 'Прогноз потребности', path: '/supplier/forecast', icon: 'TrendingUpOutlined' , permission: 'forecast.read' }],
  },
  {
    id: 'shipments',
    label: 'Поставки',
    items: [{ id: 'supplier-shipments', label: 'Поставки', path: '/supplier/shipments', icon: 'Inventory2Outlined' , permission: 'shipment.read' }],
  },
  {
    id: 'interaction',
    label: 'Взаимодействие',
    items: [
      { id: 'supplier-incidents', label: 'Инциденты', path: '/supplier/incidents', icon: 'ReportProblemOutlined' , permission: 'incident.read' },
      { id: 'supplier-documents', label: 'Документы', path: '/supplier/documents', icon: 'DescriptionOutlined' , permission: 'documents.read' },
      { id: 'supplier-notifications', label: 'Уведомления', path: '/supplier/notifications', icon: 'ReportProblemOutlined' , permission: 'incident.read' },
    ],
  },
  {
    id: 'analytics',
    label: 'Показатели',
    items: [{ id: 'supplier-performance', label: 'Мои показатели', path: '/supplier/performance', icon: 'AnalyticsOutlined' , permission: 'performance.read' }],
  },
  {
    id: 'settings',
    label: 'Настройки',
    items: [{ id: 'supplier-settings', label: 'Настройки', path: '/supplier/settings', icon: 'SettingsOutlined' , permission: 'organization.read' }],
  },
];

const CARRIER_NAV: NavGroupConfig[] = [
  {
    id: 'home',
    label: 'Главная',
    items: [{ id: 'carrier-dashboard', label: 'Обзор', path: '/carrier/dashboard', icon: 'DashboardOutlined' , permission: 'shipment.read' }],
  },
  {
    id: 'trips',
    label: 'Перевозки',
    items: [
      { id: 'carrier-shipments', label: 'Перевозки', path: '/carrier/shipments', icon: 'Inventory2Outlined' , permission: 'shipment.read' },
      { id: 'carrier-trips', label: 'Текущие рейсы', path: '/carrier/trips', icon: 'RouteOutlined' , permission: 'shipment.read' },
      { id: 'carrier-map', label: 'Карта', path: '/carrier/map', icon: 'MapOutlined' , permission: 'tracking.read' },
    ],
  },
  {
    id: 'fleet',
    label: 'Флот',
    items: [
      { id: 'carrier-vehicles', label: 'Машины', path: '/carrier/vehicles', icon: 'LocalShippingOutlined' , permission: 'vehicle.read' },
      { id: 'carrier-drivers', label: 'Водители', path: '/carrier/drivers', icon: 'PeopleOutlined' , permission: 'driver.read' },
    ],
  },
  {
    id: 'interaction',
    label: 'Взаимодействие',
    items: [
      { id: 'carrier-incidents', label: 'Инциденты', path: '/carrier/incidents', icon: 'ReportProblemOutlined' , permission: 'incident.read' },
      { id: 'carrier-documents', label: 'Документы', path: '/carrier/documents', icon: 'DescriptionOutlined' , permission: 'documents.read' },
      { id: 'carrier-notifications', label: 'Уведомления', path: '/carrier/notifications', icon: 'ReportProblemOutlined' , permission: 'incident.read' },
    ],
  },
  {
    id: 'analytics',
    label: 'Показатели',
    items: [{ id: 'carrier-performance', label: 'Мои показатели', path: '/carrier/performance', icon: 'AnalyticsOutlined' , permission: 'performance.read' }],
  },
  {
    id: 'settings',
    label: 'Настройки',
    items: [{ id: 'carrier-settings', label: 'Настройки', path: '/carrier/settings', icon: 'SettingsOutlined' , permission: 'organization.read' }],
  },
];

export const NAV_BY_ROLE: Record<AppRole, NavGroupConfig[]> = {
  ADMIN: ADMIN_NAV,
  SUPPLY_CHAIN_MANAGER: SCM_MANAGER_NAV,
  SUPPLY_PLANNER: PLANNER_NAV,
  LOGISTICS_MANAGER: LOGISTICS_NAV,
  ANALYST: ANALYST_NAV,
  SUPPLIER: SUPPLIER_NAV,
  CARRIER: CARRIER_NAV,
};

export const INTERNAL_NAV_GROUPS: NavGroupConfig[] = SCM_MANAGER_NAV;
export const SUPPLIER_NAV_ITEMS: NavItemConfig[] = SUPPLIER_NAV.flatMap((g) => g.items);
export const CARRIER_NAV_ITEMS: NavItemConfig[] = CARRIER_NAV.flatMap((g) => g.items);

export function getNavGroupsForRole(role: AppRole | undefined): NavGroupConfig[] {
  if (!role) return [];
  return NAV_BY_ROLE[role] ?? [];
}

export const APP_BRAND = PLATFORM_BRAND;
