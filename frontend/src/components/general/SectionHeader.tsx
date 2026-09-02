import { Box, Link, Typography } from '@mui/material';
import { LANDING } from '@/landing/styles/tokens';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: '0.9375rem',
          letterSpacing: '-0.01em',
          color: LANDING.ink,
        }}
      >
        {title}
      </Typography>
      {actionLabel && (
        <Link
          component="button"
          variant="body2"
          onClick={onAction}
          sx={{
            color: LANDING.muted,
            fontWeight: 400,
            fontSize: '0.8125rem',
            '&:hover': { color: LANDING.ember },
          }}
        >
          {actionLabel}
        </Link>
      )}
    </Box>
  );
}
