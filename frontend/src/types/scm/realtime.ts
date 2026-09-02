export type RealtimeEventType =
  | 'ETA_UPDATE'
  | 'SHIPMENT_STATUS'
  | 'NEW_EXCEPTION'
  | 'INCIDENT_UPDATE'
  | 'NOTIFICATION'
  | 'SCENARIO_PROGRESS'
  | 'COMMENT';

export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  entityType: 'shipment' | 'exception' | 'incident' | 'scenario' | 'notification';
  entityId: string;
  message: string;
  link?: string;
  timestamp: string;
}
