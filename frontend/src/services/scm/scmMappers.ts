import { KPI } from '@/constants/platformRu';
import type { AnalyticsOverviewData, AnalyticsSectionData } from '@/types/scm/analytics';
import type { CarrierDetail, CarrierSummary, CarriersPageData } from '@/types/scm/carrier';
import type { ControlTowerData } from '@/types/scm/controlTower';
import type {
  ExceptionDetail,
  ExceptionSeverity,
  ExceptionSummary,
  ExceptionsPageData,
} from '@/types/scm/exception';
import type { IncidentComment, IncidentDetail, IncidentSummary, IncidentsPageData } from '@/types/scm/incident';
import type { MetricValue } from '@/types/scm/metric';
import type {
  DemandForecastData,
  InventoryPlanData,
  PlanFactData,
  SupplyPlanData,
  TransportPlanData,
} from '@/types/scm/planning';
import type {
  RecommendationItem,
  ScenarioComparisonData,
  ScenarioDetail,
  ScenarioSummary,
  ScenariosPageData,
} from '@/types/scm/scenario';
import type { ScmNotification, SearchResult } from '@/types/scm/search';
import type { ShipmentDetail, ShipmentSummary, ShipmentsPageData } from '@/types/scm/shipment';
import type { SupplierDetail, SupplierSummary, SuppliersPageData } from '@/types/scm/supplier';
import type { LiveMapData } from '@/types/scm/map';
import type { ComparisonSemantic, SemanticStatus } from '@/types/scm/semantic';

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' ? (value as JsonRecord) : {};
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback;
}

function metric(
  label: string,
  value: number | string,
  status: SemanticStatus = 'NORMAL',
  unit?: string,
): MetricValue {
  return { label, value, status, unit };
}

function mapMetricDto(dto: unknown, fallbackLabel: string): MetricValue {
  const row = asRecord(dto);
  return {
    label: asString(row.label, fallbackLabel),
    value: row.value as number | string,
    unit: asString(row.unit) || undefined,
    status: (asString(row.status, 'NORMAL') as SemanticStatus),
    delta: typeof row.delta === 'number' ? row.delta : undefined,
    deltaUnit: asString(row.deltaUnit) || undefined,
    reason: asString(row.reason) || undefined,
  };
}

export function mapShipmentsPage(data: unknown): ShipmentsPageData {
  const row = asRecord(data);
  const pagination = asRecord(row.pagination);
  const items = Array.isArray(row.items) ? row.items : [];
  const page = asNumber(pagination.page ?? row.page, 1);
  const pageSize = asNumber(pagination.page_size ?? row.pageSize, 25);
  const mapped = items.map(mapShipmentSummary);
  const kpisRaw = asRecord(row.kpis);

  return {
    items: mapped,
    total: asNumber(pagination.total ?? row.total, items.length),
    page: Math.max(0, page - 1),
    pageSize,
    kpis: {
      active: mapMetricDto(kpisRaw.active ?? { label: 'Активные поставки', value: 0, status: 'NORMAL' }, 'Активные поставки'),
      atRisk: mapMetricDto(kpisRaw.atRisk ?? kpisRaw.at_risk ?? { label: KPI.atRisk, value: 0, status: 'NORMAL' }, KPI.atRisk),
      delayed: mapMetricDto(kpisRaw.delayed ?? { label: KPI.delayed, value: 0, status: 'NORMAL' }, KPI.delayed),
      noTracking: mapMetricDto(
        kpisRaw.noTracking ?? kpisRaw.no_tracking ?? { label: 'No Tracking', value: 0, status: 'NORMAL' },
        'No Tracking',
      ),
      avgDeviation: mapMetricDto(
        kpisRaw.avgDeviation ?? kpisRaw.avg_deviation ?? { label: 'Среднее отклонение ETA', value: 0, unit: ' мин', status: 'NORMAL' },
        'Среднее отклонение ETA',
      ),
      otifToday: mapMetricDto(
        kpisRaw.otifToday ?? kpisRaw.otif_today ?? { label: 'OTIF Today', value: '—', status: 'NO_DATA' },
        'OTIF Today',
      ),
    },
  };
}

