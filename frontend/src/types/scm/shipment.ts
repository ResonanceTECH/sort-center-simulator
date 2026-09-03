import type { ExceptionSummary } from '@/types/scm/exception';
import type { IncidentSummary } from '@/types/scm/incident';
import type { LiveMapData } from '@/types/scm/map';
import type { MetricValue } from '@/types/scm/metric';

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

export interface ShipmentDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

export interface ShipmentActivityItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail?: string;
}

export interface ShipmentDetail extends ShipmentSummary {
  orderId?: string;
  skus: { sku: string; name: string; quantity: number }[];
  exceptions: ExceptionSummary[];
  incidents: IncidentSummary[];
  documents: ShipmentDocument[];
  activity: ShipmentActivityItem[];
  mapView: LiveMapData;
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
