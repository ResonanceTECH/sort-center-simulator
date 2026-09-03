import type { MetricValue } from '@/types/scm/metric';

export interface CarrierSummary {
  id: string;
  name: string;
  otif: MetricValue;
  etaAccuracy: MetricValue;
  averageDelay: MetricValue;
  routesCount: number;
  shipmentCount: number;
  incidentRate: MetricValue;
  risk: MetricValue;
}

export interface CarrierDetail extends CarrierSummary {
  contactEmail: string;
  vehiclesCount: number;
  routes: { id: string; name: string; volume: number; utilization: number }[];
  recentShipments: { id: string; status: string; eta: string }[];
  incidents: { id: string; title: string; status: string }[];
}

export interface CarrierFilters {
  risk?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface CarriersPageData {
  items: CarrierSummary[];
  total: number;
  page: number;
  pageSize: number;
}
