import { INCIDENTS_MOCK, SHIPMENTS_MOCK } from '@/mocks/scm/scmData';
import type { LiveMapData, MapMarker } from '@/types/scm/map';
import type { IncidentSummary } from '@/types/scm/incident';
import type { SemanticStatus } from '@/types/scm/semantic';

export interface PortalVehicle {
  id: string;
  plate: string;
  type: string;
  status: SemanticStatus;
  assignedShipmentId?: string;
  capacity: string;
  driver?: string;
}

const CARRIER_VEHICLES: Record<string, PortalVehicle[]> = {
  'Carrier C': [
    { id: 'veh-1', plate: 'А123BC 77', type: 'Фура 20т', status: 'NORMAL', assignedShipmentId: 'SH-0100', capacity: '20 т', driver: 'И. Сидоров' },
    { id: 'veh-2', plate: 'В456DE 77', type: 'Фура 20т', status: 'WARNING', assignedShipmentId: 'SH-0103', capacity: '20 т', driver: 'П. Иванов' },
    { id: 'veh-3', plate: 'Е789FG 50', type: 'Грузовик 10т', status: 'NORMAL', capacity: '10 т' },
    { id: 'veh-4', plate: 'К012HI 16', type: 'Фура 20т', status: 'INFO', assignedShipmentId: 'SH-0106', capacity: '20 т', driver: 'А. Козлов' },
  ],
  'Carrier B': [
    { id: 'veh-b1', plate: 'М111ММ 77', type: 'Фура 20т', status: 'CRITICAL', assignedShipmentId: 'SH-0184', capacity: '20 т', driver: 'В. Петров' },
    { id: 'veh-b2', plate: 'Н222НН 77', type: 'Фура 20т', status: 'NORMAL', capacity: '20 т' },
  ],
};

export function getPortalVehicles(organization: string): PortalVehicle[] {
  return CARRIER_VEHICLES[organization] ?? CARRIER_VEHICLES['Carrier C'] ?? [];
}

export function getPortalIncidents(
  shell: 'supplier' | 'carrier',
  organization?: string,
): IncidentSummary[] {
  if (shell === 'supplier') {
    const supplierShipments = new Set(
      SHIPMENTS_MOCK.filter((s) => s.supplierName === organization).map((s) => s.id),
    );
    return INCIDENTS_MOCK.filter(
      (i) =>
        i.participants.includes('Supplier') ||
        (i.shipmentId && supplierShipments.has(i.shipmentId)) ||
        (organization && i.title.toLowerCase().includes(organization.toLowerCase())),
    );
  }

  const carrierShipments = new Set(
    SHIPMENTS_MOCK.filter((s) => s.carrierName === organization).map((s) => s.id),
  );
  return INCIDENTS_MOCK.filter(
    (i) =>
      i.participants.includes('Carrier') ||
      (i.shipmentId && carrierShipments.has(i.shipmentId)),
  );
}

export function buildCarrierPortalMap(organization: string): LiveMapData {
  const shipments = SHIPMENTS_MOCK.filter((s) => s.carrierName === organization).slice(0, 18);
  const routeCoords: [number, number][] = [
    [37.62, 55.75],
    [43.0, 56.3],
    [49.12, 55.79],
    [30.31, 59.93],
  ];

  const markers: MapMarker[] = shipments.map((s, i) => {
    const coord = routeCoords[i % routeCoords.length]!;
    return {
      id: `m-${s.id}`,
      label: s.id,
      type: 'shipments' as const,
      lng: coord[0] + (i % 4) * 0.08 - 0.12,
      lat: coord[1] + (i % 3) * 0.06 - 0.08,
      status: s.slaRisk.status,
      shipmentId: s.id,
    };
  });

  const vehicles = getPortalVehicles(organization).filter((v) => v.assignedShipmentId);
  vehicles.forEach((v) => {
    const shipment = shipments.find((s) => s.id === v.assignedShipmentId);
    if (!shipment) return;
    const base = markers.find((m) => m.shipmentId === shipment.id);
    if (base) {
      markers.push({
        id: `veh-${v.id}`,
        label: v.plate,
        type: 'vehicles',
        lng: base.lng + 0.05,
        lat: base.lat + 0.03,
        status: v.status,
        shipmentId: shipment.id,
      });
    }
  });

  return {
    markers,
    routes: [
      {
        id: 'carrier-route-main',
        label: `${organization} — активные рейсы`,
        coordinates: routeCoords,
        status: 'NORMAL',
      },
    ],
    geofences: [],
  };
}

export function filterShipmentsByOrganization(
  organization: string,
  kind: 'supplier' | 'carrier',
  limit = 25,
) {
  const key = kind === 'supplier' ? 'supplierName' : 'carrierName';
  return SHIPMENTS_MOCK.filter((s) => s[key] === organization).slice(0, limit);
}
