import { PageHeader } from '@/components/common/PageHeader';
import { InternalLayout } from '@/layouts/InternalLayout';
import { PortalLayout } from '@/layouts/PortalLayout';
import { KitEmptyState } from '@/ui-kit/EmptyState';
import type { AppShell } from '@/types/scm/roles';

interface ScmPlaceholderPageProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; to?: string }[];
  shell?: AppShell;
}

export function ScmPlaceholderPage({
  title,
  subtitle,
  breadcrumbs,
  shell = 'internal',
}: ScmPlaceholderPageProps) {
  const content = (
    <>
      <PageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} />
      <KitEmptyState
        title="Раздел в разработке"
        description="Оболочка и навигация готовы. Данные будут подключены через mock/API."
      />
    </>
  );

  if (shell === 'supplier') {
    return <PortalLayout shell="supplier">{content}</PortalLayout>;
  }
  if (shell === 'carrier') {
    return <PortalLayout shell="carrier">{content}</PortalLayout>;
  }
  return <InternalLayout>{content}</InternalLayout>;
}
