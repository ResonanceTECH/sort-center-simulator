export interface RunMetrics {
  total_items: number;
  processed: number;
  success_rate: number;
  by_zone: Record<string, number>;
  avg_cycle_sec?: number;
  failures?: Record<string, number>;
}

export interface RunResult {
  metrics: RunMetrics;
  expect_passed?: boolean;
  expect_failures?: string[];
  seed?: number;
}

export interface RunDetailApiResponse {
  id: string;
  project_id?: string;
  projectId?: string;
  scenario_id?: string;
  scenarioId?: string;
  name: string;
  status: string;
  type?: string;
  progress?: number;
  result?: RunResult | null;
  error_message?: string | null;
  created_at?: string;
  createdAt?: string;
  started_at?: string | null;
  startedAt?: string | null;
  finished_at?: string | null;
  finishedAt?: string | null;
}

export interface ScenarioDetailApiResponse {
  id: string;
  project_id?: string;
  projectId?: string;
  name: string;
  description?: string | null;
  updated_at?: string;
  updatedAt?: string;
  version?: number;
  is_default?: boolean;
  isDefault?: boolean;
  config?: Record<string, unknown>;
}

export interface SimEvent {
  t: number;
  phase: string;
  product_id?: string;
  payload?: Record<string, unknown>;
}

export interface TraceParcel {
  id: string;
  product_id: string;
  x_mm: number;
  y_mm: number;
  zone?: string | null;
}

export interface TraceFrame {
  t: number;
  belt_running: boolean;
  parcels: TraceParcel[];
  robot: {
    phase: string;
    ee_mm: [number, number, number];
    vacuum_on: boolean;
    held_product_id?: string | null;
  };
  alarms: string[];
}

export interface TraceData {
  meta: {
    run_id?: string;
    seed?: number;
    dt_sec?: number;
    duration_sec?: number;
    event_count?: number;
  };
  frames: TraceFrame[];
  markers: Array<Record<string, unknown>>;
}

export interface RunComparisonItem {
  runId: string;
  name: string;
  status: string;
  createdAt: string;
  metrics: RunMetrics | null;
  expectPassed?: boolean | null;
}
