import type { LiveMapData, MapGeofence, MapMarker, MapRoute } from '@/types/scm/map';
import type { RealtimeMapPayload } from '@/types/scm/realtime';
import type { SemanticStatus } from '@/types/scm/semantic';

const ROUTE_PRESETS: Record<string, MapRoute> = {
  'Казань → Москва': {
    id: 'r-kazan-moscow',
    label: 'Казань → Москва',
    coordinates: [
      [49.12, 55.79],
      [48.5, 55.7],
      [37.62, 55.75],
    ],
    status: 'CRITICAL',
  },
  'Москва → СПб': {
    id: 'r-moscow-spb',
    label: 'Москва → СПб',
    coordinates: [
      [37.62, 55.75],
      [30.31, 59.93],
    ],
    status: 'NORMAL',
  },
  'Supplier B → Warehouse Moscow': {
    id: 'r-supplier-wh',
    label: 'Supplier B → Warehouse Moscow',
    coordinates: [
      [37.5, 55.68],
      [37.62, 55.75],
    ],
    status: 'WARNING',
  },
};

const GEOFENCES: MapGeofence[] = [
  {
    id: 'gf-volga-delay',
    label: 'Зона задержек — Поволжье',
    status: 'HIGH',
    coordinates: [
      [46.8, 56.1],
      [50.2, 56.1],
      [50.2, 55.2],
      [46.8, 55.2],
      [46.8, 56.1],
    ],
  },
  {
    id: 'gf-m11-congestion',
    label: 'Пробки М-11 (участок)',
    status: 'CRITICAL',
    coordinates: [
      [36.8, 55.9],
      [38.4, 55.9],
      [38.4, 55.55],
      [36.8, 55.55],
      [36.8, 55.9],
    ],
  },
  {
    id: 'gf-north-weather',
    label: 'Погодный риск — Северо-Запад',
    status: 'WARNING',
    coordinates: [
      [28.5, 60.2],
      [32.5, 60.2],
      [32.5, 58.8],
      [28.5, 58.8],
      [28.5, 60.2],
    ],
  },
];

/** Runtime position overrides for realtime mock. */
const livePositions = new Map<string, { lng: number; lat: number }>();

function interpolateRoute(coords: [number, number][], t: number): [number, number] {
  const seg = Math.min(Math.floor(t * (coords.length - 1)), coords.length - 2);
  const local = t * (coords.length - 1) - seg;
  const a = coords[seg]!;
  const b = coords[seg + 1]!;
  return [a[0] + (b[0] - a[0]) * local, a[1] + (b[1] - a[1]) * local];
}

function generateClusterableMarkers(): MapMarker[] {
  const markers: MapMarker[] = [];
  const kazanMoscow = ROUTE_PRESETS['Казань → Москва']!.coordinates;
  const moscowSpb = ROUTE_PRESETS['Москва → СПб']!.coordinates;

  for (let i = 0; i < 45; i++) {
    const [lng, lat] = interpolateRoute(kazanMoscow, (i + 1) / 46);
    markers.push({
      id: `m-sh-${100 + i}`,
      label: `SH-${String(100 + i).padStart(4, '0')}`,
      type: 'shipments',
      lng: lng + (i % 5) * 0.04 - 0.08,
      lat: lat + (i % 3) * 0.03 - 0.04,
      status: i < 8 ? 'CRITICAL' : i < 18 ? 'WARNING' : 'NORMAL',
      shipmentId: `SH-${String(100 + i).padStart(4, '0')}`,
      link: `/shipments/SH-${String(100 + i).padStart(4, '0')}`,
    });
  }

  for (let i = 0; i < 35; i++) {
    const route = i % 2 === 0 ? kazanMoscow : moscowSpb;
    const [lng, lat] = interpolateRoute(route, (i + 2) / 37);
    markers.push({
      id: `m-veh-${i}`,
      label: `ТС #${i + 1}`,
      type: 'vehicles',
      lng: lng + (i % 4) * 0.05 - 0.1,
      lat: lat + (i % 4) * 0.04 - 0.06,
      status: i % 7 === 0 ? 'WARNING' : 'NORMAL',
    });
  }

  return markers;
}

