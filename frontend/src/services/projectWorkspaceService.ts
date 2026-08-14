import axios from 'axios';
import { apiClient } from '@/api/client';
import {
  cacheProjectDetail,
  getRunDetail,
  getScenarioDetail,
} from '@/mocks/projectWorkspaceData';
import { getProjectsNotifications } from '@/mocks/projectsData';
import { delay, getErrorMessage } from '@/utils/error';
import type { ProjectListStatus } from '@/types/projects';
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

const BASE_DELAY_MS = 450;
const ERROR_CHANCE = 0.01;

function maybeThrowRandomError(message: string): void {
  if (Math.random() < ERROR_CHANCE) {
    throw new Error(message);
  }
}

function mapStatus(value: unknown): ProjectListStatus {
  if (value === 'completed' || value === 'error' || value === 'archived' || value === 'draft') {
    return value;
  }
  return 'draft';
}

function mapRunStatus(value: unknown): RunSummary['status'] {
  if (value === 'queued' || value === 'running' || value === 'completed' || value === 'failed') {
    return value;
  }
  return 'queued';
}

function mapScenario(api: ScenarioSummaryApi): ScenarioSummary {
  return {
    id: api.id,
    name: api.name,
    updatedAt: api.updated_at ?? api.updatedAt ?? new Date().toISOString(),
    isDefault: api.is_default ?? api.isDefault ?? false,
  };
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

function mapProjectDetail(
  project: ProjectDetailApiResponse,
  scenariosPayload: ProjectScenariosApiResponse,
): ProjectDetail {
  const scenarios = (scenariosPayload.scenarios ?? scenariosPayload.items ?? []).map(mapScenario);
  const defaultScenarioId =
    project.default_scenario_id ??
    project.defaultScenarioId ??
    scenarios.find((item) => item.isDefault)?.id ??
    scenarios[0]?.id ??
    null;

  const lastRunApi = project.last_run ?? project.lastRun ?? null;
  const lastRun = lastRunApi ? mapRun(lastRunApi) : null;

  return {
    id: project.id,
    name: project.name,
    status: mapStatus(project.status),
    updatedAt: project.updated_at ?? project.updatedAt ?? new Date().toISOString(),
    description: project.description ?? undefined,
    scenarios: scenarios.map((scenario) => ({
      ...scenario,
      isDefault: scenario.id === defaultScenarioId,
    })),
    runs: lastRun ? [lastRun] : [],
    defaultScenarioId,
    lastRun,
    notifications: getProjectsNotifications(),
  };
}

/** GET /api/v1/projects/{projectId} + GET /api/v1/projects/{projectId}/scenarios */
export async function fetchProjectById(projectId: string): Promise<ProjectDetail | null> {
  const normalized = projectId.trim();
  if (!normalized) return null;

  try {
    const [projectRes, scenariosRes] = await Promise.all([
      apiClient.get<ProjectDetailApiResponse>(`/projects/${normalized}`),
      apiClient.get<ProjectScenariosApiResponse>(`/projects/${normalized}/scenarios`),
    ]);

    const detail = mapProjectDetail(projectRes.data, scenariosRes.data);
    return cacheProjectDetail(detail);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw new Error(getErrorMessage(error, 'Не удалось загрузить проект. Попробуйте ещё раз.'));
  }
}

/** POST /api/v1/projects/{projectId}/runs */
export async function startProjectCalculation(projectId: string): Promise<RunSummary> {
  const { data } = await apiClient.post<RunSummaryApi>(`/projects/${projectId}/runs`);
  return mapRun(data);
}

export async function fetchScenarioById(
  projectId: string,
  scenarioId: string,
): Promise<ScenarioDetail | null> {
  await delay(BASE_DELAY_MS);
  maybeThrowRandomError('Не удалось загрузить сценарий. Попробуйте ещё раз.');

  const normalizedProjectId = projectId.trim();
  const normalizedScenarioId = scenarioId.trim();
  if (!normalizedProjectId || !normalizedScenarioId) return null;

  return getScenarioDetail(normalizedProjectId, normalizedScenarioId);
}

export async function fetchRunById(
  projectId: string,
  runId: string,
): Promise<RunDetail | null> {
  await delay(BASE_DELAY_MS);
  maybeThrowRandomError('Не удалось загрузить прогон. Попробуйте ещё раз.');

  const normalizedProjectId = projectId.trim();
  const normalizedRunId = runId.trim();
  if (!normalizedProjectId || !normalizedRunId) return null;

  return getRunDetail(normalizedProjectId, normalizedRunId);
}
