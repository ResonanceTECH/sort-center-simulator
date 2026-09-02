import type { ComparisonMetric, MetricValue } from '@/types/scm/metric';
import type { SemanticStatus } from '@/types/scm/semantic';

export type PlanStatus = 'DRAFT' | 'CALCULATED' | 'REVIEW' | 'APPROVED' | 'ACTIVE' | 'SUPERSEDED';

export interface ForecastDataPoint {
  date: string;
  actual?: number;
  forecast: number;
  lower?: number;
  upper?: number;
}

export interface DemandForecastData {
  period: string;
  sku?: string;
  productGroup?: string;
  warehouse?: string;
  region?: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  seasonality: string;
  anomalies: { date: string; description: string }[];
  series: ForecastDataPoint[];
  version: string;
  lastCalculated: string;
}

export interface SupplierAllocation {
  supplierId: string;
  supplierName: string;
  allocated: number;
  capacity: number;
  utilization: number;
  status: SemanticStatus;
}

export interface SupplyPlanData {
  status: PlanStatus;
  demand: MetricValue;
  requiredSupply: MetricValue;
  allocations: SupplierAllocation[];
  violations: { message: string; status: SemanticStatus }[];
  availableActions: string[];
}

export interface InventoryPlanItem {
  sku: string;
  name: string;
  currentStock: MetricValue;
  incoming: MetricValue;
  forecastDemand: MetricValue;
  safetyStock: MetricValue;
  daysOfSupply: MetricValue;
  stockoutRisk: MetricValue;
  incomingShipments: { id: string; eta: string; quantity: number }[];
}

export interface InventoryPlanData {
  status: PlanStatus;
  items: InventoryPlanItem[];
  series: { date: string; level: number; safetyStock: number }[];
}

export interface TransportLane {
  id: string;
  lane: string;
  plannedVolume: MetricValue;
  requiredCapacity: MetricValue;
  availableCapacity: MetricValue;
  deficit: MetricValue;
  carrier: string;
  carrierId: string;
  vehicles: number;
  utilization: MetricValue;
  risk: MetricValue;
}

export interface TransportPlanData {
  status: PlanStatus;
  lanes: TransportLane[];
  availableActions: string[];
}

export interface PlanFactMetric extends ComparisonMetric {
  drillDown?: { label: string; delta: number }[];
}

export interface PlanFactData {
  period: string;
  metrics: PlanFactMetric[];
}
