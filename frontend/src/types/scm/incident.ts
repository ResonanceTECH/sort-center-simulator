import type { SemanticStatus } from '@/types/scm/semantic';

export type IncidentStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_PARTNER'
  | 'RESOLVED'
  | 'CLOSED';

export interface IncidentSummary {
  id: string;
  title: string;
  status: IncidentStatus;
  severity: SemanticStatus;
  owner: string;
  shipmentId?: string;
  participants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IncidentComment {
  id: string;
  author: string;
  role: string;
  message: string;
  timestamp: string;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  detail?: string;
}

export interface IncidentDetail extends IncidentSummary {
  description: string;
  relatedExceptionId?: string;
  timeline: IncidentTimelineEvent[];
  comments: IncidentComment[];
  recommendedActions: { id: string; label: string; description: string }[];
  availableActions: string[];
}

export interface IncidentFilters {
  status?: string;
  severity?: string;
  owner?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface IncidentsPageData {
  items: IncidentSummary[];
  total: number;
  page: number;
  pageSize: number;
}
