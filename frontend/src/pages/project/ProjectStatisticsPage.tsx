import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  WorkspaceError,
  WorkspaceLoading,
} from '@/components/project/WorkspaceStates';
import { PROJECTS_PAGE } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  fetchRunMetrics,
  fetchRuns,
} from '@/services/projectWorkspaceService';
import type { RunMetrics } from '@/types/simulation';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';

const COMPLETED_STATUSES = new Set(['completed', 'completed_with_warnings']);

function metricsToChart(metrics: RunMetrics) {
  const zones = metrics.by_zone ?? {};
  return Object.entries(zones).map(([zone, count]) => ({
    zone,
    count,
  }));
}

export function ProjectStatisticsPage() {
  const { project } = useProjectContext();
  const runsFetcher = useCallback(() => fetchRuns(project.id), [project.id]);
  const { data: runs, error: runsError, loading: runsLoading, retry } = useAsyncData(runsFetcher);

  const completedRuns = useMemo(
    () => (runs ?? []).filter((run) => COMPLETED_STATUSES.has(run.status)),
    [runs],
  );

  const [selectedRunId, setSelectedRunId] = useState<string>('');
  const [metrics, setMetrics] = useState<RunMetrics | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  useEffect(() => {
    if (!selectedRunId && completedRuns.length > 0) {
      setSelectedRunId(completedRuns[0].id);
    }
  }, [completedRuns, selectedRunId]);

  useEffect(() => {
    if (!selectedRunId) {
      setMetrics(null);
      return undefined;
    }

    let cancelled = false;
    setMetricsLoading(true);
    setMetricsError(null);

    fetchRunMetrics(project.id, selectedRunId)
      .then((payload) => {
        if (!cancelled) {
          setMetrics(payload.metrics);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMetrics(null);
          setMetricsError(error instanceof Error ? error.message : 'Не удалось загрузить метрики');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setMetricsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [project.id, selectedRunId]);

  if (runsLoading && !runs) {
    return <WorkspaceLoading withShell={false} />;
  }

  if (runsError) {
    return <WorkspaceError withShell={false} message={runsError} onRetry={retry} />;
  }

  const chartData = metrics ? metricsToChart(metrics) : [];

  return (
    <Box>
      <WorkspacePageHeader title="Статистика" subtitle="Метрики завершённых прогонов" mb={2} />

      {completedRuns.length === 0 ? (
        <Typography color="text.secondary">
          Нет завершённых прогонов. Запустите расчёт на вкладке «Прогоны».
        </Typography>
      ) : (
        <Stack spacing={2}>
          <FormControl size="small" sx={{ maxWidth: 420 }}>
            <InputLabel id="stats-run-select">Прогон</InputLabel>
            <Select
              labelId="stats-run-select"
              label="Прогон"
              value={selectedRunId}
              onChange={(event) => setSelectedRunId(event.target.value)}
            >
              {completedRuns.map((run) => (
                <MenuItem key={run.id} value={run.id}>
                  {run.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {metricsLoading && <Typography color="text.secondary">Загрузка метрик…</Typography>}
          {metricsError && <Typography color="error.main">{metricsError}</Typography>}

          {metrics && (
            <>
              <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${PROJECTS_PAGE.border}` }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Успешность
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {(metrics.success_rate * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Обработано
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {metrics.processed} / {metrics.total_items}
                    </Typography>
                  </Box>
                  {metrics.avg_cycle_sec != null && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Средний цикл
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {metrics.avg_cycle_sec.toFixed(2)} с
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>

              <Paper elevation={0} sx={{ p: 2.5, border: `1px solid ${PROJECTS_PAGE.border}` }}>
                <Typography fontWeight={600} mb={2}>
                  Распределение по зонам
                </Typography>
                <Box sx={{ width: '100%', height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="zone" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Кол-во" fill="#09090b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            </>
          )}
        </Stack>
      )}
    </Box>
  );
}