export function mapShipmentSummary(dto: unknown): ShipmentSummary {
  const row = asRecord(dto);
  const status = asString(row.status, 'DRAFT') as ShipmentSummary['status'];
  const slaRisk = mapMetricDto(row.slaRisk ?? row.sla_risk, KPI.slaRisk);
  const riskStatus = (asString(row.riskStatus ?? row.risk_status, slaRisk.status) ||
    'NORMAL') as SemanticStatus;
  const progressByStatus: Record<string, number> = {
    PLANNED: 0.12,
    ASSIGNED: 0.28,
    ACCEPTED: 0.4,
    READY_FOR_PICKUP: 0.52,
    IN_TRANSIT: 0.72,
    ARRIVED: 0.88,
    DELIVERED: 1,
  };
  return {
    id: asString(row.id),
    supplierId: asString(row.supplierId ?? row.supplier_id),
    supplierName: asString(row.supplierName ?? row.supplier_name),
    carrierId: asString(row.carrierId ?? row.carrier_id),
    carrierName: asString(row.carrierName ?? row.carrier_name),
    origin: asString(row.origin),
    destination: asString(row.destination),
    status,
    pickupAt: asString(row.pickupAt ?? row.pickup_at),
    plannedEta: asString(row.plannedEta ?? row.planned_eta),
    forecastEta: asString(row.forecastEta ?? row.forecast_eta),
    deviationMinutes: asNumber(row.deviationMinutes ?? row.deviation_minutes),
    slaRisk,
    riskStatus,
    vehiclePlate: asString(row.vehiclePlate ?? row.vehicle_plate) || undefined,
    lastTrackingAt: asString(row.lastTrackingAt ?? row.last_tracking_at) || undefined,
    trackingStatus: (asString(row.trackingStatus ?? row.tracking_status, 'OK') ||
      'OK') as ShipmentSummary['trackingStatus'],
    progress: asNumber(row.progress, progressByStatus[status] ?? 0.1),
    warehouse: asString(row.warehouse) || undefined,
    routeLabel: asString(row.routeLabel ?? row.route_label) || undefined,
    availableActions: Array.isArray(row.availableActions ?? row.available_actions)
      ? ((row.availableActions ?? row.available_actions) as string[])
      : [],
  };
}

export function mapShipmentDetail(dto: unknown): ShipmentDetail {
  const row = asRecord(dto);
  const summary = mapShipmentSummary(row);
  return {
    ...summary,
    orderId: asString(row.orderId ?? row.order_id) || undefined,
    skus: Array.isArray(row.skus) ? (row.skus as ShipmentDetail['skus']) : [],
    exceptions: Array.isArray(row.exceptions) ? (row.exceptions as ShipmentDetail['exceptions']) : [],
    incidents: Array.isArray(row.incidents) ? (row.incidents as ShipmentDetail['incidents']) : [],
    timeline: Array.isArray(row.timeline) ? (row.timeline as ShipmentDetail['timeline']) : [],
    documents: Array.isArray(row.documents) ? (row.documents as ShipmentDetail['documents']) : [],
    activity: Array.isArray(row.activity) ? (row.activity as ShipmentDetail['activity']) : [],
    mapView: (row.mapView ?? row.map_view ?? { markers: [], routes: [], geofences: [] }) as LiveMapData,
    availableActions: Array.isArray(row.availableActions ?? row.available_actions)
      ? ((row.availableActions ?? row.available_actions) as string[])
      : [],
  };
}

