import { AppLayout } from '@/layouts/AppLayout';
import { AppSnackbar } from '@/components/shared/AppSnackbar';
import { RetryAlert } from '@/components/shared/RetryAlert';
import { GeneralContent } from '@/components/general/GeneralContent';
import { GeneralSkeleton } from '@/components/general/GeneralSkeleton';
import { TopBar } from '@/components/general/TopBar';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useUiStore } from '@/store/uiStore';

export function General() {
  const { data, error, loading, retry } = useDashboardData();
  const { searchQuery } = useUiStore();

  const notifications = data?.notifications ?? [];

  return (
    <AppLayout topBar={<TopBar notifications={notifications} />}>
      {loading && <GeneralSkeleton />}
      {error && !loading && <RetryAlert message={error} onRetry={retry} />}
      {data && !loading && <GeneralContent data={data} searchQuery={searchQuery} />}
      <AppSnackbar />
    </AppLayout>
  );
}
