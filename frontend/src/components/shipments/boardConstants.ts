import type { ShipmentStatus } from '@/types/scm/shipment';
import type { SemanticStatus } from '@/types/scm/semantic';

/** Lifecycle columns — risk is never a column. */
export const BOARD_LIFECYCLE_COLUMNS: ShipmentStatus[] = [
  'PLANNED',
  'ASSIGNED',
  'ACCEPTED',
  'READY_FOR_PICKUP',
  'IN_TRANSIT',
  'ARRIVED',
  'DELIVERED',
];

export const BOARD_COLUMN_LABELS: Record<ShipmentStatus, string> = {
  DRAFT: 'Черновик',
  PLANNED: 'Запланировано',
  ASSIGNED: 'Назначено',
  ACCEPTED: 'Принято перевозчиком',
  READY_FOR_PICKUP: 'Готово к забору',
  IN_TRANSIT: 'В пути',
  ARRIVED: 'Прибыло',
  DELIVERED: 'Доставлено',
  CANCELLED: 'Отменено',
};

export const RISK_GROUP_ORDER: SemanticStatus[] = [
  'CRITICAL',
  'HIGH',
  'WARNING',
  'NO_DATA',
  'NORMAL',
];

export const RISK_GROUP_LABELS: Partial<Record<SemanticStatus, string>> = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  WARNING: 'MEDIUM',
  NO_DATA: 'NO DATA',
  NORMAL: 'NORMAL',
};

export type BoardGroupBy = 'status' | 'risk';
export type ShipmentsView = 'board' | 'table' | 'map';

export function formatDeviation(minutes: number): string {
  const abs = Math.abs(minutes);
  const sign = minutes > 0 ? '+' : minutes < 0 ? '−' : '';
  if (abs < 60) return `${sign}${abs} мин`;
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return m ? `${sign}${h}ч ${m}мин` : `${sign}${h}ч`;
}

export function formatTrackingAge(iso?: string): string {
  if (!iso) return 'нет данных';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins <= 1) return 'только что';
  if (mins < 60) return `${mins} мин назад`;
  const h = Math.floor(mins / 60);
  return `${h}ч назад`;
}
