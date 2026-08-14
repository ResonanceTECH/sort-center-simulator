import type { ProjectListStatus } from '@/types/projects';
import type { Notification } from '@/types/general';

export interface ScenarioSummary {
  id: string;
  name: string;
  updatedAt: string;
  isDefault?: boolean;
}

export interface RunSummary {
  id: string;
  name: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  createdAt: string;
  scenarioId: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  status: ProjectListStatus;
  updatedAt: string;
  description?: string;
  scenarios: ScenarioSummary[];
  runs: RunSummary[];
  defaultScenarioId: string | null;
  lastRun: RunSummary | null;
  notifications: Notification[];
}

export interface ScenarioDetail {
  id: string;
  projectId: string;
  name: string;
  updatedAt: string;
  description?: string;
}

export interface RunDetail {
  id: string;
  projectId: string;
  scenarioId: string;
  name: string;
  status: RunSummary['status'];
  createdAt: string;
  finishedAt?: string;
}

/** GET /api/v1/projects/{projectId} */
export interface ProjectDetailApiResponse {
  id: string;
  name: string;
  description?: string | null;
  status?: ProjectListStatus | string;
  updated_at?: string;
  updatedAt?: string;
  created_at?: string;
  default_scenario_id?: string | null;
  defaultScenarioId?: string | null;
  last_run?: RunSummaryApi | null;
  lastRun?: RunSummaryApi | null;
}

/** GET /api/v1/projects/{projectId}/scenarios */
export interface ProjectScenariosApiResponse {
  scenarios?: ScenarioSummaryApi[];
  items?: ScenarioSummaryApi[];
}

export interface ScenarioSummaryApi {
  id: string;
  name: string;
  updated_at?: string;
  updatedAt?: string;
  is_default?: boolean;
  isDefault?: boolean;
}

export interface RunSummaryApi {
  id: string;
  name: string;
  status: string;
  created_at?: string;
  createdAt?: string;
  scenario_id?: string;
  scenarioId?: string;
}
