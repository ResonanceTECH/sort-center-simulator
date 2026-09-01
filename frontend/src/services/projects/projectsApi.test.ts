import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/api/client';
import { fetchProjectsListApi } from '@/services/projects/projectsApi';

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('fetchProjectsListApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends correct query params', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        items: [],
        total_count: 0,
        page: 1,
        page_size: 5,
        has_more: false,
      },
    });

    await fetchProjectsListApi({
      search: '  СЦ  ',
      status: 'draft',
      sort: 'name_asc',
      page: 2,
      pageSize: 10,
    });

    expect(apiClient.get).toHaveBeenCalledWith('/projects', {
      params: {
        search: 'СЦ',
        status: 'draft',
        sort: 'name_asc',
        page: 2,
        page_size: 10,
      },
    });
  });

  it('maps response to ProjectsPageData', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        items: [
          {
            id: 'proj-1',
            name: 'Тест',
            updated_at: '2026-09-01T10:00:00.000Z',
            status: 'draft',
            scenarios_count: 1,
          },
        ],
        total_count: 1,
        page: 1,
        page_size: 5,
        has_more: false,
      },
    });

    const result = await fetchProjectsListApi();

    expect(result.projects[0]?.id).toBe('proj-1');
    expect(result.totalCount).toBe(1);
    expect(result.hasMore).toBe(false);
  });

  it('propagates ApiError', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

    await expect(fetchProjectsListApi()).rejects.toThrow('Network error');
  });
});
