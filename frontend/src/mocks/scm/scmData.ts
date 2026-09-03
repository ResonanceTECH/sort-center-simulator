import { buildShipmentMapView } from '@/mocks/scm/mapData';
import type { AnalyticsOverviewData, AnalyticsSectionData } from '@/types/scm/analytics';
import type { CarrierDetail, CarrierSummary } from '@/types/scm/carrier';
import type { ControlTowerData } from '@/types/scm/controlTower';
import type { ExceptionSummary } from '@/types/scm/exception';
import type { IncidentDetail, IncidentSummary } from '@/types/scm/incident';
import type {
  DemandForecastData,
  InventoryPlanData,
  PlanFactData,
  SupplyPlanData,
  TransportPlanData,
} from '@/types/scm/planning';
import type { RecommendationItem, ScenarioDetail, ScenarioSummary } from '@/types/scm/scenario';
import type { ShipmentDetail, ShipmentSummary, ShipmentStatus } from '@/types/scm/shipment';
import type { ScmNotification, SearchResult } from '@/types/scm/search';
import type { SupplierDetail, SupplierSummary } from '@/types/scm/supplier';
import { KPI } from '@/constants/platformRu';

export const CONTROL_TOWER_MOCK: ControlTowerData = {
  kpis: [
    { label: KPI.otif, value: '91.4', unit: '%', status: 'WARNING', delta: -2.1, deltaUnit: ' п.п.', reason: 'к плану' },
    { label: KPI.activeShipments, value: 148, status: 'NORMAL' },
    { label: KPI.atRisk, value: 17, status: 'HIGH' },
    { label: KPI.delayed, value: 6, status: 'CRITICAL' },
    { label: KPI.stockoutRisk, value: '8.2', unit: '%', status: 'WARNING' },
    { label: KPI.averageDelay, value: 47, unit: ' мин', status: 'WARNING' },
  ],
  requiresAttention: [
    {
      id: 'exc-001',
      shipmentId: 'SH-0184',
      type: 'Длительная остановка ТС',
      severity: 'CRITICAL',
      severityStatus: 'CRITICAL',
      deviation: 'ETA +3h 25m',
      probability: 0.92,
      impact: { label: KPI.slaRisk, value: 92, unit: '%', status: 'CRITICAL' },
      owner: 'М. Козлова',
      createdAt: '2026-09-02T13:20:00Z',
      route: 'Казань → Москва',
    },
    {
      id: 'exc-002',
      shipmentId: 'SH-0156',
      type: 'Задержка поставщика',
      severity: 'HIGH',
      severityStatus: 'HIGH',
      deviation: 'Pickup +2h',
      probability: 0.78,
      impact: { label: KPI.stockoutRisk, value: 34, unit: '%', status: 'HIGH' },
      owner: 'И. Петров',
      createdAt: '2026-09-02T11:45:00Z',
      route: 'Supplier B → Warehouse Moscow',
    },
  ],
  insights: [
    { id: 'ins-1', title: 'Carrier B OTIF снизился на 4.2 п.п.', description: 'Основной вклад — маршрут Москва → СПб', link: '/analytics/carriers' },
    { id: 'ins-2', title: 'Риск дефицита растёт по SKU-4421', description: '3 поставки задержаны', link: '/planning/inventory' },
  ],
  recentActivity: [
    { id: 'act-1', timestamp: '14:32', actor: 'Анна Смирнова', action: 'Перевозчик изменён', detail: 'Перевозчик A → Перевозчик B', entityType: 'shipment', entityId: 'SH-0184' },
    { id: 'act-2', timestamp: '13:47', actor: 'Система', action: 'Создано отклонение', detail: 'Длительная остановка ТС на SH-0184', entityType: 'exception', entityId: 'exc-001' },
  ],
  alertCounts: { exceptions: 17, incidents: 5 },
};

