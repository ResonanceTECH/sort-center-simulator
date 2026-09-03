export const FOOTER_CONTENT = {
  contact: {
    title: 'Связаться',
    address: 'SupplyTwin · B2B supply chain platform',
    phone: '+7 (000) 000-00-00',
    email: 'support@supplytwin.local',
  },
  stack: {
    title: 'Стек',
  },
  columns: [
    {
      title: 'Платформа',
      links: [
        { label: 'Цикл', href: '#workflow' },
        { label: 'Экраны', href: '#screens' },
        { label: 'Возможности', href: '#social-proof' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Войти', href: '/login' },
        { label: 'Регистрация', href: '/register' },
      ],
    },
    {
      title: 'Ресурсы',
      links: [
        { label: 'Документация', href: '/docs' },
        { label: 'API (OpenAPI)', href: 'http://localhost:8000/docs' },
        { label: 'Changelog', href: '/changelog' },
        { label: 'UI Kit', href: '/ui-kit' },
        { label: 'Roadmap', href: '/roadmap' },
        { label: 'Войти в демо', href: '/login' },
      ],
    },
  ],
  brandWord: 'SupplyTwin',
} as const;

export const FOOTER_SOCIAL = [
  { id: 'linkedin', label: 'LinkedIn', href: '#' },
  { id: 'github', label: 'GitHub', href: '#' },
  { id: 'telegram', label: 'Telegram', href: '#' },
] as const;
