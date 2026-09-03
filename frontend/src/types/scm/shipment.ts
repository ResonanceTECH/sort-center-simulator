import type { ExceptionSummary } from '@/types/scm/exception';
import type { IncidentSummary } from '@/types/scm/incident';
import type { LiveMapData } from '@/types/scm/map';
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

export type TrackingStatus = 'OK' | 'STALE' | 'NO_DATA';

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
  /** Risk model separate from lifecycle status. */
  riskStatus: SemanticStatus;
  vehiclePlate?: string;
  lastTrackingAt?: string;
  trackingStatus: TrackingStatus;
  /** 0..1 progress along lifecycle for board viz. */
  progress: number;
  warehouse?: string;
  routeLabel?: string;
  availableActions: string[];
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
  trackingStatus?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/** Ops KPIs — computed on backend / mock, not in the browser. */
export interface ShipmentOpsKpis {
  active: MetricValue;
  atRisk: MetricValue;
  delayed: MetricValue;
  noTracking: MetricValue;
  avgDeviation: MetricValue;
  otifToday: MetricValue;
}

export interface ShipmentsPageData {
  items: ShipmentSummary[];
  total: number;
  page: number;
  pageSize: number;
  kpis: ShipmentOpsKpis;
}
