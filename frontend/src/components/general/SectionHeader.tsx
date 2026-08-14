import { Box, Link, Typography } from '@mui/material';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>
        {title}
      </Typography>
      {actionLabel && (
        <Link
          component="button"
          variant="body2"
          onClick={onAction}
          sx={{ color: 'primary.main', fontWeight: 500, fontSize: '0.8125rem' }}
        >
          {actionLabel}
        </Link>
      )}
    </Box>
  );
}