export function mapControlTower(data: unknown): ControlTowerData {
  const row = asRecord(data);
  const kpis = Array.isArray(row.kpis)
    ? row.kpis.map((item) => mapMetricDto(item, asString(asRecord(item).label, 'KPI')))
    : [
        metric(KPI.otif, asString(row.otif, '0'), 'WARNING'),
        metric(KPI.activeShipments, asNumber(row.activeShipments ?? row.active_shipments), 'NORMAL'),
        metric(KPI.atRisk, asNumber(row.atRisk ?? row.at_risk), 'HIGH'),
        metric(KPI.delayed, asNumber(row.delayed), 'CRITICAL'),
        metric(KPI.stockoutRisk, asString(row.stockoutRisk ?? row.stockout_risk, '0'), 'WARNING', '%'),
        metric(KPI.averageDelay, asNumber(row.averageDelayMinutes ?? row.average_delay_minutes), 'WARNING', ' мин'),
      ];

  return {
    kpis,
    requiresAttention: Array.isArray(row.requiresAttention ?? row.requires_attention)
      ? ((row.requiresAttention ?? row.requires_attention) as ExceptionSummary[])
      : [],
    insights: Array.isArray(row.insights)
      ? (row.insights as ControlTowerData['insights'])
      : [],
    recentActivity: Array.isArray(row.recentActivity ?? row.recent_activity)
      ? ((row.recentActivity ?? row.recent_activity) as ControlTowerData['recentActivity'])
      : [],
    alertCounts: asRecord(row.alertCounts ?? row.alert_counts) as ControlTowerData['alertCounts'],
  };
}

export function mapExceptionsPage(items: unknown[]): ExceptionsPageData {
  const mapped = items.map(mapExceptionSummary);
  const counts: Record<ExceptionSeverity, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
    DATA_ISSUE: 0,
  };
  for (const item of mapped) {
    if (item.severity in counts) counts[item.severity] += 1;
  }
  return { items: mapped, total: mapped.length, counts };
}

export function mapExceptionSummary(dto: unknown): ExceptionSummary {
  const row = asRecord(dto);
  const severity = asString(row.severity, 'MEDIUM') as ExceptionSummary['severity'];
  return {
    id: asString(row.id),
    shipmentId: asString(row.shipmentId ?? row.shipment_id),
    type: asString(row.type),
    severity,
    severityStatus: asString(row.severityStatus ?? row.severity_status, severity) as SemanticStatus,
    deviation: asString(row.deviation),
    probability: asNumber(row.probability),
    impact: mapMetricDto(row.impact, 'Impact'),
    owner: asString(row.owner, '—'),
    createdAt: asString(row.createdAt ?? row.created_at),
    route: asString(row.route, '—'),
  };
}

export function mapExceptionDetail(dto: unknown): ExceptionDetail {
  const summary = mapExceptionSummary(dto);
  const row = asRecord(dto);
  return {
    ...summary,
    description: asString(row.description ?? row.reason, summary.deviation),
    causes: Array.isArray(row.causes) ? (row.causes as string[]) : [],
    affectedSkus: Array.isArray(row.affectedSkus)
      ? (row.affectedSkus as string[])
      : Array.isArray(row.affected_skus)
        ? (row.affected_skus as string[])
        : [],
    inventoryImpact: asString(row.inventoryImpact ?? row.inventory_impact) || undefined,
    orderImpact: asString(row.orderImpact ?? row.order_impact) || undefined,
    slaImpact: asString(row.slaImpact ?? row.sla_impact) || undefined,
    availableActions: Array.isArray(row.availableActions ?? row.available_actions)
      ? ((row.availableActions ?? row.available_actions) as string[])
      : ['CREATE_INCIDENT', 'CREATE_SCENARIO'],
  };
}

export function mapSuppliersPage(items: unknown[], page = 0, pageSize = 25): SuppliersPageData {
  const mapped = items.map(mapSupplierSummary);
  const start = page * pageSize;
  return {
    items: mapped.slice(start, start + pageSize),
    total: mapped.length,
    page,
    pageSize,
  };
}

export function mapSupplierSummary(dto: unknown): SupplierSummary {
  const row = asRecord(dto);
  return {
    id: asString(row.id),
    name: asString(row.name),
    status: asString(row.status, 'ACTIVE') as SupplierSummary['status'],
    statusSemantic: asString(row.statusSemantic ?? row.status_semantic, 'SUCCESS') as SemanticStatus,
    otif: mapMetricDto(row.otif, KPI.otif),
    reliability: mapMetricDto(row.reliability, KPI.reliability),
    leadTimeDays: mapMetricDto(row.leadTimeDays ?? row.lead_time_days, KPI.leadTime),
    supplyShare: mapMetricDto(row.supplyShare ?? row.supply_share, KPI.supplyShare),
    risk: mapMetricDto(row.risk, 'Риск'),
    openIncidents: asNumber(row.openIncidents ?? row.open_incidents),
    region: asString(row.region, '—'),
    productGroup: asString(row.productGroup ?? row.product_group, '—'),
  };
}

