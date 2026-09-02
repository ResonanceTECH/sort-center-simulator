import type { MetricValue } from '@/types/scm/metric';
import type { ExceptionSummary } from '@/types/scm/exception';

export interface ControlTowerData {
  kpis: MetricValue[];
  requiresAttention: ExceptionSummary[];
  insights: { id: string; title: string; description: string; link?: string }[];
  recentActivity: {
    id: string;
    timestamp: string;
    actor: string;
    action: string;
    detail: string;
    entityType?: string;
    entityId?: string;
  }[];
  alertCounts: {
    exceptions: number;
    incidents: number;
  };
}
