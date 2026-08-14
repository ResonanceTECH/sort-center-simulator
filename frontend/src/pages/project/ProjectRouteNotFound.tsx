import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { useProjectContext } from '@/context/projectContext';

export function ProjectRouteNotFound() {
  const { project } = useProjectContext();

  return (
    <Box sx={{ maxWidth: 480 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Раздел не найден
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        В проекте «{project.name}» нет такого раздела.
      </Typography>
      <Button
        component={RouterLink}
        to={`/projects/${project.id}`}
        variant="contained"
        startIcon={<ArrowBack />}
      >
        К проекту
      </Button>
    </Box>
  );
}