export function mapSupplierDetail(dto: unknown): SupplierDetail {
  const summary = mapSupplierSummary(dto);
  return {
    ...summary,
    contactEmail: asString(asRecord(dto).contactEmail, '—'),
    contactPhone: asString(asRecord(dto).contactPhone, '—'),
    address: asString(asRecord(dto).address, '—'),
    products: [],
    recentShipments: [],
    slaMetrics: [summary.otif, summary.reliability],
    risks: [],
    incidents: [],
  };
}

export function mapCarriersPage(items: unknown[], page = 0, pageSize = 25): CarriersPageData {
  const mapped = items.map(mapCarrierSummary);
  const start = page * pageSize;
  return {
    items: mapped.slice(start, start + pageSize),
    total: mapped.length,
    page,
    pageSize,
  };
}

export function mapCarrierSummary(dto: unknown): CarrierSummary {
  const row = asRecord(dto);
  return {
    id: asString(row.id),
    name: asString(row.name),
    otif: mapMetricDto(row.otif, KPI.otif),
    etaAccuracy: mapMetricDto(row.etaAccuracy ?? row.eta_accuracy, 'ETA Accuracy'),
    averageDelay: mapMetricDto(row.averageDelay ?? row.average_delay, KPI.averageDelay),
    routesCount: asNumber(row.routesCount ?? row.routes_count),
    shipmentCount: asNumber(row.shipmentCount ?? row.shipment_count),
    incidentRate: mapMetricDto(row.incidentRate ?? row.incident_rate, 'Incident Rate'),
    risk: mapMetricDto(row.risk, 'Риск'),
  };
}

export function mapCarrierDetail(dto: unknown): CarrierDetail {
  const summary = mapCarrierSummary(dto);
  return {
    ...summary,
    contactEmail: '—',
    vehiclesCount: 0,
    routes: [],
    recentShipments: [],
    incidents: [],
  };
}

export function mapIncidentsPage(items: unknown[], page = 0, pageSize = 25): IncidentsPageData {
  const mapped = items.map(mapIncidentSummary);
  const start = page * pageSize;
  return {
    items: mapped.slice(start, start + pageSize),
    total: mapped.length,
    page,
    pageSize,
  };
}

export function mapIncidentSummary(dto: unknown): IncidentSummary {
  const row = asRecord(dto);
  const createdAt = asString(row.createdAt ?? row.created_at, new Date().toISOString());
  return {
    id: asString(row.id),
    title: asString(row.title),
    status: asString(row.status, 'OPEN') as IncidentSummary['status'],
    severity: asString(row.severity, 'WARNING') as SemanticStatus,
    owner: asString(row.owner ?? row.assigneeId ?? row.assignee_id, '—'),
    shipmentId: asString(row.shipmentId ?? row.shipment_id) || undefined,
    participants: Array.isArray(row.participants) ? (row.participants as string[]) : [],
    createdAt,
    updatedAt: asString(row.updatedAt ?? row.updated_at, createdAt),
  };
}

export function mapIncidentComment(
  dto: unknown,
  fallback?: { name: string; role: string },
): IncidentComment {
  const row = asRecord(dto);
  return {
    id: asString(row.id),
    author: asString(row.author, fallback?.name ?? 'User'),
    role: asString(row.role, fallback?.role ?? '—'),
    message: asString(row.message),
    timestamp: asString(row.createdAt ?? row.created_at, new Date().toISOString()),
  };
}

export function mapIncidentDetail(dto: unknown): IncidentDetail {
  const summary = mapIncidentSummary(dto);
  const row = asRecord(dto);
  const commentsRaw = Array.isArray(row.comments) ? row.comments : [];
  return {
    ...summary,
    description: asString(row.description),
    relatedExceptionId: asString(row.exceptionId ?? row.exception_id) || undefined,
    timeline: [],
    comments: commentsRaw.map((comment) => mapIncidentComment(comment)),
    recommendedActions: [],
    availableActions: Array.isArray(row.availableActions ?? row.available_actions)
      ? ((row.availableActions ?? row.available_actions) as string[])
      : ['RESOLVE', 'CLOSE'],
  };
}