export const EXCEPTIONS_MOCK: ExceptionSummary[] = [
  ...CONTROL_TOWER_MOCK.requiresAttention,
  {
    id: 'exc-003',
    shipmentId: 'SH-0201',
    type: 'Отклонение от маршрута',
    severity: 'MEDIUM',
    severityStatus: 'WARNING',
    deviation: '+45 km',
    probability: 0.55,
    impact: { label: 'Влияние на ETA', value: 35, unit: ' мин', status: 'WARNING' },
    owner: '—',
    createdAt: '2026-09-02T09:10:00Z',
    route: 'Москва → СПб',
  },
];

function generateShipments(): ShipmentSummary[] {
  const suppliers = ['Supplier A', 'Supplier B', 'Supplier C'];
  const carriers = ['Carrier A', 'Carrier B', 'Carrier C'];
  const routes = [
    { origin: 'Казань', destination: 'Москва' },
    { origin: 'Москва', destination: 'СПб' },
    { origin: 'Supplier B', destination: 'Warehouse Moscow' },
  ];

  return Array.from({ length: 5000 }, (_, i) => {
    const route = routes[i % routes.length]!;
    const atRisk = i < 120;
    return {
      id: `SH-${String(100 + i).padStart(4, '0')}`,
      supplierId: `sup-${i % 3}`,
      supplierName: suppliers[i % 3]!,
      carrierId: `car-${i % 3}`,
      carrierName: carriers[i % 3]!,
      origin: route.origin,
      destination: route.destination,
      status: atRisk ? 'IN_TRANSIT' : 'IN_TRANSIT',
      pickupAt: '2026-09-02T08:00:00Z',
      plannedEta: '2026-09-02T14:00:00Z',
      forecastEta: atRisk ? '2026-09-02T17:25:00Z' : '2026-09-02T14:10:00Z',
      deviationMinutes: atRisk ? 205 : 10,
      slaRisk: {
        label: KPI.slaRisk,
        value: atRisk ? 92 : 12,
        unit: '%',
        status: atRisk ? 'CRITICAL' : 'NORMAL',
      },
    };
  });
}

export const SHIPMENTS_MOCK = generateShipments();

function getBackendActionsForStatus(status: ShipmentStatus): string[] {
  switch (status) {
    case 'DRAFT':
      return ['ASSIGN_CARRIER', 'CANCEL'];
    case 'PLANNED':
      return ['ASSIGN_CARRIER', 'CHANGE_CARRIER', 'CANCEL'];
    case 'ASSIGNED':
      return ['CHANGE_CARRIER', 'ACCEPT', 'REJECT', 'CANCEL'];
    case 'ACCEPTED':
      return ['CONFIRM_PICKUP', 'CONFIRM_READY', 'CHANGE_ROUTE', 'CANCEL'];
    case 'READY_FOR_PICKUP':
      return ['CONFIRM_PICKUP', 'CHANGE_SLOT'];
    case 'IN_TRANSIT':
      return ['CHANGE_CARRIER', 'CREATE_INCIDENT', 'CREATE_SCENARIO', 'CANCEL', 'REPORT_DELAY', 'REPORT_PROBLEM'];
    case 'ARRIVED':
      return ['CONFIRM_DELIVERY'];
    case 'DELIVERED':
      return ['UPLOAD_DOCUMENTS'];
    default:
      return [];
  }
}

