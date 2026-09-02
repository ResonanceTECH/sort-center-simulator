export const EMERGING_PANEL = {
  id: 'social-proof',
  title: 'Почему команды выбирают симулятор',
  left: {
    stat: {
      value: '8',
      label: 'экранов в workspace',
      logos: ['Layout', 'Simulation', 'Trace', 'Throughput'],
    },
    landscape: {
      title: '2D редактор layout',
      subtitle: 'Drag & drop схема СЦ',
      image: '/images/project-plan-1.svg',
    },
    banner: 'Сравнение сценариев по одним KPI',
  },
  center: {
    eyebrow: 'Кейс Logus Nova',
    name: 'Sort Center',
    role: 'Цифровая модель СЦ',
    image: '/images/project-plan-3.svg',
    quote: 'Layout, прогоны и throughput — в одном workspace',
  },
  right: {
    stat: {
      value: '100K',
      label: 'тов./ч в модели',
    },
    skills: {
      value: '6+',
      label: 'модулей платформы',
      tags: [
        { label: 'Layout', active: false },
        { label: 'Simulation', active: true },
        { label: 'Trace', active: false },
        { label: 'RBAC', active: false },
        { label: 'Metrics', active: true },
        { label: 'A/B Compare', active: false },
        { label: '2D Editor', active: false },
        { label: 'Throughput', active: true },
      ],
    },
    pricing: {
      title: 'Единая модель',
      pill: 'Trace + Simulation',
    },
  },
} as const;
