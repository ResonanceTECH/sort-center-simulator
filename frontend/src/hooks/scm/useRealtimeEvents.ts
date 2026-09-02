import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/queryClient';
import { connectMockSse } from '@/services/scm/realtimeMock';
import { useUiStore } from '@/store/uiStore';
import type { RealtimeEvent } from '@/types/scm/realtime';

function invalidateForEvent(queryClient: ReturnType<typeof useQueryClient>, event: RealtimeEvent) {
  switch (event.type) {
    case 'ETA_UPDATE':
    case 'SHIPMENT_STATUS':
      void queryClient.invalidateQueries({ queryKey: queryKeys.shipment(event.entityId) });
      void queryClient.invalidateQueries({ queryKey: ['shipments'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.controlTower });
      break;
    case 'NEW_EXCEPTION':
      void queryClient.invalidateQueries({ queryKey: ['exceptions'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.controlTower });
      break;
    case 'INCIDENT_UPDATE':
      void queryClient.invalidateQueries({ queryKey: queryKeys.incident(event.entityId) });
      void queryClient.invalidateQueries({ queryKey: ['incidents'] });
      break;
    case 'SCENARIO_PROGRESS':
      void queryClient.invalidateQueries({ queryKey: queryKeys.scenario(event.entityId) });
      void queryClient.invalidateQueries({ queryKey: ['scenarios'] });
      break;
    case 'NOTIFICATION':
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
      break;
    default:
      break;
  }
}

export function useRealtimeEvents(enabled = true) {
  const queryClient = useQueryClient();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  useEffect(() => {
    if (!enabled) return;

    const disconnect = connectMockSse((event) => {
      invalidateForEvent(queryClient, event);
      showSnackbar(event.message, 'info');
    });

    return disconnect;
  }, [enabled, queryClient, showSnackbar]);
}