export function mapScenariosPage(items: unknown[]): ScenariosPageData {
  const mapped = items.map(mapScenarioSummary);
  return { items: mapped, total: mapped.length };
}

export function mapScenarioSummary(dto: unknown): ScenarioSummary {
  const row = asRecord(dto);
  return {
    id: asString(row.id),
    name: asString(row.name),
    createdBy: asString(row.createdBy ?? row.created_by, 'System'),
    status: asString(row.status, 'DRAFT') as ScenarioSummary['status'],
    basePlan: asString(row.basePlan ?? row.base_plan, '—'),
    createdAt: asString(row.createdAt ?? row.created_at, new Date().toISOString()),
    lastCalculation: asString(row.lastCalculation ?? row.last_calculation) || undefined,
    progress: typeof row.progress === 'number' ? row.progress : undefined,
    progressMessage: asString(row.progressMessage ?? row.progress_message) || undefined,
    recommendationStatus: (asString(row.recommendationStatus ?? row.recommendation_status) ||
      undefined) as ScenarioSummary['recommendationStatus'],
  };
}

export function mapScenarioDetail(dto: unknown): ScenarioDetail {
  const summary = mapScenarioSummary(dto);
  const row = asRecord(dto);
  return {
    ...summary,
    parameters: Array.isArray(row.parameters) ? (row.parameters as ScenarioDetail['parameters']) : [],
    kpis: Array.isArray(row.kpis) ? (row.kpis as ScenarioDetail['kpis']) : [],
    availableActions: Array.isArray(row.availableActions ?? row.available_actions)
      ? ((row.availableActions ?? row.available_actions) as string[])
      : ['RUN', 'COMPARE'],
  };
}

export function mapScenarioComparison(dto: unknown): ScenarioComparisonData {
  const row = asRecord(dto);
  const scenarios = Array.isArray(row.scenarios)
    ? row.scenarios.map((item) => {
        const s = asRecord(item);
        return { id: asString(s.id), name: asString(s.name) };
      })
    : [];
  const rows = Array.isArray(row.rows)
    ? row.rows.map((item) => {
        const r = asRecord(item);
        return {
          kpi: asString(r.kpi),
          baseline: asString(r.baseline),
          values: (r.values && typeof r.values === 'object' ? r.values : {}) as Record<string, string>,
          semantic: r.semantic && typeof r.semantic === 'object'
            ? (r.semantic as ScenarioComparisonData['rows'][number]['semantic'])
            : undefined,
        };
      })
    : [];
  const bestScenarioId = asString(row.bestScenarioId ?? row.best_scenario_id) || undefined;
  return { scenarios, rows, bestScenarioId };
}

export function mapRecommendation(dto: unknown, scenarioId: string, index: number): RecommendationItem | null {
  const row = asRecord(dto);
  const recommendation = asRecord(row.recommendation ?? row);
  if (!recommendation.action && !recommendation.description) return null;

  const effects = asRecord(recommendation.effects);
  const expectedEffects = Object.entries(effects).map(([label, value]) => {
    const effect = asRecord(value);
    return {
      label,
      baseline: asNumber(effect.before),
      unit: label === KPI.cost ? undefined : '%',
      values: {
        current: asNumber(effect.before),
        expected: asNumber(effect.after),
      },
      semantic: { expected: 'BEST' as const },
    };
  });

  return {
    id: asString(recommendation.id, `${scenarioId}-rec-${index}`),
    title: asString(recommendation.action, 'Recommendation'),
    description: asString(recommendation.description),
    expectedEffects,
    status: 'PENDING',
    availableActions: ['APPLY', 'CREATE_SCENARIO', 'REJECT'],
  };
}

