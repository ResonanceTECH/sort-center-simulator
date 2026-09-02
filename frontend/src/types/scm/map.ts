import type { SemanticStatus } from '@/types/scm/semantic';

export type MapLayerType = 'vehicles' | 'shipments' | 'routes' | 'warehouses' | 'hubs' | 'riskZones';

export interface MapMarker {
  id: string;
  label: string;
  type: MapLayerType;
  lng: number;
  lat: number;
  status: SemanticStatus;
  shipmentId?: string;
  link?: string;
}

export interface MapRoute {
  id: string;
  label: string;
  coordinates: [number, number][];
  status: SemanticStatus;
}

export interface LiveMapData {
  markers: MapMarker[];
  routes: MapRoute[];
}
