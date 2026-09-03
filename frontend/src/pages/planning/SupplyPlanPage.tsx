import { useCallback, useMemo, useState } from 'react';
import { Box, Grid, LinearProgress, Typography } from '@mui/material';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { PlanWorkflowActions } from '@/components/planning/PlanWorkflowActions';
import { KpiCard } from '@/components/status/KpiCard';
import { StatusChip } from '@/components/status/StatusChip';
import { resolvePlanActions, type PlanAction } from '@/constants/planActions';
import { NAV_LABELS, PLAN_ACTION_LABELS, SECTION_LABELS } from '@/constants/platformRu';
import { useExecutePlanActionMutation } from '@/hooks/scm/useScmMutations';
import { usePermissions } from '@/hooks/usePermissions';
import { useSupplyPlanQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

const CONFIRM_ACTIONS: PlanAction[] = ['SUBMIT', 'APPROVE', 'REJECT', 'ACTIVATE'];

export function SupplyPlanPage() {
  const { role, permissions } = usePermissions();
  const { data, isLoading, error, refetch } = useSupplyPlanQuery();
  const planAction = useExecutePlanActionMutation('supply');
  const [pendingAction, setPendingAction] = useState<PlanAction | null>(null);

  const allowedActions = useMemo(
    () =>
      data
        ? resolvePlanActions(role, data.status, data.availableActions, 'supply', permissions)
        : [],
    [data, role, permissions],
  );

  const runAction = useCallback(
    (action: PlanAction) => {
      if (CONFIRM_ACTIONS.includes(action)) {
        setPendingAction(action);
        return;
      }
      planAction.mutate(action);
    },
    [planAction],
  );

  return (
    <InternalLayout>
      <PageHeader
        title={NAV_LABELS.supplyPlan}
        subtitle="Спрос → Требуемые поставки → Распределение по поставщикам"
        actions={
          data ? (
            <PlanWorkflowActions
              status={data.status}
              allowedActions={allowedActions}
              loading={planAction.isPending}
              onAction={runAction}
            />
          ) : undefined
        }
      />

      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <KpiCard metric={data.demand} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <KpiCard metric={data.requiredSupply} />
              </Grid>
            </Grid>

            <KitCard sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                {SECTION_LABELS.supplierAllocation}
              </Typography>
              {data.allocations.map((a) => (
                <Box key={a.supplierId} sx={{ py: 1.5, borderBottom: kit.border.hairline }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{a.supplierName}</Typography>
                    <Typography variant="body2">{a.allocated.toLocaleString('ru-RU')}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={a.utilization}
                    sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: kit.color.muted }}>
                      Мощность: {a.capacity.toLocaleString('ru-RU')} · {a.utilization}%
                    </Typography>
                    <StatusChip status={a.status} label={a.utilization > 90 ? 'Близко к лимиту' : 'OK'} />
                  </Box>
                </Box>
              ))}
            </KitCard>

            {data.violations.length > 0 && (
              <KitCard>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                  {SECTION_LABELS.constraintViolations}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {data.violations.map((v) => (
                    <StatusChip key={v.message} status={v.status} label={v.message} />
                  ))}
                </Box>
              </KitCard>
            )}
          </>
        )}
      </EntityStates>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction ? PLAN_ACTION_LABELS[pendingAction] ?? pendingAction : ''}
        message={
          pendingAction === 'SUBMIT'
            ? 'Отправить план поставок на согласование менеджеру?'
            : pendingAction === 'APPROVE'
              ? 'Утвердить план поставок?'
              : pendingAction === 'REJECT'
                ? 'Отклонить план и вернуть на доработку?'
                : 'Активировать план — он станет исполняемым.'
        }
        confirmLabel={pendingAction ? PLAN_ACTION_LABELS[pendingAction] : undefined}
        destructive={pendingAction === 'REJECT'}
        loading={planAction.isPending}
        onConfirm={() => {
          if (pendingAction) planAction.mutate(pendingAction, { onSuccess: () => setPendingAction(null) });
        }}
        onCancel={() => setPendingAction(null)}
      />
    </InternalLayout>
  );
}
