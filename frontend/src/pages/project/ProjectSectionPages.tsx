import { Box, Typography } from '@mui/material';
import { useProjectContext } from '@/context/projectContext';
import { useScenarioContext } from '@/context/scenarioContext';

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
      <Typography variant="h5" fontWeight={700} mb={0.5}>
        {title}
      </Typography>
      <Typography color="text.secondary" mb={2}>
        {subtitle ?? `Проект «${project.name}». Раздел в разработке.`}
      </Typography>
    </Box>
  );
}

export function ScenarioEditorPage() {
  const { scenario } = useScenarioContext();
  return (
    <ProjectSectionPlaceholder
      title="Редактор"
      subtitle={`Сценарий «${scenario.name}». Раздел в разработке.`}
    />
  );
}

export function ScenarioParametersPage() {
  const { scenario } = useScenarioContext();
  return (
    <ProjectSectionPlaceholder
      title="Параметры"
      subtitle={`Сценарий «${scenario.name}». Раздел в разработке.`}
    />
  );
}

export function ProjectRunsPage() {
  return <ProjectSectionPlaceholder title="Прогоны" />;
}

export function ProjectStatisticsPage() {
  return <ProjectSectionPlaceholder title="Статистика" />;
}

export function ProjectVisualizationPage() {
  return <ProjectSectionPlaceholder title="Визуализация" />;
}

export function ProjectComparisonPage() {
  return <ProjectSectionPlaceholder title="Сравнение" />;
}
