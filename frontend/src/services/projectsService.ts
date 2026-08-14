import { apiClient } from '@/api/client';
import { PROJECTS_PAGE_SIZE } from '@/constants/projects';
import {
  findProjectInStore,
  getProjectsNotifications,
  getProjectsStore,
  removeProjectFromStore,
  upsertProjectInStore,
} from '@/mocks/projectsData';
import { registerProjectDetail } from '@/mocks/projectWorkspaceData';
import { delay } from '@/utils/error';
import { filterAndSortProjects } from '@/utils/projects';
import type {
  CreateProjectApiResponse,
  CreateProjectPayload,
  ProjectListItem,
  ProjectListStatus,
  ProjectsPageData,
  ProjectsQuery,
} from '@/types/projects';

const BASE_DELAY_MS = 600;
const SLOW_DELAY_MS = 2200;
const ERROR_CHANCE = 0.01;

function getLoadDelayMs(): number {
  if (typeof navigator === 'undefined') return BASE_DELAY_MS;

  const connection = (navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
  }).connection;

  if (connection?.saveData) return SLOW_DELAY_MS;

  const type = connection?.effectiveType;
  if (type === 'slow-2g' || type === '2g' || type === '3g') {
    return SLOW_DELAY_MS;
  }

  return BASE_DELAY_MS;
}

function maybeThrowLoadError(): void {
  if (Math.random() < ERROR_CHANCE) {
    throw new Error('Не удалось загрузить проекты. Проверьте подключение и повторите попытку.');
  }
}

function mapStatus(value: unknown): ProjectListStatus {
  if (value === 'completed' || value === 'error' || value === 'archived' || value === 'draft') {
    return value;
  }
  return 'draft';
}

function mapApiProject(
  response: CreateProjectApiResponse,
  fallback?: Partial<ProjectListItem>,
): ProjectListItem {
  const name = response.name || fallback?.name || 'Без названия';
  const updatedAt =
    response.updated_at ?? response.updatedAt ?? fallback?.updatedAt ?? new Date().toISOString();
  const scenariosCount =
    response.scenarios_count ?? response.scenariosCount ?? fallback?.scenariosCount ?? 0;

  return {
    id: response.id,
    name,
    updatedAt,
    status: mapStatus(response.status ?? fallback?.status),
    thumbnail: fallback?.thumbnail ?? '/images/project-plan-1.svg',
    thumbnailAlt: fallback?.thumbnailAlt ?? `Превью проекта «${name}»`,
    scenariosCount,
    lastResult: fallback?.lastResult ?? { status: null, label: 'Нет результатов' },
    activeRun: fallback?.activeRun ?? null,
  };
}

export async function fetchProjectsData(
  query: ProjectsQuery = {},
): Promise<ProjectsPageData> {
  await delay(getLoadDelayMs());
  maybeThrowLoadError();

  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? PROJECTS_PAGE_SIZE);
  const status = query.status ?? 'all';
  const sort = query.sort ?? 'recent';
  const search = query.search ?? '';

  const filtered = filterAndSortProjects(getProjectsStore(), search, status, sort);
  const start = (page - 1) * pageSize;
  const projects = filtered.slice(start, start + pageSize).map((project) => ({
    ...project,
    lastResult: { ...project.lastResult },
    activeRun: project.activeRun ? { ...project.activeRun } : null,
  }));

  return {
    projects,
    totalCount: filtered.length,
    page,
    pageSize,
    hasMore: start + projects.length < filtered.length,
    notifications: getProjectsNotifications(),
  };
}

export async function createProject(
  payload: CreateProjectPayload,
): Promise<ProjectListItem> {
  const name = payload.name.trim();
  const description = payload.description?.trim();

  const { data } = await apiClient.post<CreateProjectApiResponse>('/projects', {
    name,
    description: description || undefined,
  });

  const project = mapApiProject(data, {
    name,
    status: 'draft',
    scenariosCount: 1,
    lastResult: { status: null, label: 'Нет результатов' },
    activeRun: null,
  });
  upsertProjectInStore(project);
  registerProjectDetail(project, description);

  return project;
}

/** PATCH /api/v1/projects/{projectId} */
export async function renameProject(id: string, name: string): Promise<ProjectListItem> {
  const current = findProjectInStore(id);
  const trimmed = name.trim();

  const { data } = await apiClient.patch<CreateProjectApiResponse>(`/projects/${id}`, {
    name: trimmed,
  });

  const next = mapApiProject(data, {
    ...current,
    id,
    name: trimmed,
    status: current?.status,
    thumbnail: current?.thumbnail,
    thumbnailAlt: current?.thumbnailAlt,
    scenariosCount: current?.scenariosCount,
    lastResult: current?.lastResult,
    activeRun: current?.activeRun ?? null,
  });

  upsertProjectInStore(next);
  registerProjectDetail(next);
  return next;
}

/** POST /api/v1/projects/{projectId}/archive */
export async function archiveProject(id: string): Promise<ProjectListItem> {
  const current = findProjectInStore(id);

  const { data } = await apiClient.post<CreateProjectApiResponse>(`/projects/${id}/archive`);

  const next = mapApiProject(
    {
      ...data,
      id: data.id || id,
      name: data.name || current?.name || id,
      status: data.status ?? 'archived',
    },
    {
      ...current,
      id,
      status: 'archived',
      lastResult: current?.lastResult,
      activeRun: null,
    },
  );

  upsertProjectInStore(next);
  registerProjectDetail(next);
  return next;
}

/** POST /api/v1/projects/{projectId}/copies */
export async function duplicateProject(id: string): Promise<ProjectListItem> {
  const source = findProjectInStore(id);

  const { data } = await apiClient.post<CreateProjectApiResponse>(`/projects/${id}/copies`);

  const copyName = source ? `${source.name} (копия)` : data.name || 'Копия проекта';
  const copy = mapApiProject(
    { ...data, name: copyName },
    {
      name: copyName,
      status: source?.status === 'archived' ? 'draft' : source?.status ?? 'draft',
      thumbnail: source?.thumbnail,
      thumbnailAlt: source?.thumbnailAlt,
      scenariosCount: source?.scenariosCount ?? 0,
      lastResult: { status: null, label: 'Нет результатов' },
      activeRun: null,
    },
  );

  upsertProjectInStore(copy);
  registerProjectDetail(copy);
  return copy;
}

/** DELETE /api/v1/projects/{projectId} */
export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
  removeProjectFromStore(id);
}
