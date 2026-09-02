export type AppRole =
  | 'ADMIN'
  | 'SUPPLY_CHAIN_MANAGER'
  | 'SUPPLY_PLANNER'
  | 'LOGISTICS_MANAGER'
  | 'ANALYST'
  | 'SUPPLIER'
  | 'CARRIER';

export type AppShell = 'internal' | 'supplier' | 'carrier';

export const INTERNAL_ROLES: AppRole[] = [
  'ADMIN',
  'SUPPLY_CHAIN_MANAGER',
  'SUPPLY_PLANNER',
  'LOGISTICS_MANAGER',
  'ANALYST',
];

export const PORTAL_ROLES: Record<AppShell, AppRole> = {
  internal: 'SUPPLY_CHAIN_MANAGER',
  supplier: 'SUPPLIER',
  carrier: 'CARRIER',
};

export function getAppShell(role: AppRole): AppShell {
  if (role === 'SUPPLIER') return 'supplier';
  if (role === 'CARRIER') return 'carrier';
  return 'internal';
}

export function getDefaultRoute(role: AppRole): string {
  if (role === 'SUPPLIER') return '/supplier';
  if (role === 'CARRIER') return '/carrier';
  return '/control-tower';
}

export const ROLE_LABELS: Record<AppRole, string> = {
  ADMIN: 'Администратор',
  SUPPLY_CHAIN_MANAGER: 'Менеджер цепочки поставок',
  SUPPLY_PLANNER: 'Планировщик',
  LOGISTICS_MANAGER: 'Логист',
  ANALYST: 'Аналитик',
  SUPPLIER: 'Поставщик',
  CARRIER: 'Перевозчик',
};
