import { useDeferredValue, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { AppLayout } from '@/layouts/AppLayout';
import { CreateProjectDialog } from '@/components/projects/CreateProjectDialog';import { ProjectsContent } from '@/components/projects/ProjectsContent';
import {
  ProjectsError,
  ProjectsSkeleton,
} from '@/components/projects/ProjectsStates';
import { ProjectsHeader } from '@/components/projects/ProjectsHeader';
import { TopBar } from '@/components/general/TopBar';
import { useProjectsData } from '@/hooks/useProjectsData';
import { useUiStore } from '@/store/uiStore';
import {
  archiveProject,
  createProject,
  deleteProject,
  duplicateProject,
  renameProject,
} from '@/services/projectsService';
import { getErrorMessage } from '@/utils/error';
import type {
  CreateProjectPayload,
  ProjectListStatus,
  ProjectSortOption,
  ProjectViewMode,
} from '@/types/projects';

export function Projects() {
  const navigate = useNavigate();
  const { searchQuery, showSnackbar } = useUiStore();
  const deferredSearch = useDeferredValue(searchQuery);

  const [status, setStatus] = useState<ProjectListStatus | 'all'>('all');
  const [sort, setSort] = useState<ProjectSortOption>('recent');
  const [view, setView] = useState<ProjectViewMode>('cards');
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const {
    projects,
    totalCount,
    hasMore,
    notifications,
    error,
    loading,
    loadingMore,
    retry,
    loadMore,
    refresh,
  } = useProjectsData({
    search: deferredSearch,
    status,
    sort,
  });

  useEffect(() => {
    if (error && projects.length > 0) {
      showSnackbar(error, 'error');
    }
  }, [error, projects.length, showSnackbar]);

  const handleOpenCreate = () => {
    setCreateError(null);
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    if (createLoading) return;
    setCreateOpen(false);
    setCreateError(null);
  };

  const handleCreateSubmit = async (payload: CreateProjectPayload) => {
    setCreateLoading(true);
    setCreateError(null);

    try {
      const project = await createProject(payload);
      setCreateOpen(false);
      await refresh();
      showSnackbar('Проект создан', 'success');
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setCreateError(getErrorMessage(err, 'Не удалось создать проект'));
    } finally {
      setCreateLoading(false);
    }
  };

  const handleOpen = (id: string) => navigate(`/projects/${id}`);

  const handleRename = async (id: string, name: string) => {
    try {
      await renameProject(id, name);
      await refresh();
      showSnackbar('Проект переименован', 'success');
    } catch (err) {
      showSnackbar(getErrorMessage(err, 'Не удалось переименовать проект'), 'error');
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveProject(id);
      await refresh();
      showSnackbar('Проект перемещён в архив', 'success');
    } catch (err) {
      showSnackbar(getErrorMessage(err, 'Не удалось архивировать проект'), 'error');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateProject(id);
      await refresh();
      showSnackbar('Создана копия проекта', 'success');
    } catch (err) {
      showSnackbar(getErrorMessage(err, 'Не удалось создать копию'), 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      await refresh();
      showSnackbar('Проект удалён', 'success');
    } catch (err) {
      showSnackbar(getErrorMessage(err, 'Не удалось удалить проект'), 'error');
    }
  };

  const hasFilters =
    deferredSearch.trim().length > 0 || status !== 'all' || sort === 'archived';
  const showInitialLoading = loading && projects.length === 0 && !error;
  const showError = Boolean(error) && projects.length === 0 && !loading;

  return (
    <AppLayout topBar={<TopBar notifications={notifications} />}>
      {showInitialLoading && (
        <Box>
          <ProjectsHeader onCreate={handleOpenCreate} />
          <ProjectsSkeleton />
        </Box>
      )}

      {showError && (
        <Box>
          <ProjectsHeader onCreate={handleOpenCreate} />
          <ProjectsError onRetry={retry} />
        </Box>
      )}

      {!showInitialLoading && !showError && (
        <ProjectsContent
          projects={projects}
          totalCount={totalCount}
          hasMore={hasMore}
          loading={loading}
          loadingMore={loadingMore}
          hasFilters={hasFilters}
          status={status}
          sort={sort}
          view={view}
          onStatusChange={setStatus}
          onSortChange={setSort}
          onViewChange={setView}
          onCreate={handleOpenCreate}
          onOpen={handleOpen}
          onRename={handleRename}
          onArchive={handleArchive}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
          onLoadMore={loadMore}
        />
      )}

      <CreateProjectDialog
        open={createOpen}
        loading={createLoading}
        error={createError}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSubmit}
      />
    </AppLayout>
  );
}
