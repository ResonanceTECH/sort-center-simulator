import type { ReactNode } from 'react';
import { Box, Skeleton } from '@mui/material';
import { RetryAlert } from '@/components/shared/RetryAlert';
import { KitEmptyState } from '@/ui-kit/EmptyState';

interface EntityStatesProps {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  skeleton?: ReactNode;
  children: ReactNode;
}

export function EntityStates({
  loading,
  error,
  empty,
  onRetry,
  emptyTitle = 'Нет данных',
  emptyDescription,
  emptyActionLabel,
  onEmptyAction,
  skeleton,
  children,
}: EntityStatesProps) {
  if (loading) {
    return (
      skeleton ?? (
        <Box>
          <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
          <Skeleton variant="rounded" height={320} />
        </Box>
      )
    );
  }

  if (error) {
    return <RetryAlert message={error} onRetry={onRetry ?? (() => undefined)} />;
  }

  if (empty) {
    return (
      <KitEmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        onAction={onEmptyAction}
      />
    );
  }

  return <>{children}</>;
}
