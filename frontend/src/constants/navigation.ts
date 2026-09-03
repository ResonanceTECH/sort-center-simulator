import type { AppRole } from '@/types/scm/roles';
import { NAV_LABELS, PLATFORM_BRAND } from '@/constants/platformRu';

export interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: string;
  badgeKey?: 'exceptions' | 'incidents';
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
      { id: 'home', label: 'Рабочее пространство', path: '/home', icon: 'DashboardOutlined' },
      { id: 'control-tower', label: NAV_LABELS.controlTower, path: '/control-tower', icon: 'DashboardOutlined' },
    ],
  },
  {
    id: 'strategy',
    label: 'Стратегия',
    items: [
      { id: 'network', label: NAV_LABELS.supplyNetwork, path: '/network', icon: 'HubOutlined' },
      { id: 'suppliers', label: 'Поставщики', path: '/suppliers', icon: 'StoreOutlined' },
      { id: 'carriers', label: 'Перевозчики', path: '/carriers', icon: 'LocalShippingOutlined' },
      { id: 'facilities', label: 'Склады / хабы', path: '/facilities', icon: 'WarehouseOutlined' },
      { id: 'lanes', label: 'Маршруты', path: '/lanes', icon: 'RouteOutlined' },
      { id: 'resilience', label: 'Устойчивость', path: '/strategy/resilience', icon: 'ShieldOutlined' },
    ],
  },
  {
    id: 'planning',
    label: 'Планирование',
    collapsible: true,
    items: [
      { id: 'demand', label: NAV_LABELS.demandForecast, path: '/planning/demand', icon: 'TrendingUpOutlined' },
      { id: 'supply', label: NAV_LABELS.supplyPlan, path: '/planning/supply', icon: 'InventoryOutlined' },
      { id: 'inventory', label: NAV_LABELS.inventoryPlan, path: '/planning/inventory', icon: 'WarehouseOutlined' },
      { id: 'transport', label: NAV_LABELS.transportPlan, path: '/planning/transport', icon: 'RouteOutlined' },
      { id: 'plan-fact', label: NAV_LABELS.planFact, path: '/planning/plan-fact', icon: 'CompareArrowsOutlined' },
    ],
  },
  {
    id: 'execution',
    label: 'Исполнение',
    items: [
      { id: 'shipments', label: 'Поставки', path: '/shipments', icon: 'Inventory2Outlined' },
      { id: 'map', label: NAV_LABELS.liveMap, path: '/map', icon: 'MapOutlined' },
      { id: 'exceptions', label: 'Отклонения', path: '/exceptions', icon: 'WarningAmberOutlined', badgeKey: 'exceptions' },
      { id: 'incidents', label: 'Инциденты', path: '/incidents', icon: 'ReportProblemOutlined', badgeKey: 'incidents' },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    items: [{ id: 'analytics', label: 'Аналитика', path: '/analytics', icon: 'AnalyticsOutlined' }],
  },
  {
    id: 'scenarios',
    label: 'Сценарии',
    items: [
      { id: 'scenarios', label: 'Сценарии', path: '/scenarios', icon: 'ScienceOutlined' },
      { id: 'recommendations', label: 'Рекомендации', path: '/recommendations', icon: 'LightbulbOutlined' },
    ],
  },
  {
    id: 'reports',
    label: 'Отчёты',
    items: [{ id: 'reports', label: 'Отчёты', path: '/reports', icon: 'AssessmentOutlined' }],
  },
];

