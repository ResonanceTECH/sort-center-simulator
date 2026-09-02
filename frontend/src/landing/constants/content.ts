export const STATS = [
  { value: '8', label: 'экранов\nв workspace' },
  { value: 'A/B', label: 'сравнение\nсценариев' },
  { value: '2D', label: 'редактор\nlayout СЦ' },
] as const;

export const BOTTOM_NAV = [
  { id: 'hero', label: 'Главная', href: '#hero' },
  { id: 'workflow', label: 'Процесс', href: '#workflow' },
  { id: 'screens', label: 'Экраны', href: '#screens' },
] as const;

export const BOTTOM_NAV_CTA = {
  label: 'Попробовать',
  href: '/register',
} as const;

export const DARK_FEATURES = {
  title: 'Что решает платформа',
  items: [
    'Layout без Excel и чертежей на коленке',
    'Пропускная способность до запуска на объекте',
    'Сравнение сценариев по одним KPI',
    'Командная работа с RBAC и ролями',
  ],
  cta: 'Создать проект',
} as const;

export const MARQUEE_ITEMS = [
  'Layout',
  'Simulation',
  'Trace',
  'Throughput',
  'A/B Compare',
  'RBAC',
  '2D Editor',
  'Metrics',
] as const;

export const SOCIAL_PROOF = {
  title: 'Почему команды выбирают симулятор',
  features: ['Layout', 'Simulation', 'Trace', 'Throughput', 'Metrics'],
} as const;

export const HERO = {
  id: 'hero',
  brandName: 'Sort Center',
  headlineLine1: 'Цифровая модель',
  headlineLine2: 'сортировочного центра.',
  subtitle:
    'Проектирование layout, расчёт пропускной способности и сравнение сценариев — для инженеров и команд проектирования СЦ.',
  ctaPrimary: 'Создать проект',
  ctaSecondary: 'Войти',
} as const;

export const PRODUCT = {
  id: 'product',
  pitch: {
    title: 'Что это',
    body: 'Sort Center Simulator — цифровая модель сортировочного центра. Собираете схему в редакторе, задаёте потоки и SKU, запускаете расчёт или симуляцию и сравниваете прогоны по одним метрикам.',
    audience: 'Для инженеров layout, аналитиков процессов и команд проектирования СЦ.',
  },
  capabilities: [
    {
      id: 'editor',
      title: '2D-редактор',
      text: 'Зоны, конвейеры, буферы и точки входа — layout в одном проекте.',
      tags: ['Layout', 'Зоны', 'Конвейеры'],
      image: '/images/project-plan-1.svg',
    },
    {
      id: 'simulation',
      title: 'Расчёт и симуляция',
      text: 'Аналитика или имитационный прогон с trace-событиями.',
      tags: ['Trace', 'Physics', 'Events'],
      lottie: '/landing/lottie/workflow.json',
    },
    {
      id: 'analytics',
      title: 'Метрики и узкие места',
      text: 'Throughput, очереди и загрузка зон на dashboard.',
      tags: ['Throughput', 'Queues', 'KPI'],
      lottie: '/landing/lottie/analytics.json',
    },
    {
      id: 'compare',
      title: 'Сравнение сценариев',
      text: 'Два прогона — одни KPI. Выбираете лучший вариант layout или режима.',
      tags: ['A/B', 'Compare', 'Decision'],
      image: '/images/project-plan-4.svg',
    },
  ],
} as const;

export const SCREENS = {
  id: 'screens',
  title: 'Экраны приложения',
  subtitle: 'Проекты, редактор, прогоны и аналитика — в единой навигации.',
  items: [
    { title: 'Проекты', image: '/images/project-thumb-1.svg' },
    { title: 'Редактор layout', image: '/images/project-plan-1.svg' },
    { title: 'Параметры', image: '/images/project-plan-2.svg' },
    { title: 'Симуляция', image: '/images/project-plan-3.svg' },
    { title: 'Статистика', image: '/images/project-thumb-2.svg' },
    { title: 'Сравнение', image: '/images/project-plan-4.svg' },
    { title: 'Прогоны', image: '/images/project-thumb-3.svg' },
    { title: 'Визуализация', image: '/images/project-plan-5.svg' },
  ],
} as const;

export const FLOW = {
  id: 'flow',
  title: 'Как работает',
  subtitle: 'От схемы до решения — в одном рабочем пространстве.',
  steps: [
    { title: 'Схема', text: 'Layout СЦ в 2D-редакторе', image: '/images/project-plan-1.svg' },
    { title: 'Параметры', text: 'Потоки, SKU, правила маршрутизации', image: '/images/project-plan-2.svg' },
    { title: 'Прогон', text: 'Расчёт или симуляция с trace', image: '/images/project-plan-3.svg' },
    { title: 'Решение', text: 'Статистика и сравнение вариантов', image: '/images/project-plan-4.svg' },
  ],
} as const;

export const CTA = {
  id: 'cta',
  title: 'Протестируйте свой сценарий',
  subtitle: 'Демо-данные уже в системе — первый проект за несколько минут.',
  primary: 'Начать',
  secondary: 'Демо-вход',
} as const;
