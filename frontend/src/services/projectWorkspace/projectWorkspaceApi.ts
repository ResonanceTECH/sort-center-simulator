import axios from 'axios';
import { apiClient } from '@/api/client';
import { mapProjectStatus, mapScenarioSummary } from '@/api/mappers';
import { getErrorMessage } from '@/utils/error';
import type {
  ProjectDetail,
  ProjectDetailApiResponse,
  ProjectScenariosApiResponse,
  RunDetail,
  RunSummary,
  RunSummaryApi,
  ScenarioDetail,
  ScenarioSummary,
  ScenarioSummaryApi,
} from '@/types/projectWorkspace';
import type {
  RunComparisonItem,
  RunDetailApiResponse,
  RunMetrics,
  ScenarioDetailApiResponse,
  SimEvent,
  TraceData,
} from '@/types/simulation';

function mapRunStatus(value: unknown): RunSummary['status'] {
  if (
    value === 'queued' ||
    value === 'running' ||
    value === 'completed' ||
    value === 'completed_with_warnings' ||
    value === 'failed'
  ) {
    return value;
  }
  return 'queued';
}

function mapScenario(api: ScenarioSummaryApi): ScenarioSummary {
  return mapScenarioSummary(api);
}

function mapRun(api: RunSummaryApi): RunSummary {
  return {
    id: api.id,
    name: api.name,
    status: mapRunStatus(api.status),
    createdAt: api.created_at ?? api.createdAt ?? new Date().toISOString(),
    scenarioId: api.scenario_id ?? api.scenarioId ?? '',
  };
}

function mapRunDetail(api: RunDetailApiResponse, projectId: string): RunDetail {
  return {
    id: api.id,
    projectId: api.project_id ?? api.projectId ?? projectId,
    scenarioId: api.scenario_id ?? api.scenarioId ?? '',
    name: api.name,
    status: mapRunStatus(api.status),
    createdAt: api.created_at ?? api.createdAt ?? new Date().toISOString(),
    finishedAt: api.finished_at ?? api.finishedAt ?? undefined,
    progress: api.progress,
    result: api.result ?? null,
    errorMessage: api.error_message ?? null,
  };
}

function mapProjectDetail(
  project: ProjectDetailApiResponse,
  scenariosPayload: ProjectScenariosApiResponse,
  runs: RunSummary[],
): ProjectDetail {
  const scenarios = (scenariosPayload.scenarios ?? scenariosPayload.items ?? []).map(mapScenario);
  const defaultScenarioId =
    project.default_scenario_id ??
    project.defaultScenarioId ??
    scenarios.find((item) => item.isDefault)?.id ??
    scenarios[0]?.id ??
    null;

  const lastRunApi = project.last_run ?? project.lastRun ?? null;
  const lastRunFromApi = lastRunApi ? mapRun(lastRunApi) : null;
  const lastRun =
    runs.length > 0
      ? [...runs].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0]
      : lastRunFromApi;

  return {
    id: project.id,
    name: project.name,
    status: mapProjectStatus(project.status),
    updatedAt: project.updated_at ?? project.updatedAt ?? new Date().toISOString(),
    description: project.description ?? undefined,
    scenarios: scenarios.map((scenario) => ({
      ...scenario,
      isDefault: scenario.id === defaultScenarioId,
    })),
    runs,
    defaultScenarioId,
    lastRun: lastRun ?? null,
    notifications: [],
    myRole: (project.my_role ?? project.myRole ?? null) as ProjectDetail['myRole'],
    myRoleLabel: project.my_role_label ?? project.myRoleLabel ?? null,
  };
}

export async function fetchProjectById(projectId: string): Promise<ProjectDetail | null> {
  const normalized = projectId.trim();
  if (!normalized) return null;

  try {
    const [projectRes, scenariosRes, runsRes] = await Promise.all([
      apiClient.get<ProjectDetailApiResponse>(`/projects/${normalized}`),
      apiClient.get<ProjectScenariosApiResponse>(`/projects/${normalized}/scenarios`),
      apiClient.get<RunSummaryApi[]>(`/projects/${normalized}/runs`),
    ]);

    const runs = (runsRes.data ?? []).map(mapRun);
    return mapProjectDetail(projectRes.data, scenariosRes.data, runs);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error(getErrorMessage(error, 'Не удалось загрузить проект. Попробуйте ещё раз.'));
  }
}

export async function startProjectCalculation(projectId: string): Promise<RunSummary> {
  return startProjectRun(projectId, { type: 'analytical' });
}

