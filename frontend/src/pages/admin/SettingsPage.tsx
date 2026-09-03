import { Typography } from '@mui/material';
import { COMMON } from '@/constants/platformRu';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/common/PageHeader';
import { InternalLayout } from '@/layouts/InternalLayout';
import { PortalLayout } from '@/layouts/PortalLayout';
import { KitCard } from '@/ui-kit/Card';
import { ROLE_LABELS, type AppShell } from '@/types/scm/roles';
import { usePermissions } from '@/hooks/usePermissions';

interface SettingsPageProps {
  /** Override shell; default from user workspace. */
  shell?: AppShell;
}

export function SettingsPage({ shell }: SettingsPageProps) {
  const { user } = useAuth();
  const { shell: resolved } = usePermissions();
  const activeShell = shell ?? resolved;

  const content = (
    <>
      <PageHeader title="Настройки" subtitle="Профиль и организация" />
      <KitCard sx={{ maxWidth: 480 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Профиль
        </Typography>
        <Typography variant="body2" sx={{ py: 0.75 }}>
          <strong>Имя:</strong> {user?.name}
        </Typography>
        <Typography variant="body2" sx={{ py: 0.75 }}>
          <strong>{COMMON.email}:</strong> {user?.email}
        </Typography>
        <Typography variant="body2" sx={{ py: 0.75 }}>
          <strong>Роль:</strong> {user?.role ? ROLE_LABELS[user.role] : '—'}
        </Typography>
        <Typography variant="body2" sx={{ py: 0.75 }}>
          <strong>Организация:</strong> {user?.organization ?? user?.team ?? '—'}
        </Typography>
      </KitCard>
    </>
  );

  if (activeShell === 'supplier') {
    return <PortalLayout shell="supplier">{content}</PortalLayout>;
  }
  if (activeShell === 'carrier') {
    return <PortalLayout shell="carrier">{content}</PortalLayout>;
  }
  return <InternalLayout>{content}</InternalLayout>;
}
