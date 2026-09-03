import { useCallback, useMemo } from 'react';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import type { SortDir } from '@/utils/tableSort';

const TABLE_URL_DEFAULTS = {
  page: '0',
  pageSize: '25',
  sortBy: undefined as string | undefined,
  sortDir: undefined as string | undefined,
};

export function useDataTableUrlState<T extends Record<string, string | undefined>>(
  filterDefaults: T,
) {
  const defaults = useMemo(
    () => ({ ...filterDefaults, ...TABLE_URL_DEFAULTS }),
    [filterDefaults],
  );

  const [filters, setFilters, clearFilter] = useUrlFilters(defaults);

  const pagination = useMemo(
    () => ({
      page: Number(filters.page ?? 0),
      pageSize: Number(filters.pageSize ?? 25),
    }),
    [filters.page, filters.pageSize],
  );

  const sortDir: SortDir = filters.sortDir === 'desc' ? 'desc' : 'asc';

  const sorting = useMemo(
    () => ({
      sortBy: filters.sortBy,
      sortDir: filters.sortBy ? sortDir : undefined,
    }),
    [filters.sortBy, sortDir],
  );

  const onSortChange = useCallback(
    (sortBy: string, dir: SortDir) => {
      setFilters({ sortBy, sortDir: dir, page: '0' } as Partial<typeof filters>);
    },
    [setFilters],
  );

  const onPageChange = useCallback(
    (page: number) => {
      setFilters({ page: String(page) } as Partial<typeof filters>);
    },
    [setFilters],
  );

  const onPageSizeChange = useCallback(
    (pageSize: number) => {
      setFilters({ pageSize: String(pageSize), page: '0' } as Partial<typeof filters>);
    },
    [setFilters],
  );

  const setFilterValues = useCallback(
    (updates: Partial<T>) => {
      setFilters({ ...updates, page: '0' } as Partial<typeof filters>);
    },
    [setFilters],
  );

  return {
    filters,
    setFilters,
    setFilterValues,
    clearFilter,
    pagination,
    sorting,
    sortBy: filters.sortBy,
    sortDir,
    onSortChange,
    onPageChange,
    onPageSizeChange,
  };
}
