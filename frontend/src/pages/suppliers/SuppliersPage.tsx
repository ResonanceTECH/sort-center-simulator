import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { FilterBar } from '@/components/tables/FilterBar';
import { StatusChip } from '@/components/status/StatusChip';
import { useDataTableUrlState } from '@/hooks/useDataTableUrlState';
import { useSuppliersQuery } from '@/hooks/scm/useScmQueries';
import { COMMON, KPI } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import type { SupplierSummary } from '@/types/scm/supplier';

const FILTER_DEFAULTS = {
  status: undefined as string | undefined,
  risk: undefined as string | undefined,
  region: undefined as string | undefined,
  search: undefined as string | undefined,
};

export function SuppliersPage() {
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
      status: filters.status,
      risk: filters.risk,
      region: filters.region,
      search: filters.search,
      ...pagination,
      ...sorting,
    }),
    [filters, pagination, sorting],
  );

  const { data, isLoading, error, refetch } = useSuppliersQuery(queryFilters);

  const columns = useMemo<DataTableColumn<SupplierSummary>[]>(
    () => [
      { id: 'name', header: COMMON.supplier, sortable: true, cell: (row) => row.name },
      {
        id: 'status',
        header: COMMON.status,
        cell: (row) => <StatusChip status={row.statusSemantic} label={row.status} />,
      },
      {
        id: 'otif',
        header: KPI.otif,
        sortable: true,
        cell: (row) => (
          <StatusChip status={row.otif.status} label={`${row.otif.value}${row.otif.unit ?? ''}`} />
        ),
      },
      {
        id: 'reliability',
        header: KPI.reliability,
        sortable: true,
        cell: (row) => `${row.reliability.value}${row.reliability.unit ?? ''}`,
      },
      {
        id: 'leadTimeDays',
        header: KPI.leadTime,
        sortable: true,
        cell: (row) => `${row.leadTimeDays.value}${row.leadTimeDays.unit ?? ''}`,
      },
      {
        id: 'supplyShare',
        header: KPI.supplyShare,
        sortable: true,
        cell: (row) => `${row.supplyShare.value}${row.supplyShare.unit ?? ''}`,
      },
      {
        id: 'risk',
        header: COMMON.risk,
        sortable: true,
        cell: (row) => <StatusChip status={row.risk.status} label={String(row.risk.value)} />,
      },
      { id: 'openIncidents', header: KPI.openIncidents, sortable: true, cell: (row) => row.openIncidents },
    ],
    [],
  );

  return (
    <InternalLayout>
      <PageHeader title="Поставщики" subtitle="Показатели и риски поставщиков" />

      <FilterBar
        fields={[
          {
            key: 'status',
            label: COMMON.status,
            type: 'select',
            options: [
              { value: 'ACTIVE', label: COMMON.active },
              { value: 'INACTIVE', label: COMMON.inactive },
            ],
          },
          {
            key: 'risk',
            label: COMMON.risk,
            type: 'select',
            options: [
              { value: 'LOW', label: COMMON.low },
              { value: 'MEDIUM', label: COMMON.medium },
              { value: 'HIGH', label: COMMON.high },
            ],
          },
          { key: 'search', label: COMMON.search, type: 'text' },
        ]}
        values={filters}
        onChange={setFilterValues}
      />

      <EntityStates
        loading={isLoading}
        error={error?.message}
        onRetry={() => void refetch()}
        empty={data?.items.length === 0}
        emptyTitle="Нет поставщиков"
        emptyDescription="Измените фильтры"
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
              onRowClick={(row) => navigate(`/suppliers/${row.id}`)}
              getRowId={(row) => row.id}
            />
          </KitCard>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
