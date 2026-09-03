import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/queryClient';
import { applyMapPositionUpdate } from '@/mocks/scm/mapData';
import { fetchLiveMap } from '@/services/scm/scmService';
import { subscribeMapPositionUpdates } from '@/services/scm/realtimeMock';
import type { LiveMapData } from '@/types/scm/map';

/**
 * Live map query + dedicated realtime subscription for marker movement.
 * Separate from InternalLayout SSE so the map page updates positions without full refetch.
 */
export function useLiveMapData() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.liveMap,
    queryFn: fetchLiveMap,
    staleTime: 60_000,
  });

  useEffect(() => {
    return subscribeMapPositionUpdates((payload) => {
      queryClient.setQueryData<LiveMapData>(queryKeys.liveMap, (prev) =>
        prev ? applyMapPositionUpdate(prev, payload) : prev,
      );
    });
  }, [queryClient]);

  return query;
}
