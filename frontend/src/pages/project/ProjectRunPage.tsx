import { Box, Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import {
  ResourceMissing,
  WorkspaceError,
  WorkspaceLoading,
} from '@/components/project/WorkspaceStates';
import { useProjectContext } from '@/context/projectContext';
import { useRunData } from '@/hooks/useProjectWorkspace';

export function ProjectRunPage() {
  const { project } = useProjectContext();
  const { runId } = useParams<{ runId: string }>();
  const { data: run, error, loading, retry } = useRunData(project.id, runId);

  if (!runId?.trim()) {
    return (
      <ResourceMissing
        withShell={false}
        title="Прогон не указан"
        description="В адресе отсутствует идентификатор прогона."
        backTo={`/projects/${project.id}/runs`}
        backLabel="К прогонам"
      />
    );
  }

  if (loading) {
    return <WorkspaceLoading withShell={false} />;
  }

  if (error) {
    return <WorkspaceError withShell={false} message={error} onRetry={retry} />;
  }

  if (!run) {
    return (
      <ResourceMissing
        withShell={false}
        title="Прогон не найден"
        description={`Прогон «${runId}» не найден в проекте «${project.name}».`}
        backTo={`/projects/${project.id}/runs`}
        backLabel="К прогонам"
      />
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        {run.name}
      </Typography>
      <Typography color="text.secondary">
        Статус: {run.status}. Раздел в разработке.
      </Typography>
    </Box>
  );
}
