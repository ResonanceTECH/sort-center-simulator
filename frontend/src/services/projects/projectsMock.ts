import { PROJECTS_PAGE_SIZE } from '@/constants/projects';
import { getProjectsNotifications, getProjectsStore } from '@/mocks/projectsData';
import { delay } from '@/utils/error';
import { filterAndSortProjects } from '@/utils/projects';
import type { ProjectsPageData, ProjectsQuery } from '@/types/projects';

const BASE_DELAY_MS = 400;

export async function fetchProjectsListMock(
  query: ProjectsQuery = {},
): Promise<ProjectsPageData> {
  await delay(BASE_DELAY_MS);

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
