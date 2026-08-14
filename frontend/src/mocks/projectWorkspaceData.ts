import type {
  ProjectDetail,
  RunDetail,
  RunSummary,
  ScenarioDetail,
  ScenarioSummary,
} from '@/types/projectWorkspace';
import {
  findProjectInStore,
  getProjectsNotifications,
  getProjectsStore,
} from '@/mocks/projectsData';
import type { ProjectListItem } from '@/types/projects';

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

function daysAgo(days: number, h = 12, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function buildScenarios(
  id: string,
  updatedAt: string,
  count: number,
): ScenarioSummary[] {
  const names = [
    'Базовый сценарий',
    'Пиковая нагрузка',
    'Ночная смена',
    'Расширение линий',
    'Аварийный режим',
    'Тестовый прогон',
  ];
  const safeCount = Math.max(count, count === 0 ? 0 : 1);

  if (safeCount === 0) {
    return [
      {
        id: `${id}-scn-1`,
        name: names[0],
        updatedAt,
        isDefault: true,
      },
    ];
  }

  return Array.from({ length: safeCount }, (_, index) => ({
    id: `${id}-scn-${index + 1}`,
    name: names[index] ?? `Сценарий ${index + 1}`,
    updatedAt: index === 0 ? updatedAt : daysAgo(index, 10 + index, 15),
    isDefault: index === 0,
  }));
}

function buildRuns(
  projectId: string,
  scenarios: ScenarioSummary[],
  listItem: ProjectListItem,
): RunSummary[] {
  if (!scenarios.length) return [];

  const baseScenarioId = scenarios[0].id;
  const secondScenarioId = scenarios[1]?.id ?? baseScenarioId;

  if (listItem.activeRun) {
    return [
      {
        id: `${projectId}-run-active`,
        name: listItem.activeRun.label,
        status: 'running',
        createdAt: hoursAgo(1),
        scenarioId: baseScenarioId,
      },
    ];
  }

  if (listItem.lastResult.status === 'completed') {
    return [
      {
        id: `${projectId}-run-1`,
        name: 'Расчёт базового сценария',
        status: 'completed',
        createdAt: listItem.updatedAt,
        scenarioId: baseScenarioId,
      },
      {
        id: `${projectId}-run-0`,
        name: 'Предыдущий прогон',
        status: 'completed',
        createdAt: daysAgo(3, 14, 0),
        scenarioId: secondScenarioId,
      },
    ];
  }

  if (listItem.lastResult.status === 'failed') {
    return [
      {
        id: `${projectId}-run-1`,
        name: 'Расчёт с ошибкой',
        status: 'failed',
        createdAt: listItem.updatedAt,
        scenarioId: baseScenarioId,
      },
    ];
  }

  if (listItem.lastResult.status === 'running' || listItem.lastResult.status === 'queued') {
    return [
      {
        id: `${projectId}-run-1`,
        name: listItem.lastResult.label || 'Расчёт',
        status: listItem.lastResult.status,
        createdAt: hoursAgo(2),
        scenarioId: baseScenarioId,
      },
    ];
  }

  return [];
}

function pickLastRun(runs: RunSummary[]): RunSummary | null {
  if (!runs.length) return null;
  return [...runs].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  )[0] ?? null;
}

function buildProjectDetail(
  listItem: ProjectListItem,
  description?: string,
): ProjectDetail {
  const scenarios = buildScenarios(
    listItem.id,
    listItem.updatedAt,
    listItem.scenariosCount,
  );
  const runs = buildRuns(listItem.id, scenarios, listItem);

  return {
    id: listItem.id,
    name: listItem.name,
    status: listItem.status,
    updatedAt: listItem.updatedAt,
    description: description ?? 'Карточка проекта сортировочного центра',
    scenarios,
    runs,
    defaultScenarioId: scenarios.find((s) => s.isDefault)?.id ?? scenarios[0]?.id ?? null,
    lastRun: pickLastRun(runs),
    notifications: getProjectsNotifications(),
  };
}

export const PROJECT_DETAILS: Record<string, ProjectDetail> = Object.fromEntries(
  getProjectsStore().map((project) => [project.id, buildProjectDetail(project)]),
);

export function registerProjectDetail(
  listItem: ProjectListItem,
  description?: string,
): ProjectDetail {
  const detail = buildProjectDetail(listItem, description);
  PROJECT_DETAILS[listItem.id] = detail;
  return detail;
}

export function cacheProjectDetail(detail: ProjectDetail): ProjectDetail {
  PROJECT_DETAILS[detail.id] = detail;
  return detail;
}

export function getProjectDetail(projectId: string): ProjectDetail | null {
  const cached = PROJECT_DETAILS[projectId];
  if (cached) return cached;

  const listItem = findProjectInStore(projectId);
  if (!listItem) return null;

  return registerProjectDetail(listItem);
}

export function getScenarioDetail(
  projectId: string,
  scenarioId: string,
): ScenarioDetail | null {
  const project = getProjectDetail(projectId);
  if (!project) return null;

  const scenario = project.scenarios.find((item) => item.id === scenarioId);
  if (!scenario) return null;

  return {
    id: scenario.id,
    projectId,
    name: scenario.name,
    updatedAt: scenario.updatedAt,
    description: `Сценарий «${scenario.name}» проекта «${project.name}»`,
  };
}

export function getRunDetail(projectId: string, runId: string): RunDetail | null {
  const project = getProjectDetail(projectId);
  if (!project) return null;

  const run =
    project.runs.find((item) => item.id === runId) ??
    (project.lastRun?.id === runId ? project.lastRun : undefined);
  if (!run) return null;

  return {
    id: run.id,
    projectId,
    scenarioId: run.scenarioId,
    name: run.name,
    status: run.status,
    createdAt: run.createdAt,
    finishedAt: run.status === 'completed' || run.status === 'failed'
      ? run.createdAt
      : undefined,
  };
}
