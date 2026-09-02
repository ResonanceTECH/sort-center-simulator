import type { StoredUser } from '@/types/auth';

export const DEMO_USER: StoredUser = {
  id: 'demo-1',
  name: 'Анна Смирнова',
  email: 'demo@sortcenter.ru',
  password: 'demo123',
  team: 'Supply Chain',
  role: 'SUPPLY_CHAIN_MANAGER',
  organization: 'Logus Nova',
};

export const DEMO_USERS: StoredUser[] = [
  DEMO_USER,
  {
    id: 'demo-planner',
    name: 'Иван Петров',
    email: 'planner@scm.ru',
    password: 'demo123',
    role: 'SUPPLY_PLANNER',
    organization: 'Logus Nova',
  },
  {
    id: 'demo-logistics',
    name: 'Мария Козлова',
    email: 'logistics@scm.ru',
    password: 'demo123',
    role: 'LOGISTICS_MANAGER',
    organization: 'Logus Nova',
  },
  {
    id: 'demo-supplier',
    name: 'ООО Поставщик Б',
    email: 'supplier@scm.ru',
    password: 'demo123',
    role: 'SUPPLIER',
    organization: 'Supplier B',
  },
  {
    id: 'demo-carrier',
    name: 'ТК Перевозчик C',
    email: 'carrier@scm.ru',
    password: 'demo123',
    role: 'CARRIER',
    organization: 'Carrier C',
  },
  {
    id: 'demo-admin',
    name: 'Admin User',
    email: 'admin@scm.ru',
    password: 'demo123',
    role: 'ADMIN',
    organization: 'Logus Nova',
  },
  {
    id: 'demo-analyst',
    name: 'Аналитик СЦ',
    email: 'analyst@scm.ru',
    password: 'demo123',
    role: 'ANALYST',
    organization: 'Logus Nova',
  },
];
