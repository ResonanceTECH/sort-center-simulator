import { createMapPositionUpdate } from '@/mocks/scm/mapData';
import type { RealtimeEvent, RealtimeMapPayload } from '@/types/scm/realtime';

type Listener = (event: RealtimeEvent) => void;
type MapListener = (payload: RealtimeMapPayload) => void;

const EVENT_TEMPLATES: Omit<RealtimeEvent, 'id' | 'timestamp'>[] = [
  {
    type: 'ETA_UPDATE',
    entityType: 'shipment',
    entityId: 'SH-0184',
    message: 'ETA обновлён: SH-0184 +15 мин',
    link: '/shipments/SH-0184',
  },
  {
    type: 'NEW_EXCEPTION',
    entityType: 'exception',
    entityId: 'exc-001',
    message: 'Новое отклонение: длительная остановка ТС',
    link: '/exceptions/exc-001',
  },
  {
    type: 'SHIPMENT_STATUS',
    entityType: 'shipment',
    entityId: 'SH-0156',
    message: 'Поставка SH-0156 — в пути',
    link: '/shipments/SH-0156',
  },
  {
    type: 'INCIDENT_UPDATE',
    entityType: 'incident',
    entityId: 'inc-002',
    message: 'Инцидент inc-002 — ответ перевозчика',
    link: '/incidents/inc-002',
  },
  {
    type: 'SCENARIO_PROGRESS',
    entityType: 'scenario',
    entityId: 'scn-002',
    message: 'Расчёт сценария 78%',
    link: '/scenarios/scn-002',
  },
  {
    type: 'NOTIFICATION',
    entityType: 'notification',
    entityId: 'n-live',
    message: 'План требует согласования',
    link: '/planning/transport',
  },
];

let sseTimer: ReturnType<typeof setInterval> | null = null;
let mapTimer: ReturnType<typeof setInterval> | null = null;
let index = 0;
const listeners = new Set<Listener>();
const mapListeners = new Set<MapListener>();

function emit(event: RealtimeEvent) {
  listeners.forEach((fn) => fn(event));
}

function emitMapPosition(payload: RealtimeMapPayload) {
  mapListeners.forEach((fn) => fn(payload));
  emit({
    id: `rt-map-${Date.now()}`,
    type: 'MAP_POSITION_UPDATE',
    entityType: 'vehicle',
    entityId: payload.markerId,
    message: `Обновление позиции: ${payload.markerId}`,
    timestamp: new Date().toISOString(),
    mapPayload: payload,
  });
}

export function subscribeRealtimeEvents(listener: Listener): () => void {
  listeners.add(listener);

  if (!sseTimer) {
    sseTimer = setInterval(() => {
      const template = EVENT_TEMPLATES[index % EVENT_TEMPLATES.length]!;
      index += 1;
      emit({
        ...template,
        id: `rt-${Date.now()}`,
        timestamp: new Date().toISOString(),
      });
    }, 12_000);
  }

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && sseTimer) {
      clearInterval(sseTimer);
      sseTimer = null;
    }
  };
}

/** High-frequency marker ticks for live map (mock GPS pings). */
export function subscribeMapPositionUpdates(listener: MapListener): () => void {
  mapListeners.add(listener);

  if (!mapTimer) {
    mapTimer = setInterval(() => {
      const payload = createMapPositionUpdate();
      if (payload) emitMapPosition(payload);
    }, 4_000);
  }

  return () => {
    mapListeners.delete(listener);
    if (mapListeners.size === 0 && mapTimer) {
      clearInterval(mapTimer);
      mapTimer = null;
    }
  };
}

/** Mock SSE endpoint shape — same event stream interface as future real SSE. */
export function connectMockSse(onEvent: Listener): () => void {
  return subscribeRealtimeEvents(onEvent);
}
