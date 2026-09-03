import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/app/queryClient';
import {
  fetchAnalyticsOverview,
  fetchAnalyticsSection,
  fetchGlobalSearch,
  fetchNotifications,
  fetchCarrier,
  fetchCarriers,
  fetchControlTower,
  fetchDemandForecast,
  fetchException,
  fetchExceptions,
  fetchIncident,
  fetchIncidents,
  fetchInventoryPlan,
  fetchPlanFact,
  fetchRecommendations,
  fetchScenario,
  fetchScenarios,
  compareScenarios,
  fetchShipment,
  fetchShipments,
  fetchSupplier,
  fetchSuppliers,
  fetchSupplyPlan,
  fetchTransportPlan,
} from '@/services/scm/scmService';
import type { CarrierFilters } from '@/types/scm/carrier';
import type { ExceptionFilters } from '@/types/scm/exception';
import type { IncidentFilters } from '@/types/scm/incident';
import type { ScenarioFilters } from '@/types/scm/scenario';
import type { ShipmentFilters } from '@/types/scm/shipment';
import type { SupplierFilters } from '@/types/scm/supplier';

export function useControlTowerQuery() {
  return useQuery({ queryKey: queryKeys.controlTower, queryFn: fetchControlTower });
}

export function useShipmentsQuery(filters: ShipmentFilters) {
  return useQuery({ queryKey: queryKeys.shipments(filters), queryFn: () => fetchShipments(filters) });
}

export function useShipmentQuery(id: string) {
  return useQuery({ queryKey: queryKeys.shipment(id), queryFn: () => fetchShipment(id), enabled: Boolean(id) });
}

export function useExceptionsQuery(filters: ExceptionFilters = {}) {
  return useQuery({ queryKey: queryKeys.exceptions(filters), queryFn: () => fetchExceptions(filters) });
}

export function useExceptionQuery(id: string) {
  return useQuery({ queryKey: queryKeys.exception(id), queryFn: () => fetchException(id), enabled: Boolean(id) });
}

export function useSuppliersQuery(filters: SupplierFilters) {
  return useQuery({ queryKey: queryKeys.suppliers(filters), queryFn: () => fetchSuppliers(filters) });
}

export function useSupplierQuery(id: string) {
  return useQuery({ queryKey: queryKeys.supplier(id), queryFn: () => fetchSupplier(id), enabled: Boolean(id) });
}

export function useCarriersQuery(filters: CarrierFilters) {
  return useQuery({ queryKey: queryKeys.carriers(filters), queryFn: () => fetchCarriers(filters) });
}

export function useCarrierQuery(id: string) {
  return useQuery({ queryKey: queryKeys.carrier(id), queryFn: () => fetchCarrier(id), enabled: Boolean(id) });
}

export function useIncidentsQuery(filters: IncidentFilters) {
  return useQuery({ queryKey: queryKeys.incidents(filters), queryFn: () => fetchIncidents(filters) });
}

export function useIncidentQuery(id: string) {
  return useQuery({ queryKey: queryKeys.incident(id), queryFn: () => fetchIncident(id), enabled: Boolean(id) });
}

export function useDemandForecastQuery() {
  return useQuery({ queryKey: queryKeys.demandForecast, queryFn: fetchDemandForecast });
}

export function useSupplyPlanQuery() {
  return useQuery({ queryKey: queryKeys.supplyPlan, queryFn: fetchSupplyPlan });
}

export function useInventoryPlanQuery() {
  return useQuery({ queryKey: queryKeys.inventoryPlan, queryFn: fetchInventoryPlan });
}

export function useTransportPlanQuery() {
  return useQuery({ queryKey: queryKeys.transportPlan, queryFn: fetchTransportPlan });
}

export function usePlanFactQuery() {
  return useQuery({ queryKey: queryKeys.planFact, queryFn: fetchPlanFact });
}

export function useScenariosQuery(filters: ScenarioFilters = {}) {
  return useQuery({ queryKey: queryKeys.scenarios(filters), queryFn: () => fetchScenarios(filters) });
}

export function useScenarioQuery(id: string) {
  return useQuery({ queryKey: queryKeys.scenario(id), queryFn: () => fetchScenario(id), enabled: Boolean(id) });
}

export function useScenarioCompareQuery(scenarioIds: string[]) {
  const sortedIds = [...scenarioIds].sort();
  return useQuery({
    queryKey: queryKeys.scenarioCompare(sortedIds),
    queryFn: () => compareScenarios(sortedIds),
    enabled: sortedIds.length >= 2,
  });
}

export function useRecommendationsQuery() {
  return useQuery({ queryKey: queryKeys.recommendations, queryFn: fetchRecommendations });
}

export function useAnalyticsOverviewQuery() {
  return useQuery({ queryKey: queryKeys.analyticsOverview, queryFn: fetchAnalyticsOverview });
}

export function useAnalyticsSectionQuery(section: string) {
  return useQuery({
    queryKey: queryKeys.analyticsSection(section),
    queryFn: () => fetchAnalyticsSection(section),
    enabled: Boolean(section),
  });
}

export function useGlobalSearchQuery(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.globalSearch(query),
    queryFn: () => fetchGlobalSearch(query),
    enabled: enabled && query.trim().length >= 2,
    staleTime: 10_000,
  });
}

export function useNotificationsQuery() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: fetchNotifications,
  });
}
