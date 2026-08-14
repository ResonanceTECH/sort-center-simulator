import type {
  ProjectListItem,
  ProjectListStatus,
  ProjectLastResult,
  ProjectActiveRun,
} from '@/types/projects';
import type { Notification } from '@/types/general';

function hoursToday(h: number, m: number): string {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, h = 12, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

const LAST_RESULT: Record<string, ProjectLastResult> = {
  success: { status: 'completed', label: 'Успешно' },
  failed: { status: 'failed', label: 'Ошибка' },
  running: { status: 'running', label: 'Выполняется' },
  none: { status: null, label: 'Нет результатов' },
};

function activeRun(progress: number, label = 'Симуляция'): ProjectActiveRun {
  return { progress, label };
}

const INITIAL_PROJECTS: ProjectListItem[] = [
  {
    id: 'proj-1',
    name: 'Сортировочный центр 100К',
    updatedAt: hoursToday(14, 32),
    status: 'completed',
    thumbnail: '/images/project-plan-1.svg',
    thumbnailAlt: 'План этажа сортировочного центра 100К',
    scenariosCount: 3,
    lastResult: LAST_RESULT.success,
    activeRun: null,
  },
  {
    id: 'proj-2',
    name: 'СЦ Северный хаб',
    updatedAt: daysAgo(1, 18, 5),
    status: 'completed',
    thumbnail: '/images/project-plan-2.svg',
    thumbnailAlt: 'Изометрическая схема конвейеров СЦ 100К',
    scenariosCount: 2,
    lastResult: LAST_RESULT.success,
    activeRun: null,
  },
  {
    id: 'proj-3',
    name: 'Сортировочный центр 250К',
    updatedAt: '2025-10-12T09:15:00',
    status: 'completed',
    thumbnail: '/images/project-plan-3.svg',
    thumbnailAlt: '3D-модель сортировочного центра с потоками',
    scenariosCount: 5,
    lastResult: LAST_RESULT.success,
    activeRun: null,
  },
  {
    id: 'proj-4',
    name: 'СЦ Юг — пилот',
    updatedAt: '2025-10-10T11:20:00',
    status: 'error',
    thumbnail: '/images/project-plan-4.svg',
    thumbnailAlt: 'Чертёж планировки сортировочного центра',
    scenariosCount: 2,
    lastResult: LAST_RESULT.failed,
    activeRun: null,
  },
  {
    id: 'proj-5',
    name: 'Черновик СЦ 80К',
    updatedAt: '2025-10-05T16:45:00',
    status: 'draft',
    thumbnail: '/images/project-plan-5.svg',
    thumbnailAlt: 'Черновик модели сортировочного центра',
    scenariosCount: 1,
    lastResult: LAST_RESULT.none,
    activeRun: null,
  },
  {
    id: 'proj-6',
    name: 'СЦ Восток — расширение',
    updatedAt: daysAgo(2, 11, 10),
    status: 'completed',
    thumbnail: '/images/project-plan-1.svg',
    thumbnailAlt: 'План расширения сортировочного центра',
    scenariosCount: 4,
    lastResult: LAST_RESULT.running,
    activeRun: activeRun(62, 'Пиковая нагрузка'),
  },
  {
    id: 'proj-7',
    name: 'Мини-хаб 40К',
    updatedAt: daysAgo(3, 9, 0),
    status: 'draft',
    thumbnail: '/images/project-plan-2.svg',
    thumbnailAlt: 'Черновик мини-хаба',
    scenariosCount: 1,
    lastResult: LAST_RESULT.none,
    activeRun: null,
  },
  {
    id: 'proj-8',
    name: 'СЦ Центральный',
    updatedAt: daysAgo(4, 15, 40),
    status: 'error',
    thumbnail: '/images/project-plan-3.svg',
    thumbnailAlt: 'Схема центрального СЦ',
    scenariosCount: 3,
    lastResult: LAST_RESULT.failed,
    activeRun: null,
  },
  {
    id: 'proj-9',
    name: 'СЦ 150К — ночная смена',
    updatedAt: daysAgo(5, 20, 15),
    status: 'completed',
    thumbnail: '/images/project-plan-4.svg',
    thumbnailAlt: 'План ночной смены',
    scenariosCount: 2,
    lastResult: LAST_RESULT.success,
    activeRun: activeRun(28, 'Ночной сценарий'),
  },
  {
    id: 'proj-10',
    name: 'Тестовый полигон',
    updatedAt: daysAgo(6, 8, 30),
    status: 'draft',
    thumbnail: '/images/project-thumb-1.svg',
    thumbnailAlt: 'Тестовый полигон',
    scenariosCount: 0,
    lastResult: LAST_RESULT.none,
    activeRun: null,
  },
  {
    id: 'proj-11',
    name: 'СЦ Архив 2024',
    updatedAt: daysAgo(30, 12, 0),
    status: 'archived',
    thumbnail: '/images/project-plan-5.svg',
    thumbnailAlt: 'Архивный проект',
    scenariosCount: 6,
    lastResult: LAST_RESULT.success,
    activeRun: null,
  },
  {
    id: 'proj-12',
    name: 'СЦ Запад — stage 2',
    updatedAt: daysAgo(7, 14, 0),
    status: 'completed',
    thumbnail: '/images/project-thumb-2.svg',
    thumbnailAlt: 'Схема stage 2',
    scenariosCount: 4,
    lastResult: LAST_RESULT.success,
    activeRun: null,
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    title: 'Симуляция завершена',
    message: 'Проект «СЦ 100К» рассчитан успешно',
    read: false,
    createdAt: '2025-10-12T14:32:00',
  },
  {
    id: 'n2',
    title: 'Ошибка конфигурации',
    message: 'Проверьте параметры входящего потока',
    read: false,
    createdAt: '2025-10-10T11:25:00',
  },
];

let projectsStore: ProjectListItem[] = INITIAL_PROJECTS.map((p) => ({
  ...p,
  lastResult: { ...p.lastResult },
  activeRun: p.activeRun ? { ...p.activeRun } : null,
}));

export function getProjectsStore(): ProjectListItem[] {
  return projectsStore;
}

export function getProjectsNotifications(): Notification[] {
  return INITIAL_NOTIFICATIONS;
}

export function replaceProjectsStore(next: ProjectListItem[]): void {
  projectsStore = next;
}

export function findProjectInStore(id: string): ProjectListItem | undefined {
  return projectsStore.find((p) => p.id === id);
}

export function upsertProjectInStore(project: ProjectListItem): void {
  const index = projectsStore.findIndex((p) => p.id === project.id);
  if (index === -1) {
    projectsStore = [project, ...projectsStore];
    return;
  }
  projectsStore = projectsStore.map((p, i) => (i === index ? project : p));
}

export function removeProjectFromStore(id: string): void {
  projectsStore = projectsStore.filter((p) => p.id !== id);
}

export function setProjectStatusInStore(id: string, status: ProjectListStatus): ProjectListItem | null {
  const project = findProjectInStore(id);
  if (!project) return null;
  const next = { ...project, status, updatedAt: new Date().toISOString() };
  upsertProjectInStore(next);
  return next;
}

/** @deprecated Use getProjectsStore — kept for workspace mocks compatibility shape */
export const PROJECTS_MOCK_DATA = {
  get projects() {
    return getProjectsStore();
  },
  get totalCount() {
    return getProjectsStore().length;
  },
  get notifications() {
    return getProjectsNotifications();
  },
};
