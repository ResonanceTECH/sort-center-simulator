import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { FilterBar } from '@/components/tables/FilterBar';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, labelSeverity } from '@/constants/platformRu';
import { useIncidentsQuery } from '@/hooks/scm/useScmQueries';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { INCIDENT_STATUS_LABELS } from '@/types/stateMachines';
import type { IncidentSummary } from '@/types/scm/incident';

const DEFAULT_FILTERS = {
  status: undefined as string | undefined,
  severity: undefined as string | undefined,
  search: undefined as string | undefined,
  page: '0',
  pageSize: '25',
};

export function IncidentsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlFilters(DEFAULT_FILTERS);

  const queryFilters = useMemo(
    () => ({
      status: filters.status,
      severity: filters.severity,
      search: filters.search,
      page: Number(filters.page ?? 0),
      pageSize: Number(filters.pageSize ?? 25),
    }),
    [filters],
  );

  const { data, isLoading, error, refetch } = useIncidentsQuery(queryFilters);

  const columns = useMemo<DataTableColumn<IncidentSummary>[]>(
    () => [
      { id: 'id', header: 'ID', cell: (row) => row.id },
      { id: 'title', header: COMMON.title, sortable: true, cell: (row) => row.title },
      {
        id: 'status',
        header: COMMON.status,
        cell: (row) => INCIDENT_STATUS_LABELS[row.status] ?? row.status,
      },
      {
        id: 'severity',
        header: COMMON.severity,
        cell: (row) => <StatusChip status={row.severity} label={row.severity} />,
      },
      { id: 'owner', header: COMMON.owner, cell: (row) => row.owner },
      { id: 'shipment', header: 'Поставка', cell: (row) => row.shipmentId ?? '—' },
      {
        id: 'created',
        header: 'Создан',
        cell: (row) => new Date(row.createdAt).toLocaleString('ru-RU'),
      },
    ],
    [],
  );

  return (
    <InternalLayout>
      <PageHeader title="Инциденты" subtitle="Очередь координации — взаимодействие участников цепочки" />

      <FilterBar
        fields={[
          {
            key: 'status',
            label: COMMON.status,
            type: 'select',
            options: [
              { value: 'OPEN', label: COMMON.open },
              { value: 'IN_PROGRESS', label: COMMON.inProgress },
              { value: 'WAITING_PARTNER', label: COMMON.waitingPartner },
              { value: 'RESOLVED', label: COMMON.resolved },
            ],
          },
          {
            key: 'severity',
            label: COMMON.severity,
            type: 'select',
            options: [
              { value: 'CRITICAL', label: labelSeverity('CRITICAL') },
              { value: 'HIGH', label: labelSeverity('HIGH') },
              { value: 'MEDIUM', label: labelSeverity('MEDIUM') },
            ],
          },
          { key: 'search', label: COMMON.search, type: 'text' },
        ]}
        values={filters}
        onChange={(updates) => setFilters({ ...updates, page: '0' })}
      />

      <EntityStates
        loading={isLoading}
        error={error?.message}
        onRetry={() => void refetch()}
        empty={data?.items.length === 0}
        emptyTitle="Нет активных инцидентов"
        emptyDescription="Инциденты создаются из отклонений или вручную"
      >
        {data && (
          <KitCard variant="flat" padding="none">
            <DataTable
              data={data.items}
              columns={columns}
              total={data.total}
              page={data.page}
              pageSize={data.pageSize}
              onPageChange={(page) => setFilters({ page: String(page) })}
              onPageSizeChange={(pageSize) => setFilters({ pageSize: String(pageSize), page: '0' })}
              onRowClick={(row) => navigate(`/incidents/${row.id}`)}
              getRowId={(row) => row.id}
            />
          </KitCard>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
