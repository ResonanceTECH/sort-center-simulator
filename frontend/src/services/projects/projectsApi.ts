import { apiClient } from '@/api/client';
import { mapProjectsPageResponse } from '@/api/mappers';
import type { ProjectsListApiResponse, ProjectsPageData, ProjectsQuery } from '@/types/projects';

function toQueryParams(query: ProjectsQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (query.search?.trim()) {
    params.search = query.search.trim();
  }
  if (query.status && query.status !== 'all') {
    params.status = query.status;
  }
  if (query.sort) {
    params.sort = query.sort;
  }
  if (query.page) {
    params.page = query.page;
  }
  if (query.pageSize) {
    params.page_size = query.pageSize;
  }

  return params;
}

export async function fetchProjectsListApi(
  query: ProjectsQuery = {},
): Promise<ProjectsPageData> {
  const { data } = await apiClient.get<ProjectsListApiResponse>('/projects', {
    params: toQueryParams(query),
  });

  return mapProjectsPageResponse(data);
}
