import { describe, expect, it } from 'vitest';
import {
  mapAuthToken,
  mapCreateProjectResponse,
  mapProjectListItem,
  mapProjectsPageResponse,
  mapProjectStatus,
  mapRun,
  mapScenarioSummary,
  mapUser,
  pick,
  pickRequired,
} from '@/api/mappers';

describe('mappers', () => {
  it('pick prefers camelCase over snake_case', () => {
    expect(pick('snake', 'camel')).toBe('camel');
    expect(pick('snake', undefined)).toBe('snake');
  });

  it('pickRequired falls back when both values are missing', () => {
    expect(pickRequired(undefined, undefined, 'fallback')).toBe('fallback');
  });

  it('mapAuthToken supports access_token and token', () => {
    expect(mapAuthToken({ access_token: 'abc' })).toBe('abc');
    expect(mapAuthToken({ token: 'xyz' })).toBe('xyz');
    expect(() => mapAuthToken({})).toThrow('Токен авторизации не получен');
  });

  it('mapUser maps API user', () => {
    expect(
      mapUser({
        id: '1',
        name: 'Иван',
        email: 'ivan@example.com',
        team: 'SC-1',
      }),
    ).toEqual({
      id: '1',
      name: 'Иван',
      email: 'ivan@example.com',
      team: 'SC-1',
      role: 'SUPPLY_CHAIN_MANAGER',
      organization: undefined,
    });
  });

  it('mapProjectStatus defaults to draft for unknown values', () => {
    expect(mapProjectStatus('ready')).toBe('ready');
    expect(mapProjectStatus('running')).toBe('running');
    expect(mapProjectStatus('unknown')).toBe('draft');
  });

  it('mapProjectListItem maps snake_case API payload', () => {
    const project = mapProjectListItem({
      id: 'proj-1',
      name: 'СЦ 100К',
      updated_at: '2026-09-01T10:00:00.000Z',
      status: 'ready',
      scenarios_count: 2,
      last_result: { status: 'completed', label: '99 972 тов./ч' },
      active_run: { progress: 65, label: 'SimPy #48' },
    });

    expect(project).toMatchObject({
      id: 'proj-1',
      name: 'СЦ 100К',
      updatedAt: '2026-09-01T10:00:00.000Z',
      status: 'ready',
      scenariosCount: 2,
      lastResult: { status: 'completed', label: '99 972 тов./ч' },
      activeRun: { progress: 65, label: 'SimPy #48' },
    });
  });

  it('mapCreateProjectResponse reuses project list mapper', () => {
    const project = mapCreateProjectResponse({
      id: 'proj-2',
      name: 'Новый проект',
      status: 'draft',
      scenarios_count: 1,
    });

    expect(project.id).toBe('proj-2');
    expect(project.scenariosCount).toBe(1);
    expect(project.status).toBe('draft');
  });

  it('mapScenarioSummary maps default flag', () => {
    expect(
      mapScenarioSummary({
        id: 'sc-1',
        name: 'Базовый',
        updated_at: '2026-09-01T10:00:00.000Z',
        is_default: true,
      }),
    ).toEqual({
      id: 'sc-1',
      name: 'Базовый',
      updatedAt: '2026-09-01T10:00:00.000Z',
      isDefault: true,
    });
  });

  it('mapRun maps snake_case run payload', () => {
    expect(
      mapRun({
        id: 'run-1',
        project_id: 'proj-1',
        scenario_id: 'sc-1',
        scenario_version: 3,
        type: 'simulation',
        status: 'running',
        progress: 42,
        started_at: '2026-09-01T10:00:00.000Z',
        finished_at: null,
      }),
    ).toEqual({
      id: 'run-1',
      projectId: 'proj-1',
      scenarioId: 'sc-1',
      scenarioVersion: 3,
      type: 'simulation',
      status: 'running',
      progress: 42,
      startedAt: '2026-09-01T10:00:00.000Z',
      finishedAt: null,
    });
  });

  it('mapProjectsPageResponse maps paginated snake_case response', () => {
    const page = mapProjectsPageResponse({
      items: [
        {
          id: 'proj-1',
          name: 'СЦ 100К',
          updated_at: '2026-09-01T10:00:00.000Z',
          status: 'completed',
          scenarios_count: 2,
        },
      ],
      total_count: 10,
      page: 2,
      page_size: 5,
      has_more: false,
      notifications: [{ id: 'n1', title: 'Test', message: 'Msg', read: false, createdAt: '2026-09-01' }],
    });

    expect(page.totalCount).toBe(10);
    expect(page.page).toBe(2);
    expect(page.pageSize).toBe(5);
    expect(page.hasMore).toBe(false);
    expect(page.projects).toHaveLength(1);
    expect(page.projects[0]?.name).toBe('СЦ 100К');
    expect(page.notifications).toHaveLength(1);
  });

  it('mapProjectsPageResponse returns empty list when items missing', () => {
    const page = mapProjectsPageResponse({});

    expect(page.projects).toEqual([]);
    expect(page.totalCount).toBe(0);
    expect(page.hasMore).toBe(false);
  });
});
