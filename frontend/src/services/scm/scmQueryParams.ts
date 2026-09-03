import type { CarrierFilters } from '@/types/scm/carrier';
import type { ExceptionFilters } from '@/types/scm/exception';
import type { IncidentFilters } from '@/types/scm/incident';
import type { ShipmentFilters } from '@/types/scm/shipment';
import type { SupplierFilters } from '@/types/scm/supplier';

type QueryValue = string | number | boolean;

function setParam(params: Record<string, QueryValue>, key: string, value: unknown) {
  if (value !== undefined && value !== null && value !== '') {
    params[key] = value as QueryValue;
  }
}

export function toApiPage(page?: number): number {
  return (page ?? 0) + 1;
}

export function mapShipmentQueryParams(filters: ShipmentFilters = {}): Record<string, QueryValue> {
  const params: Record<string, QueryValue> = {
    page: toApiPage(filters.page),
    page_size: filters.pageSize ?? 25,
  };

  setParam(params, 'search', filters.search);
  setParam(params, 'supplier_id', filters.supplier);
  setParam(params, 'carrier_id', filters.carrier);
  setParam(params, 'warehouse_id', filters.warehouse);
  setParam(params, 'date_from', filters.dateFrom);
  setParam(params, 'date_to', filters.dateTo);
  setParam(params, 'order', filters.sortDir ?? 'desc');

  if (filters.sortBy) {
    const sortMap: Record<string, string> = {
      forecastEta: 'planned_delivery_at',
      plannedEta: 'planned_delivery_at',
      deviationMinutes: 'planned_delivery_at',
      id: 'planned_delivery_at',
    };
    setParam(params, 'sort', sortMap[filters.sortBy] ?? filters.sortBy);
  }

  if (filters.status === 'in-transit') {
    params.status = 'IN_TRANSIT';
  } else if (filters.status === 'at-risk') {
    params.risk = 'CRITICAL';
  } else if (filters.status) {
    params.status = filters.status.toUpperCase();
  }

  if (filters.risk) {
    params.risk = filters.risk.toUpperCase();
  }

  return params;
}

export function mapSupplierQueryParams(filters: SupplierFilters = {}): Record<string, QueryValue> {
  const params: Record<string, QueryValue> = {};
  setParam(params, 'search', filters.search);
  setParam(params, 'status', filters.status);
  setParam(params, 'risk', filters.risk);
  setParam(params, 'region', filters.region);
  setParam(params, 'product_group', filters.productGroup);
  return params;
}

export function mapCarrierQueryParams(filters: CarrierFilters = {}): Record<string, QueryValue> {
  const params: Record<string, QueryValue> = {};
  setParam(params, 'search', filters.search);
  setParam(params, 'risk', filters.risk);
  return params;
}

export function mapExceptionQueryParams(filters: ExceptionFilters = {}): Record<string, QueryValue> {
  const params: Record<string, QueryValue> = {};
  setParam(params, 'severity', filters.severity?.toUpperCase());
  setParam(params, 'type', filters.type);
  setParam(params, 'status', filters.status);
  setParam(params, 'owner', filters.owner);
  setParam(params, 'supplier', filters.supplier);
  setParam(params, 'carrier', filters.carrier);
  return params;
}

export function mapIncidentQueryParams(filters: IncidentFilters = {}): Record<string, QueryValue> {
  const params: Record<string, QueryValue> = {};
  setParam(params, 'status', filters.status);
  setParam(params, 'search', filters.search);
  return params;
}
