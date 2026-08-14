import { useCallback, useEffect, useRef, useState } from 'react';
import { PROJECTS_PAGE_SIZE } from '@/constants/projects';
import { fetchProjectsData } from '@/services/projectsService';
import { getErrorMessage } from '@/utils/error';
import type {
  ProjectListItem,
  ProjectListStatus,
  ProjectSortOption,
  ProjectsPageData,
  ProjectsQuery,
} from '@/types/projects';

export interface UseProjectsDataParams {
  search: string;
  status: ProjectListStatus | 'all';
  sort: ProjectSortOption;
  pageSize?: number;
}

interface ProjectsListState {
  projects: ProjectListItem[];
  totalCount: number;
  page: number;
  hasMore: boolean;
  notifications: ProjectsPageData['notifications'];
  error: string | null;
  loading: boolean;
  loadingMore: boolean;
}

const emptyState: ProjectsListState = {
  projects: [],
  totalCount: 0,
  page: 0,
  hasMore: false,
  notifications: [],
  error: null,
  loading: true,
  loadingMore: false,
};

export function useProjectsData({
  search,
  status,
  sort,
  pageSize = PROJECTS_PAGE_SIZE,
}: UseProjectsDataParams) {
  const [state, setState] = useState<ProjectsListState>(emptyState);
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadPage = useCallback(
    async (page: number, mode: 'replace' | 'append') => {
      const requestId = ++requestIdRef.current;

      setState((prev) => ({
        ...prev,
        loading: mode === 'replace',
        loadingMore: mode === 'append',
        error: null,
        ...(mode === 'replace' && page === 1 && prev.projects.length === 0
          ? { projects: [] }
          : null),
      }));

      const query: ProjectsQuery = { search, status, sort, page, pageSize };

      try {
        const data = await fetchProjectsData(query);
        if (!mountedRef.current || requestId !== requestIdRef.current) return;

        setState((prev) => ({
          projects:
            mode === 'append' ? [...prev.projects, ...data.projects] : data.projects,
          totalCount: data.totalCount,
          page: data.page,
          hasMore: data.hasMore,
          notifications: data.notifications,
          error: null,
          loading: false,
          loadingMore: false,
        }));
      } catch (err) {
        if (!mountedRef.current || requestId !== requestIdRef.current) return;

        setState((prev) => ({
          ...prev,
          error: getErrorMessage(err),
          loading: false,
          loadingMore: false,
          ...(mode === 'replace' ? { projects: [], totalCount: 0, page: 0, hasMore: false } : null),
        }));
      }
    },
    [search, status, sort, pageSize],
  );

  useEffect(() => {
    void loadPage(1, 'replace');
  }, [loadPage]);

  const retry = useCallback(() => {
    void loadPage(1, 'replace');
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (state.loading || state.loadingMore || !state.hasMore) return;
    void loadPage(state.page + 1, 'append');
  }, [loadPage, state.hasMore, state.loading, state.loadingMore, state.page]);

  const refresh = useCallback(async () => {
    await loadPage(1, 'replace');
  }, [loadPage]);

  return {
    projects: state.projects,
    totalCount: state.totalCount,
    page: state.page,
    hasMore: state.hasMore,
    notifications: state.notifications,
    error: state.error,
    loading: state.loading,
    loadingMore: state.loadingMore,
    retry,
    loadMore,
    refresh,
  };
}
