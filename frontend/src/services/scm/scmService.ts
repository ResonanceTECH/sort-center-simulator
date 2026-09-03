import { useApiMocks } from '@/config/env';
import * as api from '@/services/scm/scmApi';
import * as mock from '@/services/scm/scmMock';
import * as mappers from '@/services/scm/scmMappers';
import type { ExceptionFilters } from '@/types/scm/exception';
import type { IncidentFilters } from '@/types/scm/incident';
import type { CreateScenarioInput, ScenarioFilters } from '@/types/scm/scenario';
import type { ShipmentFilters } from '@/types/scm/shipment';
import type { CarrierFilters } from '@/types/scm/carrier';
import type { SupplierFilters } from '@/types/scm/supplier';

export async function fetchControlTower() {
  if (useApiMocks()) return mock.fetchControlTowerMock();
  const data = await api.apiGetControlTower();
  return mappers.mapControlTower(data);
}

export async function fetchShipments(filters: ShipmentFilters = {}) {
  if (useApiMocks()) return mock.fetchShipmentsMock(filters);
  const data = await api.apiGetShipments(filters);
  return mappers.mapShipmentsPage(data);
}

export async function fetchShipment(id: string) {
  if (useApiMocks()) return mock.fetchShipmentMock(id);
  const data = await api.apiGetShipment(id);
  return mappers.mapShipmentDetail(data);
}

export async function fetchExceptions(filters: ExceptionFilters = {}) {
  if (useApiMocks()) return mock.fetchExceptionsMock(filters);
  const data = await api.apiGetExceptions(filters);
  const items = Array.isArray(data) ? data : [];
  return mappers.mapExceptionsPage(items);
}

export async function fetchException(id: string) {
  if (useApiMocks()) return mock.fetchExceptionMock(id);
  const data = await api.apiGetException(id);
  return mappers.mapExceptionDetail(data);
}

export async function fetchSuppliers(filters: SupplierFilters = {}) {
  if (useApiMocks()) return mock.fetchSuppliersMock(filters);
  const data = await api.apiGetSuppliers(filters);
  const items = Array.isArray(data) ? data : [];
  return mappers.mapSuppliersPage(items, filters.page, filters.pageSize);
}

export async function fetchSupplier(id: string) {
  if (useApiMocks()) return mock.fetchSupplierMock(id);
  const data = await api.apiGetSupplier(id);
  return mappers.mapSupplierDetail(data);
}

export async function fetchCarriers(filters: CarrierFilters = {}) {
  if (useApiMocks()) return mock.fetchCarriersMock(filters);
  const data = await api.apiGetCarriers(filters);
  const items = Array.isArray(data) ? data : [];
  return mappers.mapCarriersPage(items, filters.page, filters.pageSize);
}

export async function fetchCarrier(id: string) {
  if (useApiMocks()) return mock.fetchCarrierMock(id);
  const data = await api.apiGetCarrier(id);
  return mappers.mapCarrierDetail(data);
}

export async function fetchIncidents(filters: IncidentFilters = {}) {
  if (useApiMocks()) return mock.fetchIncidentsMock(filters);
  const data = await api.apiGetIncidents(filters);
  const items = Array.isArray(data) ? data : [];
  return mappers.mapIncidentsPage(items, filters.page, filters.pageSize);
}

export async function fetchIncident(id: string) {
  if (useApiMocks()) return mock.fetchIncidentMock(id);
  const data = await api.apiGetIncident(id);
  return mappers.mapIncidentDetail(data);
}

export async function fetchDemandForecast() {
  if (useApiMocks()) return mock.fetchDemandForecastMock();
  return mappers.mapDemandForecast();
}

export async function fetchSupplyPlan() {
  if (useApiMocks()) return mock.fetchSupplyPlanMock();
  const [plans, suppliersData] = await Promise.all([
    api.apiGetSupplyPlans(),
    api.apiGetSuppliers({}),
  ]);
  const planList = Array.isArray(plans) ? plans : [];
  const activePlan = planList.find((p) => p.status === 'ACTIVE') ?? planList[0] ?? { status: 'DRAFT' };
  const suppliers = mappers.mapSuppliersPage(Array.isArray(suppliersData) ? suppliersData : []).items;
  return mappers.mapSupplyPlan(activePlan, suppliers);
}

