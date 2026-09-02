import { Box } from '@mui/material';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';
import { useProjectContext } from '@/context/projectContext';

interface ProjectSectionPlaceholderProps {
  title: string;
  subtitle?: string;
}

export function ProjectSectionPlaceholder({
  title,
  subtitle,
}: ProjectSectionPlaceholderProps) {
  const { project } = useProjectContext();

  return (
    <Box>
      <WorkspacePageHeader
        title={title}
        subtitle={subtitle ?? `Проект «${project.name}». Раздел в разработке.`}
        mb={2}
      />
    </Box>
  );
}

export { ScenarioEditorPage } from '@/pages/project/ScenarioEditorPage';
export { ScenarioParametersPage } from '@/pages/project/ScenarioParametersPage';
export { ProjectRunsPage } from '@/pages/project/ProjectRunsPage';
export { ProjectStatisticsPage } from '@/pages/project/ProjectStatisticsPage';
export { ProjectVisualizationPage } from '@/pages/project/ProjectVisualizationPage';
export { ProjectComparisonPage } from '@/pages/project/ProjectComparisonPage';
export { ProjectScenariosPage } from '@/pages/project/ProjectScenariosPage';
export { ProjectSimulationPage } from '@/pages/project/ProjectSimulationPage';
