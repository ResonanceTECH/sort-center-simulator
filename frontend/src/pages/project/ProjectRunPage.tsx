import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  ResourceMissing,
  WorkspaceError,
  WorkspaceLoading,
} from '@/components/project/WorkspaceStates';
import { RUN_STATUS_CONFIG } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import { useRunData } from '@/hooks/useProjectWorkspace';
import { PROJECTS_PAGE } from '@/constants/projects';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';

const ACTIVE_STATUSES = new Set(['queued', 'running']);

export function ProjectRunPage() {
  const { project } = useProjectContext();
  const { runId } = useParams<{ runId: string }>();
  const { data: run, error, loading, retry } = useRunData(project.id, runId);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!run || !ACTIVE_STATUSES.has(run.status)) {
      setPolling(false);
      return undefined;
    }
    setPolling(true);
    const timer = window.setInterval(() => {
      void retry();
    }, 2000);
    return () => window.clearInterval(timer);
  }, [run?.status, run?.id, retry]);

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

  if (loading && !run) {
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

  const statusConfig = RUN_STATUS_CONFIG[run.status] ?? RUN_STATUS_CONFIG.queued;
  const metrics = run.result?.metrics;

  return (
    <Box>
      <WorkspacePageHeader title={run.name} mb={1} />
      <Stack direction="row" spacing={1} alignItems="center" mb={2}>
        <Chip
          size="small"
          label={statusConfig.label}
          sx={{
            bgcolor: statusConfig.bg,
            color: statusConfig.color,
            border: `1px solid ${statusConfig.border}`,
          }}
        />
        {polling && (
          <Typography variant="body2" color="text.secondary">
            Обновление…
          </Typography>
        )}
      </Stack>

      {ACTIVE_STATUSES.has(run.status) && (
        <LinearProgress
          variant={run.progress != null ? 'determinate' : 'indeterminate'}
          value={(run.progress ?? 0) * 100}
          sx={{ mb: 3, height: 8, borderRadius: '999px' }}
        />
      )}

      {metrics && (
        <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${PROJECTS_PAGE.border}` }}>
          <Typography fontWeight={600} mb={1.5}>
            Метрики прогона
          </Typography>
          <Stack spacing={0.75}>
            <Typography variant="body2">
              Успешность: {(metrics.success_rate * 100).toFixed(1)}%
            </Typography>
            <Typography variant="body2">
              Обработано: {metrics.processed} / {metrics.total_items}
            </Typography>
            <Typography variant="body2">
              Зона B: {metrics.by_zone.B ?? 0} · C: {metrics.by_zone.C ?? 0} · D:{' '}
              {metrics.by_zone.D ?? 0}
            </Typography>
            {run.result?.expect_passed != null && (
              <Typography
                variant="body2"
                color={run.result.expect_passed ? 'success.main' : 'warning.main'}
              >
                Expect: {run.result.expect_passed ? 'пройден' : 'не пройден'}
              </Typography>
            )}
          </Stack>

          {!ACTIVE_STATUSES.has(run.status) && (
            <Stack direction="row" spacing={1} mt={2} flexWrap="wrap">
              <Button
                component={RouterLink}
                to={`/projects/${project.id}/visualization`}
                size="small"
                variant="outlined"
              >
                Визуализация
              </Button>
              <Button
                component={RouterLink}
                to={`/projects/${project.id}/statistics`}
                size="small"
                variant="outlined"
              >
                Статистика
              </Button>
              <Button
                component={RouterLink}
                to={`/projects/${project.id}/comparison`}
                size="small"
                variant="outlined"
              >
                Сравнение
              </Button>
            </Stack>
          )}
        </Paper>
      )}

      {!metrics && !ACTIVE_STATUSES.has(run.status) && (
        <Typography color="text.secondary">
          {run.errorMessage ?? 'Метрики недоступны.'}
        </Typography>
      )}
    </Box>
  );
}