export async function fetchInventoryPlan() {
  if (useApiMocks()) return mock.fetchInventoryPlanMock();
  const [plans, inventory] = await Promise.all([api.apiGetInventoryPlans(), api.apiGetInventory()]);
  const planList = Array.isArray(plans) ? plans : [];
  const activePlan = planList.find((p) => p.status === 'ACTIVE') ?? planList[0];
  const inventoryRows = Array.isArray(inventory) ? inventory : [];
  const mapped = mappers.mapInventoryPlan(inventoryRows);
  if (activePlan?.status) mapped.status = activePlan.status;
  return mapped;
}

export async function fetchTransportPlan() {
  if (useApiMocks()) return mock.fetchTransportPlanMock();
  const plans = await api.apiGetTransportPlans();
  const planList = Array.isArray(plans) ? plans : [];
  const activePlan = planList.find((p) => p.status === 'ACTIVE') ?? planList[0] ?? { status: 'DRAFT' };
  return mappers.mapTransportPlan(activePlan);
}

export async function fetchPlanFact() {
  if (useApiMocks()) return mock.fetchPlanFactMock();
  const plans = await api.apiGetSupplyPlans();
  const planList = Array.isArray(plans) ? plans : [];
  const activePlan = planList.find((p) => p.status === 'ACTIVE') ?? planList[0];
  if (!activePlan?.id) return mappers.mapPlanFact({});
  const data = await api.apiGetPlanFact(activePlan.id);
  return mappers.mapPlanFact(data);
}

export async function fetchScenarios(_filters: ScenarioFilters = {}) {
  if (useApiMocks()) return mock.fetchScenariosMock(_filters);
  const data = await api.apiGetScenarios();
  return mappers.mapScenariosPage(Array.isArray(data) ? data : []);
}

export async function fetchScenario(id: string) {
  if (useApiMocks()) return mock.fetchScenarioMock(id);
  const data = await api.apiGetScenario(id);
  return mappers.mapScenarioDetail(data);
}

export async function compareScenarios(scenarioIds: string[]) {
  if (useApiMocks()) return mock.compareScenariosMock(scenarioIds);
  const data = await api.apiCompareScenarios(scenarioIds);
  return mappers.mapScenarioComparison(data);
}

export async function createScenario(input: CreateScenarioInput) {
  if (useApiMocks()) return mock.createScenarioMock(input);
  const data = await api.apiCreateScenario({
    name: input.name,
    parameters: input.parameters.map((p) => ({
      category: p.category,
      label: p.label,
      change: p.change,
    })),
  });
  return mappers.mapScenarioDetail({ ...data, parameters: input.parameters, kpis: [], available_actions: ['RUN', 'COMPARE'] });
}

const RUN_POLL_INTERVAL_MS = 500;
const RUN_POLL_TIMEOUT_MS = 15_000;

export async function runScenario(scenarioId: string) {
  if (useApiMocks()) return mock.runScenarioMock(scenarioId);

  const queued = await api.apiRunScenario(scenarioId);
  const runId = queued.run_id ?? queued.runId;
  if (!runId) throw new Error('Не удалось запустить сценарий');

  const started = Date.now();
  while (Date.now() - started < RUN_POLL_TIMEOUT_MS) {
    const run = await api.apiGetScenarioRun(runId);
    const status = run.status as string;
    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      return { runId, status, scenarioId };
    }
    await new Promise((resolve) => setTimeout(resolve, RUN_POLL_INTERVAL_MS));
  }

  return { runId, status: 'RUNNING', scenarioId };
}

export async function fetchRecommendations() {
  if (useApiMocks()) return mock.fetchRecommendationsMock();
  const scenarios = await api.apiGetScenarios();
  const list = Array.isArray(scenarios) ? scenarios : [];
  const recommendations = [];
  for (const [index, scenario] of list.slice(0, 5).entries()) {
    const payload = await api.apiGetScenarioRecommendations(scenario.id);
    const mapped = mappers.mapRecommendation(payload, scenario.id, index);
    if (mapped) recommendations.push(mapped);
  }
  return recommendations;
}

