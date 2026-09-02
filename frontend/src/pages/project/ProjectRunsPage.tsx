import { useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Chip,
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
import { PROJECTS_PAGE, RUN_STATUS_CONFIG } from '@/constants/projects';
import { useProjectContext } from '@/context/projectContext';
import { useAsyncData } from '@/hooks/useAsyncData';
import { fetchRuns } from '@/services/projectWorkspaceService';
import { formatProjectDate } from '@/utils/projects';
import { WorkspacePageHeader } from '@/components/project/WorkspacePageHeader';

export function ProjectRunsPage() {
  const { project } = useProjectContext();
  const fetcher = useCallback(() => fetchRuns(project.id), [project.id]);
  const { data: runs, error, loading, retry } = useAsyncData(fetcher);

  if (loading && !runs) {
    return <WorkspaceLoading withShell={false} />;
  }

  if (error) {
    return <WorkspaceError withShell={false} message={error} onRetry={retry} />;
  }

  const items = runs ?? [];

  return (
    <Box>
      <WorkspacePageHeader title="Прогоны" subtitle="История запусков аналитики и имитации" mb={2} />

      {items.length === 0 ? (
        <Typography color="text.secondary">Запусков ещё не было.</Typography>
      ) : (
        <Paper elevation={0} sx={{ border: `1px solid ${PROJECTS_PAGE.border}` }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Название</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Дата</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((run) => {
                const status = RUN_STATUS_CONFIG[run.status] ?? RUN_STATUS_CONFIG.queued;
                return (
                  <TableRow
                    key={run.id}
                    hover
                    component={RouterLink}
                    to={`/projects/${project.id}/runs/${run.id}`}
                    sx={{ textDecoration: 'none', cursor: 'pointer' }}
                  >
                    <TableCell>{run.name}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={status.label}
                        sx={{
                          bgcolor: status.bg,
                          color: status.color,
                          border: `1px solid ${status.border}`,
                        }}
                      />
                    </TableCell>
                    <TableCell>{formatProjectDate(run.createdAt)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
