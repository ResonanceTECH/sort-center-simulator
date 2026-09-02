import { Box, Button, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { LANDING } from '@/landing/styles/tokens';

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
      <Box sx={{ maxWidth: 560 }}>
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
          Проекты
        </Typography>
        <Typography
          sx={{
            fontSize: '0.9375rem',
            color: LANDING.muted,
            lineHeight: 1.5,
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
        sx={{ flexShrink: 0, alignSelf: { sm: 'center' }, minHeight: 44 }}
      >
        Создать проект
      </Button>
    </Box>
  );
}