export function getShipmentDetail(id: string): ShipmentDetail | null {
  const summary = SHIPMENTS_MOCK.find((s) => s.id === id);
  if (!summary) return null;

  const routeLabel = `${summary.origin} → ${summary.destination}`;
  const shipmentExceptions = EXCEPTIONS_MOCK.filter((e) => e.shipmentId === id);
  const shipmentIncidents = INCIDENTS_MOCK.filter((i) => i.shipmentId === id);

  return {
    ...summary,
    orderId: `ORD-${id}`,
    skus: [
      { sku: 'SKU-4421', name: 'Product Alpha', quantity: 120 },
      { sku: 'SKU-8810', name: 'Product Beta', quantity: 45 },
    ],
    exceptions: shipmentExceptions,
    incidents: shipmentIncidents,
    documents: [
      { id: `doc-${id}-1`, name: `Упаковочный лист ${id}.pdf`, type: 'Упаковочный лист', uploadedAt: '2026-09-02' },
      { id: `doc-${id}-2`, name: `CMR ${id}.pdf`, type: 'CMR', uploadedAt: '2026-09-01' },
    ],
    activity: [
      { id: 'a1', timestamp: '14:32', actor: 'Анна Смирнова', action: 'Перевозчик изменён', detail: 'Carrier A → Carrier B' },
      { id: 'a2', timestamp: '13:47', actor: 'Система', action: 'Создано отклонение', detail: shipmentExceptions[0]?.type ?? '—' },
      { id: 'a3', timestamp: '09:14', actor: summary.carrierName, action: 'Забор подтверждён' },
    ],
    mapView: buildShipmentMapView(id, routeLabel, summary.slaRisk.status),
    timeline: [
      { id: 't1', timestamp: '08:02', type: 'created', title: 'Поставка создана' },
      { id: 't2', timestamp: '08:35', type: 'accepted', title: 'Перевозчик принял' },
      { id: 't3', timestamp: '09:14', type: 'pickup', title: 'Забор подтверждён' },
      { id: 't4', timestamp: '09:26', type: 'transit', title: 'В пути' },
      { id: 't5', timestamp: '13:17', type: 'stop', title: 'Неожиданная остановка' },
      { id: 't6', timestamp: '13:20', type: 'eta', title: 'ETA изменён' },
      ...(shipmentExceptions[0]
        ? [{
            id: 't7',
            timestamp: '13:47',
            type: 'exception',
            title: 'Создано отклонение',
            relatedEntityId: shipmentExceptions[0].id,
            relatedEntityType: 'exception' as const,
          }]
        : []),
    ],
    availableActions: getBackendActionsForStatus(summary.status),
  };
}

export function getExceptionDetail(id: string) {
  const summary = EXCEPTIONS_MOCK.find((e) => e.id === id);
  if (!summary) return null;
  return {
    ...summary,
    description: 'Транспортное средство остановилось более чем на 90 минут вне запланированной точки.',
    causes: ['Остановка > 90 мин', 'Отклонение ETA', 'Превышен допуск SLA'],
    affectedSkus: ['SKU-4421'],
    inventoryImpact: 'Риск дефицита +12%',
    orderImpact: '2 заказа под риском',
    slaImpact: 'Вероятно нарушение SLA',
    availableActions: ['CREATE_INCIDENT', 'CREATE_SCENARIO', 'ASSIGN_OWNER', 'OPEN_SHIPMENT'],
  };
}

export const SUPPLIERS_MOCK: SupplierSummary[] = [
  {
    id: 'sup-0',
    name: 'Supplier A',
    status: 'ACTIVE',
    statusSemantic: 'SUCCESS',
    otif: { label: KPI.otif, value: 94, unit: '%', status: 'SUCCESS' },
    reliability: { label: KPI.reliability, value: 96, unit: '%', status: 'SUCCESS' },
    leadTimeDays: { label: KPI.leadTime, value: 3.2, unit: ' д', status: 'NORMAL' },
    supplyShare: { label: KPI.supplyShare, value: 28, unit: '%', status: 'NORMAL' },
    risk: { label: 'Риск', value: 'LOW', status: 'NORMAL' },
    openIncidents: 0,
    region: 'Центральный',
    productGroup: 'Electronics',
  },
  {
    id: 'sup-1',
    name: 'Supplier B',
    status: 'ACTIVE',
    statusSemantic: 'WARNING',
    otif: { label: KPI.otif, value: 84, unit: '%', status: 'WARNING', delta: -4.2, deltaUnit: ' п.п.' },
    reliability: { label: KPI.reliability, value: 88, unit: '%', status: 'WARNING' },
    leadTimeDays: { label: KPI.leadTime, value: 4.8, unit: ' д', status: 'WARNING' },
    supplyShare: { label: KPI.supplyShare, value: 37, unit: '%', status: 'NORMAL' },
    risk: { label: 'Риск', value: 'HIGH', status: 'HIGH' },
    openIncidents: 2,
    region: 'Поволжье',
    productGroup: 'Components',
  },
  {
    id: 'sup-2',
    name: 'Supplier C',
    status: 'ACTIVE',
    statusSemantic: 'NORMAL',
    otif: { label: KPI.otif, value: 91, unit: '%', status: 'NORMAL' },
    reliability: { label: KPI.reliability, value: 93, unit: '%', status: 'NORMAL' },
    leadTimeDays: { label: KPI.leadTime, value: 2.9, unit: ' д', status: 'SUCCESS' },
    supplyShare: { label: KPI.supplyShare, value: 25, unit: '%', status: 'NORMAL' },
    risk: { label: 'Риск', value: 'MEDIUM', status: 'WARNING' },
    openIncidents: 1,
    region: 'Северо-Запад',
    productGroup: 'Packaging',
  },
];

