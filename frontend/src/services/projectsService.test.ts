import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchProjectsData } from '@/services/projectsService';
import * as projectsApi from '@/services/projects/projectsApi';

vi.mock('@/services/projects/projectsApi');

describe('fetchProjectsData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses API for projects list', async () => {
    vi.spyOn(projectsApi, 'fetchProjectsListApi').mockResolvedValue({
      projects: [],
      totalCount: 0,
      page: 1,
      pageSize: 5,
      hasMore: false,
      notifications: [],
    });

    await fetchProjectsData({ page: 1, pageSize: 5 });

    expect(projectsApi.fetchProjectsListApi).toHaveBeenCalledWith({ page: 1, pageSize: 5 });
  });
});
