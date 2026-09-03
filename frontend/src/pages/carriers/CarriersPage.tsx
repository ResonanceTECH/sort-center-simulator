import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { FilterBar } from '@/components/tables/FilterBar';
import { StatusChip } from '@/components/status/StatusChip';
import { useDataTableUrlState } from '@/hooks/useDataTableUrlState';
import { useCarriersQuery } from '@/hooks/scm/useScmQueries';
import { COMMON, KPI, TAB_LABELS } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import type { CarrierSummary } from '@/types/scm/carrier';

const FILTER_DEFAULTS = {
  search: undefined as string | undefined,
};

export function CarriersPage() {
  const navigate = useNavigate();
  const {
    filters,
    setFilterValues,
    pagination,
    sorting,
    sortBy,
    sortDir,
    onSortChange,
    onPageChange,
    onPageSizeChange,
  } = useDataTableUrlState(FILTER_DEFAULTS);

  const queryFilters = useMemo(
    () => ({
      search: filters.search,
      ...pagination,
      ...sorting,
    }),
    [filters.search, pagination, sorting],
  );

  const { data, isLoading, error, refetch } = useCarriersQuery(queryFilters);

  const columns = useMemo<DataTableColumn<CarrierSummary>[]>(
    () => [
      { id: 'name', header: COMMON.carrier, sortable: true, cell: (row) => row.name },
      {
        id: 'otif',
        header: KPI.otif,
        sortable: true,
        cell: (row) => <StatusChip status={row.otif.status} label={`${row.otif.value}${row.otif.unit ?? ''}`} />,
      },
      {
        id: 'etaAccuracy',
        header: KPI.etaAccuracy,
        sortable: true,
        cell: (row) => `${row.etaAccuracy.value}${row.etaAccuracy.unit ?? ''}`,
      },
      {
        id: 'averageDelay',
        header: KPI.averageDelay,
        sortable: true,
        cell: (row) => `${row.averageDelay.value}${row.averageDelay.unit ?? ''}`,
      },
      { id: 'routesCount', header: TAB_LABELS.routes, sortable: true, cell: (row) => row.routesCount },
      { id: 'shipmentCount', header: 'Поставок', sortable: true, cell: (row) => row.shipmentCount },
      {
        id: 'incidentRate',
        header: KPI.incidentRate,
        sortable: true,
        cell: (row) => `${row.incidentRate.value}${row.incidentRate.unit ?? ''}`,
      },
      {
        id: 'risk',
        header: COMMON.risk,
        sortable: true,
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
        onChange={setFilterValues}
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
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={onSortChange}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
              onRowClick={(row) => navigate(`/carriers/${row.id}`)}
              getRowId={(row) => row.id}
            />
          </KitCard>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
