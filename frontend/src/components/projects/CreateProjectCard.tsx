import { Box, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import { PROJECTS_PAGE } from '@/constants/projects';
import { OZON } from '@/theme';

interface CreateProjectCardProps {
  onCreate: () => void;
}

export function CreateProjectCard({ onCreate }: CreateProjectCardProps) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onCreate}
      aria-label="Создать проект"
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 300,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        px: 3,
        py: 4,
        cursor: 'pointer',
        borderRadius: '20px',
        border: `2px dashed ${PROJECTS_PAGE.border}`,
        bgcolor: OZON.white,
        textAlign: 'center',
        transition: 'border-color 0.15s, background-color 0.15s',
        '&:hover': {
          borderColor: OZON.blue,
          bgcolor: 'rgba(9, 9, 11, 0.03)',
        },
        '&:focus-visible': {
          outline: `3px solid rgba(9, 9, 11, 0.16)`,
          outlineOffset: 2,
          borderColor: OZON.blue,
        },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '14px',
          bgcolor: 'rgba(9, 9, 11, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: OZON.blue,
        }}
      >
        <Add />
      </Box>
      <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600, color: OZON.darkSpace }}>
        Создать проект
      </Typography>
      <Typography sx={{ fontSize: '0.8125rem', color: PROJECTS_PAGE.textSecondary, maxWidth: 240, lineHeight: 1.5 }}>
        Начните с пустой модели или выберите готовый шаблон
      </Typography>
    </Box>
  );
}
