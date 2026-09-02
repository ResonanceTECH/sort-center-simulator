import { Outlet, useParams } from 'react-router-dom';
import { ScenarioSubNav } from '@/components/project/ScenarioSubNav';
import {
  ResourceMissing,
  WorkspaceError,
  WorkspaceLoading,
} from '@/components/project/WorkspaceStates';
import { useProjectContext } from '@/context/projectContext';
import { ScenarioContext } from '@/context/scenarioContext';
import { useScenarioData } from '@/hooks/useProjectWorkspace';

export function ScenarioLayout() {
  const { project } = useProjectContext();
  const { scenarioId } = useParams<{ scenarioId: string }>();
  const {
    data: scenario,
    error,
    loading,
    retry,
  } = useScenarioData(project.id, scenarioId);

  if (!scenarioId?.trim()) {
    return (
      <ResourceMissing
        withShell={false}
        title="Сценарий не указан"
        description="В адресе отсутствует идентификатор сценария."
        backTo={`/projects/${project.id}`}
        backLabel="К проекту"
      />
    );
  }

  if (loading) {
    return <WorkspaceLoading withShell={false} />;
  }

  if (error) {
    return <WorkspaceError withShell={false} message={error} onRetry={retry} />;
  }

  if (!scenario) {
    return (
      <ResourceMissing
        withShell={false}
        title="Сценарий не найден"
        description={`Сценарий «${scenarioId}» не найден в проекте «${project.name}».`}
        backTo={`/projects/${project.id}`}
        backLabel="К проекту"
      />
    );
  }

  return (
    <ScenarioContext.Provider value={{ scenario }}>
      <ScenarioSubNav />
      <Outlet />
    </ScenarioContext.Provider>
  );
}
