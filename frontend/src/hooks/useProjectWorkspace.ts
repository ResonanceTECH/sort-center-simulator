import { useCallback } from 'react';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  fetchProjectById,
  fetchRunById,
  fetchScenarioById,
} from '@/services/projectWorkspaceService';
import { fetchProjectAccess } from '@/services/membershipService';
import { useApiMocks } from '@/config/env';
import type { ProjectAccess } from '@/types/rbac';
import { mapProjectAccess } from '@/constants/permissions';

function mockAccessFromRole(role?: string | null): ProjectAccess | null {
  if (!role) return null;
  return mapProjectAccess({
    role,
    permissions: {},
    capabilities: {
      delete_project: role === 'owner',
      copy_project: role !== 'viewer',
      set_default_scenario: role !== 'viewer',
      export_csv: role !== 'viewer',
      manage_members: role === 'owner',
    },
  });
}

export function useProjectData(projectId: string | undefined) {
  const fetcher = useCallback(async () => {
    if (!projectId?.trim()) {
      return { project: null, access: null };
    }
    const project = await fetchProjectById(projectId);
    if (!project) {
      return { project: null, access: null };
    }

    if (useApiMocks()) {
      return {
        project,
        access: mockAccessFromRole(project.myRole ?? 'owner'),
      };
    }

    try {
      const access = await fetchProjectAccess(projectId);
      return { project: { ...project, myRole: access.role }, access };
    } catch {
      return {
        project,
        access: mockAccessFromRole(project.myRole ?? 'owner'),
      };
    }
  }, [projectId]);

  const result = useAsyncData(fetcher);
  return {
    ...result,
    data: result.data?.project ?? null,
    access: result.data?.access ?? null,
  };
}

export function useScenarioData(
  projectId: string | undefined,
  scenarioId: string | undefined,
) {
  const fetcher = useCallback(() => {
    if (!projectId?.trim() || !scenarioId?.trim()) {
      return Promise.resolve(null);
    }
    return fetchScenarioById(projectId, scenarioId);
  }, [projectId, scenarioId]);

  return useAsyncData(fetcher);
}

export function useRunData(projectId: string | undefined, runId: string | undefined) {
  const fetcher = useCallback(() => {
    if (!projectId?.trim() || !runId?.trim()) {
      return Promise.resolve(null);
    }
    return fetchRunById(projectId, runId);
  }, [projectId, runId]);

  return useAsyncData(fetcher);
}
