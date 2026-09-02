import type { PermissionAction, PermissionResource, ProjectAccess } from '@/types/rbac';
import { can, hasCapability } from '@/constants/permissions';

export type ProjectNavTabId =
  | 'overview'
  | 'model'
  | 'parameters'
  | 'scenarios'
  | 'simulation'
  | 'runs'
  | 'visualization'
  | 'statistics'
  | 'comparison'
  | 'members';

export interface ProjectNavContext {
  projectId: string;
  defaultScenarioId: string | null;
}

export interface ProjectNavTab {
  id: ProjectNavTabId;
  label: string;
  /** Higher value wins when multiple tabs match the current path. */
  matchPriority: number;
  requiresScenario?: boolean;
  resource?: { resource: PermissionResource; action: PermissionAction };
  resourcesAny?: { resource: PermissionResource; action: PermissionAction }[];
  capability?: 'manageMembers';
  getPath: (ctx: ProjectNavContext) => string;
  isActive: (pathname: string, projectId: string) => boolean;
}

function projectBase(projectId: string): string {
  return `/projects/${projectId}`;
}

function scenarioBase(projectId: string, scenarioId: string): string {
  return `${projectBase(projectId)}/scenarios/${scenarioId}`;
}

export function resolveDefaultScenarioId(
  defaultScenarioId: string | null | undefined,
  scenarioIds: string[],
): string | null {
  if (defaultScenarioId && scenarioIds.includes(defaultScenarioId)) {
    return defaultScenarioId;
  }
  return scenarioIds[0] ?? null;
}

/** Tab definitions in display order. */
export const PROJECT_NAV_TABS: ProjectNavTab[] = [
  {
    id: 'overview',
    label: 'Обзор',
    matchPriority: 10,
    resource: { resource: 'project', action: 'read' },
    getPath: ({ projectId }) => projectBase(projectId),
    isActive: (pathname, projectId) => {
      const base = projectBase(projectId);
      return pathname === base || pathname === `${base}/`;
    },
  },
  {
    id: 'model',
    label: 'Модель',
    matchPriority: 90,
    requiresScenario: true,
    resource: { resource: 'model', action: 'read' },
    getPath: ({ projectId, defaultScenarioId }) =>
      defaultScenarioId
        ? `${scenarioBase(projectId, defaultScenarioId)}/editor`
        : `${projectBase(projectId)}/scenarios`,
    isActive: (pathname) => /\/scenarios\/[^/]+\/editor\/?$/.test(pathname),
  },
  {
    id: 'parameters',
    label: 'Параметры',
    matchPriority: 90,
    requiresScenario: true,
    resourcesAny: [
      { resource: 'equipment_params', action: 'read' },
      { resource: 'flow_params', action: 'read' },
    ],
    getPath: ({ projectId, defaultScenarioId }) =>
      defaultScenarioId
        ? `${scenarioBase(projectId, defaultScenarioId)}/parameters`
        : `${projectBase(projectId)}/scenarios`,
    isActive: (pathname) => /\/scenarios\/[^/]+\/parameters\/?$/.test(pathname),
  },
  {
    id: 'scenarios',
    label: 'Сценарии',
    matchPriority: 80,
    resource: { resource: 'scenarios', action: 'read' },
    getPath: ({ projectId }) => `${projectBase(projectId)}/scenarios`,
    isActive: (pathname, projectId) => {
      const listPath = `${projectBase(projectId)}/scenarios`;
      return pathname === listPath || pathname === `${listPath}/`;
    },
  },
  {
    id: 'simulation',
    label: 'Расчёт',
    matchPriority: 70,
    resource: { resource: 'simulation_run', action: 'read' },
    getPath: ({ projectId }) => `${projectBase(projectId)}/simulation`,
    isActive: (pathname, projectId) =>
      pathname.startsWith(`${projectBase(projectId)}/simulation`),
  },
  {
    id: 'runs',
    label: 'Прогоны',
    matchPriority: 70,
    resource: { resource: 'simulation_results', action: 'read' },
    getPath: ({ projectId }) => `${projectBase(projectId)}/runs`,
    isActive: (pathname, projectId) =>
      pathname.startsWith(`${projectBase(projectId)}/runs`),
  },
  {
    id: 'visualization',
    label: 'Визуализация',
    matchPriority: 60,
    resource: { resource: 'visualization', action: 'read' },
    getPath: ({ projectId }) => `${projectBase(projectId)}/visualization`,
    isActive: (pathname, projectId) =>
      pathname.startsWith(`${projectBase(projectId)}/visualization`),
  },
  {
    id: 'statistics',
    label: 'Статистика',
    matchPriority: 60,
    resource: { resource: 'statistics', action: 'read' },
    getPath: ({ projectId }) => `${projectBase(projectId)}/statistics`,
    isActive: (pathname, projectId) =>
      pathname.startsWith(`${projectBase(projectId)}/statistics`),
  },
  {
    id: 'comparison',
    label: 'Сравнение',
    matchPriority: 60,
    resource: { resource: 'comparison', action: 'read' },
    getPath: ({ projectId }) => `${projectBase(projectId)}/comparison`,
    isActive: (pathname, projectId) =>
      pathname.startsWith(`${projectBase(projectId)}/comparison`),
  },
  {
    id: 'members',
    label: 'Участники',
    matchPriority: 50,
    capability: 'manageMembers',
    getPath: ({ projectId }) => `${projectBase(projectId)}/members`,
    isActive: (pathname, projectId) =>
      pathname.startsWith(`${projectBase(projectId)}/members`),
  },
];

function isTabVisible(tab: ProjectNavTab, access: ProjectAccess | null): boolean {
  if (tab.capability) {
    return hasCapability(access, tab.capability);
  }
  if (tab.resourcesAny?.length) {
    return tab.resourcesAny.some((check) => can(access, check.resource, check.action));
  }
  if (tab.resource) {
    return can(access, tab.resource.resource, tab.resource.action);
  }
  return true;
}

export function filterProjectNavTabs(
  access: ProjectAccess | null,
  tabs: ProjectNavTab[] = PROJECT_NAV_TABS,
): ProjectNavTab[] {
  return tabs.filter((tab) => isTabVisible(tab, access));
}

export function resolveActiveProjectTab(
  pathname: string,
  projectId: string,
  tabs: ProjectNavTab[] = PROJECT_NAV_TABS,
): ProjectNavTab | null {
  const matches = tabs.filter((tab) => tab.isActive(pathname, projectId));
  if (matches.length === 0) return null;
  return matches.reduce((best, tab) =>
    tab.matchPriority > best.matchPriority ? tab : best,
  );
}

export function buildProjectNavContext(
  projectId: string,
  defaultScenarioId: string | null | undefined,
  scenarioIds: string[],
): ProjectNavContext {
  return {
    projectId,
    defaultScenarioId: resolveDefaultScenarioId(defaultScenarioId, scenarioIds),
  };
}
