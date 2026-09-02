import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { FilterBar } from '@/components/tables/FilterBar';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, KPI } from '@/constants/platformRu';
import { useSuppliersQuery } from '@/hooks/scm/useScmQueries';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import type { SupplierSummary } from '@/types/scm/supplier';

const DEFAULT_FILTERS = {
  status: undefined as string | undefined,
  risk: undefined as string | undefined,
  region: undefined as string | undefined,
  search: undefined as string | undefined,
  page: '0',
  pageSize: '25',
};

export function SuppliersPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlFilters(DEFAULT_FILTERS);

  const queryFilters = useMemo(
    () => ({
      status: filters.status,
      risk: filters.risk,
      region: filters.region,
      search: filters.search,
      page: Number(filters.page ?? 0),
      pageSize: Number(filters.pageSize ?? 25),
    }),
    [filters],
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
        cell: (row) => (
          <StatusChip status={row.otif.status} label={`${row.otif.value}${row.otif.unit ?? ''}`} />
        ),
      },
      {
        id: 'reliability',
        header: KPI.reliability,
        cell: (row) => `${row.reliability.value}${row.reliability.unit ?? ''}`,
      },
      {
        id: 'leadTime',
        header: KPI.leadTime,
        cell: (row) => `${row.leadTimeDays.value}${row.leadTimeDays.unit ?? ''}`,
      },
      {
        id: 'supplyShare',
        header: KPI.supplyShare,
        cell: (row) => `${row.supplyShare.value}${row.supplyShare.unit ?? ''}`,
      },
      {
        id: 'risk',
        header: COMMON.risk,
        cell: (row) => <StatusChip status={row.risk.status} label={String(row.risk.value)} />,
      },
      { id: 'incidents', header: KPI.openIncidents, cell: (row) => row.openIncidents },
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
        onChange={(updates) => setFilters({ ...updates, page: '0' })}
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
              onPageChange={(page) => setFilters({ page: String(page) })}
              onPageSizeChange={(pageSize) => setFilters({ pageSize: String(pageSize), page: '0' })}
              onRowClick={(row) => navigate(`/suppliers/${row.id}`)}
              getRowId={(row) => row.id}
            />
          </KitCard>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
