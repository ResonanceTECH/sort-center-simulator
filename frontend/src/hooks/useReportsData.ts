import { useCallback } from 'react';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchReports } from '@/services/reportsService';
import type { ReportsQuery } from '@/types/reports';

export function useReportsData(query: ReportsQuery) {
  const fetcher = useCallback(
    () =>
      fetchReports({
        search: query.search,
        type: query.type,
        status: query.status,
        format: query.format,
      }),
    [query.search, query.type, query.status, query.format],
  );

  return useAsyncData(fetcher);
}
