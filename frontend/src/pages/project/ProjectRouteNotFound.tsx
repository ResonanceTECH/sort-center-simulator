import { Box, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { useProjectContext } from '@/context/projectContext';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';

export function ProjectRouteNotFound() {
  const { project } = useProjectContext();

  return (
    <Box sx={{ maxWidth: 480 }}>
      <WorkspacePageHeader
        title="Раздел не найден"
        subtitle={`В проекте «${project.name}» нет такого раздела.`}
        mb={2.5}
      />
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
