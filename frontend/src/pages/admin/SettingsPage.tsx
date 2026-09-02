import { COMMON } from '@/constants/platformRu';
import { useAuth } from '@/hooks/useAuth';
import { PageHeader } from '@/components/common/PageHeader';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { ROLE_LABELS } from '@/types/scm/roles';
import { Typography } from '@mui/material';

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <InternalLayout>
      <PageHeader title="Настройки" subtitle="Профиль и организация" />

      <KitCard sx={{ maxWidth: 480 }}>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Профиль</Typography>
        <Typography variant="body2" sx={{ py: 0.75 }}><strong>Имя:</strong> {user?.name}</Typography>
        <Typography variant="body2" sx={{ py: 0.75 }}><strong>{COMMON.email}:</strong> {user?.email}</Typography>
        <Typography variant="body2" sx={{ py: 0.75 }}>
          <strong>Роль:</strong> {user?.role ? ROLE_LABELS[user.role] : '—'}
        </Typography>
        <Typography variant="body2" sx={{ py: 0.75 }}>
          <strong>Организация:</strong> {user?.organization ?? user?.team ?? '—'}
        </Typography>
      </KitCard>
    </InternalLayout>
  );
}
