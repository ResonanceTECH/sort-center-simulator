import { useApiMocks } from '@/config/env';
import * as mock from '@/services/scm/scmMock';
import type { ExceptionFilters } from '@/types/scm/exception';
import type { IncidentFilters } from '@/types/scm/incident';
import type { ScenarioFilters } from '@/types/scm/scenario';
import type { ShipmentFilters } from '@/types/scm/shipment';
import type { CarrierFilters } from '@/types/scm/carrier';
import type { SupplierFilters } from '@/types/scm/supplier';

export async function fetchControlTower() {
  if (useApiMocks()) return mock.fetchControlTowerMock();
  throw new Error('Control Tower API not implemented');
}

export async function fetchShipments(filters: ShipmentFilters = {}) {
  if (useApiMocks()) return mock.fetchShipmentsMock(filters);
  throw new Error('Shipments API not implemented');
}

export async function fetchShipment(id: string) {
  if (useApiMocks()) return mock.fetchShipmentMock(id);
  throw new Error('Shipment API not implemented');
}

export async function fetchExceptions(filters: ExceptionFilters = {}) {
  if (useApiMocks()) return mock.fetchExceptionsMock(filters);
  throw new Error('Exceptions API not implemented');
}

export async function fetchException(id: string) {
  if (useApiMocks()) return mock.fetchExceptionMock(id);
  throw new Error('Exception API not implemented');
}

export async function fetchSuppliers(filters: SupplierFilters = {}) {
  if (useApiMocks()) return mock.fetchSuppliersMock(filters);
  throw new Error('Suppliers API not implemented');
}

export async function fetchSupplier(id: string) {
  if (useApiMocks()) return mock.fetchSupplierMock(id);
  throw new Error('Supplier API not implemented');
}

export async function fetchCarriers(filters: CarrierFilters = {}) {
  if (useApiMocks()) return mock.fetchCarriersMock(filters);
  throw new Error('Carriers API not implemented');
}

export async function fetchCarrier(id: string) {
  if (useApiMocks()) return mock.fetchCarrierMock(id);
  throw new Error('Carrier API not implemented');
}

export async function fetchIncidents(filters: IncidentFilters = {}) {
  if (useApiMocks()) return mock.fetchIncidentsMock(filters);
  throw new Error('Incidents API not implemented');
}

export async function fetchIncident(id: string) {
  if (useApiMocks()) return mock.fetchIncidentMock(id);
  throw new Error('Incident API not implemented');
}

export async function fetchDemandForecast() {
  if (useApiMocks()) return mock.fetchDemandForecastMock();
  throw new Error('Demand Forecast API not implemented');
}

export async function fetchSupplyPlan() {
  if (useApiMocks()) return mock.fetchSupplyPlanMock();
  throw new Error('Supply Plan API not implemented');
}

export async function fetchInventoryPlan() {
  if (useApiMocks()) return mock.fetchInventoryPlanMock();
  throw new Error('Inventory Plan API not implemented');
}

export async function fetchTransportPlan() {
  if (useApiMocks()) return mock.fetchTransportPlanMock();
  throw new Error('Transport Plan API not implemented');
}

export async function fetchPlanFact() {
  if (useApiMocks()) return mock.fetchPlanFactMock();
  throw new Error('Plan/Fact API not implemented');
}

export async function fetchScenarios(filters: ScenarioFilters = {}) {
  if (useApiMocks()) return mock.fetchScenariosMock(filters);
  throw new Error('Scenarios API not implemented');
}

export async function fetchScenario(id: string) {
  if (useApiMocks()) return mock.fetchScenarioMock(id);
  throw new Error('Scenario API not implemented');
}

export async function fetchRecommendations() {
  if (useApiMocks()) return mock.fetchRecommendationsMock();
  throw new Error('Recommendations API not implemented');
}

export async function fetchAnalyticsOverview() {
  if (useApiMocks()) return mock.fetchAnalyticsOverviewMock();
  throw new Error('Analytics API not implemented');
}

export async function fetchAnalyticsSection(section: string) {
  if (useApiMocks()) return mock.fetchAnalyticsSectionMock(section);
  throw new Error('Analytics API not implemented');
}

export async function fetchGlobalSearch(query: string) {
  if (useApiMocks()) return mock.fetchGlobalSearchMock(query);
  throw new Error('Search API not implemented');
}

export async function fetchNotifications() {
  if (useApiMocks()) return mock.fetchNotificationsMock();
  throw new Error('Notifications API not implemented');
}

export async function changeCarrier(shipmentId: string, carrierId: string) {
  if (useApiMocks()) return mock.changeCarrierMock(shipmentId, carrierId);
  throw new Error('Shipment API not implemented');
}

export async function cancelShipment(shipmentId: string) {
  if (useApiMocks()) return mock.cancelShipmentMock(shipmentId);
  throw new Error('Shipment API not implemented');
}

export async function resolveIncident(incidentId: string) {
  if (useApiMocks()) return mock.resolveIncidentMock(incidentId);
  throw new Error('Incident API not implemented');
}

export async function applyRecommendation(recommendationId: string) {
  if (useApiMocks()) return mock.applyRecommendationMock(recommendationId);
  throw new Error('Recommendation API not implemented');
}

export async function createIncidentFromException(exceptionId: string) {
  if (useApiMocks()) return mock.createIncidentFromExceptionMock(exceptionId);
  throw new Error('Incident API not implemented');
}
