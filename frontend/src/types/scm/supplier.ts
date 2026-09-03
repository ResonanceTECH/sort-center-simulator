import type { MetricValue } from '@/types/scm/metric';
import type { SemanticStatus } from '@/types/scm/semantic';

export interface SupplierSummary {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ONBOARDING';
  statusSemantic: SemanticStatus;
  otif: MetricValue;
  reliability: MetricValue;
  leadTimeDays: MetricValue;
  supplyShare: MetricValue;
  risk: MetricValue;
  openIncidents: number;
  region: string;
  productGroup: string;
}

export interface SupplierDetail extends SupplierSummary {
  contactEmail: string;
  contactPhone: string;
  address: string;
  products: { sku: string; name: string; share: number }[];
  recentShipments: { id: string; status: string; eta: string }[];
  slaMetrics: MetricValue[];
  risks: { id: string; title: string; status: SemanticStatus; description: string }[];
  incidents: { id: string; title: string; status: string }[];
}

export interface SupplierFilters {
  status?: string;
  risk?: string;
  productGroup?: string;
  region?: string;
  otifMin?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface SuppliersPageData {
  items: SupplierSummary[];
  total: number;
  page: number;
  pageSize: number;
}
