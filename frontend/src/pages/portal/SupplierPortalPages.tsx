import { useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { useAuth } from '@/hooks/useAuth';
import { PortalLayout } from '@/layouts/PortalLayout';
import { filterShipmentsByOrganization } from '@/mocks/scm/portalData';
import { KitCard } from '@/ui-kit/Card';
import { KitButton } from '@/ui-kit/Button';
import { useUiStore } from '@/store/uiStore';
import { COMMON, SHIPMENT_ACTION_LABELS } from '@/constants/platformRu';
import { SHIPMENT_STATUS_LABELS } from '@/types/stateMachines';

interface OrderRow {
  id: string;
  sku: string;
  quantity: number;
  dueDate: string;
  status: string;
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_CONFIRM: 'Ожидает подтверждения',
  CONFIRMED: 'Подтверждён',
};

const ORDERS_MOCK: OrderRow[] = [
  { id: 'ORD-1001', sku: 'SKU-4421', quantity: 120, dueDate: '2026-09-05', status: 'PENDING_CONFIRM' },
  { id: 'ORD-1002', sku: 'SKU-8810', quantity: 45, dueDate: '2026-09-06', status: 'CONFIRMED' },
  { id: 'ORD-1003', sku: 'SKU-4421', quantity: 80, dueDate: '2026-09-08', status: 'PENDING_CONFIRM' },
];

export function SupplierOrdersPage() {
  const { user } = useAuth();
  const showSnackbar = useUiStore((s) => s.showSnackbar);

  const columns = useMemo<DataTableColumn<OrderRow>[]>(
    () => [
      { id: 'id', header: 'Заказ', cell: (row) => row.id },
      { id: 'sku', header: 'SKU', cell: (row) => row.sku },
      { id: 'qty', header: 'Кол-во', cell: (row) => row.quantity },
      { id: 'due', header: 'Срок', cell: (row) => row.dueDate },
      { id: 'status', header: COMMON.status, cell: (row) => ORDER_STATUS_LABELS[row.status] ?? row.status },
      {
        id: 'action',
        header: '',
        cell: (row) =>
          row.status === 'PENDING_CONFIRM' ? (
            <KitButton
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                showSnackbar(`Заказ ${row.id} подтверждён`, 'success');
              }}
            >
              {SHIPMENT_ACTION_LABELS.CONFIRM_READY}
            </KitButton>
          ) : null,
      },
    ],
    [showSnackbar],
  );

  return (
    <PortalLayout shell="supplier">
      <PageHeader
        title="Заказы"
        subtitle={`${user?.organization ?? 'Поставщик'} — подтверждение готовности заказов`}
      />
      <KitCard variant="flat" padding="none">
        <DataTable
          data={ORDERS_MOCK}
          columns={columns}
          total={ORDERS_MOCK.length}
          page={0}
          pageSize={25}
          onPageChange={() => {}}
          getRowId={(row) => row.id}
        />
      </KitCard>
    </PortalLayout>
  );
}

export function SupplierShipmentsPage() {
  const { user } = useAuth();
  const supplierItems = useMemo(
    () => filterShipmentsByOrganization(user?.organization ?? 'Supplier Alpha', 'supplier', 25),
    [user?.organization],
  );

  const columns = useMemo<DataTableColumn<(typeof supplierItems)[0]>[]>(
    () => [
      { id: 'id', header: 'ID', cell: (row) => row.id },
      { id: 'route', header: COMMON.routeCol, cell: (row) => `${row.origin} → ${row.destination}` },
      { id: 'status', header: COMMON.status, cell: (row) => SHIPMENT_STATUS_LABELS[row.status] ?? row.status },
      { id: 'eta', header: 'ETA', cell: (row) => new Date(row.forecastEta).toLocaleString('ru-RU') },
    ],
    [],
  );

  return (
    <PortalLayout shell="supplier">
      <PageHeader title="Поставки" subtitle="Поставки вашей организации" />
      <KitCard variant="flat" padding="none">
        <DataTable
          data={supplierItems}
          columns={columns}
          total={supplierItems.length}
          page={0}
          pageSize={25}
          onPageChange={() => {}}
          getRowId={(row) => row.id}
        />
      </KitCard>
    </PortalLayout>
  );
}

/** Carrier shipments list — same table pattern as supplier, scoped to carrier org. */
export function CarrierShipmentsPage() {
  const { user } = useAuth();
  const items = useMemo(
    () => filterShipmentsByOrganization(user?.organization ?? 'Carrier Vector', 'carrier', 25),
    [user?.organization],
  );

  const columns = useMemo<DataTableColumn<(typeof items)[0]>[]>(
    () => [
      { id: 'id', header: 'ID', cell: (row) => row.id },
      { id: 'supplier', header: 'Поставщик', cell: (row) => row.supplierName },
      { id: 'route', header: COMMON.routeCol, cell: (row) => `${row.origin} → ${row.destination}` },
      { id: 'status', header: COMMON.status, cell: (row) => SHIPMENT_STATUS_LABELS[row.status] ?? row.status },
      { id: 'eta', header: 'ETA', cell: (row) => new Date(row.forecastEta).toLocaleString('ru-RU') },
    ],
    [],
  );

  return (
    <PortalLayout shell="carrier">
      <PageHeader title="Перевозки" subtitle="Только назначенные вашей организации" />
      <KitCard variant="flat" padding="none">
        <DataTable
          data={items}
          columns={columns}
          total={items.length}
          page={0}
          pageSize={25}
          onPageChange={() => {}}
          getRowId={(row) => row.id}
        />
      </KitCard>
    </PortalLayout>
  );
}
