import { Box, Button, Paper, Skeleton, Typography } from '@mui/material';
import { Add, FolderOutlined, Refresh } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { PROJECTS_PAGE } from '@/constants/projects';
import { OZON } from '@/theme';

export function ProjectsSkeleton() {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        },
        gap: 2.5,
      }}
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <Paper
          key={i}
          sx={{
            overflow: 'hidden',
            border: `1px solid ${PROJECTS_PAGE.border}`,
            boxShadow: 'none',
            minHeight: 300,
            bgcolor: OZON.white,
          }}
        >
          <Box sx={{ position: 'relative', aspectRatio: '16 / 7', bgcolor: 'rgba(0, 91, 255, 0.08)' }}>
            <Skeleton
              variant="rectangular"
              animation="wave"
              sx={{ width: '100%', height: '100%', bgcolor: 'rgba(0, 91, 255, 0.10)' }}
            />
            <Skeleton
              variant="circular"
              animation="wave"
              width={28}
              height={28}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                bgcolor: 'rgba(0, 91, 255, 0.14)',
              }}
            />
          </Box>
          <Box sx={{ p: '16px 20px 20px' }}>
            <Skeleton
              variant="rounded"
              animation="wave"
              width="78%"
              height={22}
              sx={{ mb: 1.25, bgcolor: 'rgba(0, 91, 255, 0.10)', borderRadius: '8px' }}
            />
            <Skeleton
              variant="rounded"
              animation="wave"
              width="46%"
              height={16}
              sx={{ mb: 2.25, bgcolor: 'rgba(0, 91, 255, 0.08)', borderRadius: '8px' }}
            />
            <Skeleton
              variant="rounded"
              animation="wave"
              width={104}
              height={26}
              sx={{ bgcolor: 'rgba(0, 91, 255, 0.10)', borderRadius: '999px' }}
            />
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

interface ProjectsEmptyProps {
  onCreate: () => void;
  filtered?: boolean;
}

export function ProjectsEmpty({ onCreate, filtered = false }: ProjectsEmptyProps) {
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: { xs: 280, md: 360 },
      }}
    >
      <Paper
        sx={{
          py: { xs: 5, md: 6 },
          px: { xs: 3, md: 4 },
          textAlign: 'center',
          border: `1px solid ${PROJECTS_PAGE.border}`,
          boxShadow: 'none',
          width: '100%',
          maxWidth: 720,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            fontWeight: 700,
            color: OZON.darkSpace,
            mb: 1.25,
            letterSpacing: '-0.02em',
          }}
        >
          {filtered ? 'Ничего не найдено' : 'Проектов пока нет'}
        </Typography>

        <Typography
          sx={{
            fontSize: '0.9375rem',
            color: PROJECTS_PAGE.textSecondary,
            maxWidth: 420,
            mx: 'auto',
            mb: 3.5,
            lineHeight: 1.6,
          }}
        >
          {filtered
            ? 'Измените поисковый запрос или фильтры, чтобы увидеть проекты'
            : 'Создайте первый проект, чтобы собрать схему сортировочного центра и проверить ее с помощью симуляции'}
        </Typography>

        {!filtered && (
          <Button variant="contained" startIcon={<Add />} onClick={onCreate}>
            Создать проект
          </Button>
        )}
      </Paper>
    </Box>
  );
}

interface ProjectsErrorProps {
  onRetry: () => void;
}

export function ProjectsError({ onRetry }: ProjectsErrorProps) {
  const navigate = useNavigate();

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
      <Typography sx={{ fontSize: '1.0625rem', fontWeight: 700, color: OZON.darkSpace, mb: 0.75 }}>
        Не удалось загрузить проекты
      </Typography>
      <Typography sx={{ fontSize: '0.875rem', color: PROJECTS_PAGE.textSecondary, mb: 2.5 }}>
        Проверьте подключение и повторите попытку
      </Typography>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        <Button variant="contained" startIcon={<Refresh />} onClick={onRetry}>
          Повторить
        </Button>
        <Button
          variant="outlined"
          startIcon={<FolderOutlined />}
          onClick={() => navigate('/projects')}
        >
          Перейти к проектам
        </Button>
      </Box>
    </Paper>
  );
}
