import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/app/queryClient';
import { connectMockSse } from '@/services/scm/realtimeMock';
import type { ShipmentsPageData, ShipmentSummary } from '@/types/scm/shipment';
import type { RealtimeEvent } from '@/types/scm/realtime';

/**
 * Patch shipment cards in cache on ETA/status events — no full page reload, keep scroll/filters.
 */
export function useShipmentBoardRealtime(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const disconnect = connectMockSse((event: RealtimeEvent) => {
      if (event.type !== 'ETA_UPDATE' && event.type !== 'SHIPMENT_STATUS' && event.type !== 'NEW_EXCEPTION') {
        return;
      }
      if (event.entityType !== 'shipment' && event.type !== 'NEW_EXCEPTION') return;

      const entityId = event.entityId;
      queryClient.setQueriesData<ShipmentsPageData>({ queryKey: ['shipments'] }, (prev) => {
        if (!prev) return prev;
        const idx = prev.items.findIndex((s) => s.id === entityId);
        if (idx < 0) return prev;
        const current = prev.items[idx]!;
        const nextItem: ShipmentSummary = {
          ...current,
          ...(event.type === 'ETA_UPDATE'
            ? {
                forecastEta: new Date(Date.now() + 90 * 60_000).toISOString(),
                deviationMinutes: current.deviationMinutes + 15,
                lastTrackingAt: new Date().toISOString(),
                trackingStatus: 'OK' as const,
              }
            : {}),
          ...(event.type === 'SHIPMENT_STATUS'
            ? {
                // keep status; bump tracking freshness for visual feedback
                lastTrackingAt: new Date().toISOString(),
              }
            : {}),
        };
        const items = [...prev.items];
        items[idx] = nextItem;
        return { ...prev, items };
      });

      void queryClient.invalidateQueries({ queryKey: queryKeys.shipment(entityId) });
    });

    return disconnect;
  }, [enabled, queryClient]);
}
