import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import { Box, Tab, Tabs } from '@mui/material';
import { useProjectContext } from '@/context/projectContext';
import { PROJECTS_PAGE } from '@/constants/projects';

interface NavTab {
  label: string;
  path: string;
  match: (pathname: string) => boolean;
}

export function ProjectNav() {
  const { project } = useProjectContext();
  const { projectId, scenarioId } = useParams<{ projectId: string; scenarioId?: string }>();
  const location = useLocation();
  const base = `/projects/${projectId}`;
  const defaultScenarioId = project.defaultScenarioId ?? project.scenarios[0]?.id;
  const editorBase = defaultScenarioId
    ? `${base}/scenarios/${defaultScenarioId}`
    : `${base}/scenarios`;

  const tabs: NavTab[] = [
    { label: 'Обзор', path: base, match: (p) => p === base },
    {
      label: 'Модель',
      path: `${editorBase}/editor`,
      match: (p) => p.includes('/scenarios/') && p.includes('/editor'),
    },
    {
      label: 'Параметры',
      path: `${editorBase}/parameters`,
      match: (p) => p.includes('/parameters'),
    },
    { label: 'Сценарии', path: `${base}/scenarios`, match: (p) => p === `${base}/scenarios` },
    { label: 'Расчёт', path: `${base}/simulation`, match: (p) => p.includes('/simulation') },
    { label: 'Прогоны', path: `${base}/runs`, match: (p) => p.includes('/runs') },
    {
      label: 'Визуализация',
      path: `${base}/visualization`,
      match: (p) => p.includes('/visualization'),
    },
    { label: 'Статистика', path: `${base}/statistics`, match: (p) => p.includes('/statistics') },
    { label: 'Сравнение', path: `${base}/comparison`, match: (p) => p.includes('/comparison') },
  ];

  const activeIndex = Math.max(
    0,
    tabs.findIndex((tab) => tab.match(location.pathname)),
  );

  return (
    <Box
      sx={{
        mb: 3,
        borderBottom: `1px solid ${PROJECTS_PAGE.border}`,
        overflowX: 'auto',
      }}
    >
      <Tabs
        value={activeIndex}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ minHeight: 44 }}
      >
        {tabs.map((tab, index) => (
          <Tab
            key={tab.path}
            component={RouterLink}
            to={tab.path}
            label={tab.label}
            value={index}
            sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600 }}
          />
        ))}
      </Tabs>
      {scenarioId && location.pathname.includes('/scenarios/') && (
        <Box sx={{ py: 1, fontSize: '0.8125rem', color: 'text.secondary' }}>
          Сценарий: {project.scenarios.find((s) => s.id === scenarioId)?.name ?? scenarioId}
        </Box>
      )}
    </Box>
  );
}
