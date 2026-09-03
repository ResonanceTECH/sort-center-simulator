import { apiClient } from '@/api/client';
import {
  mapCarrierQueryParams,
  mapExceptionQueryParams,
  mapIncidentQueryParams,
  mapShipmentQueryParams,
  mapSupplierQueryParams,
} from '@/services/scm/scmQueryParams';
import type { CarrierFilters } from '@/types/scm/carrier';
import type { ExceptionFilters } from '@/types/scm/exception';
import type { IncidentFilters } from '@/types/scm/incident';
import type { ShipmentFilters } from '@/types/scm/shipment';
import type { SupplierFilters } from '@/types/scm/supplier';

export async function apiGetControlTower() {
  const { data } = await apiClient.get('/control-tower');
  return data;
}

export async function apiGetShipments(filters: ShipmentFilters = {}) {
  const { data } = await apiClient.get('/shipments', { params: mapShipmentQueryParams(filters) });
  return data;
}

export async function apiGetShipment(id: string) {
  const { data } = await apiClient.get(`/shipments/${encodeURIComponent(id)}`);
  return data;
}

export async function apiAssignCarrier(shipmentId: string, carrierId: string) {
  const { data } = await apiClient.post(`/shipments/${encodeURIComponent(shipmentId)}/assign-carrier`, {
    carrier_id: carrierId,
  });
  return data;
}

export async function apiCancelShipment(shipmentId: string) {
  const { data } = await apiClient.post(`/shipments/${encodeURIComponent(shipmentId)}/cancel`);
  return data;
}

export async function apiGetExceptions(filters: ExceptionFilters = {}) {
  const { data } = await apiClient.get('/exceptions', { params: mapExceptionQueryParams(filters) });
  return data;
}

export async function apiGetException(id: string) {
  const { data } = await apiClient.get(`/exceptions/${encodeURIComponent(id)}`);
  return data;
}

export async function apiGetSuppliers(filters: SupplierFilters = {}) {
  const { data } = await apiClient.get('/suppliers', { params: mapSupplierQueryParams(filters) });
  return data;
}

export async function apiGetSupplier(id: string) {
  const { data } = await apiClient.get(`/suppliers/${encodeURIComponent(id)}`);
  return data;
}

export async function apiGetCarriers(filters: CarrierFilters = {}) {
  const { data } = await apiClient.get('/carriers', { params: mapCarrierQueryParams(filters) });
  return data;
}

export async function apiGetCarrier(id: string) {
  const { data } = await apiClient.get(`/carriers/${encodeURIComponent(id)}`);
  return data;
}

export async function apiGetIncidents(filters: IncidentFilters = {}) {
  const { data } = await apiClient.get('/incidents', { params: mapIncidentQueryParams(filters) });
  return data;
}

export async function apiGetIncident(id: string) {
  const { data } = await apiClient.get(`/incidents/${encodeURIComponent(id)}`);
  return data;
}

export async function apiCreateIncident(payload: {
  title: string;
  description?: string;
  exception_id?: string;
  shipment_id?: string;
}) {
  const { data } = await apiClient.post('/incidents', payload);
  return data;
}

export async function apiResolveIncident(id: string) {
  const { data } = await apiClient.post(`/incidents/${encodeURIComponent(id)}/resolve`);
  return data;
}

export async function apiAddIncidentComment(incidentId: string, message: string) {
  const { data } = await apiClient.post(`/incidents/${encodeURIComponent(incidentId)}/comments`, {
    message,
  });
  return data;
}

export async function apiGetSupplyPlans() {
  const { data } = await apiClient.get('/supply-plans');
  return data;
}

export async function apiGetInventoryPlans() {
  const { data } = await apiClient.get('/inventory-plans');
  return data;
}

export async function apiGetTransportPlans() {
  const { data } = await apiClient.get('/transport-plans');
  return data;
}

export async function apiGetInventory() {
  const { data } = await apiClient.get('/inventory');
  return data;
}

export async function apiGetPlanFact(planId: string) {
  const { data } = await apiClient.get(`/plans/${encodeURIComponent(planId)}/plan-fact`);
  return data;
}

export async function apiGetScenarios() {
  const { data } = await apiClient.get('/scenarios');
  return data;
}

export async function apiGetScenario(scenarioId: string) {
  const { data } = await apiClient.get(`/scenarios/${encodeURIComponent(scenarioId)}`);
  return data;
}

export async function apiCreateScenario(payload: {
  name: string;
  base_plan_id?: string;
  parameters: Array<{ category: string; label: string; change: string }>;
}) {
  const { data } = await apiClient.post('/scenarios', payload);
  return data;
}

export async function apiRunScenario(scenarioId: string) {
  const { data } = await apiClient.post(`/scenarios/${encodeURIComponent(scenarioId)}/runs`);
  return data;
}

export async function apiGetScenarioRun(runId: string) {
  const { data } = await apiClient.get(`/scenario-runs/${encodeURIComponent(runId)}`);
  return data;
}

export async function apiCompareScenarios(scenarioIds: string[]) {
  const { data } = await apiClient.post('/scenarios/comparison', {
    scenario_ids: scenarioIds,
  });
  return data;
}

export async function apiGetScenarioRecommendations(scenarioId: string) {
  const { data } = await apiClient.get(`/scenarios/${encodeURIComponent(scenarioId)}/recommendations`);
  return data;
}

export async function apiApplyScenario(scenarioId: string) {
  const { data } = await apiClient.post(`/scenarios/${encodeURIComponent(scenarioId)}/apply`);
  return data;
}

export async function apiGetAnalyticsInsights() {
  const { data } = await apiClient.get('/analytics/insights');
  return data;
}

export async function apiGetAnalyticsSection(section: string) {
  const path =
    section === 'service' || section === 'service-level'
      ? '/analytics/service-level'
      : `/analytics/${section}`;
  const { data } = await apiClient.get(path);
  return data;
}

export async function apiGetNotifications() {
  const { data } = await apiClient.get('/notifications');
  return data;
}

export async function apiGetNetwork() {
  const { data } = await apiClient.get('/network');
  return data;
}
