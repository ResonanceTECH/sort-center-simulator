export type ReportType = 'simulation' | 'statistics' | 'comparison' | 'export';
export type ReportFormat = 'pdf' | 'xlsx' | 'csv' | 'json';
export type ReportStatus = 'ready' | 'processing' | 'failed' | 'expired';

export interface ReportListItem {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  scenarioId: string | null;
  scenarioName: string | null;
  type: ReportType;
  format: ReportFormat;
  status: ReportStatus;
  createdAt: string;
  fileSizeBytes: number;
}

export interface ReportsQuery {
  search?: string;
  type?: ReportType | 'all';
  status?: ReportStatus | 'all';
  format?: ReportFormat | 'all';
}

export interface ReportsPageData {
  reports: ReportListItem[];
  totalCount: number;
}

export interface ReportApiItem {
  id: string;
  name: string;
  project_id: string;
  project_name: string;
  scenario_id?: string | null;
  scenario_name?: string | null;
  type: ReportType | string;
  format: ReportFormat | string;
  status: ReportStatus | string;
  created_at: string;
  file_size_bytes: number;
}

export interface ReportsListApiResponse {
  items: ReportApiItem[];
  total: number;
}
