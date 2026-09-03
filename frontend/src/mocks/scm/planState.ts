import { planActionsForStatus, transitionPlanStatus, type PlanAction } from '@/constants/planActions';
import { SUPPLY_PLAN_MOCK, TRANSPORT_PLAN_MOCK } from '@/mocks/scm/scmData';
import type { PlanStatus, SupplyPlanData, TransportPlanData } from '@/types/scm/planning';

export type PlanKind = 'supply' | 'transport';

let supplyPlanState: SupplyPlanData = structuredClone(SUPPLY_PLAN_MOCK);
let transportPlanState: TransportPlanData = structuredClone(TRANSPORT_PLAN_MOCK);

function refreshSupplyActions(status: PlanStatus) {
  supplyPlanState = {
    ...supplyPlanState,
    status,
    availableActions: planActionsForStatus(status, 'supply'),
  };
}

function refreshTransportActions(status: PlanStatus) {
  transportPlanState = {
    ...transportPlanState,
    status,
    availableActions: planActionsForStatus(status, 'transport'),
  };
}

export function getSupplyPlanState(): SupplyPlanData {
  return supplyPlanState;
}

export function getTransportPlanState(): TransportPlanData {
  return transportPlanState;
}

export function applySupplyPlanAction(action: PlanAction): SupplyPlanData {
  if (action === 'EDIT') {
    return supplyPlanState;
  }

  if (action === 'CALCULATE' && supplyPlanState.status === 'CALCULATED') {
    supplyPlanState = {
      ...supplyPlanState,
      violations: [{ message: 'Пересчёт завершён — нарушений не обнаружено', status: 'SUCCESS' }],
    };
    return supplyPlanState;
  }

  const nextStatus = transitionPlanStatus(supplyPlanState.status, action);
  refreshSupplyActions(nextStatus);
  return supplyPlanState;
}

export function applyTransportPlanAction(action: PlanAction): TransportPlanData {
  if (action === 'CHANGE_CARRIER' || action === 'EDIT') {
    return transportPlanState;
  }

  if (action === 'RECALCULATE' || action === 'CALCULATE') {
    if (transportPlanState.status === 'CALCULATED' || transportPlanState.status === 'DRAFT') {
      transportPlanState = {
        ...transportPlanState,
        lanes: transportPlanState.lanes.map((lane) => ({
          ...lane,
          deficit:
            Number(lane.deficit.value) > 0
              ? { ...lane.deficit, value: Math.max(0, Number(lane.deficit.value) - 8), status: 'WARNING' as const }
              : lane.deficit,
          utilization: {
            ...lane.utilization,
            value: Math.min(100, Number(lane.utilization.value) - 5),
            status: 'WARNING' as const,
          },
        })),
      };
    }
    const nextStatus = transitionPlanStatus(transportPlanState.status, action);
    refreshTransportActions(nextStatus);
    return transportPlanState;
  }

  const nextStatus = transitionPlanStatus(transportPlanState.status, action);
  refreshTransportActions(nextStatus);
  return transportPlanState;
}

export function applyPlanAction(planKind: PlanKind, action: PlanAction) {
  return planKind === 'supply'
    ? applySupplyPlanAction(action)
    : applyTransportPlanAction(action);
}

/** Reset for dev/hot reload consistency. */
export function resetPlanMockState() {
  supplyPlanState = structuredClone(SUPPLY_PLAN_MOCK);
  transportPlanState = structuredClone(TRANSPORT_PLAN_MOCK);
}

// Ensure availableActions match status on init
refreshSupplyActions(supplyPlanState.status);
refreshTransportActions(transportPlanState.status);