export function getSupplierDetail(id: string): SupplierDetail | null {
  const summary = SUPPLIERS_MOCK.find((s) => s.id === id);
  if (!summary) return null;
  return {
    ...summary,
    contactEmail: 'contact@supplier.example',
    contactPhone: '+7 (495) 123-45-67',
    address: 'Москва, ул. Промышленная, 12',
    products: [
      { sku: 'SKU-4421', name: 'Product Alpha', share: 42 },
      { sku: 'SKU-8810', name: 'Product Beta', share: 31 },
    ],
    recentShipments: [
      { id: 'SH-0184', status: 'IN_TRANSIT', eta: '2026-09-02T17:25:00Z' },
      { id: 'SH-0156', status: 'IN_TRANSIT', eta: '2026-09-02T15:00:00Z' },
    ],
    slaMetrics: [
      { label: KPI.onTimePickup, value: 89, unit: '%', status: 'WARNING' },
      { label: 'Качество', value: 98, unit: '%', status: 'SUCCESS' },
    ],
    risks: [
      { id: 'r1', title: 'Ограничение мощности Q3', status: 'HIGH', description: 'Производство ограничено на 30%' },
    ],
    incidents: [{ id: 'inc-001', title: 'Задержка забора — Поставщик B', status: 'IN_PROGRESS' }],
  };
}

export const CARRIERS_MOCK: CarrierSummary[] = [
  {
    id: 'car-0',
    name: 'Carrier A',
    otif: { label: KPI.otif, value: 95, unit: '%', status: 'SUCCESS' },
    etaAccuracy: { label: KPI.etaAccuracy, value: 92, unit: '%', status: 'SUCCESS' },
    averageDelay: { label: KPI.avgDelay, value: 18, unit: ' мин', status: 'NORMAL' },
    routesCount: 12,
    shipmentCount: 156,
    incidentRate: { label: KPI.incidentRate, value: 1.2, unit: '%', status: 'NORMAL' },
    risk: { label: 'Риск', value: 'LOW', status: 'NORMAL' },
  },
  {
    id: 'car-1',
    name: 'Carrier B',
    otif: { label: KPI.otif, value: 87, unit: '%', status: 'WARNING', delta: -4.2, deltaUnit: ' п.п.' },
    etaAccuracy: { label: KPI.etaAccuracy, value: 81, unit: '%', status: 'WARNING' },
    averageDelay: { label: KPI.avgDelay, value: 47, unit: ' мин', status: 'HIGH' },
    routesCount: 8,
    shipmentCount: 98,
    incidentRate: { label: KPI.incidentRate, value: 3.8, unit: '%', status: 'HIGH' },
    risk: { label: 'Риск', value: 'HIGH', status: 'HIGH' },
  },
  {
    id: 'car-2',
    name: 'Carrier C',
    otif: { label: KPI.otif, value: 91, unit: '%', status: 'NORMAL' },
    etaAccuracy: { label: KPI.etaAccuracy, value: 88, unit: '%', status: 'NORMAL' },
    averageDelay: { label: KPI.avgDelay, value: 28, unit: ' мин', status: 'NORMAL' },
    routesCount: 6,
    shipmentCount: 72,
    incidentRate: { label: KPI.incidentRate, value: 2.1, unit: '%', status: 'NORMAL' },
    risk: { label: 'Риск', value: 'MEDIUM', status: 'WARNING' },
  },
];

