import type { Notification } from '@/types/general';

export type ProjectListStatus = 'draft' | 'completed' | 'error' | 'archived';

export type ProjectSortOption = 'recent' | 'oldest' | 'name_asc' | 'name_desc' | 'archived';

export type ProjectViewMode = 'cards' | 'table';

export type ProjectLastResultStatus = 'completed' | 'failed' | 'running' | 'queued' | null;

export interface ProjectLastResult {
  status: ProjectLastResultStatus;
  label: string;
}

export interface ProjectActiveRun {
  progress: number;
  label: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  updatedAt: string;
  status: ProjectListStatus;
  thumbnail: string;
  thumbnailAlt: string;
  scenariosCount: number;
  lastResult: ProjectLastResult;
  activeRun: ProjectActiveRun | null;
}

export interface ProjectsQuery {
  search?: string;
  status?: ProjectListStatus | 'all';
  sort?: ProjectSortOption;
  page?: number;
  pageSize?: number;
}

export interface ProjectsPageData {
  projects: ProjectListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  notifications: Notification[];
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface CreateProjectApiResponse {
  id: string;
  name: string;
  description?: string | null;
  status?: ProjectListStatus | string;
  updated_at?: string;
  updatedAt?: string;
  created_at?: string;
  scenarios_count?: number;
  scenariosCount?: number;
}
