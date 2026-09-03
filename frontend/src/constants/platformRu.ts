import type { ShipmentAction } from '@/constants/businessActions';
import type { SemanticStatus } from '@/types/scm/semantic';

/** Центральный словарь UI платформы (русский) */

export const PLATFORM_BRAND = {
  admin: 'Консоль администратора',
  internal: 'Платформа цепочки поставок',
  supplier: 'Кабинет поставщика',
  carrier: 'Кабинет перевозчика',
} as const;

export const NAV_LABELS = {
  controlTower: 'Башня управления',
  supplyNetwork: 'Сеть поставок',
  demandForecast: 'Прогноз спроса',
  supplyPlan: 'План поставок',
  inventoryPlan: 'План запасов',
  transportPlan: 'План перевозок',
  planFact: 'План / Факт',
  liveMap: 'Карта в реальном времени',
  analyticsOverview: 'Обзор',
  serviceLevel: 'Уровень сервиса',
  analyticsSuppliers: 'Поставщики',
  analyticsCarriers: 'Перевозчики',
  analyticsRoutes: 'Маршруты',
  analyticsInventory: 'Запасы',
  analyticsRisks: 'Риски',
  dashboard: 'Главная',
  performance: 'Показатели',
} as const;

export const COMMON = {
  search: 'Поиск',
  status: 'Статус',
  risk: 'Риск',
  supplier: 'Поставщик',
  carrier: 'Перевозчик',
  route: 'Маршрут',
  action: 'Действие',
  owner: 'Ответственный',
  severity: 'Критичность',
  title: 'Название',
  type: 'Тип',
  uploaded: 'Загружен',
  document: 'Документ',
  allExceptions: 'Все отклонения',
  openShipment: 'Открыть поставку',
  openEntity: 'Открыть сущность →',
  retry: 'Повторить',
  confirm: 'Подтвердить',
  cancel: 'Отмена',
  save: 'Сохранить',
  apply: 'Применить',
  reject: 'Отклонить',
  modify: 'Изменить',
  download: 'Скачать',
  upload: 'Загрузить',
  resolve: 'Решить',
  compare: 'Сравнить',
  new: 'Новый',
  rows: 'Строк:',
  noData: 'Нет данных',
  loading: 'Загрузка…',
  inDevelopment: 'Раздел в разработке',
  inDevelopmentHint: 'Оболочка и навигация готовы. Данные будут подключены через mock/API.',
  active: 'Активен',
  inactive: 'Неактивен',
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
  atRisk: 'Под риском',
  inTransit: 'В пути',
  critical: 'Критический',
  open: 'Открыт',
  inProgress: 'В работе',
  waitingPartner: 'Ожидание партнёра',
  resolved: 'Решён',
  routeCol: 'Маршрут',
  email: 'Email',
  name: 'Имя',
  organization: 'Организация',
} as const;

export const SEVERITY_LABELS: Record<string, string> = {
  CRITICAL: 'Критический',
  HIGH: 'Высокий',
  MEDIUM: 'Средний',
  LOW: 'Низкий',
  DATA_ISSUE: 'Ошибка данных',
};

export const SEMANTIC_LABELS: Record<SemanticStatus, string> = {
  NORMAL: 'Норма',
  INFO: 'Инфо',
  WARNING: 'Внимание',
  HIGH: 'Высокий',
  CRITICAL: 'Критический',
  SUCCESS: 'Успех',
  NO_DATA: 'Нет данных',
};

export const COMPARISON_LABELS: Record<string, string> = {
  BEST: 'Лучший',
  RISK: 'Риск',
  TARGET_REACHED: 'Цель достигнута',
  TARGET_NOT_REACHED: 'Цель не достигнута',
};

export const SHIPMENT_ACTION_LABELS: Record<ShipmentAction, string> = {
  READ: 'Просмотр',
  CHANGE_CARRIER: 'Назначить перевозчика',
  ASSIGN_CARRIER: 'Назначить перевозчика',
  REPLAN: 'Перепланировать',
  CANCEL: 'Отменить поставку',
  CREATE_SCENARIO: 'Создать сценарий',
  CREATE_INCIDENT: 'Создать инцидент',
  CHANGE_ROUTE: 'Изменить маршрут',
  CHANGE_SLOT: 'Изменить слот',
  CONFIRM_READY: 'Подтвердить готовность',
  UPLOAD_DOCUMENTS: 'Загрузить документы',
  REPORT_PROBLEM: 'Сообщить о проблеме',
  ACCEPT: 'Принять',
  REJECT: 'Отклонить',
  ASSIGN_VEHICLE: 'Назначить ТС',
  CONFIRM_PICKUP: 'Подтвердить забор',
  REPORT_DELAY: 'Сообщить о задержке',
  CONFIRM_DELIVERY: 'Подтвердить доставку',
};

export const PLAN_ACTION_LABELS: Record<string, string> = {
  EDIT: 'Редактировать',
  CALCULATE: 'Рассчитать',
  RECALCULATE: 'Пересчитать',
  SUBMIT: 'Отправить на согласование',
  APPROVE: 'Утвердить',
  REJECT: 'Отклонить',
  ACTIVATE: 'Активировать',
  CHANGE_CARRIER: 'Сменить перевозчика',
};