export function getCarrierDetail(id: string): CarrierDetail | null {
  const summary = CARRIERS_MOCK.find((c) => c.id === id);
  if (!summary) return null;
  return {
    ...summary,
    contactEmail: 'dispatch@carrier.example',
    vehiclesCount: 24,
    routes: [
      { id: 'rt-1', name: 'Москва → СПб', volume: 510, utilization: 95 },
      { id: 'rt-2', name: 'Казань → Москва', volume: 320, utilization: 78 },
    ],
    recentShipments: [{ id: 'SH-0184', status: 'IN_TRANSIT', eta: '2026-09-02T17:25:00Z' }],
    incidents: [{ id: 'inc-002', title: 'Длительная остановка SH-0184', status: 'OPEN' }],
  };
}

export const INCIDENTS_MOCK: IncidentSummary[] = [
  {
    id: 'inc-001',
    title: 'Задержка забора — Поставщик B',
    status: 'IN_PROGRESS',
    severity: 'HIGH',
    owner: 'И. Петров',
    shipmentId: 'SH-0156',
    participants: ['Manager', 'Supplier'],
    createdAt: '2026-09-02T11:50:00Z',
    updatedAt: '2026-09-02T14:10:00Z',
  },
  {
    id: 'inc-002',
    title: 'Длительная остановка ТС SH-0184',
    status: 'OPEN',
    severity: 'CRITICAL',
    owner: 'М. Козлова',
    shipmentId: 'SH-0184',
    participants: ['Manager', 'Carrier'],
    createdAt: '2026-09-02T13:50:00Z',
    updatedAt: '2026-09-02T13:50:00Z',
  },
  {
    id: 'inc-003',
    title: 'Отклонение от маршрута Москва → СПб',
    status: 'WAITING_PARTNER',
    severity: 'WARNING',
    owner: 'А. Смирнова',
    shipmentId: 'SH-0201',
    participants: ['Manager', 'Carrier'],
    createdAt: '2026-09-01T16:00:00Z',
    updatedAt: '2026-09-02T09:30:00Z',
  },
];

export function getIncidentDetail(id: string): IncidentDetail | null {
  const summary = INCIDENTS_MOCK.find((i) => i.id === id);
  if (!summary) return null;
  return {
    ...summary,
    description: 'Инцидент связан с задержкой исполнения и требует координации участников цепочки.',
    relatedExceptionId: summary.shipmentId === 'SH-0184' ? 'exc-001' : undefined,
    timeline: [
      { id: 't1', timestamp: '13:50', actor: 'Система', action: 'Инцидент создан', detail: summary.title },
      { id: 't2', timestamp: '14:05', actor: 'М. Козлова', action: 'Назначен ответственный' },
    ],
    comments: [
      { id: 'c1', author: 'М. Козлова', role: 'Manager', message: 'Перевозчик подтвердил остановку на ТО.', timestamp: '14:12' },
      { id: 'c2', author: 'Carrier C', role: 'Carrier', message: 'ETA обновлён, ожидаем возобновление через 45 мин.', timestamp: '14:20' },
    ],
    recommendedActions: [
      { id: 'ra1', label: 'Переназначить на Перевозчика A', description: 'Снизит риск SLA на 18 п.п.' },
      { id: 'ra2', label: 'Создать сценарий', description: 'Оценить влияние переназначения' },
    ],
    availableActions: ['ASSIGN_OWNER', 'ADD_COMMENT', 'RESOLVE', 'CLOSE'],
  };
}

