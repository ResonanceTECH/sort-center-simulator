import type { ReactNode } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { TopBar } from '@/components/general/TopBar';
import { useRealtimeEvents } from '@/hooks/scm/useRealtimeEvents';
import { useControlTowerQuery, useNotificationsQuery } from '@/hooks/scm/useScmQueries';

interface InternalLayoutProps {
  children: ReactNode;
}

export function InternalLayout({ children }: InternalLayoutProps) {
  const { data: controlTower } = useControlTowerQuery();
  const { data: notifications = [] } = useNotificationsQuery();
  useRealtimeEvents(true);

  return (
    <AppLayout
      shell="internal"
      topBar={
        <TopBar
          notifications={notifications}
          alertCounts={controlTower?.alertCounts}
        />
      }
    >
      {children}
    </AppLayout>
  );
}
