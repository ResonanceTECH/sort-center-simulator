import { apiClient } from '@/api/client';
import { mapCreateProjectResponse } from '@/api/mappers';
import { registerProjectDetail } from '@/mocks/projectWorkspaceData';
import { fetchProjectsListApi } from '@/services/projects/projectsApi';
import type {
  CreateProjectApiResponse,
  CreateProjectPayload,
  ProjectListItem,
  ProjectsPageData,
  ProjectsQuery,
} from '@/types/projects';

export async function fetchProjectsData(
  query: ProjectsQuery = {},
): Promise<ProjectsPageData> {
  return fetchProjectsListApi(query);
}

export async function createProject(
  payload: CreateProjectPayload,
): Promise<ProjectListItem> {
  const name = payload.name.trim();
  const description = payload.description?.trim();

  const { data } = await apiClient.post<CreateProjectApiResponse>('/projects', {
    name,
    description: description || undefined,
    creation_mode: payload.creationMode,
    template_id: payload.templateId,
  });

  const project = mapCreateProjectResponse(data, {
    name,
    status: 'draft',
    scenariosCount: 1,
    lastResult: { status: null, label: 'Нет результатов' },
    activeRun: null,
  });
  registerProjectDetail(project, description);

  return project;
}

/** PATCH /api/v1/projects/{projectId} */
export async function renameProject(id: string, name: string): Promise<ProjectListItem> {
  const trimmed = name.trim();

  const { data } = await apiClient.patch<CreateProjectApiResponse>(`/projects/${id}`, {
    name: trimmed,
  });

  const project = mapCreateProjectResponse(data, {
    id,
    name: trimmed,
    lastResult: { status: null, label: 'Нет результатов' },
    activeRun: null,
  });
  registerProjectDetail(project);
  return project;
}

/** POST /api/v1/projects/{projectId}/archive */
export async function archiveProject(id: string): Promise<ProjectListItem> {
  const { data } = await apiClient.post<CreateProjectApiResponse>(`/projects/${id}/archive`);

  const project = mapCreateProjectResponse(
    {
      ...data,
      id: data.id || id,
      status: data.status ?? 'archived',
    },
    {
      id,
      status: 'archived',
      activeRun: null,
    },
  );

  registerProjectDetail(project);
  return project;
}

/** POST /api/v1/projects/{projectId}/copies */
export async function duplicateProject(id: string): Promise<ProjectListItem> {
  const { data } = await apiClient.post<CreateProjectApiResponse>(`/projects/${id}/copies`);

  const project = mapCreateProjectResponse(data, {
    name: data.name,
    status: 'draft',
    lastResult: { status: null, label: 'Нет результатов' },
    activeRun: null,
  });

  registerProjectDetail(project);
  return project;
}

/** DELETE /api/v1/projects/{projectId} */
export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
}