export const DEMAND_FORECAST_MOCK: DemandForecastData = {
  period: 'Q3 2026',
  trend: 'UP',
  seasonality: 'Peak season — август-сентябрь',
  anomalies: [{ date: '2026-08-15', description: 'Промо-всплеск +34%' }],
  version: 'v3.2',
  lastCalculated: '2026-09-01T08:00:00Z',
  series: Array.from({ length: 12 }, (_, i) => ({
    date: `2026-${String(i + 1).padStart(2, '0')}`,
    actual: i < 8 ? 8000 + i * 200 + Math.random() * 500 : undefined,
    forecast: 8200 + i * 180,
    lower: 7800 + i * 160,
    upper: 8600 + i * 200,
  })),
};

export const SUPPLY_PLAN_MOCK: SupplyPlanData = {
  status: 'CALCULATED',
  demand: { label: KPI.demand, value: 108700, status: 'NORMAL' },
  requiredSupply: { label: KPI.requiredSupply, value: 112000, status: 'NORMAL' },
  allocations: [
    { supplierId: 'sup-0', supplierName: 'Supplier A', allocated: 34000, capacity: 40000, utilization: 85, status: 'NORMAL' },
    { supplierId: 'sup-1', supplierName: 'Supplier B', allocated: 39000, capacity: 42000, utilization: 93, status: 'WARNING' },
    { supplierId: 'sup-2', supplierName: 'Supplier C', allocated: 25000, capacity: 30000, utilization: 83, status: 'NORMAL' },
    { supplierId: 'sup-3', supplierName: 'Supplier D', allocated: 14000, capacity: 15000, utilization: 93, status: 'WARNING' },
  ],
  violations: [{ message: 'Мощность Поставщика B превышена на 2%', status: 'WARNING' }],
  availableActions: ['EDIT', 'CALCULATE', 'SUBMIT'],
};

export const INVENTORY_PLAN_MOCK: InventoryPlanData = {
  status: 'ACTIVE',
  items: [
    {
      sku: 'SKU-4421',
      name: 'Product Alpha',
      currentStock: { label: 'Текущий запас', value: 1240, status: 'NORMAL' },
      incoming: { label: 'Входящие', value: 320, status: 'NORMAL' },
      forecastDemand: { label: 'Прогноз спроса', value: 480, status: 'WARNING' },
      safetyStock: { label: 'Страховой запас', value: 400, status: 'NORMAL' },
      daysOfSupply: { label: 'Дней запаса', value: 12, unit: ' д', status: 'WARNING' },
      stockoutRisk: { label: KPI.stockoutRisk, value: 34, unit: '%', status: 'HIGH' },
      incomingShipments: [{ id: 'SH-0184', eta: '2026-09-02T17:25:00Z', quantity: 120 }],
    },
  ],
  series: Array.from({ length: 14 }, (_, i) => ({
    date: `Day ${i + 1}`,
    level: 1400 - i * 45,
    safetyStock: 400,
  })),
};

export const TRANSPORT_PLAN_MOCK: TransportPlanData = {
  status: 'REVIEW',
  lanes: [
    {
      id: 'lane-1',
      lane: 'Москва → Санкт-Петербург',
      plannedVolume: { label: 'План', value: 500, unit: ' т', status: 'NORMAL' },
      requiredCapacity: { label: 'Требуется', value: 510, unit: ' т', status: 'NORMAL' },
      availableCapacity: { label: 'Доступно', value: 486, unit: ' т', status: 'WARNING' },
      deficit: { label: 'Дефицит', value: 24, unit: ' т', status: 'CRITICAL' },
      carrier: 'Carrier B',
      carrierId: 'car-1',
      vehicles: 8,
      utilization: { label: 'Загрузка', value: 105, unit: '%', status: 'CRITICAL' },
      risk: { label: 'Риск', value: 'CRITICAL', status: 'CRITICAL' },
    },
  ],
  availableActions: ['EDIT', 'CALCULATE', 'SUBMIT', 'RECALCULATE', 'CHANGE_CARRIER'],
};

