import { useCallback } from 'react';
import { useAsyncData } from '@/hooks/useAsyncData';
import {
  fetchProjectById,
  fetchRunById,
  fetchScenarioById,
} from '@/services/projectWorkspaceService';

export function useProjectData(projectId: string | undefined) {
  const fetcher = useCallback(() => {
    if (!projectId?.trim()) {
      return Promise.resolve(null);
    }
    return fetchProjectById(projectId);
  }, [projectId]);

  return useAsyncData(fetcher);
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
