import type { User, UserApiResponse } from '@/types/auth';
import type {
  CreateProjectApiResponse,
  ProjectActiveRun,
  ProjectLastResult,
  ProjectListItem,
  ProjectListItemApi,
  ProjectListStatus,
  ProjectLastResultStatus,
  ProjectsListApiResponse,
  ProjectsPageData,
} from '@/types/projects';
import type { ScenarioSummary, ScenarioSummaryApi } from '@/types/projectWorkspace';
import type { Run, RunApiResponse, RunStatus, RunType } from '@/types/runs';

export function pick<T>(snake?: T, camel?: T): T | undefined {
  return camel ?? snake;
}

export function pickRequired<T>(
  snake: T | undefined,
  camel: T | undefined,
  fallback: T,
): T {
  return camel ?? snake ?? fallback;
}

export function mapAuthToken(dto: { access_token?: string; token?: string }): string {
  const token = dto.access_token ?? dto.token;
  if (!token) {
    throw new Error('Токен авторизации не получен');
  }
  return token;
}

export function mapUser(dto: UserApiResponse): User {
  return {
    id: dto.id,
    name: dto.name,
    email: dto.email,
    team: dto.team,
  };
}

export function mapProjectStatus(value: unknown): ProjectListStatus {
  if (
    value === 'draft' ||
    value === 'ready' ||
    value === 'running' ||
    value === 'completed' ||
    value === 'error' ||
    value === 'archived'
  ) {
    return value;
  }
  return 'draft';
}

function mapLastResultStatus(value: unknown): ProjectLastResultStatus {
  if (value === 'completed' || value === 'failed' || value === 'running' || value === 'queued') {
    return value;
  }
  return null;
}

function mapLastResult(
  dto?: ProjectListItemApi['lastResult'] | ProjectListItemApi['last_result'],
  fallback?: ProjectLastResult,
): ProjectLastResult {
  if (!dto) {
    return fallback ?? { status: null, label: 'Нет результатов' };
  }

  return {
    status: mapLastResultStatus(dto.status),
    label: dto.label ?? fallback?.label ?? 'Нет результатов',
  };
}

function mapActiveRun(
  dto?: ProjectListItemApi['activeRun'] | ProjectListItemApi['active_run'] | null,
  fallback?: ProjectActiveRun | null,
): ProjectActiveRun | null {
  if (!dto) {
    return fallback ?? null;
  }

  return {
    progress: dto.progress ?? fallback?.progress ?? 0,
    label: dto.label ?? fallback?.label ?? 'Симуляция',
  };
}

export function mapProjectListItem(
  dto: ProjectListItemApi,
  fallback?: Partial<ProjectListItem>,
): ProjectListItem {
  const name = dto.name || fallback?.name || 'Без названия';
  const updatedAt = pickRequired(dto.updated_at, dto.updatedAt, fallback?.updatedAt ?? new Date().toISOString());
  const scenariosCount = pick(dto.scenarios_count, dto.scenariosCount) ?? fallback?.scenariosCount ?? 0;
  const thumbnail = dto.thumbnail ?? fallback?.thumbnail ?? '/images/project-plan-1.svg';

  return {
    id: dto.id,
    name,
    updatedAt,
    status: mapProjectStatus(dto.status ?? fallback?.status),
    thumbnail,
    thumbnailAlt:
      pick(dto.thumbnail_alt, dto.thumbnailAlt) ??
      fallback?.thumbnailAlt ??
      `Превью проекта «${name}»`,
    scenariosCount,
    lastResult: mapLastResult(dto.lastResult ?? dto.last_result, fallback?.lastResult),
    activeRun: mapActiveRun(dto.activeRun ?? dto.active_run, fallback?.activeRun ?? null),
  };
}

export function mapCreateProjectResponse(
  dto: CreateProjectApiResponse,
  fallback?: Partial<ProjectListItem>,
): ProjectListItem {
  return mapProjectListItem(dto, fallback);
}

export function mapProjectsPageResponse(dto: ProjectsListApiResponse): ProjectsPageData {
  const items = dto.items ?? dto.projects ?? [];
  const page = dto.page ?? 1;
  const pageSize = dto.page_size ?? dto.pageSize ?? items.length;
  const totalCount = dto.total_count ?? dto.totalCount ?? items.length;
  const hasMore = dto.has_more ?? dto.hasMore ?? false;

  return {
    projects: items.map((item) => mapProjectListItem(item)),
    totalCount,
    page,
    pageSize,
    hasMore,
    notifications: dto.notifications ?? [],
  };
}

export function mapScenarioSummary(dto: ScenarioSummaryApi): ScenarioSummary {
  return {
    id: dto.id,
    name: dto.name,
    updatedAt: pickRequired(dto.updated_at, dto.updatedAt, new Date().toISOString()),
    isDefault: pick(dto.is_default, dto.isDefault),
  };
}

function mapRunType(value: string): RunType {
  return value === 'simulation' ? 'simulation' : 'analytical';
}

function mapRunStatus(value: string): RunStatus {
  if (
    value === 'queued' ||
    value === 'preparing' ||
    value === 'running' ||
    value === 'completed' ||
    value === 'completed_with_warnings' ||
    value === 'failed' ||
    value === 'cancelled' ||
    value === 'outdated'
  ) {
    return value;
  }
  return 'queued';
}

export function mapRun(dto: RunApiResponse): Run {
  return {
    id: dto.id,
    projectId: pickRequired(dto.project_id, dto.projectId, ''),
    scenarioId: pickRequired(dto.scenario_id, dto.scenarioId, ''),
    scenarioVersion: pick(dto.scenario_version, dto.scenarioVersion) ?? 0,
    type: mapRunType(dto.type),
    status: mapRunStatus(dto.status),
    progress: dto.progress ?? 0,
    startedAt: pick(dto.started_at, dto.startedAt) ?? null,
    finishedAt: pick(dto.finished_at, dto.finishedAt) ?? null,
  };
}
