import type { AppRole } from '@/types/scm/roles';
import type { ScmPermission } from '@/constants/scmPermissions';
import type { ShipmentStatus } from '@/types/scm/shipment';
import { can } from '@/utils/can';

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

/** Action → SCM permission (backend still authorizes). */
export const SHIPMENT_ACTION_PERMISSIONS: Record<ShipmentAction, ScmPermission> = {
  READ: 'shipment.read',
  CHANGE_CARRIER: 'shipment.assign_carrier',
  ASSIGN_CARRIER: 'shipment.assign_carrier',
  REPLAN: 'shipment.update',
  CANCEL: 'shipment.cancel',
  CREATE_SCENARIO: 'scenario.create',
  CREATE_INCIDENT: 'incident.create',
  CHANGE_ROUTE: 'shipment.change_route',
  CHANGE_SLOT: 'shipment.reschedule',
  CONFIRM_READY: 'shipment.confirm_ready',
  UPLOAD_DOCUMENTS: 'documents.create',
  REPORT_PROBLEM: 'incident.create',
  ACCEPT: 'shipment.accept',
  REJECT: 'shipment.reject',
  ASSIGN_VEHICLE: 'vehicle.create',
  CONFIRM_PICKUP: 'shipment.confirm_pickup',
  REPORT_DELAY: 'shipment.report_delay',
  CONFIRM_DELIVERY: 'shipment.confirm_delivery',
};

export function resolveShipmentActions(
  role: AppRole | undefined,
  status: ShipmentStatus,
  apiActions: string[],
  permissions?: readonly string[],
): ShipmentAction[] {
  if (!role) return [];

  const roleSet = new Set(SHIPMENT_ACTIONS_BY_ROLE[role]);
  const statusSet = new Set(SHIPMENT_ACTIONS_BY_STATUS[status] ?? []);

  return apiActions
    .map((key) => API_ACTION_MAP[key])
    .filter((action): action is ShipmentAction => Boolean(action))
    .filter((action) => roleSet.has(action))
    .filter((action) => statusSet.size === 0 || statusSet.has(action) || action === 'READ')
    .filter((action) => {
      if (!permissions) return true;
      return can(permissions, SHIPMENT_ACTION_PERMISSIONS[action]);
    });
}
