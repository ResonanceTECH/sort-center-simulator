import type { ReactNode } from 'react';
import { KitPageHeader } from '@/ui-kit';

interface WorkspacePageHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  mb?: number;
}

/** Thin wrapper — prefer importing KitPageHeader from @/ui-kit directly. */
export function WorkspacePageHeader(props: WorkspacePageHeaderProps) {
  return <KitPageHeader {...props} />;
}
