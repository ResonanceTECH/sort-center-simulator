import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ProjectsGrid, ProjectsPaginationFooter } from '@/components/projects/ProjectsGrid';
import { ProjectsHeader } from '@/components/projects/ProjectsHeader';
import { ProjectsEmpty } from '@/components/projects/ProjectsStates';
import { ProjectsToolbar } from '@/components/projects/ProjectsToolbar';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { PROJECTS_PAGE } from '@/constants/projects';
import { formatProjectDate } from '@/utils/projects';
import type {
  ProjectListItem,
  ProjectListStatus,
  ProjectSortOption,
  ProjectViewMode,
} from '@/types/projects';

interface ProjectsContentProps {
  projects: ProjectListItem[];
  totalCount: number;
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  hasFilters: boolean;
  status: ProjectListStatus | 'all';
  sort: ProjectSortOption;
  view: ProjectViewMode;
  onStatusChange: (value: ProjectListStatus | 'all') => void;
  onSortChange: (value: ProjectSortOption) => void;
  onViewChange: (value: ProjectViewMode) => void;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
}

export function ProjectsContent({
  projects,
  totalCount,
  hasMore,
  loading,
  loadingMore,
  hasFilters,
  status,
  sort,
  view,
  onStatusChange,
  onSortChange,
  onViewChange,
  onCreate,
  onOpen,
  onRename,
  onArchive,
  onDuplicate,
  onDelete,
  onLoadMore,
}: ProjectsContentProps) {
  const pageSx = {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    position: 'relative',
  } as const;

  const isEmptyCatalog = totalCount === 0 && !hasFilters;
  const isEmptyFiltered = totalCount === 0 && hasFilters;

  return (
    <Box sx={pageSx}>
      <ProjectsHeader onCreate={onCreate} />

      {!isEmptyCatalog && (
        <ProjectsToolbar
          status={status}
          sort={sort}
          view={view}
          foundCount={totalCount}
          onStatusChange={onStatusChange}
          onSortChange={onSortChange}
          onViewChange={onViewChange}
        />
      )}

      {loading && projects.length > 0 && (
        <Box
          sx={{
            position: 'absolute',
            top: 72,
            right: 8,
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <CircularProgress size={18} />
        </Box>
      )}

      {isEmptyCatalog || isEmptyFiltered ? (
        <ProjectsEmpty onCreate={onCreate} filtered={isEmptyFiltered} />
      ) : view === 'cards' ? (
        <ProjectsGrid
          projects={projects}
          totalCount={totalCount}
          hasMore={hasMore}
          loadingMore={loadingMore}
          onCreate={onCreate}
          onOpen={onOpen}
          onRename={onRename}
          onArchive={onArchive}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onLoadMore={onLoadMore}
        />
      ) : (
        <Box>
          <TableContainer
            component={Paper}
            sx={{ border: `1px solid ${PROJECTS_PAGE.border}`, boxShadow: 'none', mb: 3 }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Проект</TableCell>
                  <TableCell>Сценарии</TableCell>
                  <TableCell>Последний результат</TableCell>
                  <TableCell>Изменён</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {projects.map((project) => (
                  <TableRow
                    key={project.id}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => onOpen(project.id)}
                  >
                    <TableCell>
                      <Typography fontWeight={600} fontSize="0.875rem">
                        {project.name}
                      </Typography>
                      {project.activeRun && (
                        <Typography sx={{ fontSize: '0.75rem', color: PROJECTS_PAGE.textMuted }}>
                          {project.activeRun.label}: {project.activeRun.progress}%
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{project.scenariosCount}</TableCell>
                    <TableCell>{project.lastResult.label}</TableCell>
                    <TableCell>{formatProjectDate(project.updatedAt)}</TableCell>
                    <TableCell>
                      <ProjectStatusBadge status={project.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <ProjectsPaginationFooter
            shownCount={projects.length}
            totalCount={totalCount}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={onLoadMore}
          />
        </Box>
      )}
    </Box>
  );
}
