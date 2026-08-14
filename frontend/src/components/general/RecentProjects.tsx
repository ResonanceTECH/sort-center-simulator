import { Box, Grid, Typography } from '@mui/material';
import { ProjectCard } from '@/components/general/ProjectCard';
import { SectionHeader } from '@/components/general/SectionHeader';
import { useUiStore } from '@/store/uiStore';
import { filterBySearch } from '@/utils/search';
import type { Project } from '@/types/general';

interface RecentProjectsProps {
  projects: Project[];
  searchQuery: string;
}

export function RecentProjects({ projects, searchQuery }: RecentProjectsProps) {
  const { showSnackbar } = useUiStore();
  const filtered = filterBySearch(projects, searchQuery, (project) => project.name);

  return (
    <Box>
      <SectionHeader
        title="Последние проекты"
        actionLabel="Все проекты"
        onAction={() => showSnackbar('Переход к проектам...', 'info')}
      />
      {filtered.length === 0 ? (
        <Typography variant="body2" color="text.secondary" py={2}>
          Проекты не найдены
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {filtered.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <ProjectCard project={project} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
