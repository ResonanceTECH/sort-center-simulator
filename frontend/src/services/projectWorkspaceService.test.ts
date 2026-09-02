import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchProjectById, fetchRunById, fetchRuns } from '@/services/projectWorkspaceService';
import * as projectWorkspaceApi from '@/services/projectWorkspace/projectWorkspaceApi';
import * as projectWorkspaceMock from '@/services/projectWorkspace/projectWorkspaceMock';

vi.mock('@/services/projectWorkspace/projectWorkspaceApi');
vi.mock('@/services/projectWorkspace/projectWorkspaceMock');

describe('projectWorkspaceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses API implementation when VITE_USE_API_MOCKS=false', async () => {
    vi.stubEnv('VITE_USE_API_MOCKS', 'false');
    vi.mocked(projectWorkspaceApi.fetchProjectById).mockResolvedValue(null);

    await fetchProjectById('project-1');

    expect(projectWorkspaceApi.fetchProjectById).toHaveBeenCalledWith('project-1');
    expect(projectWorkspaceMock.fetchProjectById).not.toHaveBeenCalled();
  });

  it('uses mock implementation when VITE_USE_API_MOCKS=true', async () => {
    vi.stubEnv('VITE_USE_API_MOCKS', 'true');
    vi.mocked(projectWorkspaceMock.fetchProjectById).mockResolvedValue(null);

    await fetchProjectById('proj-1');

    expect(projectWorkspaceMock.fetchProjectById).toHaveBeenCalledWith('proj-1');
    expect(projectWorkspaceApi.fetchProjectById).not.toHaveBeenCalled();
  });

  it('routes fetchRuns to API in live mode', async () => {
    vi.stubEnv('VITE_USE_API_MOCKS', 'false');
    vi.mocked(projectWorkspaceApi.fetchRuns).mockResolvedValue([]);

    await fetchRuns('project-1');

    expect(projectWorkspaceApi.fetchRuns).toHaveBeenCalledWith('project-1');
  });

  it('routes fetchRunById to API in live mode', async () => {
    vi.stubEnv('VITE_USE_API_MOCKS', 'false');
    vi.mocked(projectWorkspaceApi.fetchRunById).mockResolvedValue(null);

    await fetchRunById('project-1', 'run-1');

    expect(projectWorkspaceApi.fetchRunById).toHaveBeenCalledWith('project-1', 'run-1');
  });
});
