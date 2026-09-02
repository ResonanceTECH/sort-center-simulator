import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import { Box, Chip, Tab, Tabs, Typography } from '@mui/material';
import { useProjectContext } from '@/context/projectContext';
import { PROJECTS_PAGE } from '@/constants/projects';
import { can } from '@/constants/permissions';
import { LANDING } from '@/landing/styles/tokens';

interface ScenarioSubTab {
  label: string;
  path: string;
  isActive: (pathname: string) => boolean;
  visible: boolean;
}

export function ScenarioSubNav() {
  const { project, access } = useProjectContext();
  const { projectId, scenarioId } = useParams<{ projectId: string; scenarioId: string }>();
  const location = useLocation();

  if (!projectId || !scenarioId) return null;

  const base = `/projects/${projectId}/scenarios/${scenarioId}`;
  const scenario = project.scenarios.find((item) => item.id === scenarioId);

  const subTabs: ScenarioSubTab[] = [
    {
      label: 'Редактор',
      path: `${base}/editor`,
      isActive: (pathname: string) => /\/editor\/?$/.test(pathname),
      visible: can(access, 'model', 'read'),
    },
    {
      label: 'Параметры',
      path: `${base}/parameters`,
      isActive: (pathname: string) => /\/parameters\/?$/.test(pathname),
      visible:
        can(access, 'equipment_params', 'read') || can(access, 'flow_params', 'read'),
    },
  ].filter((tab) => tab.visible);

  if (subTabs.length === 0) return null;

  const activeIndex = Math.max(
    0,
    subTabs.findIndex((tab) => tab.isActive(location.pathname)),
  );

  return (
    <Box
      sx={{
        mb: 3,
        p: 2.5,
        borderRadius: LANDING.radiusCard,
        border: `1px solid ${PROJECTS_PAGE.border}`,
        bgcolor: LANDING.snow,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 1,
          mb: 1.5,
        }}
      >
        <Typography variant="subtitle2" sx={{ color: LANDING.muted }}>
          Сценарий
        </Typography>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '1rem',
            letterSpacing: '-0.02em',
            color: LANDING.ink,
          }}
        >
          {scenario?.name ?? scenarioId}
        </Typography>
        {scenario?.isDefault && (
          <Chip label="По умолчанию" size="small" variant="outlined" sx={{ fontWeight: 500 }} />
        )}
      </Box>
      <Tabs
        value={activeIndex}
        sx={{
          minHeight: 40,
          borderBottom: `1px solid ${PROJECTS_PAGE.border}`,
        }}
      >
        {subTabs.map((tab, index) => (
          <Tab
            key={tab.path}
            component={RouterLink}
            to={tab.path}
            label={tab.label}
            value={index}
            sx={{ minHeight: 40, textTransform: 'none', fontWeight: 500 }}
          />
        ))}
      </Tabs>
    </Box>
  );
}
