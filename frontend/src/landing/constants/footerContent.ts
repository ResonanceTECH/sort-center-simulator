export const FOOTER_CONTENT = {
  contact: {
    title: 'Связаться',
    address: 'Logus Nova · кейс проектирования СЦ',
    phone: '+7 (000) 000-00-00',
    email: 'support@sort-center.local',
  },
  stack: {
    title: 'Стек',
  },
  columns: [
    {
      title: 'Платформа',
      links: [
        { label: 'Процесс', href: '#workflow' },
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
        { label: 'Документация API', href: 'http://localhost:8000/docs' },
        { label: 'Демо-проект', href: '/register' },
        { label: 'GitHub', href: '#' },
        { label: 'Logus Nova', href: '#hero' },
      ],
    },
  ],
  brandWord: 'Sort Center',
} as const;

export const FOOTER_SOCIAL = [
  { id: 'linkedin', label: 'LinkedIn', href: '#' },
  { id: 'github', label: 'GitHub', href: '#' },
  { id: 'telegram', label: 'Telegram', href: '#' },
] as const;