export function mapNotifications(items: unknown[]): ScmNotification[] {
  return items.map((dto) => {
    const row = asRecord(dto);
    return {
      id: asString(row.id),
      title: asString(row.title),
      message: asString(row.message),
      read: Boolean(row.read ?? row.isRead ?? row.is_read),
      createdAt: asString(row.createdAt ?? row.created_at),
      link: asString(row.link, '/control-tower'),
    };
  });
}

export function mapAnalyticsOverview(controlTower: ControlTowerData, insights: unknown[]): AnalyticsOverviewData {
  return {
    kpis: controlTower.kpis.map((metricValue) => ({
      label: metricValue.label,
      metric: metricValue,
    })),
    otifTrend: [],
    topIssues: insights.slice(0, 5).map((item, index) => {
      const row = asRecord(item);
      return {
        label: asString(row.title, `Issue ${index + 1}`),
        value: -1,
        link: '/analytics/overview',
      };
    }),
  };
}

export function mapAnalyticsSection(section: string, payload: unknown): AnalyticsSectionData {
  const row = asRecord(payload);
  const items = Array.isArray(payload) ? payload : Array.isArray(row.items) ? row.items : [payload];
  return {
    title: section,
    kpis: items.slice(0, 4).map((item, index) => ({
      label: asString(asRecord(item).name, `Item ${index + 1}`),
      metric: metric('OTIF', asNumber(asRecord(item).otif, 0) * 100, 'NORMAL', '%'),
    })),
    chart: items.slice(0, 6).map((item, index) => ({
      label: asString(asRecord(item).name, `#${index + 1}`),
      value: asNumber(asRecord(item).otif, 0) * 100,
    })),
  };
}

export function mapSearchResults(groups: {
  shipments: ShipmentSummary[];
  suppliers: SupplierSummary[];
  carriers: CarrierSummary[];
  incidents: IncidentSummary[];
}): SearchResult[] {
  const results: SearchResult[] = [];
  for (const shipment of groups.shipments.slice(0, 5)) {
    results.push({
      id: shipment.id,
      type: 'shipment',
      label: shipment.id,
      subtitle: `${shipment.origin} → ${shipment.destination}`,
      link: `/shipments/${shipment.id}`,
    });
  }
  for (const supplier of groups.suppliers.slice(0, 3)) {
    results.push({
      id: supplier.id,
      type: 'supplier',
      label: supplier.name,
      subtitle: supplier.region,
      link: `/suppliers/${supplier.id}`,
    });
  }
  for (const carrier of groups.carriers.slice(0, 3)) {
    results.push({
      id: carrier.id,
      type: 'carrier',
      label: carrier.name,
      link: `/carriers/${carrier.id}`,
    });
  }
  for (const incident of groups.incidents.slice(0, 3)) {
    results.push({
      id: incident.id,
      type: 'incident',
      label: incident.title,
      link: `/incidents/${incident.id}`,
    });
  }
  return results;
}

export function mapSupplyPlan(plan: unknown, suppliers: SupplierSummary[]): SupplyPlanData {
  const row = asRecord(plan);
  const status = asString(row.status, 'DRAFT') as SupplyPlanData['status'];
  return {
    status,
    demand: metric('Спрос', '—', 'NORMAL'),
    requiredSupply: metric('Требуемые поставки', '—', 'NORMAL'),
    allocations: suppliers.slice(0, 3).map((supplier, index) => ({
      supplierId: supplier.id,
      supplierName: supplier.name,
      allocated: (index + 1) * 10000,
      capacity: (index + 2) * 10000,
      utilization: 0.7 + index * 0.1,
      status: supplier.risk.status ?? 'NORMAL',
    })),
    violations: [],
    availableActions: status === 'DRAFT' ? ['CALCULATE'] : status === 'CALCULATED' ? ['SUBMIT'] : ['APPROVE'],
  };
}

