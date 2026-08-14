import { Box, Button, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { OZON } from '@/theme';
import { PROJECTS_PAGE } from '@/constants/projects';

interface ProjectsHeaderProps {
  onCreate: () => void;
}

export function ProjectsHeader({ onCreate }: ProjectsHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: { xs: 'stretch', sm: 'flex-start' },
        justifyContent: 'space-between',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 2,
        mb: 3,
      }}
    >
      <Box sx={{ maxWidth: 640 }}>
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
          Проекты
        </Typography>
        <Typography
          sx={{
            fontSize: '0.9375rem',
            color: PROJECTS_PAGE.textSecondary,
            lineHeight: 1.55,
            whiteSpace: 'pre-line',
          }}
        >
          {'Создавайте модели сортировочных центров, запускайте симуляции\nи сравнивайте сценарии'}
        </Typography>
      </Box>

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={onCreate}
        sx={{ flexShrink: 0, alignSelf: { sm: 'center' } }}
      >
        Создать проект
      </Button>
    </Box>
  );
}
