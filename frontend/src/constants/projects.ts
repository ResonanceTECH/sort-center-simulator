import type { ProjectListStatus, ProjectSortOption } from '@/types/projects';

export const PROJECTS_PAGE_SIZE = 5;

export const PROJECTS_PAGE = {
  bg: '#F5F7FA',
  border: '#DDE3EA',
  textSecondary: '#667085',
  textMuted: '#98A2B3',
  success: '#12B76A',
  successBg: '#ECFDF3',
  successBorder: '#ABEFC6',
  warning: '#F79009',
  error: '#D92D20',
  errorBg: '#FEF3F2',
  errorBorder: '#FECDCA',
  draftBg: '#F9FAFB',
} as const;

export const STATUS_FILTER_OPTIONS: { value: ProjectListStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все статусы' },
  { value: 'draft', label: 'Черновик' },
  { value: 'ready', label: 'Готов к расчету' },
  { value: 'running', label: 'Выполняется' },
  { value: 'completed', label: 'Завершен' },
  { value: 'error', label: 'С ошибкой' },
  { value: 'archived', label: 'Архив' },
];

export const PROJECT_STATUS_LABELS: Record<ProjectListStatus, string> = {
  draft: 'Черновик',
  ready: 'Готов к расчету',
  running: 'Выполняется',
  completed: 'Завершен',
  error: 'С ошибкой',
  archived: 'Архив',
};

export const SORT_OPTIONS: { value: ProjectSortOption; label: string }[] = [
  { value: 'recent', label: 'Сначала недавно измененные' },
  { value: 'oldest', label: 'Сначала старые' },
  { value: 'name_asc', label: 'По названию А–Я' },
  { value: 'name_desc', label: 'По названию Я–А' },
  { value: 'archived', label: 'Архивированные' },
];

export const STATUS_CONFIG: Record<
  ProjectListStatus,
  { label: string; icon: string; color: string; bg: string; border: string }
> = {
  draft: {
    label: 'Черновик',
    icon: 'EditOutlined',
    color: '#667085',
    bg: PROJECTS_PAGE.draftBg,
    border: PROJECTS_PAGE.border,
  },
  ready: {
    label: 'Готов к расчету',
    icon: 'CheckCircleOutline',
    color: '#175CD3',
    bg: '#EFF8FF',
    border: '#B2DDFF',
  },
  running: {
    label: 'Выполняется',
    icon: 'Autorenew',
    color: PROJECTS_PAGE.warning,
    bg: '#FFFAEB',
    border: '#FEDF89',
  },
  completed: {
    label: 'Завершен',
    icon: '',
    color: PROJECTS_PAGE.success,
    bg: PROJECTS_PAGE.successBg,
    border: PROJECTS_PAGE.successBorder,
  },
  error: {
    label: 'С ошибкой',
    icon: 'ErrorOutline',
    color: PROJECTS_PAGE.error,
    bg: PROJECTS_PAGE.errorBg,
    border: PROJECTS_PAGE.errorBorder,
  },
  archived: {
    label: 'Архив',
    icon: 'ArchiveOutlined',
    color: '#667085',
    bg: PROJECTS_PAGE.draftBg,
    border: PROJECTS_PAGE.border,
  },
};

export const RUN_STATUS_CONFIG: Record<
  'queued' | 'running' | 'completed' | 'completed_with_warnings' | 'failed',
  { label: string; color: string; bg: string; border: string }
> = {
  queued: {
    label: 'В очереди',
    color: '#667085',
    bg: PROJECTS_PAGE.draftBg,
    border: PROJECTS_PAGE.border,
  },
  running: {
    label: 'Выполняется',
    color: PROJECTS_PAGE.warning,
    bg: '#FFFAEB',
    border: '#FEDF89',
  },
  completed: {
    label: 'Завершён',
    color: PROJECTS_PAGE.success,
    bg: PROJECTS_PAGE.successBg,
    border: PROJECTS_PAGE.successBorder,
  },
  completed_with_warnings: {
    label: 'Завершён с замечаниями',
    color: PROJECTS_PAGE.warning,
    bg: '#FFFAEB',
    border: '#FEDF89',
  },
  failed: {
    label: 'Ошибка',
    color: PROJECTS_PAGE.error,
    bg: PROJECTS_PAGE.errorBg,
    border: PROJECTS_PAGE.errorBorder,
  },
};
