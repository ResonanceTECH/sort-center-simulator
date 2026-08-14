import { DASHBOARD_MOCK_DATA } from '@/mocks/dashboardData';
import { delay } from '@/utils/error';
import { filterBySearch } from '@/utils/search';
import type { DashboardData } from '@/types/general';

const DELAY_MS = 600;
const ERROR_CHANCE = 0.02;

export async function fetchDashboardData(): Promise<DashboardData> {
  await delay(DELAY_MS);

  if (Math.random() < ERROR_CHANCE) {
    throw new Error('Не удалось загрузить данные. Попробуйте обновить страницу.');
  }

  return DASHBOARD_MOCK_DATA;
}

export async function searchItems(query: string): Promise<{ projects: string[] }> {
  await delay(300);

  const projects = filterBySearch(
    DASHBOARD_MOCK_DATA.projects,
    query,
    (project) => project.name,
  ).map((project) => project.name);

  return { projects };
}
