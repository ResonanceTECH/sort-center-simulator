import axios from 'axios';
import { apiClient } from '@/api/client';
import type {
  ReportApiItem,
  ReportFormat,
  ReportListItem,
  ReportStatus,
  ReportType,
  ReportsListApiResponse,
  ReportsPageData,
  ReportsQuery,
} from '@/types/reports';

function mapType(value: unknown): ReportType {
  if (value === 'simulation' || value === 'statistics' || value === 'comparison' || value === 'export') {
    return value;
  }
  return 'export';
}

function mapFormat(value: unknown): ReportFormat {
  if (value === 'pdf' || value === 'xlsx' || value === 'csv' || value === 'json') {
    return value;
  }
  return 'pdf';
}

function mapStatus(value: unknown): ReportStatus {
  if (value === 'ready' || value === 'processing' || value === 'failed' || value === 'expired') {
    return value;
  }
  return 'ready';
}

function mapReport(item: ReportApiItem): ReportListItem {
  return {
    id: item.id,
    name: item.name,
    projectId: item.project_id,
    projectName: item.project_name,
    scenarioId: item.scenario_id ?? null,
    scenarioName: item.scenario_name ?? null,
    type: mapType(item.type),
    format: mapFormat(item.format),
    status: mapStatus(item.status),
    createdAt: item.created_at,
    fileSizeBytes: item.file_size_bytes ?? 0,
  };
}

function buildQueryParams(query: ReportsQuery): Record<string, string> {
  const params: Record<string, string> = {};
  if (query.search?.trim()) params.search = query.search.trim();
  if (query.type && query.type !== 'all') params.type = query.type;
  if (query.status && query.status !== 'all') params.status = query.status;
  if (query.format && query.format !== 'all') params.format = query.format;
  return params;
}

/** GET /api/v1/reports */
export async function fetchReports(query: ReportsQuery = {}): Promise<ReportsPageData> {
  const { data } = await apiClient.get<ReportsListApiResponse>('/reports', {
    params: buildQueryParams(query),
  });

  const items = Array.isArray(data.items) ? data.items : [];
  return {
    reports: items.map(mapReport),
    totalCount: data.total ?? items.length,
  };
}

/** GET /api/v1/reports/{reportId} */
export async function fetchReportById(reportId: string): Promise<ReportListItem> {
  const { data } = await apiClient.get<ReportApiItem>(`/reports/${reportId}`);
  return mapReport(data);
}

/** GET /api/v1/reports/{reportId}/download */
export async function downloadReport(reportId: string): Promise<void> {
  try {
    const response = await apiClient.get<Blob>(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });

    const disposition = response.headers['content-disposition'] as string | undefined;
    let filename = `report-${reportId}`;
    const match = disposition?.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    if (match) {
      filename = decodeURIComponent(match[1] || match[2]);
    }

    const blob = response.data;
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.data instanceof Blob) {
      const text = await err.response.data.text();
      try {
        const parsed = JSON.parse(text) as { message?: string };
        if (parsed.message) {
          throw new Error(parsed.message);
        }
      } catch (inner) {
        if (inner instanceof Error && inner.message !== text) {
          throw inner;
        }
      }
    }
    throw err;
  }
}

/** DELETE /api/v1/reports/{reportId} */
export async function deleteReport(reportId: string): Promise<void> {
  await apiClient.delete(`/reports/${reportId}`);
}
