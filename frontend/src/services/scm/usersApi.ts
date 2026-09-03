import { apiClient } from '@/api/client';

export interface UserApiItem {
  id: string;
  name: string;
  email: string;
  team?: string;
  organization_id: string;
  roles: string[];
}

export interface RoleApiItem {
  id: string;
  code: string;
  name: string;
}

export interface AuditEventApiItem {
  id: string;
  organization_id: string;
  user_id?: string;
  user_name?: string;
  entity_type: string;
  entity_id: string;
  action: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  created_at: string;
}

export async function fetchUsersApi(): Promise<UserApiItem[]> {
  const { data } = await apiClient.get<UserApiItem[]>('/users');
  return data;
}

export async function fetchRolesApi(): Promise<RoleApiItem[]> {
  const { data } = await apiClient.get<RoleApiItem[]>('/users/roles');
  return data;
}

export async function fetchAuditEventsApi(limit = 50): Promise<AuditEventApiItem[]> {
  const { data } = await apiClient.get<AuditEventApiItem[]>('/users/audit-events', { params: { limit } });
  return data;
}

export async function createUserApi(payload: {
  name: string;
  email: string;
  password: string;
  team?: string;
  roles?: string[];
}): Promise<UserApiItem> {
  const { data } = await apiClient.post<UserApiItem>('/users', payload);
  return data;
}

export async function deleteUserApi(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`);
}