export async function startProjectRun(
  projectId: string,
  options: {
    scenarioId?: string;
    type?: 'analytical' | 'simulation';
    seed?: number;
  } = {},
): Promise<RunSummary> {
  const { data } = await apiClient.post<RunSummaryApi>(`/projects/${projectId}/runs`, {
    type: options.type ?? 'analytical',
    scenario_id: options.scenarioId,
    seed: options.seed,
  });
  return mapRun(data);
}

export async function createScenario(
  projectId: string,
  payload: { name: string; copyFromId?: string },
): Promise<ScenarioSummary> {
  const { data } = await apiClient.post<ScenarioSummaryApi>(`/projects/${projectId}/scenarios`, {
    name: payload.name,
    copy_from_id: payload.copyFromId,
  });
  return mapScenario(data);
}

export async function setDefaultScenario(projectId: string, scenarioId: string): Promise<void> {
  await apiClient.post(`/projects/${projectId}/scenarios/${scenarioId}/set-default`);
}

export async function fetchScenarioById(
  projectId: string,
  scenarioId: string,
): Promise<ScenarioDetail | null> {
  const normalizedProjectId = projectId.trim();
  const normalizedScenarioId = scenarioId.trim();
  if (!normalizedProjectId || !normalizedScenarioId) return null;

  try {
    const { data } = await apiClient.get<ScenarioDetailApiResponse>(
      `/projects/${normalizedProjectId}/scenarios/${normalizedScenarioId}`,
    );
    return {
      id: data.id,
      projectId: data.project_id ?? data.projectId ?? normalizedProjectId,
      name: data.name,
      updatedAt: data.updated_at ?? data.updatedAt ?? new Date().toISOString(),
      description: data.description ?? undefined,
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error(getErrorMessage(error, 'Не удалось загрузить сценарий. Попробуйте ещё раз.'));
  }
}

export async function fetchRuns(projectId: string): Promise<RunSummary[]> {
  const { data } = await apiClient.get<RunSummaryApi[]>(`/projects/${projectId}/runs`);
  return data.map(mapRun);
}

export async function fetchRunById(
  projectId: string,
  runId: string,
): Promise<RunDetail | null> {
  const normalizedProjectId = projectId.trim();
  const normalizedRunId = runId.trim();
  if (!normalizedProjectId || !normalizedRunId) return null;

  try {
    const { data } = await apiClient.get<RunDetailApiResponse>(
      `/projects/${normalizedProjectId}/runs/${normalizedRunId}`,
    );
    return mapRunDetail(data, normalizedProjectId);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error(getErrorMessage(error, 'Не удалось загрузить прогон. Попробуйте ещё раз.'));
  }
}

export async function fetchRunEvents(projectId: string, runId: string): Promise<SimEvent[]> {
  const { data } = await apiClient.get<{ events: SimEvent[] }>(
    `/projects/${projectId}/runs/${runId}/events`,
  );
  return data.events ?? [];
}

export async function fetchRunTrace(projectId: string, runId: string): Promise<TraceData> {
  const { data } = await apiClient.get<TraceData>(`/projects/${projectId}/runs/${runId}/trace`);
  return data;
}

export async function fetchRunMetrics(
  projectId: string,
  runId: string,
): Promise<{ metrics: RunMetrics; expectPassed?: boolean; expectFailures?: string[] }> {
  const { data } = await apiClient.get<{
    metrics: RunMetrics;
    expect_passed?: boolean;
    expect_failures?: string[];
  }>(`/projects/${projectId}/runs/${runId}/metrics`);
  return {
    metrics: data.metrics,
    expectPassed: data.expect_passed,
    expectFailures: data.expect_failures,
  };
}

export async function fetchRunComparison(
  projectId: string,
  runIds: string[],
): Promise<RunComparisonItem[]> {
  const { data } = await apiClient.get<{
    runs: Array<{
      run_id: string;
      name: string;
      status: string;
      created_at: string;
      metrics: RunMetrics | null;
      expect_passed?: boolean | null;
    }>;
  }>(`/projects/${projectId}/comparison`, {
    params: { run_ids: runIds.join(',') },
  });
  return (data.runs ?? []).map((item) => ({
    runId: item.run_id,
    name: item.name,
    status: item.status,
    createdAt: item.created_at,
    metrics: item.metrics,
    expectPassed: item.expect_passed,
  }));
}

export async function fetchScenarioConfig(
  projectId: string,
  scenarioId: string,
): Promise<Record<string, unknown>> {
  const { data } = await apiClient.get<Record<string, unknown>>(
    `/projects/${projectId}/scenarios/${scenarioId}/config`,
  );
  return data;
}

export async function updateScenarioConfig(
  projectId: string,
  scenarioId: string,
  config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { data } = await apiClient.put<Record<string, unknown>>(
    `/projects/${projectId}/scenarios/${scenarioId}/config`,
    config,
  );
  return data;
}
