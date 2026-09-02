import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Box, Chip, Tab, Tabs, Tooltip, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import {
  buildProjectNavContext,
  filterProjectNavTabs,
  resolveActiveProjectTab,
} from '@/constants/projectNav';
import { PROJECTS_PAGE } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import { OZON } from '@/theme';

export function ProjectNav() {
  const { project, access } = useProjectContext();
  const location = useLocation();

  const navContext = buildProjectNavContext(
    project.id,
    project.defaultScenarioId,
    project.scenarios.map((scenario) => scenario.id),
  );
  const tabs = filterProjectNavTabs(access);
  const activeTab = resolveActiveProjectTab(location.pathname, project.id, tabs);
  const activeIndex = activeTab ? tabs.findIndex((tab) => tab.id === activeTab.id) : false;

  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            component={RouterLink}
            to="/projects"
            variant="body2"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              mb: 1,
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: OZON.blue },
            }}
          >
            <ArrowBack sx={{ fontSize: 16 }} />
            К проектам
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {project.name}
            </Typography>
            <ProjectStatusBadge status={project.status} />
            {access && (
              <Chip
                label={access.roleLabel}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          borderBottom: `1px solid ${PROJECTS_PAGE.border}`,
          overflowX: 'auto',
        }}
      >
        <Tabs
          value={activeIndex}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ minHeight: 44 }}
        >
          {tabs.map((tab) => {
            const path = tab.getPath(navContext);
            const disabled = Boolean(tab.requiresScenario && !navContext.defaultScenarioId);
            const tabNode = (
              <Tab
                key={tab.id}
                component={disabled ? 'div' : RouterLink}
                to={disabled ? undefined : path}
                label={tab.label}
                value={tabs.findIndex((item) => item.id === tab.id)}
                disabled={disabled}
                aria-current={activeTab?.id === tab.id ? 'page' : undefined}
                sx={{ minHeight: 44, textTransform: 'none', fontWeight: 600 }}
              />
            );

            if (!disabled) return tabNode;

            return (
              <Tooltip key={tab.id} title="Создайте сценарий, чтобы открыть раздел">
                <span>{tabNode}</span>
              </Tooltip>
            );
          })}
        </Tabs>
      </Box>
    </Box>
  );
}
