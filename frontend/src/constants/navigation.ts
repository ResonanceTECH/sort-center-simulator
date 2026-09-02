import type { AppRole } from '@/types/scm/roles';
import { NAV_LABELS, PLATFORM_BRAND } from '@/constants/platformRu';

export interface NavItemConfig {
  id: string;
  label: string;
  path: string;
  icon: string;
  badgeKey?: 'exceptions' | 'incidents';
  roles?: AppRole[];
}

export interface NavGroupConfig {
  id: string;
  label: string;
  items: NavItemConfig[];
  roles?: AppRole[];
  collapsible?: boolean;
}

export const INTERNAL_NAV_GROUPS: NavGroupConfig[] = [
  {
    id: 'overview',
    label: 'Обзор',
    items: [
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
      { id: 'scenarios', label: 'Сценарии', path: '/scenarios', icon: 'ScienceOutlined' },
      { id: 'recommendations', label: 'Рекомендации', path: '/recommendations', icon: 'LightbulbOutlined' },
    ],
  },
  {
    id: 'admin',
    label: 'Система',
    roles: ['ADMIN', 'SUPPLY_CHAIN_MANAGER'],
    items: [
      { id: 'users', label: 'Пользователи', path: '/admin/users', icon: 'PeopleOutlined', roles: ['ADMIN'] },
      { id: 'roles', label: 'Роли', path: '/admin/roles', icon: 'AdminPanelSettingsOutlined', roles: ['ADMIN'] },
      { id: 'settings', label: 'Настройки', path: '/settings', icon: 'SettingsOutlined' },
      { id: 'integrations', label: 'Интеграции', path: '/integrations', icon: 'ExtensionOutlined', roles: ['ADMIN'] },
    ],
  },
];

export const SUPPLIER_NAV_ITEMS: NavItemConfig[] = [
  { id: 'supplier-dashboard', label: NAV_LABELS.dashboard, path: '/supplier', icon: 'DashboardOutlined' },
  { id: 'supplier-orders', label: 'Заказы', path: '/supplier/orders', icon: 'ReceiptLongOutlined' },
  { id: 'supplier-forecast', label: 'Прогноз', path: '/supplier/forecast', icon: 'TrendingUpOutlined' },
  { id: 'supplier-shipments', label: 'Поставки', path: '/supplier/shipments', icon: 'Inventory2Outlined' },
  { id: 'supplier-documents', label: 'Документы', path: '/supplier/documents', icon: 'DescriptionOutlined' },
  { id: 'supplier-incidents', label: 'Инциденты', path: '/supplier/incidents', icon: 'ReportProblemOutlined' },
  { id: 'supplier-performance', label: NAV_LABELS.performance, path: '/supplier/performance', icon: 'AnalyticsOutlined' },
];

export const CARRIER_NAV_ITEMS: NavItemConfig[] = [
  { id: 'carrier-shipments', label: 'Назначенные', path: '/carrier', icon: 'Inventory2Outlined' },
  { id: 'carrier-trips', label: 'Текущие рейсы', path: '/carrier/trips', icon: 'RouteOutlined' },
  { id: 'carrier-vehicles', label: 'Транспорт', path: '/carrier/vehicles', icon: 'LocalShippingOutlined' },
  { id: 'carrier-map', label: 'Карта', path: '/carrier/map', icon: 'MapOutlined' },
  { id: 'carrier-incidents', label: 'Инциденты', path: '/carrier/incidents', icon: 'ReportProblemOutlined' },
  { id: 'carrier-documents', label: 'Документы', path: '/carrier/documents', icon: 'DescriptionOutlined' },
  { id: 'carrier-performance', label: NAV_LABELS.performance, path: '/carrier/performance', icon: 'AnalyticsOutlined' },
];

export const APP_BRAND = PLATFORM_BRAND;
