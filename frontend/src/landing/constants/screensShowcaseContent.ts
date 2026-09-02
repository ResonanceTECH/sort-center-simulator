import type { SplitShowcaseItem } from '@/components/splitShowcase/splitShowcase.types';
import { SCREENS } from '@/landing/constants/content';

export const SCREENS_SHOWCASE_ITEMS: SplitShowcaseItem[] = [
  {
    id: 'projects',
    number: '01',
    title: 'Проекты',
    description: 'Список проектов, роли команды и быстрый вход в workspace.',
    image: '/images/project-thumb-1.svg',
    tags: ['Workspace', 'RBAC'],
    stats: [
      { label: 'Экранов', value: '8' },
      { label: 'Роли', value: 'RBAC' },
    ],
  },
  {
    id: 'editor',
    number: '02',
    title: 'Редактор layout',
    description: '2D-схема СЦ: зоны, конвейеры, буферы и точки входа в одном редакторе.',
    image: '/images/project-plan-1.svg',
    tags: ['Layout', '2D'],
    stats: [
      { label: 'Объекты', value: 'Drag & drop' },
      { label: 'Слои', value: 'Зоны / линии' },
    ],
  },
  {
    id: 'parameters',
    number: '03',
    title: 'Параметры',
    description: 'Потоки, SKU, правила маршрутизации и режимы работы оборудования.',
    image: '/images/project-plan-2.svg',
    tags: ['SKU', 'Потоки'],
    stats: [
      { label: 'Направления', value: '400' },
      { label: 'Поток', value: '100K/ч' },
    ],
  },
  {
    id: 'simulation',
    number: '04',
    title: 'Симуляция',
    description: 'Запуск расчёта или trace-прогона с визуализацией движения и очередей.',
    image: '/images/project-plan-3.svg',
    tags: ['Trace', 'Simulation'],
    stats: [
      { label: 'Режим', value: 'Trace' },
      { label: 'Прогресс', value: 'Live' },
    ],
  },
  {
    id: 'statistics',
    number: '05',
    title: 'Статистика',
    description: 'Throughput, загрузка зон и KPI по результатам прогона.',
    image: '/images/project-thumb-2.svg',
    tags: ['Metrics', 'Dashboard'],
    stats: [
      { label: 'KPI', value: 'Throughput' },
      { label: 'Формат', value: 'Charts' },
    ],
  },
  {
    id: 'comparison',
    number: '06',
    title: 'Сравнение',
    description: 'Два сценария на одних метриках — выбор лучшего варианта layout.',
    image: '/images/project-plan-4.svg',
    tags: ['A/B', 'Compare'],
    stats: [
      { label: 'Сценарии', value: 'A / B' },
      { label: 'Метрики', value: 'Единые' },
    ],
  },
  {
    id: 'runs',
    number: '07',
    title: 'Прогоны',
    description: 'История расчётов и симуляций с фильтрами и статусами.',
    image: '/images/project-thumb-3.svg',
    tags: ['Runs', 'History'],
    stats: [
      { label: 'Статусы', value: 'Done / Run' },
      { label: 'Trace', value: 'Events' },
    ],
  },
  {
    id: 'visualization',
    number: '08',
    title: 'Визуализация',
    description: '2D/3D представление модели и анимация потоков на схеме.',
    image: '/images/project-plan-5.svg',
    tags: ['2D', 'Visual'],
    stats: [
      { label: 'View', value: '2D / 3D' },
      { label: 'Потоки', value: 'Animated' },
    ],
  },
];

export const SCREENS_SHOWCASE = {
  id: SCREENS.id,
  title: SCREENS.title,
  subtitle: SCREENS.subtitle,
} as const;
