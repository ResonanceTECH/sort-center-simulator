import { Box, Button, CircularProgress, Typography } from '@mui/material';
import { ProjectListCard } from '@/components/projects/ProjectListCard';
import { CreateProjectCard } from '@/components/projects/CreateProjectCard';
import { PROJECTS_PAGE } from '@/constants/projects';
import type { ProjectListItem } from '@/types/projects';

interface ProjectsPaginationFooterProps {
  shownCount: number;
  totalCount: number;
  hasMore: boolean;
  loadingMore: boolean;
  onLoadMore: () => void;
}

export function ProjectsPaginationFooter({
  shownCount,
  totalCount,
  hasMore,
  loadingMore,
  onLoadMore,
}: ProjectsPaginationFooterProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.25 }}>
      {hasMore && (
        <Button
          variant="outlined"
          size="medium"
          onClick={onLoadMore}
          disabled={loadingMore}
          sx={{ minWidth: 180 }}
          startIcon={loadingMore ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {loadingMore ? 'Загрузка…' : 'Показать еще'}
        </Button>
      )}
      <Typography sx={{ fontSize: '0.8125rem', color: PROJECTS_PAGE.textMuted }}>
        Показано {shownCount} из {totalCount} проектов
      </Typography>
    </Box>
  );
}

interface ProjectsGridProps {
  projects: ProjectListItem[];
  totalCount: number;
  hasMore: boolean;
  loadingMore: boolean;
  onCreate: () => void;
  onOpen: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onArchive: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onLoadMore: () => void;
}

export function ProjectsGrid({
  projects,
  totalCount,
  hasMore,
  loadingMore,
  onCreate,
  onOpen,
  onRename,
  onArchive,
  onDuplicate,
  onDelete,
  onLoadMore,
}: ProjectsGridProps) {
  return (
    <Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)',
          },
          gap: 2.5,
          mb: 3,
        }}
      >
        {projects.map((project) => (
          <ProjectListCard
            key={project.id}
            project={project}
            onOpen={onOpen}
            onRename={onRename}
            onArchive={onArchive}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
          />
        ))}
        <CreateProjectCard onCreate={onCreate} />
      </Box>

      <ProjectsPaginationFooter
        shownCount={projects.length}
        totalCount={totalCount}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={onLoadMore}
      />
    </Box>
  );
}
