import type { SplitShowcaseItem } from '@/components/splitShowcase/splitShowcase.types';
import { SCREENS } from '@/landing/constants/content';

export const SCREENS_SHOWCASE_ITEMS: SplitShowcaseItem[] = [
  {
    id: 'control-tower',
    number: '01',
    title: 'Control Tower',
    description: 'OTIF, active / at risk / delayed, live map и очередь «Requires attention».',
    image: '/images/project-thumb-1.svg',
    tags: ['OTIF', 'Live Map'],
    stats: [
      { label: 'Active', value: '148' },
      { label: 'At Risk', value: '17' },
    ],
  },
  {
    id: 'supply-network',
    number: '02',
    title: 'Supply Network',
    description: 'Цифровая модель сети: поставщики, склады, РЦ, маршруты и критические узлы.',
    image: '/images/project-plan-1.svg',
    tags: ['Network', 'Resilience'],
    stats: [
      { label: 'Узлы', value: 'Graph' },
      { label: 'Риски', value: 'Scored' },
    ],
  },
  {
    id: 'demand-supply',
    number: '03',
    title: 'Demand & Supply Plan',
    description: 'Forecast demand преобразуется в required supply и allocation по поставщикам.',
    image: '/images/project-plan-2.svg',
    tags: ['Forecast', 'Allocation'],
    stats: [
      { label: 'Forecast', value: '108 700' },
      { label: 'Accuracy', value: '92.1%' },
    ],
  },
  {
    id: 'inventory',
    number: '04',
    title: 'Inventory Plan',
    description: 'Текущие запасы, incoming, safety stock и прогноз stockout risk.',
    image: '/images/project-plan-3.svg',
    tags: ['Inventory', 'Safety Stock'],
    stats: [
      { label: 'On hand', value: '12 480' },
      { label: 'Stockout', value: '18 Sep' },
    ],
  },
  {
    id: 'shipments',
    number: '05',
    title: 'Shipments',
    description: 'Центральная сущность: маршрут, planned vs forecast ETA, deviation и SLA risk.',
    image: '/images/project-thumb-2.svg',
    tags: ['Shipment', 'ETA'],
    stats: [
      { label: 'Deviation', value: '+2h 13m' },
      { label: 'SLA Risk', value: '87%' },
    ],
  },
  {
    id: 'exceptions',
    number: '06',
    title: 'Exceptions',
    description: 'Система сама формирует очередь: CRITICAL, HIGH и DATA ISSUE с business impact.',
    image: '/images/project-plan-4.svg',
    tags: ['Exceptions', 'Impact'],
    stats: [
      { label: 'Critical', value: '5' },
      { label: 'High', value: '8' },
    ],
  },
  {
    id: 'scenarios',
    number: '07',
    title: 'Scenario Engine',
    description: 'What-if по demand, supplier, transport и warehouse — сравнение KPI и рекомендация.',
    image: '/images/project-thumb-3.svg',
    tags: ['What-if', 'Compare'],
    stats: [
      { label: 'Сценарии', value: 'A / B' },
      { label: 'KPI', value: 'Unified' },
    ],
  },
];

export const SCREENS_SHOWCASE = {
  id: SCREENS.id,
  title: SCREENS.title,
  subtitle: SCREENS.subtitle,
} as const;
