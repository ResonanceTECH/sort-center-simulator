import type { ComparisonMetric } from '@/types/scm/metric';
import type { ComparisonSemantic } from '@/types/scm/semantic';

export type ScenarioStatus = 'DRAFT' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface ScenarioSummary {
  id: string;
  name: string;
  createdBy: string;
  status: ScenarioStatus;
  basePlan: string;
  createdAt: string;
  lastCalculation?: string;
  progress?: number;
  progressMessage?: string;
  recommendationStatus?: ComparisonSemantic;
}

export interface ScenarioParameter {
  category: 'Demand' | 'Supplier' | 'Carrier' | 'Route' | 'Warehouse' | 'Inventory';
  label: string;
  change: string;
}

export interface ScenarioDetail extends ScenarioSummary {
  parameters: ScenarioParameter[];
  kpis: ComparisonMetric[];
  availableActions: string[];
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  expectedEffects: ComparisonMetric[];
  status: 'PENDING' | 'APPLIED' | 'REJECTED' | 'SAVED';
  availableActions: string[];
}

export interface ScenarioFilters {
  status?: string;
  search?: string;
}

export interface ScenariosPageData {
  items: ScenarioSummary[];
  total: number;
}

export interface CreateScenarioInput {
  name: string;
  parameters: ScenarioParameter[];
}

export interface ScenarioComparisonRow {
  kpi: string;
  baseline: string;
  values: Record<string, string>;
  semantic?: Record<string, ComparisonSemantic>;
}

export interface ScenarioComparisonData {
  scenarios: Array<{ id: string; name: string }>;
  rows: ScenarioComparisonRow[];
  bestScenarioId?: string;
}
