import { useCallback, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  WorkspaceError,
  WorkspaceLoading,
} from '@/components/project/WorkspaceStates';
import { PROJECTS_PAGE } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  fetchRunComparison,
  fetchRuns,
} from '@/services/projectWorkspaceService';
import type { RunComparisonItem } from '@/types/simulation';
import { formatProjectDate } from '@/utils/projects';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';

const COMPLETED_STATUSES = new Set(['completed', 'completed_with_warnings']);

export function ProjectComparisonPage() {
  const { project } = useProjectContext();
  const runsFetcher = useCallback(() => fetchRuns(project.id), [project.id]);
  const { data: runs, error: runsError, loading: runsLoading, retry } = useAsyncData(runsFetcher);

  const completedRuns = useMemo(
    () => (runs ?? []).filter((run) => COMPLETED_STATUSES.has(run.status)),
    [runs],
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparison, setComparison] = useState<RunComparisonItem[]>([]);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [comparing, setComparing] = useState(false);

  const toggleRun = (runId: string) => {
    setSelectedIds((prev) =>
      prev.includes(runId) ? prev.filter((id) => id !== runId) : [...prev, runId],
    );
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      setCompareError('Выберите минимум 2 прогона');
      return;
    }
    setComparing(true);
    setCompareError(null);
    try {
      const items = await fetchRunComparison(project.id, selectedIds);
      setComparison(items);
    } catch (error: unknown) {
      setComparison([]);
      setCompareError(error instanceof Error ? error.message : 'Не удалось сравнить прогоны');
    } finally {
      setComparing(false);
    }
  };

  if (runsLoading && !runs) {
    return <WorkspaceLoading withShell={false} />;
  }

  if (runsError) {
    return <WorkspaceError withShell={false} message={runsError} onRetry={retry} />;
  }

  return (
    <Box>
      <WorkspacePageHeader
        title="Сравнение прогонов"
        subtitle="Выберите минимум два завершённых прогона"
        mb={2}
      />

      {completedRuns.length < 2 ? (
        <Typography color="text.secondary">
          Нужно минимум 2 завершённых прогона для сравнения.
        </Typography>
      ) : (
        <>
          <Paper elevation={0} sx={{ mb: 2, border: `1px solid ${PROJECTS_PAGE.border}` }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Прогон</TableCell>
                  <TableCell>Дата</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {completedRuns.map((run) => (
                  <TableRow key={run.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.includes(run.id)}
                        onChange={() => toggleRun(run.id)}
                      />
                    </TableCell>
                    <TableCell>{run.name}</TableCell>
                    <TableCell>{formatProjectDate(run.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          <Button variant="contained" onClick={handleCompare} disabled={comparing}>
            {comparing ? 'Сравнение…' : 'Сравнить'}
          </Button>
          {compareError && (
            <Typography color="error.main" mt={1}>
              {compareError}
            </Typography>
          )}

          {comparison.length > 0 && (
            <Paper elevation={0} sx={{ mt: 2, border: `1px solid ${PROJECTS_PAGE.border}` }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Прогон</TableCell>
                    <TableCell>Успешность</TableCell>
                    <TableCell>Обработано</TableCell>
                    <TableCell>B</TableCell>
                    <TableCell>C</TableCell>
                    <TableCell>D</TableCell>
                    <TableCell>Expect</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparison.map((item) => (
                    <TableRow key={item.runId}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>
                        {item.metrics
                          ? `${(item.metrics.success_rate * 100).toFixed(1)}%`
                          : '—'}
                      </TableCell>
                      <TableCell>
                        {item.metrics
                          ? `${item.metrics.processed}/${item.metrics.total_items}`
                          : '—'}
                      </TableCell>
                      <TableCell>{item.metrics?.by_zone.B ?? '—'}</TableCell>
                      <TableCell>{item.metrics?.by_zone.C ?? '—'}</TableCell>
                      <TableCell>{item.metrics?.by_zone.D ?? '—'}</TableCell>
                      <TableCell>
                        {item.expectPassed == null ? '—' : item.expectPassed ? 'OK' : 'FAIL'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
