import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { FilterBar } from '@/components/tables/FilterBar';
import { StatusChip } from '@/components/status/StatusChip';
import { useShipmentsQuery } from '@/hooks/scm/useScmQueries';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { COMMON, KPI } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { SHIPMENT_STATUS_LABELS } from '@/types/stateMachines';
import type { ShipmentSummary } from '@/types/scm/shipment';

const DEFAULT_FILTERS = {
  status: undefined as string | undefined,
  risk: undefined as string | undefined,
  supplier: undefined as string | undefined,
  carrier: undefined as string | undefined,
  search: undefined as string | undefined,
  page: '0',
  pageSize: '25',
};

export function ShipmentsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlFilters(DEFAULT_FILTERS);

  const queryFilters = useMemo(
    () => ({
      status: filters.status,
      risk: filters.risk,
      supplier: filters.supplier,
      carrier: filters.carrier,
      search: filters.search,
      page: Number(filters.page ?? 0),
      pageSize: Number(filters.pageSize ?? 25),
    }),
    [filters],
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
      <PageHeader title="Поставки" subtitle="Операционный список — фильтры синхронизированы с URL" />

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
        onChange={(updates) => setFilters({ ...updates, page: '0' })}
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
            onPageChange={(page) => setFilters({ page: String(page) })}
            onPageSizeChange={(pageSize) => setFilters({ pageSize: String(pageSize), page: '0' })}
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
