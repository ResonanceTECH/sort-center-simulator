import { beforeEach, describe, expect, it } from 'vitest';
import { replaceProjectsStore } from '@/mocks/projectsData';
import { fetchProjectsListMock } from '@/services/projects/projectsMock';
import type { ProjectListItem } from '@/types/projects';

const SAMPLE_PROJECTS: ProjectListItem[] = [
  {
    id: 'proj-1',
    name: 'СЦ Альфа',
    updatedAt: '2026-09-03T10:00:00.000Z',
    status: 'completed',
    thumbnail: '/images/project-plan-1.svg',
    thumbnailAlt: 'Альфа',
    scenariosCount: 2,
    lastResult: { status: 'completed', label: 'Успешно' },
    activeRun: null,
  },
  {
    id: 'proj-2',
    name: 'СЦ Бета',
    updatedAt: '2026-09-01T10:00:00.000Z',
    status: 'draft',
    thumbnail: '/images/project-plan-2.svg',
    thumbnailAlt: 'Бета',
    scenariosCount: 1,
    lastResult: { status: null, label: 'Нет результатов' },
    activeRun: null,
  },
  {
    id: 'proj-3',
    name: 'Архивный проект',
    updatedAt: '2026-08-01T10:00:00.000Z',
    status: 'archived',
    thumbnail: '/images/project-plan-3.svg',
    thumbnailAlt: 'Архив',
    scenariosCount: 1,
    lastResult: { status: null, label: 'Нет результатов' },
    activeRun: null,
  },
];

describe('fetchProjectsListMock', () => {
  beforeEach(() => {
    replaceProjectsStore(SAMPLE_PROJECTS.map((project) => ({
      ...project,
      lastResult: { ...project.lastResult },
      activeRun: project.activeRun ? { ...project.activeRun } : null,
    })));
  });

  it('filters by search', async () => {
    const result = await fetchProjectsListMock({ search: 'альфа' });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0]?.name).toBe('СЦ Альфа');
  });

  it('filters by status', async () => {
    const result = await fetchProjectsListMock({ status: 'draft' });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0]?.status).toBe('draft');
  });

  it('paginates correctly', async () => {
    const result = await fetchProjectsListMock({ page: 1, pageSize: 1, sort: 'recent' });

    expect(result.projects).toHaveLength(1);
    expect(result.totalCount).toBe(2);
    expect(result.hasMore).toBe(true);
  });

  it('excludes archived when status=all and sort!=archived', async () => {
    const result = await fetchProjectsListMock({ status: 'all', sort: 'recent' });

    expect(result.projects.map((project) => project.id)).toEqual(['proj-1', 'proj-2']);
  });
});