export const TAB_LABELS = {
  overview: 'Обзор',
  performance: 'Показатели',
  shipments: 'Поставки',
  products: 'Продукты',
  risks: 'Риски',
  incidents: 'Инциденты',
  routes: 'Маршруты',
  capacity: 'Мощность',
  relations: 'Связи',
  documents: 'Документы',
  sla: 'SLA',
} as const;

export const MAP_LAYERS: Record<string, string> = {
  vehicles: 'Транспорт',
  shipments: 'Поставки',
  routes: 'Маршруты',
  warehouses: 'Склады',
  hubs: 'Хабы',
  riskZones: 'Зоны риска',
};

export const SEARCH_ENTITY_LABELS: Record<string, string> = {
  shipment: 'Поставка',
  supplier: 'Поставщик',
  carrier: 'Перевозчик',
  order: 'Заказ',
  sku: 'SKU',
  incident: 'Инцидент',
  exception: 'Отклонение',
};

export const KPI = {
  otif: 'OTIF',
  activeShipments: 'Активные поставки',
  atRisk: 'Под риском',
  delayed: 'Задержаны',
  stockoutRisk: 'Риск дефицита',
  averageDelay: 'Средняя задержка',
  slaRisk: 'Риск SLA',
  reliability: 'Надёжность',
  leadTime: 'Lead time',
  supplyShare: 'Доля поставок',
  openIncidents: 'Открытые инциденты',
  etaAccuracy: 'Точность ETA',
  avgDelay: 'Средняя задержка',
  incidentRate: 'Частота инцидентов',
  onTimePickup: 'Своевременный забор',
  quality: 'Качество',
  trend: 'Тренд',
  confidence: 'Доверие',
  demand: 'Спрос',
  requiredSupply: 'Требуемые поставки',
  version: 'Версия',
  seasonality: 'Сезонность',
  forecastEta: 'Прогноз ETA',
  cost: 'Стоимость',
  volume: 'Объём',
  incidents: 'Инциденты',
} as const;

export const SECTION_LABELS = {
  requiresAttention: 'Требует внимания',
  recentActivity: 'Недавняя активность',
  insights: 'Инсайты',
  timeline: 'Хронология',
  impact: 'Влияние',
  details: 'Детали',
  comments: 'Комментарии',
  recommendedActions: 'Рекомендуемые действия',
  parameters: 'Параметры',
  baselineVsScenario: 'БАЗОВЫЙ vs СЦЕНАРИЙ',
  forecastChart: 'График прогноза',
  anomalies: 'Аномалии',
  supplierAllocation: 'Распределение по поставщикам',
  constraintViolations: 'Нарушения ограничений',
  inventoryLevel: 'Уровень запасов',
  incomingShipments: 'Входящие поставки',
  otifTrend: 'Тренд OTIF',
  topIssues: 'Главные проблемы',
  quickActions: 'Быстрые действия',
  assignedShipments: 'Назначенные поставки',
  cargoSku: 'Груз / SKU',
  map: 'Маршрут на карте',
  exceptions: 'Отклонения',
  incidents: 'Инциденты',
  documents: 'Документы',
  activity: 'Активность',
  plannedEta: 'Плановый ETA',
  pickup: 'Забор',
  partners: 'Участники',
  noExceptions: 'Нет отклонений по этой поставке',
  noIncidents: 'Нет инцидентов',
  noDocuments: 'Документы не загружены',
} as const;

export const ANALYTICS_SECTION_TITLES: Record<string, string> = {
  service: NAV_LABELS.serviceLevel,
  suppliers: 'Аналитика поставщиков',
  carriers: 'Аналитика перевозчиков',
  routes: 'Аналитика маршрутов',
  inventory: 'Аналитика запасов',
  risks: 'Аналитика рисков',
};

export const EXCEPTION_TYPE_LABELS: Record<string, string> = {
  'Long Vehicle Stop': 'Длительная остановка ТС',
  'Supplier Delay': 'Задержка поставщика',
  'Route Deviation': 'Отклонение от маршрута',
};

export const SCENARIO_CATEGORY_LABELS: Record<string, string> = {
  Demand: 'Спрос',
  Supplier: 'Поставщик',
  Carrier: 'Перевозчик',
  Route: 'Маршрут',
  Warehouse: 'Склад',
  Inventory: 'Запасы',
};

export function labelExceptionType(type: string): string {
  return EXCEPTION_TYPE_LABELS[type] ?? type;
}

export function labelScenarioCategory(category: string): string {
  return SCENARIO_CATEGORY_LABELS[category] ?? category;
}

export function labelSeverity(value: string): string {
  return SEVERITY_LABELS[value] ?? value;
}

export function labelSemantic(status: SemanticStatus): string {
  return SEMANTIC_LABELS[status] ?? status;
}

export function labelComparison(value: string): string {
  return COMPARISON_LABELS[value] ?? value.replace(/_/g, ' ');
}
