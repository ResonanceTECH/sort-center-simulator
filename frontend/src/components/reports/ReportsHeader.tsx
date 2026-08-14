import { Box, Typography } from '@mui/material';
import { OZON } from '@/theme';
import { PROJECTS_PAGE } from '@/constants/projects';

export function ReportsHeader() {
  return (
    <Box sx={{ mb: 3, maxWidth: 720 }}>
      <Typography
        component="h1"
        sx={{
          fontSize: { xs: '1.5rem', md: '1.75rem' },
          fontWeight: 700,
          color: OZON.darkSpace,
          letterSpacing: '-0.02em',
          mb: 0.75,
        }}
      >
        Отчеты
      </Typography>
      <Typography
        sx={{
          fontSize: '0.9375rem',
          color: PROJECTS_PAGE.textSecondary,
          lineHeight: 1.55,
        }}
      >
        Скачивайте результаты симуляций, статистику и сравнения сценариев
      </Typography>
    </Box>
  );
}
