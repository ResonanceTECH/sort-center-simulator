import type { ComparisonSemantic, SemanticStatus } from '@/types/scm/semantic';

export interface MetricValue {
  value: number | string;
  unit?: string;
  label: string;
  status: SemanticStatus;
  delta?: number;
  deltaUnit?: string;
  reason?: string;
}

export interface ComparisonMetric {
  label: string;
  baseline: number | string;
  values: Record<string, number | string>;
  unit?: string;
  semantic?: Record<string, ComparisonSemantic>;
}
