export type RunType = 'analytical' | 'simulation';

export type RunStatus =
  | 'queued'
  | 'preparing'
  | 'running'
  | 'completed'
  | 'completed_with_warnings'
  | 'failed'
  | 'cancelled'
  | 'outdated';

export interface Run {
  id: string;
  projectId: string;
  scenarioId: string;
  scenarioVersion: number;
  type: RunType;
  status: RunStatus;
  progress: number;
  startedAt: string | null;
  finishedAt: string | null;
}

export interface RunApiResponse {
  id: string;
  project_id?: string;
  projectId?: string;
  scenario_id?: string;
  scenarioId?: string;
  scenario_version?: number;
  scenarioVersion?: number;
  type: string;
  status: string;
  progress?: number;
  started_at?: string | null;
  startedAt?: string | null;
  finished_at?: string | null;
  finishedAt?: string | null;
}
