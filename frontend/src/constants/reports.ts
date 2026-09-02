import type { ReportFormat, ReportStatus, ReportType } from '@/types/reports';
import { PROJECTS_PAGE } from '@/constants/projects';

export const REPORT_TYPE_OPTIONS: { value: ReportType | 'all'; label: string }[] = [
  { value: 'all', label: 'Все типы' },
  { value: 'simulation', label: 'Симуляция' },
  { value: 'statistics', label: 'Статистика' },
  { value: 'comparison', label: 'Сравнение' },
  { value: 'export', label: 'Экспорт' },
];

export const REPORT_STATUS_OPTIONS: { value: ReportStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все статусы' },
  { value: 'ready', label: 'Готов' },
  { value: 'processing', label: 'Формируется' },
  { value: 'failed', label: 'Ошибка' },
  { value: 'expired', label: 'Истёк' },
];

export const REPORT_FORMAT_OPTIONS: { value: ReportFormat | 'all'; label: string }[] = [
  { value: 'all', label: 'Все форматы' },
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'XLSX' },
  { value: 'csv', label: 'CSV' },
  { value: 'json', label: 'JSON' },
];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  simulation: 'Симуляция',
  statistics: 'Статистика',
  comparison: 'Сравнение',
  export: 'Экспорт',
};

export const REPORT_STATUS_CONFIG: Record<
  ReportStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  ready: {
    label: 'Готов',
    color: PROJECTS_PAGE.success,
    bg: PROJECTS_PAGE.successBg,
    border: PROJECTS_PAGE.successBorder,
  },
  processing: {
    label: 'Формируется',
    color: PROJECTS_PAGE.warning,
    bg: 'rgba(255, 90, 0, 0.08)',
    border: 'rgba(255, 90, 0, 0.28)',
  },
  failed: {
    label: 'Ошибка',
    color: PROJECTS_PAGE.error,
    bg: PROJECTS_PAGE.errorBg,
    border: PROJECTS_PAGE.errorBorder,
  },
  expired: {
    label: 'Истёк',
    color: '#71717a',
    bg: PROJECTS_PAGE.draftBg,
    border: PROJECTS_PAGE.border,
  },
};

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}