const STATIC_MARKERS: MapMarker[] = [
  {
    id: 'm-wh-moscow',
    label: 'Склад Москва',
    type: 'warehouses',
    lng: 37.62,
    lat: 55.75,
    status: 'NORMAL',
  },
  {
    id: 'm-hub-spb',
    label: 'Хаб СПб',
    type: 'hubs',
    lng: 30.31,
    lat: 59.93,
    status: 'NORMAL',
  },
  {
    id: 'm-wh-kazan',
    label: 'Хаб Казань',
    type: 'hubs',
    lng: 49.12,
    lat: 55.79,
    status: 'NORMAL',
  },
];

function withLivePositions(markers: MapMarker[]): MapMarker[] {
  return markers.map((m) => {
    const pos = livePositions.get(m.id);
    return pos ? { ...m, lng: pos.lng, lat: pos.lat } : m;
  });
}

export function createLiveMapBase(): LiveMapData {
  return {
    markers: [...generateClusterableMarkers(), ...STATIC_MARKERS],
    routes: [ROUTE_PRESETS['Казань → Москва']!, ROUTE_PRESETS['Москва → СПб']!],
    geofences: GEOFENCES,
  };
}

export function getLiveMapData(): LiveMapData {
  const base = createLiveMapBase();
  return { ...base, markers: withLivePositions(base.markers) };
}

export function applyMapPositionUpdate(data: LiveMapData, update: RealtimeMapPayload): LiveMapData {
  livePositions.set(update.markerId, { lng: update.lng, lat: update.lat });
  return {
    ...data,
    markers: data.markers.map((m) =>
      m.id === update.markerId ? { ...m, lng: update.lng, lat: update.lat } : m,
    ),
  };
}

/** Pick a movable marker and nudge along its route for SSE mock. */
export function createMapPositionUpdate(): RealtimeMapPayload | null {
  const base = createLiveMapBase();
  const movable = base.markers.filter((m) => m.type === 'vehicles' || m.type === 'shipments');
  if (movable.length === 0) return null;

  const marker = movable[Math.floor(Math.random() * movable.length)]!;
  const current = livePositions.get(marker.id) ?? { lng: marker.lng, lat: marker.lat };
  const deltaLng = (Math.random() - 0.5) * 0.35;
  const deltaLat = (Math.random() - 0.5) * 0.2;

  return {
    markerId: marker.id,
    lng: current.lng + deltaLng,
    lat: current.lat + deltaLat,
  };
}

export function buildShipmentMapView(
  shipmentId: string,
  routeLabel: string,
  status: SemanticStatus,
): LiveMapData {
  const route =
    ROUTE_PRESETS[routeLabel] ??
    ({
      id: `r-${shipmentId}`,
      label: routeLabel,
      coordinates: [
        [37.62, 55.75],
        [30.31, 59.93],
      ],
      status,
    } satisfies MapRoute);

  const mid = route.coordinates[Math.floor(route.coordinates.length / 2)] ?? route.coordinates[0]!;

  return {
    markers: [
      {
        id: `m-${shipmentId}`,
        label: shipmentId,
        type: 'shipments',
        lng: mid[0],
        lat: mid[1],
        status,
        shipmentId,
      },
      {
        id: `m-origin-${shipmentId}`,
        label: 'Отправление',
        type: 'hubs',
        lng: route.coordinates[0]![0],
        lat: route.coordinates[0]![1],
        status: 'NORMAL',
      },
      {
        id: `m-dest-${shipmentId}`,
        label: 'Назначение',
        type: 'warehouses',
        lng: route.coordinates[route.coordinates.length - 1]![0],
        lat: route.coordinates[route.coordinates.length - 1]![1],
        status: 'NORMAL',
      },
    ],
    routes: [route],
    geofences: [],
  };
}

/** @deprecated use getLiveMapData() */
export const LIVE_MAP_MOCK: LiveMapData = getLiveMapData();