const PLANNER_NAV: NavGroupConfig[] = [
  {
    id: 'overview',
    label: 'Обзор',
    items: [
      { id: 'planning-home', label: 'Planning Overview', path: '/planning', icon: 'DashboardOutlined' },
    ],
  },
  {
    id: 'planning',
    label: 'Планирование',
    collapsible: true,
    items: [
      { id: 'demand', label: NAV_LABELS.demandForecast, path: '/planning/demand', icon: 'TrendingUpOutlined' },
      { id: 'supply', label: NAV_LABELS.supplyPlan, path: '/planning/supply', icon: 'InventoryOutlined' },
      { id: 'inventory', label: NAV_LABELS.inventoryPlan, path: '/planning/inventory', icon: 'WarehouseOutlined' },
      { id: 'transport', label: NAV_LABELS.transportPlan, path: '/planning/transport', icon: 'RouteOutlined' },
      { id: 'plan-fact', label: NAV_LABELS.planFact, path: '/planning/plan-fact', icon: 'CompareArrowsOutlined' },
    ],
  },
  {
    id: 'data',
    label: 'Данные',
    items: [
      { id: 'network', label: NAV_LABELS.supplyNetwork, path: '/network', icon: 'HubOutlined' },
      { id: 'suppliers', label: 'Поставщики', path: '/suppliers', icon: 'StoreOutlined' },
      { id: 'lanes', label: 'Маршруты', path: '/lanes', icon: 'RouteOutlined' },
    ],
  },
  {
    id: 'scenarios',
    label: 'Сценарии',
    items: [
      { id: 'scenarios', label: 'Сценарии', path: '/scenarios', icon: 'ScienceOutlined' },
      { id: 'compare', label: 'Сравнение', path: '/scenarios/compare', icon: 'CompareArrowsOutlined' },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    items: [{ id: 'analytics', label: 'Аналитика', path: '/analytics', icon: 'AnalyticsOutlined' }],
  },
  {
    id: 'reports',
    label: 'Отчёты',
    items: [{ id: 'reports', label: 'Отчёты', path: '/reports', icon: 'AssessmentOutlined' }],
  },
];

const LOGISTICS_NAV: NavGroupConfig[] = [
  {
    id: 'overview',
    label: 'Обзор',
    items: [
      { id: 'home', label: 'Logistics Hub', path: '/home', icon: 'DashboardOutlined' },
      { id: 'control-tower', label: 'Logistics Control Tower', path: '/control-tower', icon: 'DashboardOutlined' },
    ],
  },
  {
    id: 'transport',
    label: 'Транспорт',
    items: [
      { id: 'transport-plan', label: NAV_LABELS.transportPlan, path: '/planning/transport', icon: 'RouteOutlined' },
      { id: 'shipments', label: 'Поставки', path: '/shipments', icon: 'Inventory2Outlined' },
      { id: 'map', label: NAV_LABELS.liveMap, path: '/map', icon: 'MapOutlined' },
      { id: 'carriers', label: 'Перевозчики', path: '/carriers', icon: 'LocalShippingOutlined' },
      { id: 'lanes', label: 'Маршруты', path: '/lanes', icon: 'RouteOutlined' },
    ],
  },
  {
    id: 'control',
    label: 'Контроль',
    items: [
      { id: 'exceptions', label: 'Отклонения', path: '/exceptions', icon: 'WarningAmberOutlined', badgeKey: 'exceptions' },
      { id: 'incidents', label: 'Инциденты', path: '/incidents', icon: 'ReportProblemOutlined', badgeKey: 'incidents' },
    ],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    collapsible: true,
    items: [
      { id: 'analytics-carriers', label: NAV_LABELS.analyticsCarriers, path: '/analytics/carriers', icon: 'LocalShippingOutlined' },
      { id: 'analytics-routes', label: NAV_LABELS.analyticsRoutes, path: '/analytics/routes', icon: 'RouteOutlined' },
    ],
  },
  {
    id: 'scenarios',
    label: 'Сценарии',
    items: [
      { id: 'scenarios', label: 'Операционные сценарии', path: '/scenarios', icon: 'ScienceOutlined' },
    ],
  },
  {
    id: 'reports',
    label: 'Отчёты',
    items: [{ id: 'reports', label: 'Отчёты', path: '/reports', icon: 'AssessmentOutlined' }],
  },
];

const ANALYST_NAV: NavGroupConfig[] = [
  {
    id: 'overview',
    label: 'Обзор',
    items: [{ id: 'home', label: 'Analytics Workspace', path: '/home', icon: 'DashboardOutlined' }],
  },
  {
    id: 'analytics',
    label: 'Аналитика',
    collapsible: true,
    items: [
      { id: 'analytics', label: NAV_LABELS.analyticsOverview, path: '/analytics', icon: 'AnalyticsOutlined' },
      { id: 'analytics-service', label: NAV_LABELS.serviceLevel, path: '/analytics/service', icon: 'SpeedOutlined' },
      { id: 'analytics-suppliers', label: NAV_LABELS.analyticsSuppliers, path: '/analytics/suppliers', icon: 'StoreOutlined' },
      { id: 'analytics-carriers', label: NAV_LABELS.analyticsCarriers, path: '/analytics/carriers', icon: 'LocalShippingOutlined' },
      { id: 'analytics-routes', label: NAV_LABELS.analyticsRoutes, path: '/analytics/routes', icon: 'RouteOutlined' },
      { id: 'analytics-inventory', label: NAV_LABELS.analyticsInventory, path: '/analytics/inventory', icon: 'WarehouseOutlined' },
      { id: 'analytics-risks', label: NAV_LABELS.analyticsRisks, path: '/analytics/risks', icon: 'ShieldOutlined' },
    ],
  },
  {
    id: 'scenarios',
    label: 'Сценарии',
    items: [
      { id: 'scenarios', label: 'Все сценарии', path: '/scenarios', icon: 'ScienceOutlined' },
      { id: 'new-scenario', label: 'Новый сценарий', path: '/scenarios/new', icon: 'ScienceOutlined' },
      { id: 'compare', label: 'Сравнение', path: '/scenarios/compare', icon: 'CompareArrowsOutlined' },
    ],
  },
  {
    id: 'data',
    label: 'Данные',
    items: [
      { id: 'network', label: NAV_LABELS.supplyNetwork, path: '/network', icon: 'HubOutlined' },
      { id: 'suppliers', label: 'Поставщики', path: '/suppliers', icon: 'StoreOutlined' },
      { id: 'carriers', label: 'Перевозчики', path: '/carriers', icon: 'LocalShippingOutlined' },
      { id: 'shipments', label: 'Поставки', path: '/shipments', icon: 'Inventory2Outlined' },
      { id: 'plan-fact', label: NAV_LABELS.planFact, path: '/planning/plan-fact', icon: 'CompareArrowsOutlined' },
    ],
  },
  {
    id: 'reports',
    label: 'Отчёты',
    items: [{ id: 'reports', label: 'Отчёты', path: '/reports', icon: 'AssessmentOutlined' }],
  },
];

const ADMIN_NAV: NavGroupConfig[] = [
  {
    id: 'admin',
    label: 'Администрирование',
    items: [
      { id: 'admin-home', label: 'Обзор', path: '/admin', icon: 'DashboardOutlined' },
      { id: 'users', label: 'Пользователи', path: '/admin/users', icon: 'PeopleOutlined' },
      { id: 'roles', label: 'Роли и права', path: '/admin/roles', icon: 'AdminPanelSettingsOutlined' },
      { id: 'organizations', label: 'Организации', path: '/admin/organizations', icon: 'BusinessOutlined' },
      { id: 'integrations', label: 'Интеграции', path: '/admin/integrations', icon: 'ExtensionOutlined' },
      { id: 'dictionaries', label: 'Справочники', path: '/admin/dictionaries', icon: 'MenuBookOutlined' },
      { id: 'audit', label: 'Audit Log', path: '/admin/audit', icon: 'HistoryOutlined' },
      { id: 'system', label: 'System Health', path: '/admin/system', icon: 'SettingsOutlined' },
      { id: 'settings', label: 'Настройки', path: '/settings', icon: 'SettingsOutlined' },
    ],
  },
];

const SUPPLIER_NAV: NavGroupConfig[] = [
  {
    id: 'home',
    label: 'Главная',
    items: [{ id: 'supplier-dashboard', label: 'Обзор', path: '/supplier/dashboard', icon: 'DashboardOutlined' }],
  },
  {
    id: 'orders',
    label: 'Заказы',
    items: [{ id: 'supplier-orders', label: 'Заказы', path: '/supplier/orders', icon: 'ReceiptLongOutlined' }],
  },
  {
    id: 'planning',
    label: 'Планирование',
    items: [{ id: 'supplier-forecast', label: 'Прогноз потребности', path: '/supplier/forecast', icon: 'TrendingUpOutlined' }],
  },
  {
    id: 'shipments',
    label: 'Поставки',
    items: [{ id: 'supplier-shipments', label: 'Поставки', path: '/supplier/shipments', icon: 'Inventory2Outlined' }],
  },
  {
    id: 'interaction',
    label: 'Взаимодействие',
    items: [
      { id: 'supplier-incidents', label: 'Инциденты', path: '/supplier/incidents', icon: 'ReportProblemOutlined' },
      { id: 'supplier-documents', label: 'Документы', path: '/supplier/documents', icon: 'DescriptionOutlined' },
      { id: 'supplier-notifications', label: 'Уведомления', path: '/supplier/notifications', icon: 'ReportProblemOutlined' },
    ],
  },
  {
    id: 'analytics',
    label: 'Показатели',
    items: [{ id: 'supplier-performance', label: 'Мои показатели', path: '/supplier/performance', icon: 'AnalyticsOutlined' }],
  },
  {
    id: 'settings',
    label: 'Настройки',
    items: [{ id: 'supplier-settings', label: 'Настройки', path: '/supplier/settings', icon: 'SettingsOutlined' }],
  },
];

const CARRIER_NAV: NavGroupConfig[] = [
  {
    id: 'home',
    label: 'Главная',
    items: [{ id: 'carrier-dashboard', label: 'Обзор', path: '/carrier/dashboard', icon: 'DashboardOutlined' }],
  },
  {
    id: 'trips',
    label: 'Перевозки',
    items: [
      { id: 'carrier-shipments', label: 'Перевозки', path: '/carrier/shipments', icon: 'Inventory2Outlined' },
      { id: 'carrier-trips', label: 'Текущие рейсы', path: '/carrier/trips', icon: 'RouteOutlined' },
      { id: 'carrier-map', label: 'Карта', path: '/carrier/map', icon: 'MapOutlined' },
    ],
  },
  {
    id: 'fleet',
    label: 'Флот',
    items: [
      { id: 'carrier-vehicles', label: 'Машины', path: '/carrier/vehicles', icon: 'LocalShippingOutlined' },
      { id: 'carrier-drivers', label: 'Водители', path: '/carrier/drivers', icon: 'PeopleOutlined' },
    ],
  },
  {
    id: 'interaction',
    label: 'Взаимодействие',
    items: [
      { id: 'carrier-incidents', label: 'Инциденты', path: '/carrier/incidents', icon: 'ReportProblemOutlined' },
      { id: 'carrier-documents', label: 'Документы', path: '/carrier/documents', icon: 'DescriptionOutlined' },
      { id: 'carrier-notifications', label: 'Уведомления', path: '/carrier/notifications', icon: 'ReportProblemOutlined' },
    ],
  },
  {
    id: 'analytics',
    label: 'Показатели',
    items: [{ id: 'carrier-performance', label: 'Мои показатели', path: '/carrier/performance', icon: 'AnalyticsOutlined' }],
  },
  {
    id: 'settings',
    label: 'Настройки',
    items: [{ id: 'carrier-settings', label: 'Настройки', path: '/carrier/settings', icon: 'SettingsOutlined' }],
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
