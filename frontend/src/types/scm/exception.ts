import type { MetricValue } from '@/types/scm/metric';
import type { SemanticStatus } from '@/types/scm/semantic';

export type ExceptionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'DATA_ISSUE';

export interface ExceptionSummary {
  id: string;
  shipmentId: string;
  type: string;
  severity: ExceptionSeverity;
  severityStatus: SemanticStatus;
  deviation: string;
  probability: number;
  impact: MetricValue;
  owner: string;
  createdAt: string;
  route: string;
}

export interface ExceptionDetail extends ExceptionSummary {
  description: string;
  causes: string[];
  affectedSkus: string[];
  inventoryImpact?: string;
  orderImpact?: string;
  slaImpact?: string;
  availableActions: string[];
}

export interface ExceptionFilters {
  severity?: string;
  type?: string;
  owner?: string;
  supplier?: string;
  carrier?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface ExceptionsPageData {
  items: ExceptionSummary[];
  total: number;
  counts: Record<ExceptionSeverity, number>;
}
