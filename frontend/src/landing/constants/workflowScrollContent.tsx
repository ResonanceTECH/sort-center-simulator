import type { HorizontalScrollItem } from '@/components/horizontalScroll/horizontalScroll.types';
import {
  AnalyzePreview,
  DecidePreview,
  DetectPreview,
  MonitorPreview,
  PredictPreview,
  ReplanPreview,
  SimulatePreview,
} from '@/landing/sections/workflowScrollPreviews';

export const WORKFLOW_SCROLL = {
  id: 'workflow',
  title: 'От мониторинга — к управленческому решению',
  subtitle: 'Фактические события корректируют прогнозы. Сценарии проверяются до внедрения.',
} as const;

export const WORKFLOW_SCROLL_ITEMS: HorizontalScrollItem[] = [
  {
    id: 'monitor',
    number: '01',
    title: 'Monitor',
    description: 'Единая картина сети: поставщики, склады, перевозчики и активные поставки.',
    content: <MonitorPreview />,
  },
  {
    id: 'predict',
    number: '02',
    title: 'Predict',
    description: 'Прогноз спроса, ETA и будущих отклонений на основе истории и фактических событий.',
    content: <PredictPreview />,
  },
  {
    id: 'detect',
    number: '03',
    title: 'Detect',
    description: 'Очередь исключений: AT RISK, CRITICAL и вероятность нарушения SLA.',
    content: <DetectPreview />,
  },
  {
    id: 'analyze',
    number: '04',
    title: 'Analyze',
    description: 'Причина отклонения и бизнес-влияние: SKU, запасы, заказы клиентов.',
    content: <AnalyzePreview />,
  },
  {
    id: 'simulate',
    number: '05',
    title: 'Simulate',
    description: 'What-if: поставщик −40%, маршрут закрыт, demand +25% — до реального внедрения.',
    content: <SimulatePreview />,
  },
  {
    id: 'decide',
    number: '06',
    title: 'Decide',
    description: 'Сравнение сценариев по OTIF, logistics cost, lead time и stockout risk.',
    content: <DecidePreview />,
  },
  {
    id: 'replan',
    number: '07',
    title: 'Replan',
    description: 'Корректировка allocation, маршрутов и планов — факт возвращается в тактику и стратегию.',
    content: <ReplanPreview />,
  },
];
