import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { FilterBar } from '@/components/tables/FilterBar';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, KPI, TAB_LABELS } from '@/constants/platformRu';
import { useCarriersQuery } from '@/hooks/scm/useScmQueries';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import type { CarrierSummary } from '@/types/scm/carrier';

const DEFAULT_FILTERS = {
  search: undefined as string | undefined,
  page: '0',
  pageSize: '25',
};

export function CarriersPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlFilters(DEFAULT_FILTERS);

  const queryFilters = useMemo(
    () => ({
      search: filters.search,
      page: Number(filters.page ?? 0),
      pageSize: Number(filters.pageSize ?? 25),
    }),
    [filters],
  );

  const { data, isLoading, error, refetch } = useCarriersQuery(queryFilters);

  const columns = useMemo<DataTableColumn<CarrierSummary>[]>(
    () => [
      { id: 'name', header: COMMON.carrier, sortable: true, cell: (row) => row.name },
      {
        id: 'otif',
        header: KPI.otif,
        cell: (row) => <StatusChip status={row.otif.status} label={`${row.otif.value}${row.otif.unit ?? ''}`} />,
      },
      {
        id: 'etaAccuracy',
        header: KPI.etaAccuracy,
        cell: (row) => `${row.etaAccuracy.value}${row.etaAccuracy.unit ?? ''}`,
      },
      {
        id: 'averageDelay',
        header: KPI.averageDelay,
        cell: (row) => `${row.averageDelay.value}${row.averageDelay.unit ?? ''}`,
      },
      { id: 'routes', header: TAB_LABELS.routes, cell: (row) => row.routesCount },
      { id: 'shipments', header: 'Поставок', cell: (row) => row.shipmentCount },
      {
        id: 'incidentRate',
        header: KPI.incidentRate,
        cell: (row) => `${row.incidentRate.value}${row.incidentRate.unit ?? ''}`,
      },
      {
        id: 'risk',
        header: COMMON.risk,
        cell: (row) => <StatusChip status={row.risk.status} label={String(row.risk.value)} />,
      },
    ],
    [],
  );

  return (
    <InternalLayout>
      <PageHeader title="Перевозчики" subtitle="Показатели перевозчиков и аналитика маршрутов" />

      <FilterBar
        fields={[{ key: 'search', label: COMMON.search, type: 'text' }]}
        values={filters}
        onChange={(updates) => setFilters({ ...updates, page: '0' })}
      />

      <EntityStates
        loading={isLoading}
        error={error?.message}
        onRetry={() => void refetch()}
        empty={data?.items.length === 0}
        emptyTitle="Нет перевозчиков"
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
              onRowClick={(row) => navigate(`/carriers/${row.id}`)}
              getRowId={(row) => row.id}
            />
          </KitCard>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
