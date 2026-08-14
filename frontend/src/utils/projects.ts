import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import type { ProjectListItem, ProjectListStatus, ProjectSortOption } from '@/types/projects';

export function formatProjectDate(iso: string): string {
  const date = parseISO(iso);

  if (isToday(date)) {
    return `Сегодня, ${format(date, 'HH:mm')}`;
  }

  if (isYesterday(date)) {
    return `Вчера, ${format(date, 'HH:mm')}`;
  }

  return format(date, 'd MMM, HH:mm', { locale: ru });
}

export function filterAndSortProjects(
  projects: ProjectListItem[],
  query: string,
  status: ProjectListStatus | 'all',
  sort: ProjectSortOption,
): ProjectListItem[] {
  let result = [...projects];

  const q = query.trim().toLowerCase();
  if (q) {
    result = result.filter((p) => p.name.toLowerCase().includes(q));
  }

  if (status !== 'all') {
    result = result.filter((p) => p.status === status);
  } else if (sort === 'archived') {
    result = result.filter((p) => p.status === 'archived');
  } else {
    result = result.filter((p) => p.status !== 'archived');
  }

  switch (sort) {
    case 'oldest':
      result.sort((a, b) => +new Date(a.updatedAt) - +new Date(b.updatedAt));
      break;
    case 'name_asc':
      result.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
      break;
    case 'name_desc':
      result.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
      break;
    case 'archived':
    case 'recent':
    default:
      result.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
      break;
  }

  return result;
}
