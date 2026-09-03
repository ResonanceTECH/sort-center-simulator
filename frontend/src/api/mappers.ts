import type { MeApiResponse, OrganizationInfo, User, UserApiResponse, WorkspaceType } from '@/types/auth';
import type { AppRole } from '@/types/scm/roles';
import { getRolePermissions } from '@/constants/scmPermissions';
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

const KNOWN_ROLES: AppRole[] = [
  'ADMIN',
  'SUPPLY_CHAIN_MANAGER',
  'SUPPLY_PLANNER',
  'LOGISTICS_MANAGER',
  'ANALYST',
  'SUPPLIER',
  'CARRIER',
];

function asAppRole(value: string | undefined, fallback: AppRole = 'SUPPLY_CHAIN_MANAGER'): AppRole {
  if (value && (KNOWN_ROLES as string[]).includes(value)) {
    return value as AppRole;
  }
  return fallback;
}

function asWorkspace(value: string): WorkspaceType | null {
  if (value === 'INTERNAL' || value === 'ADMIN' || value === 'SUPPLIER' || value === 'CARRIER') {
    return value;
  }
  return null;
}

function workspacesFromRoles(roles: AppRole[]): WorkspaceType[] {
  const set = new Set<WorkspaceType>();
  for (const role of roles) {
    if (role === 'ADMIN') set.add('ADMIN');
    else if (role === 'SUPPLIER') set.add('SUPPLIER');
    else if (role === 'CARRIER') set.add('CARRIER');
    else set.add('INTERNAL');
  }
  return (['ADMIN', 'INTERNAL', 'SUPPLIER', 'CARRIER'] as WorkspaceType[]).filter((w) => set.has(w));
}

export function mapUser(dto: UserApiResponse): User {
  const nested = dto.user;
  const roleCodes = (dto.roles ?? (dto.role ? [dto.role] : [])).map(String);
  const roles = (roleCodes.length ? roleCodes : ['SUPPLY_CHAIN_MANAGER']).map((r) => asAppRole(r));
  const role = asAppRole(dto.role ? String(dto.role) : roles[0], roles[0]);

  const orgRaw = dto.organization;
  let organizationInfo: OrganizationInfo | undefined;
  let organizationName: string | undefined;
  if (orgRaw && typeof orgRaw === 'object') {
    organizationInfo = orgRaw;
    organizationName = orgRaw.name;
  } else if (typeof orgRaw === 'string') {
    organizationName = orgRaw;
  }

  const availableWorkspaces =
    (dto.available_workspaces ?? dto.availableWorkspaces ?? [])
      .map(asWorkspace)
      .filter((w): w is WorkspaceType => w != null);

  return {
    id: nested?.id ?? dto.id ?? '',
    name: nested?.name ?? dto.name ?? '',
    email: nested?.email ?? dto.email ?? '',
    team: nested?.team ?? dto.team,
    role,
    roles,
    permissions: Array.isArray(dto.permissions) ? dto.permissions : [...getRolePermissions(role)],
    availableWorkspaces: availableWorkspaces.length ? availableWorkspaces : workspacesFromRoles(roles),
    organization: organizationName ?? dto.organization_id ?? dto.organizationId,
    organizationId: dto.organization_id ?? dto.organizationId ?? organizationInfo?.id,
    organizationInfo,
    organizationType: dto.organization_type ?? dto.organizationType ?? organizationInfo?.type,
  };
}

export function mapMe(dto: MeApiResponse): User {
  const roles = (dto.roles ?? (dto.role ? [dto.role] : [])).map((r) => asAppRole(String(r)));
  const role = roles[0] ?? 'SUPPLY_CHAIN_MANAGER';
  const org = dto.organization ?? undefined;
  const workspaces = (dto.available_workspaces ?? [])
    .map(asWorkspace)
    .filter((w): w is WorkspaceType => w != null);

  return {
    id: dto.user?.id ?? dto.id ?? '',
    name: dto.user?.name ?? dto.name ?? '',
    email: dto.user?.email ?? dto.email ?? '',
    team: dto.user?.team ?? dto.team,
    role,
    roles: roles.length ? roles : [role],
    permissions: dto.permissions ?? [...getRolePermissions(role)],
    availableWorkspaces: workspaces.length ? workspaces : workspacesFromRoles(roles.length ? roles : [role]),
    organization: org?.name ?? dto.organization_id,
    organizationId: org?.id ?? dto.organization_id,
    organizationInfo: org ?? undefined,
    organizationType: dto.organization_type ?? org?.type,
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
