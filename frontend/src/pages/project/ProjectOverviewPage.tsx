import { useState, type ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  AccessTime,
  AccountTreeOutlined,
  CompareArrowsOutlined,
  FlagOutlined,
  OpenInNew,
  PlayArrowOutlined,
  SettingsOutlined,
  TimelineOutlined,
} from '@mui/icons-material';
import { PermissionGate } from '@/components/project/PermissionGate';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { PROJECTS_PAGE, RUN_STATUS_CONFIG } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import { startProjectCalculation } from '@/services/projectWorkspaceService';
import { useUiStore } from '@/store/uiStore';
import { OZON } from '@/theme';
import { formatProjectDate } from '@/utils/projects';
import { getErrorMessage } from '@/utils/error';
import type { RunSummary, ScenarioSummary } from '@/types/projectWorkspace';

function RunStatusChip({ status }: { status: RunSummary['status'] }) {
  const config = RUN_STATUS_CONFIG[status];
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1,
        py: 0.25,
        borderRadius: '12px',
        bgcolor: config.bg,
        border: `1px solid ${config.border}`,
        color: config.color,
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
        whiteSpace: 'nowrap',
      }}
    >
      {config.label}
    </Box>
  );
}

function MetaRow({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
      <Box sx={{ display: 'flex', color: PROJECTS_PAGE.textMuted }}>{icon}</Box>
      <Typography sx={{ fontSize: '0.875rem', color: PROJECTS_PAGE.textSecondary }}>
        {children}
      </Typography>
    </Box>
  );
}

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        border: `1px solid ${PROJECTS_PAGE.border}`,
        bgcolor: OZON.white,
        height: '100%',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 2,
        }}
      >
        <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: OZON.darkSpace }}>
          {title}
        </Typography>
        {action}
      </Box>
      {children}
    </Paper>
  );
}

