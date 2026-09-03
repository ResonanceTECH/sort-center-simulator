import { FilterBar } from '@/components/tables/FilterBar';
import { COMMON } from '@/constants/platformRu';
import { BOARD_COLUMN_LABELS, BOARD_LIFECYCLE_COLUMNS } from '@/components/shipments/boardConstants';

export const SHIPMENT_FILTER_DEFAULTS = {
  status: undefined as string | undefined,
  risk: undefined as string | undefined,
  supplier: undefined as string | undefined,
  carrier: undefined as string | undefined,
  route: undefined as string | undefined,
  warehouse: undefined as string | undefined,
  trackingStatus: undefined as string | undefined,
  dateFrom: undefined as string | undefined,
  search: undefined as string | undefined,
};

interface ShipmentFiltersBarProps {
  values: Record<string, string | undefined>;
  onChange: (updates: Record<string, string | undefined>) => void;
}

export function ShipmentFiltersBar({ values, onChange }: ShipmentFiltersBarProps) {
  return (
    <FilterBar
      fields={[
        { key: 'search', label: 'Поиск поставки', type: 'text' },
        { key: 'dateFrom', label: 'Дата', type: 'text' },
        {
          key: 'status',
          label: 'Статус',
          type: 'select',
          options: [
            { value: 'delayed', label: 'Delayed' },
            ...BOARD_LIFECYCLE_COLUMNS.map((s) => ({
              value: s,
              label: BOARD_COLUMN_LABELS[s],
            })),
            { value: 'in-transit', label: COMMON.inTransit },
          ],
        },
        {
          key: 'risk',
          label: 'Риск',
          type: 'select',
          options: [
            { value: 'at-risk', label: COMMON.atRisk },
            { value: 'CRITICAL', label: 'CRITICAL' },
            { value: 'HIGH', label: 'HIGH' },
            { value: 'MEDIUM', label: 'MEDIUM' },
            { value: 'NORMAL', label: 'NORMAL' },
            { value: 'NO_DATA', label: 'NO DATA' },
          ],
        },
        {
          key: 'supplier',
          label: 'Поставщик',
          type: 'select',
          options: [
            { value: 'sup-0', label: 'Supplier Alpha' },
            { value: 'sup-1', label: 'Supplier B' },
            { value: 'sup-2', label: 'Supplier C' },
          ],
        },
        {
          key: 'carrier',
          label: 'Перевозчик',
          type: 'select',
          options: [
            { value: 'car-0', label: 'Carrier Vector' },
            { value: 'car-1', label: 'Carrier B' },
            { value: 'car-2', label: 'Carrier C' },
          ],
        },
        {
          key: 'route',
          label: 'Маршрут',
          type: 'select',
          options: [
            { value: 'Казань', label: 'Казань → Москва' },
            { value: 'Москва → СПб', label: 'Москва → СПб' },
            { value: 'Warehouse', label: 'Supplier → Warehouse' },
          ],
        },
        {
          key: 'warehouse',
          label: 'Склад',
          type: 'select',
          options: [
            { value: 'Москва РЦ', label: 'Москва РЦ' },
            { value: 'СПб', label: 'СПб' },
            { value: 'Казань', label: 'Казань' },
          ],
        },
        {
          key: 'trackingStatus',
          label: 'Tracking',
          type: 'select',
          options: [
            { value: 'no_data', label: 'No Tracking' },
            { value: 'OK', label: 'OK' },
            { value: 'STALE', label: 'Stale' },
          ],
        },
      ]}
      values={values}
      onChange={onChange}
    />
  );
}
