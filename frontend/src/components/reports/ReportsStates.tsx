import { Box, Button, Paper, Skeleton, Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { PROJECTS_PAGE } from '@/constants/projects';
import { OZON } from '@/theme';

export function ReportsSkeleton() {
  return (
    <Paper
      sx={{
        border: `1px solid ${PROJECTS_PAGE.border}`,
        boxShadow: 'none',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'rgba(9, 9, 11, 0.04)' }}>
        <Skeleton variant="text" width="40%" height={24} />
      </Box>
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={i}
          sx={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.4fr 1.2fr 1fr 0.7fr 1fr 1fr 0.8fr 0.8fr',
            gap: 1,
            px: 2,
            py: 1.5,
            borderTop: `1px solid ${PROJECTS_PAGE.border}`,
          }}
        >
          {Array.from({ length: 9 }).map((__, j) => (
            <Skeleton key={j} variant="text" height={22} />
          ))}
        </Box>
      ))}
    </Paper>
  );
}

interface ReportsEmptyProps {
  filtered?: boolean;
}

export function ReportsEmpty({ filtered = false }: ReportsEmptyProps) {
  return (
    <Paper
      sx={{
        py: { xs: 5, md: 6 },
        px: { xs: 3, md: 4 },
        textAlign: 'center',
        border: `1px solid ${PROJECTS_PAGE.border}`,
        boxShadow: 'none',
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: '1.25rem', md: '1.5rem' },
          fontWeight: 600,
          color: OZON.darkSpace,
          mb: 1.25,
        }}
      >
        {filtered ? 'Ничего не найдено' : 'Отчётов пока нет'}
      </Typography>
      <Typography
        sx={{
          fontSize: '0.9375rem',
          color: PROJECTS_PAGE.textSecondary,
          maxWidth: 420,
          mx: 'auto',
          lineHeight: 1.6,
        }}
      >
        {filtered
          ? 'Измените поисковый запрос или фильтры, чтобы увидеть отчёты'
          : 'Отчёты появятся после запуска симуляций и расчётов статистики'}
      </Typography>
    </Paper>
  );
}

interface ReportsErrorProps {
  onRetry: () => void;
}

export function ReportsError({ onRetry }: ReportsErrorProps) {
  return (
    <Paper
      sx={{
        p: 3,
        border: `1px solid ${PROJECTS_PAGE.errorBorder}`,
        bgcolor: PROJECTS_PAGE.errorBg,
        boxShadow: 'none',
      }}
      role="alert"
    >
      <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600, color: OZON.darkSpace, mb: 0.75 }}>
        Не удалось загрузить отчёты
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', color: PROJECTS_PAGE.textSecondary, mb: 2.5 }}>
        Проверьте подключение и повторите попытку
      </Typography>
      <Button variant="contained" startIcon={<Refresh />} onClick={onRetry}>
        Повторить
      </Button>
    </Paper>
  );
}
