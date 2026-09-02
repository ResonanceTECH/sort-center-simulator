import type { ReactNode } from 'react';
import { AppLayout } from '@/layouts/AppLayout';
import { TopBar } from '@/components/general/TopBar';

interface PortalLayoutProps {
  children: ReactNode;
  shell: 'supplier' | 'carrier';
}

export function PortalLayout({ children, shell }: PortalLayoutProps) {
  return (
    <AppLayout shell={shell} topBar={<TopBar notifications={[]} />}>
      {children}
    </AppLayout>
  );
}
