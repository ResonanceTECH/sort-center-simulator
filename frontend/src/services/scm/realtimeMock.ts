import type { RealtimeEvent } from '@/types/scm/realtime';

type Listener = (event: RealtimeEvent) => void;

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

let timer: ReturnType<typeof setInterval> | null = null;
let index = 0;
const listeners = new Set<Listener>();

function emit(event: RealtimeEvent) {
  listeners.forEach((fn) => fn(event));
}

export function subscribeRealtimeEvents(listener: Listener): () => void {
  listeners.add(listener);

  if (!timer) {
    timer = setInterval(() => {
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
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

/** Mock SSE endpoint shape — same event stream interface as future real SSE. */
export function connectMockSse(onEvent: Listener): () => void {
  return subscribeRealtimeEvents(onEvent);
}
