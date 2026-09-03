import { delay } from '@/utils/error';
import {
  ANALYTICS_OVERVIEW_MOCK,
  CARRIERS_MOCK,
  CONTROL_TOWER_MOCK,
  DEMAND_FORECAST_MOCK,
  EXCEPTIONS_MOCK,
  getAnalyticsSection,
  getCarrierDetail,
  getExceptionDetail,
  getShipmentDetail,
  getSupplierDetail,
  INCIDENTS_MOCK,
  INVENTORY_PLAN_MOCK,
  NOTIFICATIONS_MOCK,
  PLAN_FACT_MOCK,
  RECOMMENDATIONS_MOCK,
  searchEntities,
  SHIPMENTS_MOCK,
  SUPPLIERS_MOCK,
} from '@/mocks/scm/scmData';
import type { AnalyticsOverviewData, AnalyticsSectionData } from '@/types/scm/analytics';
import type { CarrierFilters, CarriersPageData } from '@/types/scm/carrier';
import type { ControlTowerData } from '@/types/scm/controlTower';
import type { ExceptionFilters, ExceptionsPageData } from '@/types/scm/exception';
import type { IncidentFilters, IncidentsPageData } from '@/types/scm/incident';
import type {
  DemandForecastData,
  InventoryPlanData,
  PlanFactData,
  SupplyPlanData,
  TransportPlanData,
} from '@/types/scm/planning';
import type { CreateScenarioInput, RecommendationItem, ScenarioFilters, ScenariosPageData } from '@/types/scm/scenario';
import type { ShipmentFilters, ShipmentsPageData } from '@/types/scm/shipment';
import type { SupplierFilters, SuppliersPageData } from '@/types/scm/supplier';
import { paginateRows, sortRows } from '@/utils/tableSort';

const MOCK_DELAY = 400;

export async function fetchControlTowerMock(): Promise<ControlTowerData> {
  await delay(MOCK_DELAY);
  return CONTROL_TOWER_MOCK;
}

export async function fetchShipmentsMock(filters: ShipmentFilters = {}): Promise<ShipmentsPageData> {
  await delay(MOCK_DELAY);

  let items = [...SHIPMENTS_MOCK];
  const page = filters.page ?? 0;
  const pageSize = filters.pageSize ?? 25;

  if (filters.status === 'at-risk' || filters.risk === 'at-risk') {
    items = items.filter((s) => s.riskStatus === 'CRITICAL' || s.riskStatus === 'HIGH');
  } else if (filters.risk) {
    const risk = filters.risk.toUpperCase();
    items = items.filter((s) => {
      if (risk === 'MEDIUM') return s.riskStatus === 'WARNING';
      return s.riskStatus === risk;
    });
  }
  if (filters.status === 'in-transit') {
    items = items.filter((s) => s.status === 'IN_TRANSIT');
  } else if (filters.status === 'delayed') {
    items = items.filter((s) => s.deviationMinutes >= 30);
  } else if (
    filters.status &&
    filters.status !== 'at-risk' &&
    !['in-transit', 'delayed'].includes(filters.status)
  ) {
    items = items.filter((s) => s.status === filters.status);
  }
  if (filters.carrier) {
    items = items.filter((s) => s.carrierId === filters.carrier);
  }
  if (filters.supplier) {
    items = items.filter((s) => s.supplierId === filters.supplier);
  }
  if (filters.route) {
    items = items.filter((s) => (s.routeLabel ?? `${s.origin} → ${s.destination}`).includes(filters.route!));
  }
  if (filters.warehouse) {
    items = items.filter((s) => s.warehouse === filters.warehouse);
  }
  if (filters.trackingStatus === 'no_data' || filters.trackingStatus === 'NO_DATA') {
    items = items.filter((s) => s.trackingStatus === 'NO_DATA');
  } else if (filters.trackingStatus) {
    items = items.filter((s) => s.trackingStatus === filters.trackingStatus);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.supplierName.toLowerCase().includes(q) ||
        s.carrierName.toLowerCase().includes(q) ||
        s.origin.toLowerCase().includes(q) ||
        s.destination.toLowerCase().includes(q),
    );
  }

  // Ops KPIs from full unfiltered universe (backend responsibility)
  const universe = SHIPMENTS_MOCK.filter((s) => s.status !== 'CANCELLED');
  const active = universe.filter((s) => s.status !== 'DELIVERED');
  const atRisk = active.filter((s) => s.riskStatus === 'HIGH' || s.riskStatus === 'CRITICAL');
  const delayed = active.filter((s) => s.deviationMinutes >= 30);
  const noTracking = active.filter((s) => s.trackingStatus === 'NO_DATA');
  const avgDev =
    active.length === 0
      ? 0
      : Math.round(active.reduce((sum, s) => sum + s.deviationMinutes, 0) / active.length);

  items = sortRows(items, filters.sortBy, filters.sortDir ?? 'asc');
  const pageData = paginateRows(items, page, pageSize);

  return {
    ...pageData,
    kpis: {
      active: { label: 'Активные поставки', value: active.length, status: 'NORMAL' },
      atRisk: { label: 'At Risk', value: atRisk.length, status: atRisk.length ? 'HIGH' : 'SUCCESS' },
      delayed: { label: 'Delayed', value: delayed.length, status: delayed.length ? 'CRITICAL' : 'SUCCESS' },
      noTracking: {
        label: 'No Tracking',
        value: noTracking.length,
        status: noTracking.length ? 'WARNING' : 'SUCCESS',
      },
      avgDeviation: {
        label: 'Среднее отклонение ETA',
        value: avgDev,
        unit: ' мин',
        status: avgDev > 45 ? 'WARNING' : 'NORMAL',
      },
      otifToday: { label: 'OTIF Today', value: '91.4', unit: '%', status: 'WARNING' },
    },
  };
}

