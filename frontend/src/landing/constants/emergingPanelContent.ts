export const EMERGING_PANEL = {
  id: 'social-proof',
  title: 'Почему выбирают SupplyTwin',
  left: {
    stat: {
      value: '3',
      label: 'уровня управления',
      logos: ['Strategy', 'Planning', 'Execution'],
    },
    landscape: {
      title: 'Supply Network',
      subtitle: 'Цифровая модель всей цепочки',
      image: '/images/project-plan-1.svg',
    },
    banner: 'PLAN → EXECUTE → MONITOR → REPLAN ↺',
  },
  center: {
    eyebrow: 'От постфактум-отчётов',
    name: 'SupplyTwin',
    role: 'Digital Twin supply chain',
    image: '/images/project-plan-3.svg',
    quote: 'Видеть риск заранее, понимать влияние и проверять решение до срыва SLA',
  },
  right: {
    stat: {
      value: '7',
      label: 'ключевых вопросов цепочки',
    },
    skills: {
      value: '6+',
      label: 'модулей платформы',
      tags: [
        { label: 'Control Tower', active: true },
        { label: 'Network', active: false },
        { label: 'Forecast', active: true },
        { label: 'Exceptions', active: true },
        { label: 'Scenarios', active: false },
        { label: 'Impact', active: true },
        { label: 'Incidents', active: false },
        { label: 'Analytics', active: true },
      ],
    },
    pricing: {
      title: 'Единый контур',
      pill: 'Strategy + Execution',
    },
  },
} as const;
