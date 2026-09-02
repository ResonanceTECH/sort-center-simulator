import type { ShipmentStatus } from '@/types/scm/shipment';

export type PlanStatus =
  | 'DRAFT'
  | 'CALCULATED'
  | 'REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUPERSEDED';

export type IncidentStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'WAITING_PARTNER'
  | 'RESOLVED'
  | 'CLOSED';

export type ScenarioStatus =
  | 'DRAFT'
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  DRAFT: 'Черновик',
  PLANNED: 'Запланирована',
  ASSIGNED: 'Назначена',
  ACCEPTED: 'Принята',
  READY_FOR_PICKUP: 'Готова к забору',
  IN_TRANSIT: 'В пути',
  ARRIVED: 'Прибыла',
  DELIVERED: 'Доставлена',
  CANCELLED: 'Отменена',
};

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  OPEN: 'Открыт',
  IN_PROGRESS: 'В работе',
  WAITING_PARTNER: 'Ожидание партнёра',
  RESOLVED: 'Решён',
  CLOSED: 'Закрыт',
};

export const SCENARIO_STATUS_LABELS: Record<ScenarioStatus, string> = {
  DRAFT: 'Черновик',
  QUEUED: 'В очереди',
  RUNNING: 'Расчёт',
  COMPLETED: 'Завершён',
  FAILED: 'Ошибка',
  CANCELLED: 'Отменён',
};
