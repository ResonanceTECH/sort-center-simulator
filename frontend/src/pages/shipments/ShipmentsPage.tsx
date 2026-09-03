import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { FilterBar } from '@/components/tables/FilterBar';
import { StatusChip } from '@/components/status/StatusChip';
import { useDataTableUrlState } from '@/hooks/useDataTableUrlState';
import { useShipmentsQuery } from '@/hooks/scm/useScmQueries';
import { COMMON, KPI } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { SHIPMENT_STATUS_LABELS } from '@/types/stateMachines';
import type { ShipmentSummary } from '@/types/scm/shipment';

const FILTER_DEFAULTS = {
  status: undefined as string | undefined,
  risk: undefined as string | undefined,
  supplier: undefined as string | undefined,
  carrier: undefined as string | undefined,
  search: undefined as string | undefined,
};

export function ShipmentsPage() {
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
      supplier: filters.supplier,
      carrier: filters.carrier,
      search: filters.search,
      ...pagination,
      ...sorting,
    }),
    [filters, pagination, sorting],
  );

  const { data, isLoading, error, refetch } = useShipmentsQuery(queryFilters);

  const columns = useMemo<DataTableColumn<ShipmentSummary>[]>(
    () => [
      { id: 'id', header: 'ID', sortable: true, cell: (row) => row.id },
      { id: 'supplierName', header: 'Поставщик', sortable: true, cell: (row) => row.supplierName },
      { id: 'carrierName', header: 'Перевозчик', sortable: true, cell: (row) => row.carrierName },
      { id: 'origin', header: 'Откуда', cell: (row) => row.origin },
      { id: 'destination', header: 'Куда', cell: (row) => row.destination },
      {
        id: 'status',
        header: 'Статус',
        cell: (row) => SHIPMENT_STATUS_LABELS[row.status] ?? row.status,
      },
      {
        id: 'forecastEta',
        header: KPI.forecastEta,
        sortable: true,
        cell: (row) => new Date(row.forecastEta).toLocaleString('ru-RU'),
      },
      {
        id: 'deviationMinutes',
        header: 'Отклонение',
        sortable: true,
        cell: (row) => `${row.deviationMinutes} мин`,
      },
      {
        id: 'slaRisk',
        header: KPI.slaRisk,
        sortable: true,
        cell: (row) => (
          <StatusChip
            status={row.slaRisk.status}
            label={`${row.slaRisk.value}${row.slaRisk.unit ?? ''}`}
          />
        ),
      },
    ],
    [],
  );

  return (
    <InternalLayout>
      <PageHeader
        title="Поставки"
        subtitle="Сортировка и фильтры синхронизированы с URL (?sortBy=&sortDir=)"
      />

      <FilterBar
        fields={[
          {
            key: 'status',
            label: 'Статус',
            type: 'select',
            options: [
              { value: 'at-risk', label: COMMON.atRisk },
              { value: 'in-transit', label: COMMON.inTransit },
            ],
          },
          {
            key: 'carrier',
            label: 'Перевозчик',
            type: 'select',
            options: [
              { value: 'car-0', label: 'Перевозчик A' },
              { value: 'car-1', label: 'Перевозчик B' },
              { value: 'car-2', label: 'Перевозчик C' },
            ],
          },
          { key: 'search', label: 'Поиск', type: 'text' },
        ]}
        values={filters}
        onChange={setFilterValues}
      />

      <EntityStates
        loading={isLoading}
        error={error?.message}
        onRetry={() => void refetch()}
        empty={data?.items.length === 0}
        emptyTitle="Нет активных поставок"
        emptyDescription="Измените фильтры или создайте новую поставку"
      >
        {data && (
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
            onRowClick={(row) => navigate(`/shipments/${row.id}`)}
            getRowId={(row) => row.id}
            virtualized
            maxBodyHeight={520}
          />
        )}
      </EntityStates>
    </InternalLayout>
  );
}
