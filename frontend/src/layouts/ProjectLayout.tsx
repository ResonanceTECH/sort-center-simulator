import { Outlet, useParams } from 'react-router-dom';
import {
  ResourceMissing,
  WorkspaceError,
  WorkspaceLoading,
  WorkspaceShell,
} from '@/components/project/WorkspaceStates';
import { ProjectNav } from '@/components/project/ProjectNav';
import { ProjectContext } from '@/context/projectContext';
import { useProjectData } from '@/hooks/useProjectWorkspace';

export function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, access, error, loading, retry } = useProjectData(projectId);

  if (!projectId?.trim()) {
    return (
      <ResourceMissing
        title="Проект не указан"
        description="В адресе отсутствует идентификатор проекта. Выберите проект из списка."
      />
    );
  }

  if (loading && !project) {
    return <WorkspaceLoading />;
  }

  if (error && !project) {
    return <WorkspaceError message={error} onRetry={retry} />;
  }

  if (!project) {
    return (
      <ResourceMissing
        title="Проект не найден"
        description={`Проект с идентификатором «${projectId}» не существует или был удалён.`}
      />
    );
  }

  return (
    <ProjectContext.Provider value={{ project, access, refresh: retry }}>
      <WorkspaceShell notifications={project.notifications}>
        <ProjectNav />
        <Outlet />
      </WorkspaceShell>
    </ProjectContext.Provider>
  );
}