export function mapInventoryPlan(inventoryRows: unknown[]): InventoryPlanData {
  const items = inventoryRows.map((row) => {
    const item = asRecord(row);
    return {
      sku: asString(item.sku_id),
      name: asString(item.sku_id),
      currentStock: metric('Текущий запас', asNumber(item.current_stock), 'NORMAL'),
      incoming: metric('В пути', asNumber(item.incoming), 'NORMAL'),
      forecastDemand: metric('Прогноз спроса', '—', 'NORMAL'),
      safetyStock: metric('Страховой запас', asNumber(item.safety_stock), 'NORMAL'),
      daysOfSupply: metric('Дней запаса', asNumber(item.days_of_supply), 'WARNING'),
      stockoutRisk: metric(KPI.stockoutRisk, asNumber(item.stockout_probability) * 100, 'HIGH', '%'),
      incomingShipments: [],
    };
  });

  return { status: 'ACTIVE', items, series: [] };
}

export function mapTransportPlan(plan: unknown): TransportPlanData {
  const row = asRecord(plan);
  return {
    status: asString(row.status, 'DRAFT') as TransportPlanData['status'],
    lanes: [],
    availableActions: ['CALCULATE'],
  };
}

export function mapPlanFact(payload: unknown): PlanFactData {
  const row = asRecord(payload);
  const metrics = [];
  const otif = asRecord(row.otif);
  if (Object.keys(otif).length) {
    metrics.push({
      label: KPI.otif,
      baseline: asNumber(otif.plan) * 100,
      unit: '%',
      values: { plan: asNumber(otif.plan) * 100, fact: asNumber(otif.fact) * 100 },
      semantic: {
        fact: (asNumber(otif.delta) < 0 ? 'RISK' : 'BEST') as ComparisonSemantic,
      },
    });
  }
  const leadTime = asRecord(row.lead_time ?? row.leadTime);
  if (Object.keys(leadTime).length) {
    metrics.push({
      label: KPI.leadTime,
      baseline: asNumber(leadTime.plan),
      unit: ' ч',
      values: { plan: asNumber(leadTime.plan), fact: asNumber(leadTime.fact) },
    });
  }
  return { period: 'Q3', metrics };
}

export function mapDemandForecast(): DemandForecastData {
  return {
    period: 'Q3 2026',
    trend: 'STABLE',
    seasonality: '—',
    anomalies: [],
    series: [],
    version: 'v1',
    lastCalculated: new Date().toISOString(),
  };
}

export function mapLiveMap(network: unknown, shipments: ShipmentSummary[]): LiveMapData {
  const row = asRecord(network);
  const nodes = Array.isArray(row.nodes) ? row.nodes : [];
  const connections = Array.isArray(row.connections) ? row.connections : [];

  const nodeById = new Map<string, JsonRecord>();
  for (const node of nodes) {
    const n = asRecord(node);
    nodeById.set(asString(n.id), n);
  }

  const markers: LiveMapData['markers'] = [];
  for (const node of nodes) {
    const n = asRecord(node);
    const type = asString(n.type);
    markers.push({
      id: asString(n.id),
      label: asString(n.name),
      type: type.includes('WAREHOUSE') ? 'warehouses' : type.includes('HUB') ? 'hubs' : 'warehouses',
      lng: asNumber(n.longitude),
      lat: asNumber(n.latitude),
      status: 'NORMAL',
    });
  }

  for (const shipment of shipments) {
    const destNode = [...nodeById.values()].find((n) => asString(n.name) === shipment.destination);
    markers.push({
      id: `sh-${shipment.id}`,
      label: shipment.id,
      type: 'shipments',
      lng: asNumber(destNode?.longitude, 37.61),
      lat: asNumber(destNode?.latitude, 55.75),
      status: shipment.slaRisk.status ?? 'NORMAL',
      shipmentId: shipment.id,
      link: `/shipments/${shipment.id}`,
    });
  }

  const routes: LiveMapData['routes'] = connections.map((connection) => {
    const c = asRecord(connection);
    const source = nodeById.get(asString(c.source_node_id));
    const target = nodeById.get(asString(c.target_node_id));
    return {
      id: asString(c.id),
      label: `${asString(source?.name, '?')} → ${asString(target?.name, '?')}`,
      coordinates: [
        [asNumber(source?.longitude), asNumber(source?.latitude)],
        [asNumber(target?.longitude), asNumber(target?.latitude)],
      ] as [number, number][],
      status: 'NORMAL',
    };
  });

  return { markers, routes, geofences: [] };
}
