import { useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { LiveMapPanel } from '@/components/maps/LiveMapPanel';
import { ShipmentBoard } from '@/components/shipments/ShipmentBoard';
import {
  SHIPMENT_FILTER_DEFAULTS,
  ShipmentFiltersBar,
} from '@/components/shipments/ShipmentFilters';
import { ShipmentKpiRow, type OpsKpiKey } from '@/components/shipments/ShipmentKpiRow';
import { ShipmentViewSwitcher } from '@/components/shipments/ShipmentViewSwitcher';
import type { BoardGroupBy, ShipmentsView } from '@/components/shipments/boardConstants';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { StatusChip } from '@/components/status/StatusChip';
import { ActionGuard } from '@/components/common/ActionGuard';
import { useDataTableUrlState } from '@/hooks/useDataTableUrlState';
import { useLiveMapData } from '@/hooks/scm/useLiveMapData';
import { useShipmentBoardRealtime } from '@/hooks/scm/useShipmentBoardRealtime';
import { useShipmentsQuery } from '@/hooks/scm/useScmQueries';
import { BOARD_COLUMN_LABELS } from '@/components/shipments/boardConstants';
import { KPI } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { kit } from '@/ui-kit/tokens';
import type { MapLayerType } from '@/types/scm/map';
import type { ShipmentSummary } from '@/types/scm/shipment';

const MAP_LAYERS: MapLayerType[] = ['shipments', 'routes', 'hubs', 'warehouses'];

function parseView(raw: string | null): ShipmentsView {
  if (raw === 'table' || raw === 'map' || raw === 'board') return raw;
  return 'board';
}

export function ShipmentsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = parseView(searchParams.get('view'));
  const groupBy = (searchParams.get('groupBy') === 'risk' ? 'risk' : 'status') as BoardGroupBy;

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
  } = useDataTableUrlState(SHIPMENT_FILTER_DEFAULTS);

  const queryFilters = useMemo(
    () => ({
      status: filters.status,
      risk: filters.risk,
      supplier: filters.supplier,
      carrier: filters.carrier,
      route: filters.route,
      warehouse: filters.warehouse,
      trackingStatus: filters.trackingStatus,
      dateFrom: filters.dateFrom,
      search: filters.search,
      ...(view === 'board' || view === 'map'
        ? { page: 0, pageSize: 200 }
        : { ...pagination, ...sorting }),
    }),
    [filters, pagination, sorting, view],
  );

  const { data, isLoading, error, refetch, isFetching } = useShipmentsQuery(queryFilters);
  const liveMap = useLiveMapData();
  useShipmentBoardRealtime(view === 'board');

  const setView = (next: ShipmentsView) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('view', next);
    setSearchParams(nextParams, { replace: true });
  };

  const setGroupBy = (next: BoardGroupBy) => {
    const nextParams = new URLSearchParams(searchParams);
    if (next === 'status') nextParams.delete('groupBy');
    else nextParams.set('groupBy', next);
    setSearchParams(nextParams, { replace: true });
  };

  const applyKpiFilter = (key: OpsKpiKey) => {
    if (key === 'atRisk') {
      setFilterValues({ risk: 'at-risk', status: undefined, trackingStatus: undefined });
    } else if (key === 'delayed') {
      setFilterValues({ status: 'delayed', risk: undefined, trackingStatus: undefined });
    } else if (key === 'noTracking') {
      setFilterValues({ trackingStatus: 'no_data', status: undefined, risk: undefined });
    } else if (key === 'active') {
      setFilterValues({
        status: undefined,
        risk: undefined,
        trackingStatus: undefined,
        search: undefined,
      });
    }
    if (view !== 'board') setView('board');
  };

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
        cell: (row) => BOARD_COLUMN_LABELS[row.status] ?? row.status,
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
        id: 'risk',
        header: KPI.slaRisk,
        cell: (row) => (
          <StatusChip status={row.riskStatus} label={row.riskStatus} />
        ),
      },
    ],
    [],
  );

  return (
    <InternalLayout>
      <PageHeader
        title="Операционный центр"
        subtitle="Мониторинг и управление текущими поставками"
        actions={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <ActionGuard permission="shipment.create">
              <KitButton variant="primary" onClick={() => navigate('/shipments/new')}>
                Создать поставку
              </KitButton>
            </ActionGuard>
          </Box>
        }
      />

      <ShipmentKpiRow
        kpis={data?.kpis}
        loading={isLoading && !data}
        onSelect={applyKpiFilter}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
        <ShipmentViewSwitcher value={view} onChange={setView} />
        {isFetching && !isLoading && (
          <Typography variant="caption" sx={{ color: kit.color.muted }}>
            обновление…
          </Typography>
        )}
      </Box>

      {view !== 'map' && (
        <ShipmentFiltersBar values={filters} onChange={setFilterValues} />
      )}

      {view === 'map' ? (
        <EntityStates
          loading={liveMap.isLoading}
          error={liveMap.error?.message}
          onRetry={() => void liveMap.refetch()}
        >
          {liveMap.data && (
            <Box>
              <LiveMapPanel
                data={liveMap.data}
                activeLayers={MAP_LAYERS}
                height={560}
                fitToData
                onMarkerSelect={(m) => {
                  if (m.shipmentId) navigate(`/shipments/${m.shipmentId}`);
                }}
              />
              <Typography variant="caption" sx={{ color: kit.color.muted, mt: 1, display: 'block' }}>
                Полный экран —{' '}
                <Box
                  component="span"
                  sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                  onClick={() => navigate('/map')}
                >
                  /map
                </Box>
              </Typography>
            </Box>
          )}
        </EntityStates>
      ) : view === 'board' ? (
        <EntityStates
          loading={isLoading && !data}
          error={error?.message}
          onRetry={() => void refetch()}
        >
          <ShipmentBoard
            items={data?.items ?? []}
            loading={isLoading && !data}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            hideDelivered
          />
        </EntityStates>
      ) : (
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
      )}
    </InternalLayout>
  );
}
