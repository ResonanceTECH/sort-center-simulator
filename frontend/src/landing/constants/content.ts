export const STATS = [
  { value: '3', label: 'уровня\nуправления' },
  { value: '7', label: 'шагов\nцикла решений' },
  { value: '1', label: 'единое окно\nцепочки' },
] as const;

export const BOTTOM_NAV = [
  { id: 'hero', label: 'Главная', href: '#hero' },
  { id: 'workflow', label: 'Цикл', href: '#workflow' },
  { id: 'screens', label: 'Экраны', href: '#screens' },
] as const;

export const BOTTOM_NAV_CTA = {
  label: 'Попробовать',
  href: '/register',
} as const;

export const DARK_FEATURES = {
  title: 'Три уровня — один контур управления',
  items: [
    'Strategic — Supply Network, поставщики, resilience и what-if сети',
    'Tactical — прогноз спроса, supply, inventory и transport planning',
    'Operational — Control Tower, shipments, exceptions и incidents',
    'Замкнутый цикл: факт исполнения возвращается в планирование',
  ],
  cta: 'Открыть Control Tower',
} as const;

export const MARQUEE_ITEMS = [
  'Control Tower',
  'Supply Network',
  'Demand Forecast',
  'Exceptions',
  'Predictive ETA',
  'What-if',
  'Impact Analysis',
  'Replan',
] as const;

export const SOCIAL_PROOF = {
  title: 'Почему выбирают SupplyTwin',
  features: ['Control Tower', 'Scenarios', 'ETA', 'Exceptions', 'Network'],
} as const;

export const HERO = {
  id: 'hero',
  brandName: 'SupplyTwin',
  headlineLine1: 'Цифровой двойник',
  headlineLine2: 'цепочки поставок.',
  subtitle:
    'Стратегия, планирование и операционный контроль в одном пространстве. Видите риск до срыва SLA — проверяйте решения через what-if сценарии.',
  ctaPrimary: 'Начать',
  ctaSecondary: 'Войти',
} as const;

export const PRODUCT = {
  id: 'product',
  pitch: {
    title: 'Что это',
    body: 'SupplyTwin объединяет данные из ERP, TMS, WMS и Excel в единую модель цепочки поставок. Платформа не заканчивается на точке на карте — связывает событие с бизнес-влиянием и вариантами решения.',
    audience: 'Для SCM managers, логистов, planners, закупок и руководителей транспортной логистики.',
  },
  capabilities: [
    {
      id: 'control-tower',
      title: 'Control Tower',
      text: 'Live map, predictive ETA и очередь исключений — что происходит с цепочкой прямо сейчас.',
      tags: ['OTIF', 'ETA', 'Exceptions'],
      image: '/images/project-plan-1.svg',
    },
    {
      id: 'planning',
      title: 'Planning',
      text: 'Demand forecast преобразуется в supply, inventory и transport plan с контролем мощностей.',
      tags: ['Demand', 'Supply', 'Inventory'],
      lottie: '/landing/lottie/workflow.json',
    },
    {
      id: 'impact',
      title: 'Impact Analysis',
      text: 'Задержка поставки → SKU → запасы → stockout risk → затронутые заказы клиентов.',
      tags: ['SKU', 'Stockout', 'SLA'],
      lottie: '/landing/lottie/analytics.json',
    },
    {
      id: 'scenarios',
      title: 'Scenario Engine',
      text: 'What-if моделирование: сравнение сценариев по OTIF, cost и stockout risk с рекомендацией.',
      tags: ['What-if', 'Compare', 'Decision'],
      image: '/images/project-plan-4.svg',
    },
  ],
} as const;

export const SCREENS = {
  id: 'screens',
  title: 'Экраны платформы',
  subtitle: 'Control Tower, планирование, поставки и сценарии — в единой навигации.',
  items: [
    { title: 'Control Tower', image: '/images/project-thumb-1.svg' },
    { title: 'Supply Network', image: '/images/project-plan-1.svg' },
    { title: 'Demand & Supply Plan', image: '/images/project-plan-2.svg' },
    { title: 'Inventory Plan', image: '/images/project-plan-3.svg' },
    { title: 'Shipments', image: '/images/project-thumb-2.svg' },
    { title: 'Exceptions', image: '/images/project-plan-4.svg' },
    { title: 'Scenario Engine', image: '/images/project-thumb-3.svg' },
    { title: 'Analytics', image: '/images/project-plan-5.svg' },
  ],
} as const;

export const FLOW = {
  id: 'flow',
  title: 'Как работает',
  subtitle: 'От мониторинга сети до управленческого решения — в одном цикле.',
  steps: [
    { title: 'Monitor', text: 'Единая картина сети и поставок', image: '/images/project-plan-1.svg' },
    { title: 'Predict', text: 'Прогноз спроса, ETA и отклонений', image: '/images/project-plan-2.svg' },
    { title: 'Detect', text: 'Очередь исключений и SLA-риски', image: '/images/project-plan-3.svg' },
    { title: 'Decide', text: 'Сценарии, сравнение KPI и replan', image: '/images/project-plan-4.svg' },
  ],
} as const;

export const CTA = {
  id: 'cta',
  title: 'Увидьте риск до того, как он станет инцидентом',
  subtitle: 'Демо-данные уже в системе — Control Tower за пару минут.',
  primary: 'Начать',
  secondary: 'Демо-вход',
} as const;