export async function fetchAnalyticsOverview() {
  if (useApiMocks()) return mock.fetchAnalyticsOverviewMock();
  const [controlTower, insightsPayload] = await Promise.all([
    fetchControlTower(),
    api.apiGetAnalyticsInsights(),
  ]);
  const insights = Array.isArray(insightsPayload?.items) ? insightsPayload.items : [];
  return mappers.mapAnalyticsOverview(controlTower, insights);
}

export async function fetchAnalyticsSection(section: string) {
  if (useApiMocks()) return mock.fetchAnalyticsSectionMock(section);
  const data = await api.apiGetAnalyticsSection(section);
  return mappers.mapAnalyticsSection(section, data);
}

export async function fetchGlobalSearch(query: string) {
  if (useApiMocks()) return mock.fetchGlobalSearchMock(query);
  const q = query.trim();
  if (q.length < 2) return [];

  const [shipments, suppliers, carriers, incidents] = await Promise.all([
    fetchShipments({ search: q, page: 0, pageSize: 5 }),
    fetchSuppliers({ search: q, page: 0, pageSize: 5 }),
    fetchCarriers({ search: q, page: 0, pageSize: 5 }),
    fetchIncidents({ search: q, page: 0, pageSize: 5 }),
  ]);

  return mappers.mapSearchResults({
    shipments: shipments.items,
    suppliers: suppliers.items,
    carriers: carriers.items,
    incidents: incidents.items,
  });
}

export async function fetchNotifications() {
  if (useApiMocks()) return mock.fetchNotificationsMock();
  const data = await api.apiGetNotifications();
  return mappers.mapNotifications(Array.isArray(data) ? data : []);
}

export async function changeCarrier(shipmentId: string, carrierId: string) {
  if (useApiMocks()) return mock.changeCarrierMock(shipmentId, carrierId);
  const data = await api.apiAssignCarrier(shipmentId, carrierId);
  return { shipmentId, carrierId, success: true, shipment: mappers.mapShipmentDetail(data) };
}

export async function cancelShipment(shipmentId: string) {
  if (useApiMocks()) return mock.cancelShipmentMock(shipmentId);
  const data = await api.apiCancelShipment(shipmentId);
  return { shipmentId, status: mappers.mapShipmentDetail(data).status };
}

export async function resolveIncident(incidentId: string) {
  if (useApiMocks()) return mock.resolveIncidentMock(incidentId);
  const data = await api.apiResolveIncident(incidentId);
  return { incidentId, status: data.status ?? 'RESOLVED' };
}

export async function addIncidentComment(
  incidentId: string,
  message: string,
  author?: { name: string; role: string },
) {
  if (useApiMocks()) return mock.addIncidentCommentMock(incidentId, message, author);
  const data = await api.apiAddIncidentComment(incidentId, message);
  return mappers.mapIncidentComment(data, author);
}

export async function applyRecommendation(recommendationId: string) {
  if (useApiMocks()) return mock.applyRecommendationMock(recommendationId);
  const scenarioId = recommendationId.split('-rec-')[0];
  if (!scenarioId) throw new Error('Не удалось определить сценарий');
  const data = await api.apiApplyScenario(scenarioId);
  return { recommendationId, status: 'APPLIED', planId: data.plan_id ?? data.planId };
}

export async function createIncidentFromException(exceptionId: string) {
  if (useApiMocks()) return mock.createIncidentFromExceptionMock(exceptionId);
  const exception = await fetchException(exceptionId);
  const created = await api.apiCreateIncident({
    title: `Инцидент: ${exception.type}`,
    description: exception.description,
    exception_id: exceptionId,
    shipment_id: exception.shipmentId || undefined,
  });
  return { incidentId: created.id, exceptionId };
}

export async function fetchLiveMap() {
  if (useApiMocks()) return mock.fetchLiveMapMock();
  const [network, shipments] = await Promise.all([
    api.apiGetNetwork(),
    fetchShipments({ status: 'in-transit', page: 0, pageSize: 100 }),
  ]);
  return mappers.mapLiveMap(network, shipments.items);
}

export async function executePlanAction(planKind: 'supply' | 'transport', action: string) {
  if (useApiMocks()) return mock.executePlanActionMock(planKind, action);
  // Backend plan workflow endpoints are not wired yet — refresh current plan state after action.
  if (planKind === 'supply') await fetchSupplyPlan();
  else await fetchTransportPlan();
  return { planKind, action, status: 'QUEUED' };
}
