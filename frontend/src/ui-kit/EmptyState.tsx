import type { ReactNode } from 'react';
import { Box, Typography } from '@mui/material';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export interface KitEmptyStateProps {
  title: string;
  description?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export function KitEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: KitEmptyStateProps) {
  return (
    <KitCard
      variant="panel"
      padding="lg"
      sx={{ textAlign: 'center', maxWidth: 560, mx: 'auto', width: '100%' }}
    >
      {icon != null && (
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: kit.radius.button,
            bgcolor: kit.color.paper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2.5,
            color: kit.color.ink,
          }}
        >
          {icon}
        </Box>
      )}
      <Typography
        sx={{
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: kit.color.ink,
          mb: 1.25,
        }}
      >
        {title}
      </Typography>
      {description != null && (
        <Typography
          sx={{
            fontSize: '0.9375rem',
            color: kit.color.muted,
            maxWidth: 420,
            mx: 'auto',
            mb: actionLabel ? 3.5 : 0,
            lineHeight: 1.5,
          }}
        >
          {description}
        </Typography>
      )}
      {actionLabel && onAction && (
        <KitButton variant="primary" onClick={onAction}>
          {actionLabel}
        </KitButton>
      )}
    </KitCard>
  );
}
