import type { DashboardData } from '@/types/general';

export const DASHBOARD_MOCK_DATA: DashboardData = {
  projects: [
    {
      id: 'p1',
      name: 'СЦ Москва Восточный',
      status: 'active',
      throughput: '99 200 тов/ч',
      area: '12 400 м²',
      updatedAt: '2025-05-14T10:30:00',
      thumbnail: '/images/project-thumb-1.svg',
    },
    {
      id: 'p2',
      name: 'СЦ Санкт-Петербург',
      status: 'active',
      throughput: '78 500 тов/ч',
      area: '9 800 м²',
      updatedAt: '2025-05-13T16:45:00',
      thumbnail: '/images/project-thumb-2.svg',
    },
    {
      id: 'p3',
      name: 'СЦ Екатеринбург',
      status: 'draft',
      throughput: '65 000 тов/ч',
      area: '8 200 м²',
      updatedAt: '2025-05-12T09:15:00',
      thumbnail: '/images/project-thumb-3.svg',
    },
  ],
  notifications: [
    { id: 'n1', title: 'Симуляция завершена', message: 'Сценарий «Пик утром» успешно завершён', read: false, createdAt: '2025-05-15T10:20:00' },
    { id: 'n2', title: 'Новое узкое место', message: 'Обнаружено узкое место в зоне сканирования', read: false, createdAt: '2025-05-14T16:00:00' },
    { id: 'n3', title: 'Обновление тарифа', message: 'Ваш тариф действует до 15.06.2025', read: true, createdAt: '2025-05-10T09:00:00' },
  ],
};
