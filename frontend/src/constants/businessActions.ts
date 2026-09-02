import type { AppRole } from '@/types/scm/roles';
import type { ShipmentStatus } from '@/types/scm/shipment';

export type ShipmentAction =
  | 'READ'
  | 'CHANGE_CARRIER'
  | 'ASSIGN_CARRIER'
  | 'REPLAN'
  | 'CANCEL'
  | 'CREATE_SCENARIO'
  | 'CREATE_INCIDENT'
  | 'CHANGE_ROUTE'
  | 'CHANGE_SLOT'
  | 'CONFIRM_READY'
  | 'UPLOAD_DOCUMENTS'
  | 'REPORT_PROBLEM'
  | 'ACCEPT'
  | 'REJECT'
  | 'ASSIGN_VEHICLE'
  | 'CONFIRM_PICKUP'
  | 'REPORT_DELAY'
  | 'CONFIRM_DELIVERY';

/** §40 Role → allowed shipment actions (backend still authorizes). */
export const SHIPMENT_ACTIONS_BY_ROLE: Record<AppRole, ShipmentAction[]> = {
  ADMIN: [
    'READ',
    'CHANGE_CARRIER',
    'ASSIGN_CARRIER',
    'REPLAN',
    'CANCEL',
    'CREATE_SCENARIO',
    'CREATE_INCIDENT',
    'CHANGE_ROUTE',
    'CHANGE_SLOT',
  ],
  SUPPLY_CHAIN_MANAGER: ['READ', 'CHANGE_CARRIER', 'REPLAN', 'CANCEL', 'CREATE_SCENARIO'],
  SUPPLY_PLANNER: ['READ', 'CREATE_SCENARIO', 'REPLAN'],
  LOGISTICS_MANAGER: [
    'READ',
    'ASSIGN_CARRIER',
    'CHANGE_CARRIER',
    'CHANGE_ROUTE',
    'CHANGE_SLOT',
    'CREATE_INCIDENT',
    'CANCEL',
  ],
  ANALYST: ['READ', 'CREATE_SCENARIO'],
  SUPPLIER: ['READ', 'CONFIRM_READY', 'UPLOAD_DOCUMENTS', 'REPORT_PROBLEM'],
  CARRIER: [
    'READ',
    'ACCEPT',
    'REJECT',
    'ASSIGN_VEHICLE',
    'CONFIRM_PICKUP',
    'REPORT_DELAY',
    'CONFIRM_DELIVERY',
    'REPORT_PROBLEM',
  ],
};

/** Status → actions the process allows regardless of role. */
export const SHIPMENT_ACTIONS_BY_STATUS: Partial<Record<ShipmentStatus, ShipmentAction[]>> = {
  DRAFT: ['ASSIGN_CARRIER', 'CANCEL'],
  PLANNED: ['ASSIGN_CARRIER', 'CHANGE_CARRIER', 'CANCEL'],
  ASSIGNED: ['CHANGE_CARRIER', 'ACCEPT', 'REJECT', 'CANCEL'],
  ACCEPTED: ['CONFIRM_PICKUP', 'CONFIRM_READY', 'CHANGE_ROUTE', 'CANCEL'],
  READY_FOR_PICKUP: ['CONFIRM_PICKUP', 'CHANGE_SLOT'],
  IN_TRANSIT: ['REPORT_DELAY', 'CHANGE_CARRIER', 'CREATE_INCIDENT', 'CREATE_SCENARIO', 'REPORT_PROBLEM', 'CANCEL'],
  ARRIVED: ['CONFIRM_DELIVERY'],
  DELIVERED: ['READ', 'UPLOAD_DOCUMENTS'],
  CANCELLED: ['READ'],
};

/** Maps API action keys to canonical ShipmentAction. */
export const API_ACTION_MAP: Record<string, ShipmentAction> = {
  CHANGE_CARRIER: 'CHANGE_CARRIER',
  ASSIGN_CARRIER: 'ASSIGN_CARRIER',
  CANCEL: 'CANCEL',
  CREATE_SCENARIO: 'CREATE_SCENARIO',
  CREATE_INCIDENT: 'CREATE_INCIDENT',
  REPLAN: 'REPLAN',
  CHANGE_ROUTE: 'CHANGE_ROUTE',
  CHANGE_SLOT: 'CHANGE_SLOT',
  CONFIRM_READY: 'CONFIRM_READY',
  UPLOAD_DOCUMENTS: 'UPLOAD_DOCUMENTS',
  REPORT_PROBLEM: 'REPORT_PROBLEM',
  ACCEPT: 'ACCEPT',
  REJECT: 'REJECT',
  ASSIGN_VEHICLE: 'ASSIGN_VEHICLE',
  CONFIRM_PICKUP: 'CONFIRM_PICKUP',
  REPORT_DELAY: 'REPORT_DELAY',
  CONFIRM_DELIVERY: 'CONFIRM_DELIVERY',
};

export function resolveShipmentActions(
  role: AppRole | undefined,
  status: ShipmentStatus,
  apiActions: string[],
): ShipmentAction[] {
  if (!role) return [];

  const roleSet = new Set(SHIPMENT_ACTIONS_BY_ROLE[role]);
  const statusSet = new Set(SHIPMENT_ACTIONS_BY_STATUS[status] ?? []);

  return apiActions
    .map((key) => API_ACTION_MAP[key])
    .filter((action): action is ShipmentAction => Boolean(action))
    .filter((action) => roleSet.has(action))
    .filter((action) => statusSet.size === 0 || statusSet.has(action) || action === 'READ');
}
