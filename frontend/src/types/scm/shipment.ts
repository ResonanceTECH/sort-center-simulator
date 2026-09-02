import type { MetricValue } from '@/types/scm/metric';
import type { SemanticStatus } from '@/types/scm/semantic';

export type ShipmentStatus =
  | 'DRAFT'
  | 'PLANNED'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'READY_FOR_PICKUP'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface ShipmentSummary {
  id: string;
  supplierId: string;
  supplierName: string;
  carrierId: string;
  carrierName: string;
  origin: string;
  destination: string;
  status: ShipmentStatus;
  pickupAt: string;
  plannedEta: string;
  forecastEta: string;
  deviationMinutes: number;
  slaRisk: MetricValue;
}

export interface ShipmentTimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  title: string;
  description?: string;
  relatedEntityId?: string;
  relatedEntityType?: 'exception' | 'incident' | 'shipment';
}

export interface ShipmentDetail extends ShipmentSummary {
  orderId?: string;
  skus: { sku: string; name: string; quantity: number }[];
  exceptions: { id: string; type: string; severity: SemanticStatus }[];
  incidents: { id: string; title: string; status: string }[];
  timeline: ShipmentTimelineEvent[];
  availableActions: string[];
}

export interface ShipmentFilters {
  status?: string;
  risk?: string;
  supplier?: string;
  carrier?: string;
  route?: string;
  warehouse?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface ShipmentsPageData {
  items: ShipmentSummary[];
  total: number;
  page: number;
  pageSize: number;
}
