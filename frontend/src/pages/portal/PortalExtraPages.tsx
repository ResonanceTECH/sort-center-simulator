import { useMemo, useState } from 'react';
import { Box, Drawer, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { LiveMapPanel } from '@/components/maps/LiveMapPanel';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, labelSeverity } from '@/constants/platformRu';
import { useAuth } from '@/hooks/useAuth';
import { PortalLayout } from '@/layouts/PortalLayout';
import {
  buildCarrierPortalMap,
  getPortalIncidents,
  getPortalVehicles,
  type PortalVehicle,
} from '@/mocks/scm/portalData';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import type { AppShell } from '@/types/scm/roles';
import type { IncidentSummary } from '@/types/scm/incident';
import type { MapLayerType } from '@/types/scm/map';
import { INCIDENT_STATUS_LABELS } from '@/types/stateMachines';

type PortalShell = Extract<AppShell, 'supplier' | 'carrier'>;

interface PortalIncidentsPageProps {
  shell: PortalShell;
}

export function PortalIncidentsPage({ shell }: PortalIncidentsPageProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<IncidentSummary | null>(null);

  const incidents = useMemo(
    () => getPortalIncidents(shell, user?.organization),
    [shell, user?.organization],
  );

  const columns = useMemo<DataTableColumn<IncidentSummary>[]>(
    () => [
      { id: 'id', header: 'ID', cell: (row) => row.id },
      { id: 'title', header: COMMON.title, cell: (row) => row.title },
      {
        id: 'status',
        header: COMMON.status,
        cell: (row) => INCIDENT_STATUS_LABELS[row.status] ?? row.status,
      },
      {
        id: 'severity',
        header: COMMON.severity,
        cell: (row) => <StatusChip status={row.severity} label={labelSeverity(row.severity)} />,
      },
      { id: 'shipment', header: 'Поставка', cell: (row) => row.shipmentId ?? '—' },
      { id: 'owner', header: COMMON.owner, cell: (row) => row.owner },
    ],
    [],
  );

  return (
    <PortalLayout shell={shell}>
      <PageHeader
        title="Инциденты"
        subtitle={`${user?.organization ?? 'Организация'} — только инциденты, связанные с вашими поставками`}
      />
      <EntityStates empty={incidents.length === 0} emptyTitle="Нет инцидентов">
        <KitCard variant="flat" padding="none">
          <DataTable
            data={incidents}
            columns={columns}
            total={incidents.length}
            page={0}
            pageSize={25}
            onPageChange={() => {}}
            onRowClick={setSelected}
            getRowId={(row) => row.id}
          />
        </KitCard>
      </EntityStates>

      <Drawer anchor="right" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected && (
          <Box sx={{ width: 340, p: 3 }}>
            <Typography variant="h6" fontWeight={700}>{selected.title}</Typography>
            <Box sx={{ display: 'flex', gap: 1, my: 1.5 }}>
              <StatusChip status={selected.severity} label={labelSeverity(selected.severity)} />
              <StatusChip status="INFO" label={INCIDENT_STATUS_LABELS[selected.status]} />
            </Box>
            <Typography variant="body2" sx={{ color: kit.color.muted, mb: 1 }}>
              Поставка: {selected.shipmentId ?? '—'}
            </Typography>
            <Typography variant="body2" sx={{ color: kit.color.muted, mb: 1 }}>
              Участники: {selected.participants.join(', ')}
            </Typography>
            <Typography variant="body2" sx={{ color: kit.color.muted }}>
              Ответственный: {selected.owner}
            </Typography>
          </Box>
        )}
      </Drawer>
    </PortalLayout>
  );
}

export function CarrierVehiclesPage() {
  const { user } = useAuth();

  const vehicles = useMemo(
    () => getPortalVehicles(user?.organization ?? 'Carrier C'),
    [user?.organization],
  );

  const columns = useMemo<DataTableColumn<PortalVehicle>[]>(
    () => [
      { id: 'plate', header: 'Госномер', cell: (row) => row.plate },
      { id: 'type', header: 'Тип', cell: (row) => row.type },
      { id: 'capacity', header: 'Грузоподъёмность', cell: (row) => row.capacity },
      { id: 'driver', header: 'Водитель', cell: (row) => row.driver ?? '—' },
      {
        id: 'status',
        header: COMMON.status,
        cell: (row) => <StatusChip status={row.status} label={row.status === 'NORMAL' ? 'Доступен' : 'На рейсе'} />,
      },
      { id: 'shipment', header: 'Поставка', cell: (row) => row.assignedShipmentId ?? '—' },
    ],
    [],
  );

  return (
    <PortalLayout shell="carrier">
      <PageHeader
        title="Транспорт"
        subtitle={`${user?.organization ?? 'Перевозчик'} — парк ТС и назначения`}
      />
      <EntityStates empty={vehicles.length === 0} emptyTitle="Нет зарегистрированного транспорта">
        <KitCard variant="flat" padding="none">
          <DataTable
            data={vehicles}
            columns={columns}
            total={vehicles.length}
            page={0}
            pageSize={25}
            onPageChange={() => {}}
            getRowId={(row) => row.id}
          />
        </KitCard>
      </EntityStates>
    </PortalLayout>
  );
}

const CARRIER_MAP_LAYERS: MapLayerType[] = ['shipments', 'vehicles', 'routes'];

export function CarrierMapPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const mapData = useMemo(
    () => buildCarrierPortalMap(user?.organization ?? 'Carrier C'),
    [user?.organization],
  );

  return (
    <PortalLayout shell="carrier">
      <PageHeader
        title="Карта"
        subtitle="Поставки и ТС вашей организации в реальном времени (mock)"
      />
      <KitCard>
        <LiveMapPanel
          data={mapData}
          activeLayers={CARRIER_MAP_LAYERS}
          clustering={false}
          fitToData
          height={480}
          onMarkerSelect={(marker) => {
            if (marker.shipmentId) navigate('/carrier/trips');
          }}
        />
      </KitCard>
    </PortalLayout>
  );
}
