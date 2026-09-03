import type { DocNavGroup } from '@/docs/types';

/** Full IA — items without slug are planned (visible but not claimable as live). */
export const DOCS_NAV: DocNavGroup[] = [
  {
    id: 'start',
    title: 'Начало работы',
    items: [
      { title: 'Введение', slug: 'getting-started/introduction' },
      { title: 'Обзор платформы', slug: 'getting-started/overview' },
      { title: 'Архитектура', slug: 'getting-started/architecture' },
      { title: 'Quickstart', slug: 'getting-started/quickstart' },
    ],
  },
  {
    id: 'roles',
    title: 'Руководства по ролям',
    items: [
      { title: 'Supply Chain Manager', slug: 'roles/supply-chain-manager' },
      { title: 'Supply Planner', slug: 'roles/supply-planner' },
      { title: 'Logistics Manager', slug: 'roles/logistics-manager' },
      { title: 'Analyst', slug: 'roles/analyst' },
      { title: 'Supplier', slug: 'roles/supplier' },
      { title: 'Carrier', slug: 'roles/carrier' },
      { title: 'Administrator', slug: 'roles/administrator' },
    ],
  },
  {
    id: 'execution',
    title: 'Исполнение',
    items: [
      { title: 'Поставки (Workspace)', slug: 'execution/shipments' },
      { title: 'Отклонения', slug: 'execution/exceptions' },
      { title: 'Инциденты', status: 'planned' },
      { title: 'Tracking / ETA', status: 'planned' },
    ],
  },
  {
    id: 'planning',
    title: 'Планирование',
    items: [
      { title: 'Обзор планирования', slug: 'planning/overview' },
      { title: 'Demand Forecast', status: 'planned' },
      { title: 'Supply Plan', status: 'planned' },
      { title: 'Transportation Plan', status: 'planned' },
    ],
  },
  {
    id: 'scenarios',
    title: 'Сценарии',
    items: [
      { title: 'Обзор сценариев', slug: 'scenarios/overview' },
      { title: 'Builder / Run / Compare', status: 'planned' },
      { title: 'Apply & versioning', status: 'planned' },
    ],
  },
  {
    id: 'portals',
    title: 'Порталы',
    items: [
      { title: 'Supplier Portal', status: 'planned' },
      { title: 'Carrier Portal', status: 'planned' },
    ],
  },
  {
    id: 'developers',
    title: 'Разработчикам',
    items: [
      { title: 'API: начало работы', slug: 'developers/api-getting-started' },
      { title: 'RBAC & scope', status: 'planned' },
      { title: 'Realtime', status: 'planned' },
    ],
  },
  {
    id: 'reference',
    title: 'Справочник',
    items: [
      { title: 'Глоссарий', slug: 'reference/glossary' },
      { title: 'Permissions', status: 'planned' },
      { title: 'State machines', status: 'planned' },
    ],
  },
  {
    id: 'support',
    title: 'Поддержка',
    items: [
      { title: 'FAQ', slug: 'support/faq' },
      { title: 'Известные ограничения', slug: 'support/known-limitations' },
      { title: 'Changelog', slug: 'support/changelog' },
    ],
  },
];
