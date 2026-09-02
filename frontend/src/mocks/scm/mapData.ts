import type { LiveMapData } from '@/types/scm/map';

export const LIVE_MAP_MOCK: LiveMapData = {
  markers: [
    {
      id: 'm-sh-0184',
      label: 'SH-0184',
      type: 'shipments',
      lng: 48.5,
      lat: 55.7,
      status: 'CRITICAL',
      shipmentId: 'SH-0184',
      link: '/shipments/SH-0184',
    },
    {
      id: 'm-vehicle-12',
      label: 'Carrier B #12',
      type: 'vehicles',
      lng: 49.1,
      lat: 55.75,
      status: 'WARNING',
    },
    {
      id: 'm-wh-moscow',
      label: 'Warehouse Moscow',
      type: 'warehouses',
      lng: 37.62,
      lat: 55.75,
      status: 'NORMAL',
    },
    {
      id: 'm-hub-spb',
      label: 'Hub SPB',
      type: 'hubs',
      lng: 30.31,
      lat: 59.93,
      status: 'NORMAL',
    },
    {
      id: 'm-risk-1',
      label: 'Risk Zone',
      type: 'riskZones',
      lng: 43.0,
      lat: 56.3,
      status: 'HIGH',
    },
  ],
  routes: [
    {
      id: 'r-kazan-moscow',
      label: 'Казань → Москва',
      coordinates: [
        [49.12, 55.79],
        [48.5, 55.7],
        [37.62, 55.75],
      ],
      status: 'CRITICAL',
    },
    {
      id: 'r-moscow-spb',
      label: 'Москва → СПб',
      coordinates: [
        [37.62, 55.75],
        [30.31, 59.93],
      ],
      status: 'NORMAL',
    },
  ],
};
