import { useApiMocks } from '@/config/env';
import * as projectWorkspaceApi from '@/services/projectWorkspace/projectWorkspaceApi';
import * as projectWorkspaceMock from '@/services/projectWorkspace/projectWorkspaceMock';
import type {
  ProjectDetail,
  RunDetail,
  RunSummary,
  ScenarioDetail,
} from '@/types/projectWorkspace';
import type { RunComparisonItem, RunMetrics, SimEvent, TraceData } from '@/types/simulation';

const impl = () => (useApiMocks() ? projectWorkspaceMock : projectWorkspaceApi);

/** GET project + scenarios (+ runs in API mode) */
export async function fetchProjectById(projectId: string): Promise<ProjectDetail | null> {
  return impl().fetchProjectById(projectId);
}

/** POST /projects/{projectId}/runs */
export async function startProjectCalculation(projectId: string): Promise<RunSummary> {
  return impl().startProjectCalculation(projectId);
}

export async function startProjectRun(
  projectId: string,
  options?: {
    scenarioId?: string;
    type?: 'analytical' | 'simulation';
    seed?: number;
  },
): Promise<RunSummary> {
  return impl().startProjectRun(projectId, options ?? {});
}

export async function createScenario(
  projectId: string,
  payload: { name: string; copyFromId?: string },
): Promise<import('@/types/projectWorkspace').ScenarioSummary> {
  return impl().createScenario(projectId, payload);
}

export async function setDefaultScenario(projectId: string, scenarioId: string): Promise<void> {
  return impl().setDefaultScenario(projectId, scenarioId);
}

/** GET /projects/{projectId}/scenarios/{scenarioId} */
export async function fetchScenarioById(
  projectId: string,
  scenarioId: string,
): Promise<ScenarioDetail | null> {
  return impl().fetchScenarioById(projectId, scenarioId);
}

/** GET /projects/{projectId}/runs */
export async function fetchRuns(projectId: string): Promise<RunSummary[]> {
  return impl().fetchRuns(projectId);
}

/** GET /projects/{projectId}/runs/{runId} */
export async function fetchRunById(projectId: string, runId: string): Promise<RunDetail | null> {
  return impl().fetchRunById(projectId, runId);
}

/** GET /projects/{projectId}/runs/{runId}/events */
export async function fetchRunEvents(projectId: string, runId: string): Promise<SimEvent[]> {
  return impl().fetchRunEvents(projectId, runId);
}

/** GET /projects/{projectId}/runs/{runId}/trace */
export async function fetchRunTrace(projectId: string, runId: string): Promise<TraceData> {
  return impl().fetchRunTrace(projectId, runId);
}

/** GET /projects/{projectId}/runs/{runId}/metrics */
export async function fetchRunMetrics(
  projectId: string,
  runId: string,
): Promise<{ metrics: RunMetrics; expectPassed?: boolean; expectFailures?: string[] }> {
  return impl().fetchRunMetrics(projectId, runId);
}

/** GET /projects/{projectId}/comparison */
export async function fetchRunComparison(
  projectId: string,
  runIds: string[],
): Promise<RunComparisonItem[]> {
  return impl().fetchRunComparison(projectId, runIds);
}

/** GET /projects/{projectId}/scenarios/{scenarioId}/config */
export async function fetchScenarioConfig(
  projectId: string,
  scenarioId: string,
): Promise<Record<string, unknown>> {
  return impl().fetchScenarioConfig(projectId, scenarioId);
}

/** PUT /projects/{projectId}/scenarios/{scenarioId}/config */
export async function updateScenarioConfig(
  projectId: string,
  scenarioId: string,
  config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  return impl().updateScenarioConfig(projectId, scenarioId, config);
}