export const PLAN_FACT_MOCK: PlanFactData = {
  period: 'August 2026',
  metrics: [
    {
      label: KPI.otif,
      baseline: '95%',
      unit: '%',
      values: { plan: 95, fact: 89 },
      semantic: { fact: 'RISK' },
      drillDown: [
        { label: 'Carrier B', delta: -2.4 },
        { label: 'Supplier C', delta: -1.7 },
        { label: 'Москва → СПб', delta: -1.1 },
        { label: 'Other', delta: -0.8 },
      ],
    },
    {
      label: KPI.volume,
      baseline: '108 700',
      values: { plan: 108700, fact: 104200 },
      semantic: { fact: 'TARGET_NOT_REACHED' },
    },
  ],
};

export const SCENARIOS_MOCK: ScenarioSummary[] = [
  {
    id: 'scn-001',
    name: 'Supplier B capacity -30%',
    createdBy: 'И. Петров',
    status: 'COMPLETED',
    basePlan: 'Supply Plan v3.2',
    createdAt: '2026-09-01T10:00:00Z',
    lastCalculation: '2026-09-01T10:45:00Z',
    recommendationStatus: 'RISK',
  },
  {
    id: 'scn-002',
    name: 'Carrier C unavailable',
    createdBy: 'А. Смирнова',
    status: 'RUNNING',
    basePlan: 'Transport Plan v2.1',
    createdAt: '2026-09-02T08:00:00Z',
    progress: 67,
    progressMessage: 'Обработка ограничений перевозок...',
  },
];

export function getScenarioDetail(id: string): ScenarioDetail | null {
  const summary = SCENARIOS_MOCK.find((s) => s.id === id);
  if (!summary) return null;
  return {
    ...summary,
    parameters: [
      { category: 'Demand', label: 'Глобальный спрос', change: '+20%' },
      { category: 'Supplier', label: 'Поставщик B', change: 'Мощность -30%' },
      { category: 'Carrier', label: 'Перевозчик C', change: 'Недоступен' },
    ],
    kpis: [
      { label: 'OTIF', baseline: 92, unit: '%', values: { baseline: 92, scenario: 79 }, semantic: { scenario: 'RISK' } },
      { label: KPI.stockoutRisk, baseline: 7, unit: '%', values: { baseline: 7, scenario: 31 }, semantic: { scenario: 'RISK' } },
      { label: 'Логистические затраты', baseline: '12.4M', values: { baseline: '12.4M', scenario: '13.1M' } },
    ],
    availableActions: ['COMPARE', 'CREATE_RECOMMENDATION', 'APPLY'],
  };
}

export const RECOMMENDATIONS_MOCK: RecommendationItem[] = [
  {
    id: 'rec-001',
    title: 'Перераспределить 14% объёма Поставщика B на Поставщика A',
    description: 'Снижает риск дефицита при сохранении lead time',
    expectedEffects: [
      { label: 'OTIF', baseline: 79, unit: '%', values: { current: 79, expected: 93 }, semantic: { expected: 'BEST' } },
      { label: KPI.stockoutRisk, baseline: 31, unit: '%', values: { current: 31, expected: 9 }, semantic: { expected: 'BEST' } },
      { label: KPI.cost, baseline: '+0%', values: { current: 0, expected: 4 }, semantic: { expected: 'RISK' } },
    ],
    status: 'PENDING',
    availableActions: ['APPLY', 'CREATE_SCENARIO', 'MODIFY', 'REJECT', 'SAVE'],
  },
];

export const ANALYTICS_OVERVIEW_MOCK: AnalyticsOverviewData = {
  kpis: [
    { label: 'OTIF', metric: { label: 'OTIF', value: 91.4, unit: '%', status: 'WARNING', delta: -2.1, deltaUnit: ' п.п.' }, link: '/analytics/service' },
    { label: KPI.stockoutRisk, metric: { label: KPI.stockoutRisk, value: 8.2, unit: '%', status: 'WARNING' }, link: '/analytics/inventory' },
  ],
  otifTrend: [
    { label: 'Jan', value: 94, drillDownLink: '/analytics/suppliers' },
    { label: 'Feb', value: 93 },
    { label: 'Mar', value: 92 },
    { label: 'Apr', value: 91.4, drillDownLink: '/analytics/carriers' },
  ],
  topIssues: [
    { label: 'OTIF Перевозчика B', value: -4.2, link: '/carriers/car-1' },
    { label: 'Задержки Поставщика B', value: -3.1, link: '/suppliers/sup-1' },
  ],
};

