export type SearchEntityType =
  | 'shipment'
  | 'supplier'
  | 'carrier'
  | 'order'
  | 'sku'
  | 'incident'
  | 'exception';

export interface SearchResult {
  id: string;
  type: SearchEntityType;
  label: string;
  subtitle?: string;
  link: string;
}

export interface ScmNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link: string;
}
