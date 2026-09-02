import { useMemo, useState } from 'react';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, KPI, SHIPMENT_ACTION_LABELS } from '@/constants/platformRu';
import { PortalLayout } from '@/layouts/PortalLayout';
import { SHIPMENTS_MOCK } from '@/mocks/scm/scmData';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { useUiStore } from '@/store/uiStore';

type TripRow = (typeof SHIPMENTS_MOCK)[0] & { action?: string };

export function CarrierTripsPage() {
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());

  const trips = useMemo(
    () =>
      SHIPMENTS_MOCK.filter((s) => s.carrierName === 'Carrier C')
        .slice(0, 8)
        .map((s) => ({
          ...s,
          action: accepted.has(s.id) ? 'IN_TRANSIT' : 'AWAITING_ACCEPT',
        })),
    [accepted],
  );

  const columns = useMemo<DataTableColumn<TripRow>[]>(
    () => [
      { id: 'id', header: 'Поставка', cell: (row) => row.id },
      { id: 'route', header: COMMON.routeCol, cell: (row) => `${row.origin} → ${row.destination}` },
      {
        id: 'sla',
        header: KPI.slaRisk,
        cell: (row) => (
          <StatusChip status={row.slaRisk.status} label={`${row.slaRisk.value}${row.slaRisk.unit ?? ''}`} />
        ),
      },
      {
        id: 'action',
        header: COMMON.action,
        cell: (row) =>
          row.action === 'AWAITING_ACCEPT' ? (
            <KitButton
              variant="primary"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setAccepted((prev) => new Set(prev).add(row.id));
                showSnackbar(`Поставка ${row.id} принята`, 'success');
              }}
            >
              {SHIPMENT_ACTION_LABELS.ACCEPT}
            </KitButton>
          ) : (
            <KitButton variant="ghost" size="small" onClick={() => showSnackbar('Задержка сообщена', 'info')}>
              {SHIPMENT_ACTION_LABELS.REPORT_DELAY}
            </KitButton>
          ),
      },
    ],
    [showSnackbar],
  );

  return (
    <PortalLayout shell="carrier">
      <PageHeader title="Текущие рейсы" subtitle="Назначенные поставки — принять, забрать, доставить" />
      <EntityStates empty={trips.length === 0} emptyTitle="Нет назначенных рейсов">
        <KitCard variant="flat" padding="none">
          <DataTable
            data={trips}
            columns={columns}
            total={trips.length}
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
