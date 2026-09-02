import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, NAV_LABELS } from '@/constants/platformRu';
import { useTransportPlanQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import type { TransportLane } from '@/types/scm/planning';

export function TransportPlanPage() {
  const { data, isLoading, error, refetch } = useTransportPlanQuery();

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
        actions={<KitButton variant="primary">Пересчитать</KitButton>}
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
    </InternalLayout>
  );
}
