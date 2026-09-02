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
  getIncidentDetail,
  getScenarioDetail,
  getShipmentDetail,
  getSupplierDetail,
  INCIDENTS_MOCK,
  INVENTORY_PLAN_MOCK,
  NOTIFICATIONS_MOCK,
  PLAN_FACT_MOCK,
  RECOMMENDATIONS_MOCK,
  SCENARIOS_MOCK,
  searchEntities,
  SHIPMENTS_MOCK,
  SUPPLIERS_MOCK,
  SUPPLY_PLAN_MOCK,
  TRANSPORT_PLAN_MOCK,
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
import type { RecommendationItem, ScenarioFilters, ScenariosPageData } from '@/types/scm/scenario';
import type { ShipmentFilters, ShipmentsPageData } from '@/types/scm/shipment';
import type { SupplierFilters, SuppliersPageData } from '@/types/scm/supplier';

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

  if (filters.status === 'at-risk') {
    items = items.filter((s) => s.slaRisk.status === 'CRITICAL' || s.slaRisk.status === 'HIGH');
  }
  if (filters.carrier) {
    items = items.filter((s) => s.carrierId === filters.carrier);
  }
  if (filters.supplier) {
    items = items.filter((s) => s.supplierId === filters.supplier);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    items = items.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.supplierName.toLowerCase().includes(q) ||
        s.carrierName.toLowerCase().includes(q),
    );
  }

  const total = items.length;
  const start = page * pageSize;
  items = items.slice(start, start + pageSize);

  return { items, total, page, pageSize };
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

  const total = items.length;
  items = items.slice(page * pageSize, page * pageSize + pageSize);
  return { items, total, page, pageSize };
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

  const total = items.length;
  items = items.slice(page * pageSize, page * pageSize + pageSize);
  return { items, total, page, pageSize };
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

  const total = items.length;
  items = items.slice(page * pageSize, page * pageSize + pageSize);
  return { items, total, page, pageSize };
}

export async function fetchIncidentMock(id: string) {
  await delay(MOCK_DELAY);
  const detail = getIncidentDetail(id);
  if (!detail) throw new Error('Инцидент не найден');
  return detail;
}

export async function fetchDemandForecastMock(): Promise<DemandForecastData> {
  await delay(MOCK_DELAY);
  return DEMAND_FORECAST_MOCK;
}

export async function fetchSupplyPlanMock(): Promise<SupplyPlanData> {
  await delay(MOCK_DELAY);
  return SUPPLY_PLAN_MOCK;
}

export async function fetchInventoryPlanMock(): Promise<InventoryPlanData> {
  await delay(MOCK_DELAY);
  return INVENTORY_PLAN_MOCK;
}

export async function fetchTransportPlanMock(): Promise<TransportPlanData> {
  await delay(MOCK_DELAY);
  return TRANSPORT_PLAN_MOCK;
}

export async function fetchPlanFactMock(): Promise<PlanFactData> {
  await delay(MOCK_DELAY);
  return PLAN_FACT_MOCK;
}

export async function fetchScenariosMock(filters: ScenarioFilters = {}): Promise<ScenariosPageData> {
  await delay(MOCK_DELAY);
  let items = [...SCENARIOS_MOCK];
  if (filters.status) items = items.filter((s) => s.status === filters.status);
  return { items, total: items.length };
}

export async function fetchScenarioMock(id: string) {
  await delay(MOCK_DELAY);
  const detail = getScenarioDetail(id);
  if (!detail) throw new Error('Сценарий не найден');
  return detail;
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
