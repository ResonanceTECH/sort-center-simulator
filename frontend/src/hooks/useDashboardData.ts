import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchDashboardData } from '@/services/generalService';

export function useDashboardData() {
  return useAsyncData(fetchDashboardData);
}