function ScenarioRow({
  projectId,
  scenario,
}: {
  projectId: string;
  scenario: ScenarioSummary;
}) {
  return (
    <Box
      component={RouterLink}
      to={`/projects/${projectId}/scenarios/${scenario.id}/editor`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: 1.5,
        py: 1.25,
        borderRadius: '14px',
        textDecoration: 'none',
        color: 'inherit',
        border: `1px solid transparent`,
        transition: 'background-color 0.15s, border-color 0.15s',
        '&:hover': {
          bgcolor: 'rgba(9, 9, 11, 0.03)',
          borderColor: 'rgba(9, 9, 11, 0.16)',
        },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Typography
            sx={{
              fontSize: '0.9375rem',
              fontWeight: 600,
              color: OZON.darkSpace,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {scenario.name}
          </Typography>
          {scenario.isDefault && (
            <Typography
              component="span"
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 600,
                color: OZON.blue,
                bgcolor: 'rgba(9, 9, 11, 0.06)',
                px: 0.75,
                py: 0.15,
                borderRadius: '12px',
                flexShrink: 0,
              }}
            >
              базовый
            </Typography>
          )}
        </Box>
        <Typography sx={{ fontSize: '0.8125rem', color: PROJECTS_PAGE.textMuted }}>
          Изменён {formatProjectDate(scenario.updatedAt)}
        </Typography>
      </Box>
      <OpenInNew sx={{ fontSize: 18, color: PROJECTS_PAGE.textMuted, flexShrink: 0 }} />
    </Box>
  );
}

export function ProjectOverviewPage() {
  const { project, access, refresh } = useProjectContext();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const [starting, setStarting] = useState(false);

  const baseScenario =
    project.scenarios.find((s) => s.id === project.defaultScenarioId) ??
    project.scenarios.find((s) => s.isDefault) ??
    project.scenarios[0];
  const lastRun = project.lastRun;
  const scenarioId = baseScenario?.id;

  const handleStartCalculation = async () => {
    if (starting) return;
    setStarting(true);
    try {
      await startProjectCalculation(project.id);
      showSnackbar('Расчёт поставлен в очередь', 'success');
      refresh();
    } catch (error) {
      showSnackbar(getErrorMessage(error, 'Не удалось запустить расчёт'), 'error');
    } finally {
      setStarting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 960 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 1,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontSize: '0.8125rem',
              fontWeight: 500,
              color: PROJECTS_PAGE.textMuted,
              mb: 1,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Обзор
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={2} alignItems="center">
            <ProjectStatusBadge status={project.status} />
            {access && (
              <Chip size="small" label={access.roleLabel} variant="outlined" />
            )}
            <MetaRow icon={<AccessTime sx={{ fontSize: 16 }} />}>
              Изменён {formatProjectDate(project.updatedAt)}
            </MetaRow>
          </Stack>
        </Box>
      </Box>

      <Typography
        variant="body1"
        sx={{
          color: PROJECTS_PAGE.textSecondary,
          mb: 3,
          mt: 2,
          maxWidth: 640,
          lineHeight: 1.55,
        }}
      >
        {project.description?.trim() || 'Описание проекта не задано'}
      </Typography>

      <Stack direction="row" flexWrap="wrap" gap={1.25} sx={{ mb: 3.5 }}>
        {scenarioId && (
          <>
            <PermissionGate resource="model" action="read">
              <Button
                component={RouterLink}
                to={`/projects/${project.id}/scenarios/${scenarioId}/editor`}
                variant="contained"
                startIcon={<OpenInNew />}
              >
                Открыть редактор
              </Button>
            </PermissionGate>
            <PermissionGate resource="equipment_params" action="update">
              <Button
                component={RouterLink}
                to={`/projects/${project.id}/scenarios/${scenarioId}/parameters`}
                variant="outlined"
                startIcon={<SettingsOutlined />}
              >
                Параметры
              </Button>
            </PermissionGate>
          </>
        )}
        <PermissionGate resource="simulation_run" action="create">
          <Button
            variant="outlined"
            startIcon={
              starting ? <CircularProgress size={16} color="inherit" /> : <PlayArrowOutlined />
            }
            disabled={starting || !scenarioId || project.status === 'archived'}
            onClick={() => {
              void handleStartCalculation();
            }}
          >
            Запустить расчёт
          </Button>
        </PermissionGate>
        <Button
          component={RouterLink}
          to={`/projects/${project.id}/runs`}
          variant="outlined"
          startIcon={<TimelineOutlined />}
        >
          Посмотреть запуски
        </Button>
        <Button
          component={RouterLink}
          to={`/projects/${project.id}/comparison`}
          variant="outlined"
          startIcon={<CompareArrowsOutlined />}
        >
          Сравнить сценарии
        </Button>
        <PermissionGate capability="manageMembers">
          <Button
            component={RouterLink}
            to={`/projects/${project.id}/members`}
            variant="outlined"
          >
            Участники
          </Button>
        </PermissionGate>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          mb: 2,
        }}
      >
        <SectionCard title="Базовый сценарий">
          {baseScenario ? (
            <Box>
              <Typography sx={{ fontWeight: 600, color: OZON.darkSpace, mb: 0.5 }}>
                {baseScenario.name}
              </Typography>
              <MetaRow icon={<AccessTime sx={{ fontSize: 16 }} />}>
                Изменён {formatProjectDate(baseScenario.updatedAt)}
              </MetaRow>
              <Button
                component={RouterLink}
                to={`/projects/${project.id}/scenarios/${baseScenario.id}/editor`}
                size="small"
                sx={{ mt: 2 }}
              >
                Открыть
              </Button>
            </Box>
          ) : (
            <Typography sx={{ color: PROJECTS_PAGE.textMuted, fontSize: '0.875rem' }}>
              Базовый сценарий не задан
            </Typography>
          )}
        </SectionCard>

        <SectionCard
          title="Последний запуск"
          action={
            lastRun ? (
              <Button
                component={RouterLink}
                to={`/projects/${project.id}/runs/${lastRun.id}`}
                size="small"
              >
                Открыть
              </Button>
            ) : undefined
          }
        >
          {lastRun ? (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 600, color: OZON.darkSpace }}>
                  {lastRun.name}
                </Typography>
                <RunStatusChip status={lastRun.status} />
              </Box>
              <Stack spacing={0.75}>
                <MetaRow icon={<AccessTime sx={{ fontSize: 16 }} />}>
                  {formatProjectDate(lastRun.createdAt)}
                </MetaRow>
                <MetaRow icon={<FlagOutlined sx={{ fontSize: 16 }} />}>
                  Сценарий{' '}
                  {project.scenarios.find((s) => s.id === lastRun.scenarioId)?.name ??
                    lastRun.scenarioId}
                </MetaRow>
              </Stack>
            </Box>
          ) : (
            <Typography sx={{ color: PROJECTS_PAGE.textMuted, fontSize: '0.875rem' }}>
              Запусков ещё не было. Запустите расчёт, чтобы увидеть результат здесь.
            </Typography>
          )}
        </SectionCard>
      </Box>

      <SectionCard
        title="Сценарии"
        action={
          <MetaRow icon={<AccountTreeOutlined sx={{ fontSize: 16 }} />}>
            {project.scenarios.length}
          </MetaRow>
        }
      >
        {project.scenarios.length === 0 ? (
          <Typography sx={{ color: PROJECTS_PAGE.textMuted, fontSize: '0.875rem' }}>
            В проекте пока нет сценариев
          </Typography>
        ) : (
          <Stack
            divider={
              <Box sx={{ borderBottom: `1px solid ${PROJECTS_PAGE.border}`, mx: 1.5 }} />
            }
          >
            {project.scenarios.map((scenario) => (
              <ScenarioRow key={scenario.id} projectId={project.id} scenario={scenario} />
            ))}
          </Stack>
        )}
      </SectionCard>
    </Box>
  );
}
