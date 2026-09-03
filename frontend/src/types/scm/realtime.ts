export type RealtimeEventType =
  | 'ETA_UPDATE'
  | 'SHIPMENT_STATUS'
  | 'NEW_EXCEPTION'
  | 'INCIDENT_UPDATE'
  | 'NOTIFICATION'
  | 'SCENARIO_PROGRESS'
  | 'COMMENT'
  | 'MAP_POSITION_UPDATE';

export interface RealtimeMapPayload {
  markerId: string;
  lng: number;
  lat: number;
}

export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  entityType: 'shipment' | 'exception' | 'incident' | 'scenario' | 'notification' | 'vehicle';
  entityId: string;
  message: string;
  link?: string;
  timestamp: string;
  mapPayload?: RealtimeMapPayload;
}
