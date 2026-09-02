import { Box, Typography } from '@mui/material';
import { LANDING } from '@/landing/styles/tokens';

export function WelcomeRow() {
  return (
    <Box sx={{ mb: 3, maxWidth: 560 }}>
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: '1.75rem', md: '2rem' },
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: LANDING.ink,
          lineHeight: 1.2,
          mb: 1,
        }}
      >
        Добро пожаловать
      </Typography>
      <Typography
        sx={{
          fontSize: '0.9375rem',
          color: LANDING.muted,
          lineHeight: 1.5,
        }}
      >
        Проектируйте, моделируйте и сравнивайте сценарии сортировочных центров с точными
        данными и аналитикой.
      </Typography>
    </Box>
  );
}
