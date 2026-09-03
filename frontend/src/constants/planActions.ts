import type { AppRole } from '@/types/scm/roles';
import type { PlanStatus } from '@/types/scm/planning';

export type PlanAction =
  | 'EDIT'
  | 'CALCULATE'
  | 'RECALCULATE'
  | 'SUBMIT'
  | 'APPROVE'
  | 'REJECT'
  | 'ACTIVATE'
  | 'CHANGE_CARRIER';

/** §38 — process actions allowed per plan status (backend contract). */
export const PLAN_ACTIONS_BY_STATUS: Record<PlanStatus, PlanAction[]> = {
  DRAFT: ['EDIT', 'CALCULATE'],
  CALCULATED: ['EDIT', 'CALCULATE', 'SUBMIT'],
  REVIEW: ['APPROVE', 'REJECT'],
  APPROVED: ['ACTIVATE'],
  ACTIVE: [],
  SUPERSEDED: [],
};

/** Transport plan adds lane-level ops while editable. */
export const TRANSPORT_EXTRA_ACTIONS: Partial<Record<PlanStatus, PlanAction[]>> = {
  DRAFT: ['RECALCULATE', 'CHANGE_CARRIER'],
  CALCULATED: ['RECALCULATE', 'CHANGE_CARRIER'],
};

/** §38 role matrix. */
export const PLAN_ACTIONS_BY_ROLE: Record<AppRole, PlanAction[]> = {
  ADMIN: [],
  SUPPLY_CHAIN_MANAGER: ['APPROVE', 'REJECT', 'ACTIVATE'],
  SUPPLY_PLANNER: ['EDIT', 'CALCULATE', 'SUBMIT'],
  LOGISTICS_MANAGER: ['CALCULATE', 'RECALCULATE', 'SUBMIT', 'CHANGE_CARRIER'],
  ANALYST: [],
  SUPPLIER: [],
  CARRIER: [],
};

const API_PLAN_ACTION_MAP: Record<string, PlanAction> = {
  EDIT: 'EDIT',
  CALCULATE: 'CALCULATE',
  RECALCULATE: 'RECALCULATE',
  SUBMIT: 'SUBMIT',
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  ACTIVATE: 'ACTIVATE',
  CHANGE_CARRIER: 'CHANGE_CARRIER',
};

export function resolvePlanActions(
  role: AppRole | undefined,
  status: PlanStatus,
  apiActions: string[],
  planKind: 'supply' | 'transport' = 'supply',
): PlanAction[] {
  if (!role) return [];

  const roleSet = new Set(PLAN_ACTIONS_BY_ROLE[role]);
  const statusSet = new Set([
    ...PLAN_ACTIONS_BY_STATUS[status],
    ...(planKind === 'transport' ? TRANSPORT_EXTRA_ACTIONS[status] ?? [] : []),
  ]);

  return apiActions
    .map((key) => API_PLAN_ACTION_MAP[key])
    .filter((action): action is PlanAction => Boolean(action))
    .filter((action) => roleSet.has(action) && statusSet.has(action));
}

export function transitionPlanStatus(status: PlanStatus, action: PlanAction): PlanStatus {
  switch (action) {
    case 'CALCULATE':
    case 'RECALCULATE':
      return status === 'DRAFT' ? 'CALCULATED' : status;
    case 'SUBMIT':
      return status === 'CALCULATED' ? 'REVIEW' : status;
    case 'APPROVE':
      return status === 'REVIEW' ? 'APPROVED' : status;
    case 'REJECT':
      return status === 'REVIEW' ? 'CALCULATED' : status;
    case 'ACTIVATE':
      return status === 'APPROVED' ? 'ACTIVE' : status;
    default:
      return status;
  }
}

export function planActionsForStatus(
  status: PlanStatus,
  planKind: 'supply' | 'transport' = 'supply',
): string[] {
  const base = PLAN_ACTIONS_BY_STATUS[status];
  const extra = planKind === 'transport' ? TRANSPORT_EXTRA_ACTIONS[status] ?? [] : [];
  return [...new Set([...base, ...extra])];
}
