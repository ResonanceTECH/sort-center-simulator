import { Box } from '@mui/material';
import { PLAN_ACTION_LABELS } from '@/constants/platformRu';
import type { PlanAction } from '@/constants/planActions';
import { StatusChip } from '@/components/status/StatusChip';
import { KitButton } from '@/ui-kit/Button';
import type { PlanStatus } from '@/types/scm/planning';
import { PLAN_STATUS_LABELS, PLAN_STATUS_SEMANTIC } from '@/types/stateMachines';

const PRIMARY_ACTIONS: PlanAction[] = ['CALCULATE', 'RECALCULATE', 'SUBMIT', 'APPROVE', 'ACTIVATE'];
const SECONDARY_ACTIONS: PlanAction[] = ['EDIT', 'REJECT', 'CHANGE_CARRIER'];

interface PlanWorkflowActionsProps {
  status: PlanStatus;
  allowedActions: PlanAction[];
  loading?: boolean;
  onAction: (action: PlanAction) => void;
}

export function PlanStatusBadge({ status }: { status: PlanStatus }) {
  return (
    <StatusChip
      status={PLAN_STATUS_SEMANTIC[status]}
      label={PLAN_STATUS_LABELS[status]}
    />
  );
}

export function PlanWorkflowActions({
  status,
  allowedActions,
  loading,
  onAction,
}: PlanWorkflowActionsProps) {
  const primary = allowedActions.filter((a) => PRIMARY_ACTIONS.includes(a));
  const secondary = allowedActions.filter((a) => SECONDARY_ACTIONS.includes(a));

  if (allowedActions.length === 0) {
    return <PlanStatusBadge status={status} />;
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
      <PlanStatusBadge status={status} />
      {secondary.map((action) => (
        <KitButton
          key={action}
          variant="ghost"
          size="small"
          loading={loading}
          onClick={() => onAction(action)}
        >
          {PLAN_ACTION_LABELS[action] ?? action}
        </KitButton>
      ))}
      {primary.map((action) => (
        <KitButton
          key={action}
          variant={action === 'REJECT' ? 'danger' : 'primary'}
          size="small"
          loading={loading}
          onClick={() => onAction(action)}
        >
          {PLAN_ACTION_LABELS[action] ?? action}
        </KitButton>
      ))}
    </Box>
  );
}
