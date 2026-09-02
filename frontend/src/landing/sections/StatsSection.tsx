import { Box, Typography } from '@mui/material';
import { STATS } from '@/landing/constants/content';
import { LANDING } from '@/landing/styles/tokens';

interface StatsSectionProps {
  embedded?: boolean;
}

export function StatsSection({ embedded = false }: StatsSectionProps) {
  return (
    <Box
      sx={{
        mt: embedded ? { xs: 6, md: 8 } : 0,
        pt: embedded ? { xs: 4, md: 6 } : 0,
        borderTop: embedded ? `1px solid ${LANDING.border}` : 'none',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
        gap: { xs: 3, md: 4 },
      }}
    >
      {STATS.map((stat) => (
        <Box key={stat.label} sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 600,
              letterSpacing: '-0.03em',
              lineHeight: 1,
              color: LANDING.ink,
            }}
          >
            {stat.value}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.875rem',
              lineHeight: 1.45,
              fontWeight: 400,
              color: LANDING.muted,
              whiteSpace: 'pre-line',
            }}
          >
            {stat.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
