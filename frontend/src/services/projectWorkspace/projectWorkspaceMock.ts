import axios from 'axios';
import { apiClient } from '@/api/client';
import { mapProjectStatus, mapScenarioSummary } from '@/api/mappers';
import {
  cacheProjectDetail,
  getProjectDetail,
  getRunDetail,
  getScenarioDetail,
} from '@/mocks/projectWorkspaceData';
import { getProjectsNotifications } from '@/mocks/projectsData';
import { delay, getErrorMessage } from '@/utils/error';
import type {
  ProjectDetail,
  ProjectDetailApiResponse,
  ProjectScenariosApiResponse,
  RunDetail,
  RunSummary,
  RunSummaryApi,
  ScenarioDetail,
  ScenarioSummaryApi,
} from '@/types/projectWorkspace';
import type {
  RunComparisonItem,
  RunMetrics,
  SimEvent,
  TraceData,
} from '@/types/simulation';

const MOCK_SCENARIO_CONFIG: Record<string, unknown> = {
  version: 1,
  simulation: { dt_sec: 0.05, seed: 42, mode: 'analytical' },
  layout: {
    belt_speed_mps: 1.0,
    accumulator: { width_mm: 500, depth_mm: 700, height_mm: 700 },
    zones: {
      B: { enabled: true, type: 'sorter_feed' },
      C: { enabled: true, type: 'oversize_cage' },
      D: { enabled: true, type: 'repack_cage' },
    },
    robot: { model: 'ur10e', gripper: 'vacuum' },
  },
  catalog: {
    product_ids: ['box_300', 'bottle', 'pen', 'bag'],
    spawn_mode: 'accumulator',
    items_per_run: 50,
  },
  classification: {
    size_min_mm: [10, 10, 10],
    size_max_mm: [450, 320, 320],
    circularity_k_threshold: 0.8,
  },
  expect: { success_rate_min: 0.5 },
};

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

function mapRun(api: RunSummaryApi): RunSummary {
  return {
    id: api.id,
    name: api.name,
    status: mapRunStatus(api.status),
    createdAt: api.created_at ?? api.createdAt ?? new Date().toISOString(),
    scenarioId: api.scenario_id ?? api.scenarioId ?? '',
  };
}

function mapScenario(api: ScenarioSummaryApi): import('@/types/projectWorkspace').ScenarioSummary {
  return mapScenarioSummary(api);
}

async function fetchProjectFromViteMock(projectId: string): Promise<ProjectDetail | null> {
  try {
    const [projectRes, scenariosRes] = await Promise.all([
      apiClient.get<ProjectDetailApiResponse>(`/projects/${projectId}`),
      apiClient.get<ProjectScenariosApiResponse>(`/projects/${projectId}/scenarios`),
    ]);

    const scenarios = (scenariosRes.data.scenarios ?? scenariosRes.data.items ?? []).map(
      (api: ScenarioSummaryApi) => mapScenarioSummary(api),
    );
    const defaultScenarioId =
      projectRes.data.default_scenario_id ??
      projectRes.data.defaultScenarioId ??
      scenarios.find((item) => item.isDefault)?.id ??
      scenarios[0]?.id ??
      null;

    const lastRunApi = projectRes.data.last_run ?? projectRes.data.lastRun ?? null;
    const lastRun = lastRunApi ? mapRun(lastRunApi) : null;

    const detail: ProjectDetail = {
      id: projectRes.data.id,
      name: projectRes.data.name,
      status: mapProjectStatus(projectRes.data.status),
      updatedAt:
        projectRes.data.updated_at ??
        projectRes.data.updatedAt ??
        new Date().toISOString(),
      description: projectRes.data.description ?? undefined,
      scenarios: scenarios.map((scenario) => ({
        ...scenario,
        isDefault: scenario.id === defaultScenarioId,
      })),
      runs: lastRun ? [lastRun] : [],
      defaultScenarioId,
      lastRun,
      notifications: getProjectsNotifications(),
    };

    return cacheProjectDetail(detail);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return getProjectDetail(projectId);
    }
    throw new Error(getErrorMessage(error, 'Не удалось загрузить проект. Попробуйте ещё раз.'));
  }
}

export async function fetchProjectById(projectId: string): Promise<ProjectDetail | null> {
  const normalized = projectId.trim();
  if (!normalized) return null;

  await delay(200);
  return fetchProjectFromViteMock(normalized);
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
): Promise<import('@/types/projectWorkspace').ScenarioSummary> {
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
  await delay(150);
  return getScenarioDetail(projectId, scenarioId);
}

export async function fetchRuns(projectId: string): Promise<RunSummary[]> {
  await delay(150);
  const fromVite = await fetchProjectFromViteMock(projectId);
  if (fromVite?.runs.length) {
    return fromVite.runs;
  }
  return getProjectDetail(projectId)?.runs ?? [];
}

export async function fetchRunById(
  projectId: string,
  runId: string,
): Promise<RunDetail | null> {
  await delay(150);
  return getRunDetail(projectId, runId);
}

export async function fetchRunEvents(
  _projectId: string,
  _runId: string,
): Promise<SimEvent[]> {
  await delay(100);
  return [];
}

export async function fetchRunTrace(
  _projectId: string,
  _runId: string,
): Promise<TraceData> {
  await delay(100);
  return { meta: { duration_sec: 0 }, frames: [], markers: [] };
}

export async function fetchRunMetrics(
  projectId: string,
  runId: string,
): Promise<{ metrics: RunMetrics; expectPassed?: boolean; expectFailures?: string[] }> {
  await delay(100);
  const run = getRunDetail(projectId, runId);
  if (run?.result?.metrics) {
    return {
      metrics: run.result.metrics,
      expectPassed: run.result.expect_passed,
      expectFailures: run.result.expect_failures,
    };
  }

  return {
    metrics: {
      total_items: 50,
      processed: 48,
      success_rate: 0.96,
      by_zone: { B: 30, C: 10, D: 8 },
    },
    expectPassed: true,
  };
}

export async function fetchRunComparison(
  projectId: string,
  runIds: string[],
): Promise<RunComparisonItem[]> {
  await delay(150);
  const project = getProjectDetail(projectId);
  if (!project) return [];

  const items: RunComparisonItem[] = [];

  for (const runId of runIds) {
    const run = project.runs.find((item) => item.id === runId);
    if (!run) continue;
    items.push({
      runId: run.id,
      name: run.name,
      status: run.status,
      createdAt: run.createdAt,
      metrics:
        run.status === 'completed'
          ? {
              total_items: 50,
              processed: 48,
              success_rate: 0.96,
              by_zone: { B: 30, C: 10, D: 8 },
            }
          : null,
      expectPassed: run.status === 'completed' ? true : null,
    });
  }

  return items;
}

export async function fetchScenarioConfig(
  _projectId: string,
  _scenarioId: string,
): Promise<Record<string, unknown>> {
  await delay(100);
  return structuredClone(MOCK_SCENARIO_CONFIG);
}

export async function updateScenarioConfig(
  _projectId: string,
  _scenarioId: string,
  config: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  await delay(200);
  return config;
}
