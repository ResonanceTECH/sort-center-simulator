import { apiClient } from '@/api/client';
import {
  mapInvitation,
  mapInvitationPreview,
  mapMember,
  mapProjectAccess,
} from '@/constants/permissions';
import type {
  InvitationPreview,
  ProjectAccess,
  ProjectInvitation,
  ProjectMember,
  ProjectRole,
} from '@/types/rbac';

export async function fetchProjectAccess(
  projectId: string,
): Promise<ProjectAccess> {
  const { data } = await apiClient.get(`/projects/${projectId}/access`);
  return mapProjectAccess(data);
}

export async function fetchProjectMembers(projectId: string): Promise<ProjectMember[]> {
  const { data } = await apiClient.get<{ members: Array<Record<string, unknown>> }>(
    `/projects/${projectId}/members`,
  );
  return (data.members ?? []).map((item) => mapMember(item as Parameters<typeof mapMember>[0]));
}

export async function fetchProjectInvitations(
  projectId: string,
): Promise<ProjectInvitation[]> {
  const { data } = await apiClient.get<{ invitations: Array<Record<string, unknown>> }>(
    `/projects/${projectId}/invitations`,
  );
  return (data.invitations ?? []).map((item) =>
    mapInvitation(item as Parameters<typeof mapInvitation>[0]),
  );
}

export async function createProjectInvitation(
  projectId: string,
  role: ProjectRole,
): Promise<ProjectInvitation> {
  const { data } = await apiClient.post<Record<string, unknown>>(
    `/projects/${projectId}/invitations`,
    { role, expires_in_days: 7 },
  );
  return mapInvitation(data as Parameters<typeof mapInvitation>[0]);
}

export async function revokeProjectInvitation(
  projectId: string,
  invitationId: string,
): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/invitations/${invitationId}`);
}

export async function updateMemberRole(
  projectId: string,
  userId: string,
  role: ProjectRole,
): Promise<ProjectMember> {
  const { data } = await apiClient.patch<Record<string, unknown>>(
    `/projects/${projectId}/members/${userId}`,
    { role },
  );
  return mapMember(data as Parameters<typeof mapMember>[0]);
}

export async function removeProjectMember(projectId: string, userId: string): Promise<void> {
  await apiClient.delete(`/projects/${projectId}/members/${userId}`);
}

export async function previewInvitation(code: string): Promise<InvitationPreview> {
  const { data } = await apiClient.get<Record<string, unknown>>(`/invitations/${code}/preview`);
  return mapInvitationPreview(data as Parameters<typeof mapInvitationPreview>[0]);
}

export async function acceptInvitation(code: string): Promise<ProjectAccess> {
  const { data } = await apiClient.post<{
    role: string;
    role_label?: string;
    permissions?: Record<string, string[]>;
    capabilities?: Record<string, boolean>;
  }>('/invitations/accept', { code });
  return mapProjectAccess(data);
}