export async function fetchShipmentMock(id: string) {
  await delay(MOCK_DELAY);
  const detail = getShipmentDetail(id);
  if (!detail) throw new Error('Поставка не найдена');
  return detail;
}

export async function fetchExceptionsMock(filters: ExceptionFilters = {}): Promise<ExceptionsPageData> {
  await delay(MOCK_DELAY);

  let items = [...EXCEPTIONS_MOCK];
  if (filters.severity) {
    items = items.filter((e) => e.severity === filters.severity);
  }

  const counts = {
    CRITICAL: items.filter((e) => e.severity === 'CRITICAL').length,
    HIGH: items.filter((e) => e.severity === 'HIGH').length,
    MEDIUM: items.filter((e) => e.severity === 'MEDIUM').length,
    LOW: items.filter((e) => e.severity === 'LOW').length,
    DATA_ISSUE: items.filter((e) => e.severity === 'DATA_ISSUE').length,
  };

  return { items, total: items.length, counts };
}

export async function fetchExceptionMock(id: string) {
  await delay(MOCK_DELAY);
  const detail = getExceptionDetail(id);
  if (!detail) throw new Error('Отклонение не найдено');
  return detail;
}

export async function fetchSuppliersMock(filters: SupplierFilters = {}): Promise<SuppliersPageData> {
  await delay(MOCK_DELAY);
  let items = [...SUPPLIERS_MOCK];
  const page = filters.page ?? 0;
  const pageSize = filters.pageSize ?? 25;

  if (filters.status) items = items.filter((s) => s.status === filters.status);
  if (filters.risk) items = items.filter((s) => s.risk.value === filters.risk);
  if (filters.region) items = items.filter((s) => s.region === filters.region);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((s) => s.name.toLowerCase().includes(q));
  }

  items = sortRows(items, filters.sortBy, filters.sortDir ?? 'asc');
  return paginateRows(items, page, pageSize);
}

export async function fetchSupplierMock(id: string) {
  await delay(MOCK_DELAY);
  const detail = getSupplierDetail(id);
  if (!detail) throw new Error('Поставщик не найден');
  return detail;
}

export async function fetchCarriersMock(filters: CarrierFilters = {}): Promise<CarriersPageData> {
  await delay(MOCK_DELAY);
  let items = [...CARRIERS_MOCK];
  const page = filters.page ?? 0;
  const pageSize = filters.pageSize ?? 25;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((c) => c.name.toLowerCase().includes(q));
  }

  items = sortRows(items, filters.sortBy, filters.sortDir ?? 'asc');
  return paginateRows(items, page, pageSize);
}

export async function fetchCarrierMock(id: string) {
  await delay(MOCK_DELAY);
  const detail = getCarrierDetail(id);
  if (!detail) throw new Error('Перевозчик не найден');
  return detail;
}

export async function fetchIncidentsMock(filters: IncidentFilters = {}): Promise<IncidentsPageData> {
  await delay(MOCK_DELAY);
  let items = [...INCIDENTS_MOCK];
  const page = filters.page ?? 0;
  const pageSize = filters.pageSize ?? 25;

  if (filters.status) items = items.filter((i) => i.status === filters.status);
  if (filters.severity) items = items.filter((i) => i.severity === filters.severity);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter((i) => i.title.toLowerCase().includes(q) || i.id.toLowerCase().includes(q));
  }

  items = sortRows(items, filters.sortBy, filters.sortDir ?? 'asc');
  return paginateRows(items, page, pageSize);
}

export async function fetchIncidentMock(id: string) {
  await delay(MOCK_DELAY);
  const { getIncidentWithComments } = await import('@/mocks/scm/incidentState');
  const detail = getIncidentWithComments(id);
  if (!detail) throw new Error('Инцидент не найден');
  return detail;
}

