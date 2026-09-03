import { useCallback, useMemo, useState } from 'react';
import { EntityStates } from '@/components/common/EntityStates';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { PageHeader } from '@/components/common/PageHeader';
import { PlanWorkflowActions } from '@/components/planning/PlanWorkflowActions';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { StatusChip } from '@/components/status/StatusChip';
import { resolvePlanActions, type PlanAction } from '@/constants/planActions';
import { COMMON, NAV_LABELS, PLAN_ACTION_LABELS } from '@/constants/platformRu';
import { useExecutePlanActionMutation } from '@/hooks/scm/useScmMutations';
import { usePermissions } from '@/hooks/usePermissions';
import { useTransportPlanQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { useUiStore } from '@/store/uiStore';
import { KitCard } from '@/ui-kit/Card';
import type { TransportLane } from '@/types/scm/planning';

const CONFIRM_ACTIONS: PlanAction[] = ['SUBMIT', 'APPROVE', 'REJECT', 'ACTIVATE'];

export function TransportPlanPage() {
  const { role, permissions } = usePermissions();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const { data, isLoading, error, refetch } = useTransportPlanQuery();
  const planAction = useExecutePlanActionMutation('transport');
  const [pendingAction, setPendingAction] = useState<PlanAction | null>(null);

  const allowedActions = useMemo(
    () =>
      data
        ? resolvePlanActions(role, data.status, data.availableActions, 'transport', permissions)
        : [],
    [data, role, permissions],
  );

  const runAction = useCallback(
    (action: PlanAction) => {
      if (action === 'CHANGE_CARRIER') {
        showSnackbar('Смена перевозчика — выберите плечо в таблице (mock)', 'info');
        return;
      }
      if (action === 'EDIT') {
        showSnackbar('Редактирование плана — mock', 'info');
        return;
      }
      if (CONFIRM_ACTIONS.includes(action)) {
        setPendingAction(action);
        return;
      }
      planAction.mutate(action);
    },
    [planAction, showSnackbar],
  );

  const columns: DataTableColumn<TransportLane>[] = [
    { id: 'lane', header: 'Плечо', cell: (row) => row.lane },
    { id: 'required', header: 'Требуется', cell: (row) => `${row.requiredCapacity.value}${row.requiredCapacity.unit}` },
    { id: 'available', header: 'Доступно', cell: (row) => `${row.availableCapacity.value}${row.availableCapacity.unit}` },
    { id: 'deficit', header: 'Дефицит', cell: (row) => `${row.deficit.value}${row.deficit.unit}` },
    { id: 'carrier', header: COMMON.carrier, cell: (row) => row.carrier },
    { id: 'vehicles', header: 'ТС', cell: (row) => row.vehicles },
    {
      id: 'utilization',
      header: 'Загрузка',
      cell: (row) => `${row.utilization.value}${row.utilization.unit}`,
    },
    {
      id: 'risk',
      header: COMMON.risk,
      cell: (row) => <StatusChip status={row.risk.status} label={String(row.risk.value)} />,
    },
  ];

  return (
    <InternalLayout>
      <PageHeader
        title={NAV_LABELS.transportPlan}
        subtitle="Мощность плеч и распределение по перевозчикам"
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
          <KitCard variant="flat" padding="none">
            <DataTable
              data={data.lanes}
              columns={columns}
              total={data.lanes.length}
              page={0}
              pageSize={25}
              onPageChange={() => {}}
              getRowId={(row) => row.id}
            />
          </KitCard>
        )}
      </EntityStates>

      <ConfirmDialog
        open={Boolean(pendingAction)}
        title={pendingAction ? PLAN_ACTION_LABELS[pendingAction] ?? pendingAction : ''}
        message={
          pendingAction === 'SUBMIT'
            ? 'Отправить транспортный план на согласование?'
            : pendingAction === 'APPROVE'
              ? 'Утвердить транспортный план?'
              : pendingAction === 'REJECT'
                ? 'Отклонить план и вернуть на пересчёт?'
                : 'Активировать транспортный план.'
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