export function getAnalyticsSection(type: string): AnalyticsSectionData {
  const base: AnalyticsSectionData = {
    title: type,
    kpis: [{ label: 'OTIF', metric: { label: 'OTIF', value: 91.4, unit: '%', status: 'WARNING' } }],
    chart: [
      { label: 'Week 1', value: 93, drillDownLink: '/shipments' },
      { label: 'Week 2', value: 91 },
      { label: 'Week 3', value: 89, drillDownLink: '/exceptions' },
      { label: 'Week 4', value: 92 },
    ],
    drillDownHint: 'Клик по столбцу → drill-down к причине',
  };
  return base;
}

export const NOTIFICATIONS_MOCK: ScmNotification[] = [
  {
    id: 'n1',
    title: 'Новое отклонение',
    message: 'Длительная остановка ТС на SH-0184',
    read: false,
    createdAt: '2026-09-02T13:47:00Z',
    link: '/exceptions/exc-001',
  },
  {
    id: 'n2',
    title: 'Поставка задержана',
    message: 'SH-0184 ETA +3h 25m',
    read: false,
    createdAt: '2026-09-02T13:20:00Z',
    link: '/shipments/SH-0184',
  },
  {
    id: 'n3',
    title: 'Сценарий завершён',
    message: 'Supplier B capacity -30%',
    read: true,
    createdAt: '2026-09-01T10:45:00Z',
    link: '/scenarios/scn-001',
  },
  {
    id: 'n4',
    title: 'План требует согласования',
    message: 'Transport Plan v2.1',
    read: false,
    createdAt: '2026-09-02T08:00:00Z',
    link: '/planning/transport',
  },
  {
    id: 'n5',
    title: 'Инцидент назначен',
    message: 'Длительная остановка ТС SH-0184',
    read: false,
    createdAt: '2026-09-02T13:50:00Z',
    link: '/incidents/inc-002',
  },
];

export function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  SHIPMENTS_MOCK.forEach((s) => {
    results.push({
      id: s.id,
      type: 'shipment',
      label: s.id,
      subtitle: `${s.origin} → ${s.destination}`,
      link: `/shipments/${s.id}`,
    });
    results.push({
      id: `ORD-${s.id}`,
      type: 'order',
      label: `ORD-${s.id}`,
      subtitle: s.id,
      link: `/shipments/${s.id}`,
    });
  });

  SUPPLIERS_MOCK.forEach((s) => {
    results.push({
      id: s.id,
      type: 'supplier',
      label: s.name,
      subtitle: s.region,
      link: `/suppliers/${s.id}`,
    });
  });

  CARRIERS_MOCK.forEach((c) => {
    results.push({
      id: c.id,
      type: 'carrier',
      label: c.name,
      link: `/carriers/${c.id}`,
    });
  });

  EXCEPTIONS_MOCK.forEach((e) => {
    results.push({
      id: e.id,
      type: 'exception',
      label: e.type,
      subtitle: e.shipmentId,
      link: `/exceptions/${e.id}`,
    });
  });

  INCIDENTS_MOCK.forEach((i) => {
    results.push({
      id: i.id,
      type: 'incident',
      label: i.title,
      subtitle: i.id,
      link: `/incidents/${i.id}`,
    });
  });

  results.push(
    { id: 'SKU-4421', type: 'sku', label: 'SKU-4421', subtitle: 'Product Alpha', link: '/planning/inventory' },
    { id: 'SKU-8810', type: 'sku', label: 'SKU-8810', subtitle: 'Product Beta', link: '/planning/inventory' },
  );

  return results;
}

export function searchEntities(query: string): SearchResult[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  return buildSearchIndex()
    .filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.subtitle?.toLowerCase().includes(q),
    )
    .slice(0, 12);
}
