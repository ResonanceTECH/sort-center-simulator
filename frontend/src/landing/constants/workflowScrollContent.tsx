import type { HorizontalScrollItem } from '@/components/horizontalScroll/horizontalScroll.types';
import {
  BottlenecksPreview,
  ComparePreview,
  EditorPreview,
  ParametersPreview,
  RecommendationPreview,
  SimulationPreview,
} from '@/landing/sections/workflowScrollPreviews';

export const WORKFLOW_SCROLL = {
  id: 'workflow',
  title: 'От модели к инженерному решению',
  subtitle: 'Шесть шагов — от схемы сортировочного центра до готовой рекомендации по конфигурации.',
} as const;

export const WORKFLOW_SCROLL_ITEMS: HorizontalScrollItem[] = [
  {
    id: 'model',
    number: '01',
    title: 'Соберите модель',
    description: 'Добавляйте оборудование и соединяйте технологические блоки в единую схему.',
    content: <EditorPreview />,
  },
  {
    id: 'parameters',
    number: '02',
    title: 'Настройте параметры',
    description: 'Задайте потоки, направления, ворота и пропускную способность оборудования.',
    content: <ParametersPreview />,
  },
  {
    id: 'simulation',
    number: '03',
    title: 'Запустите симуляцию',
    description: 'Наблюдайте движение товаров, очереди, загрузку оборудования и прогресс прогона.',
    content: <SimulationPreview />,
  },
  {
    id: 'bottlenecks',
    number: '04',
    title: 'Найдите узкие места',
    description: 'Heatmap и загрузка зон показывают, где теряется пропускная способность.',
    content: <BottlenecksPreview />,
  },
  {
    id: 'compare',
    number: '05',
    title: 'Сравните сценарии',
    description: 'Сопоставьте базовый, оптимизированный и новый варианты по одним KPI.',
    content: <ComparePreview />,
  },
  {
    id: 'recommendation',
    number: '06',
    title: 'Получите рекомендацию',
    description: 'Выберите сценарий, который достигает целевой производительности с минимальной очередью.',
    content: <RecommendationPreview />,
  },
];