export async function addIncidentCommentMock(
  incidentId: string,
  message: string,
  author?: { name: string; role: string },
) {
  await delay(MOCK_DELAY);
  const { addIncidentCommentState } = await import('@/mocks/scm/incidentState');
  return addIncidentCommentState(
    incidentId,
    message,
    author?.name ?? 'Вы',
    author?.role ?? 'Manager',
  );
}

export async function fetchDemandForecastMock(): Promise<DemandForecastData> {
  await delay(MOCK_DELAY);
  return DEMAND_FORECAST_MOCK;
}

export async function fetchSupplyPlanMock(): Promise<SupplyPlanData> {
  await delay(MOCK_DELAY);
  const { getSupplyPlanState } = await import('@/mocks/scm/planState');
  return getSupplyPlanState();
}

export async function fetchInventoryPlanMock(): Promise<InventoryPlanData> {
  await delay(MOCK_DELAY);
  return INVENTORY_PLAN_MOCK;
}

export async function fetchTransportPlanMock(): Promise<TransportPlanData> {
  await delay(MOCK_DELAY);
  const { getTransportPlanState } = await import('@/mocks/scm/planState');
  return getTransportPlanState();
}

export async function fetchPlanFactMock(): Promise<PlanFactData> {
  await delay(MOCK_DELAY);
  return PLAN_FACT_MOCK;
}

export async function fetchScenariosMock(filters: ScenarioFilters = {}): Promise<ScenariosPageData> {
  await delay(MOCK_DELAY);
  const { listScenarioState } = await import('@/mocks/scm/scenarioState');
  let items = listScenarioState();
  if (filters.status) items = items.filter((s) => s.status === filters.status);
  return { items, total: items.length };
}

export async function fetchScenarioMock(id: string) {
  await delay(MOCK_DELAY);
  const { getScenarioState } = await import('@/mocks/scm/scenarioState');
  const detail = getScenarioState(id);
  if (!detail) throw new Error('Сценарий не найден');
  return detail;
}

export async function createScenarioMock(input: CreateScenarioInput) {
  await delay(MOCK_DELAY);
  const { createScenarioState } = await import('@/mocks/scm/scenarioState');
  return createScenarioState(input);
}

export async function runScenarioMock(id: string) {
  const { runScenarioState } = await import('@/mocks/scm/scenarioState');
  return runScenarioState(id);
}

export async function compareScenariosMock(ids: string[]) {
  await delay(MOCK_DELAY);
  const { compareScenariosState } = await import('@/mocks/scm/scenarioState');
  return compareScenariosState(ids);
}

export async function fetchRecommendationsMock(): Promise<RecommendationItem[]> {
  await delay(MOCK_DELAY);
  return RECOMMENDATIONS_MOCK;
}

export async function fetchAnalyticsOverviewMock(): Promise<AnalyticsOverviewData> {
  await delay(MOCK_DELAY);
  return ANALYTICS_OVERVIEW_MOCK;
}

export async function fetchAnalyticsSectionMock(section: string): Promise<AnalyticsSectionData> {
  await delay(MOCK_DELAY);
  return getAnalyticsSection(section);
}

export async function fetchGlobalSearchMock(query: string) {
  await delay(200);
  return searchEntities(query);
}

export async function fetchNotificationsMock() {
  await delay(MOCK_DELAY);
  return NOTIFICATIONS_MOCK;
}

export async function changeCarrierMock(shipmentId: string, carrierId: string) {
  await delay(MOCK_DELAY);
  return { shipmentId, carrierId, success: true };
}

export async function cancelShipmentMock(shipmentId: string) {
  await delay(MOCK_DELAY);
  return { shipmentId, status: 'CANCELLED' as const };
}

export async function resolveIncidentMock(incidentId: string) {
  await delay(MOCK_DELAY);
  return { incidentId, status: 'RESOLVED' as const };
}

export async function applyRecommendationMock(recommendationId: string) {
  await delay(MOCK_DELAY);
  return { recommendationId, status: 'APPLIED' as const };
}

export async function createIncidentFromExceptionMock(exceptionId: string) {
  await delay(MOCK_DELAY);
  return { incidentId: 'inc-new', exceptionId };
}

export async function fetchLiveMapMock() {
  await delay(MOCK_DELAY);
  const { getLiveMapData } = await import('@/mocks/scm/mapData');
  return getLiveMapData();
}

export async function executePlanActionMock(
  planKind: 'supply' | 'transport',
  action: string,
) {
  await delay(MOCK_DELAY);
  const { applyPlanAction } = await import('@/mocks/scm/planState');
  return applyPlanAction(planKind, action as import('@/constants/planActions').PlanAction);
}
