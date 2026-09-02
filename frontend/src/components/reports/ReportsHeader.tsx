import { Box, Typography } from '@mui/material';
import { LANDING } from '@/landing/styles/tokens';

export function ReportsHeader() {
  return (
    <Box sx={{ mb: 3, maxWidth: 560 }}>
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: '1.75rem', md: '2rem' },
          fontWeight: 600,
          color: LANDING.ink,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          mb: 1,
        }}
      >
        Отчёты
      </Typography>
      <Typography
        sx={{
          fontSize: '0.9375rem',
          color: LANDING.muted,
          lineHeight: 1.5,
        }}
      >
        Скачивайте результаты симуляций, статистику и сравнения сценариев
      </Typography>
    </Box>
  );
}
