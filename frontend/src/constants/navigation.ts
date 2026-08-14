import type { NavItem } from '@/types/general';

export const NAV_ITEMS: NavItem[] = [
  { id: 'projects', label: 'Проекты', path: '/projects', icon: 'FolderOutlined' },
  { id: 'templates', label: 'Шаблоны', path: '/templates', icon: 'DescriptionOutlined' },
  { id: 'reports', label: 'Отчеты', path: '/reports', icon: 'ArticleOutlined' },
];

export const NAV_BOTTOM_ITEMS: NavItem[] = [
  { id: 'docs', label: 'Документация', path: '/docs', icon: 'DescriptionOutlined' },
  { id: 'settings', label: 'Настройки', path: '/settings', icon: 'SettingsOutlined' },
];
