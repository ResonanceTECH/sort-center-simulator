import type { ReactNode } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { TopBar } from '@/components/general/TopBar';
import { useRealtimeEvents } from '@/hooks/scm/useRealtimeEvents';
import { useControlTowerQuery, useNotificationsQuery } from '@/hooks/scm/useScmQueries';
import { usePermissions } from '@/hooks/usePermissions';
import { getAppShell } from '@/types/scm/roles';

interface InternalLayoutProps {
  children: ReactNode;
}

export function InternalLayout({ children }: InternalLayoutProps) {
  const { role } = usePermissions();
  const shell = role ? getAppShell(role) : 'internal';
  const { data: controlTower } = useControlTowerQuery();
  const { data: notifications = [] } = useNotificationsQuery();
  useRealtimeEvents(shell === 'internal');

  return (
    <AppLayout
      shell={shell === 'admin' ? 'admin' : 'internal'}
      topBar={
        <TopBar
          notifications={notifications}
          alertCounts={shell === 'admin' ? undefined : controlTower?.alertCounts}
        />
      }
    >
      {children}
    </AppLayout>
  );
}
