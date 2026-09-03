import { landingForRole } from '@/workspace/workspaceResolver';

export type AppRole =
  | 'ADMIN'
  | 'SUPPLY_CHAIN_MANAGER'
  | 'SUPPLY_PLANNER'
  | 'LOGISTICS_MANAGER'
  | 'ANALYST'
  | 'SUPPLIER'
  | 'CARRIER';

/** Four product workspaces — not one shared shell with hidden buttons. */
export type AppShell = 'admin' | 'internal' | 'supplier' | 'carrier';

export const INTERNAL_ROLES: AppRole[] = [
  'SUPPLY_CHAIN_MANAGER',
  'SUPPLY_PLANNER',
  'LOGISTICS_MANAGER',
  'ANALYST',
];

export const ADMIN_ROLES: AppRole[] = ['ADMIN'];

export function getAppShell(role: AppRole): AppShell {
  if (role === 'ADMIN') return 'admin';
  if (role === 'SUPPLIER') return 'supplier';
  if (role === 'CARRIER') return 'carrier';
  return 'internal';
}

/** JTBD landing page per role (TZ §10). */
export function getDefaultRoute(role: AppRole): string {
  return landingForRole(role);
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
