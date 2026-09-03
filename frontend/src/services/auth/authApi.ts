import { apiClient } from '@/api/client';
import { mapAuthToken, mapMe, mapUser } from '@/api/mappers';
import { setToken } from '@/services/auth/tokenStorage';
import type { AuthApiResponse, LoginData, MeApiResponse, RegisterData, User } from '@/types/auth';

export interface LoginApiPayload {
  email: string;
  password: string;
}

export interface RegisterApiPayload {
  name: string;
  email: string;
  password: string;
  team?: string;
}

export async function loginApi(data: LoginData): Promise<{ user: User; token: string }> {
  const payload: LoginApiPayload = {
    email: data.email.trim(),
    password: data.password,
  };

  const { data: response } = await apiClient.post<AuthApiResponse>('/auth/login', payload);
  const token = mapAuthToken(response);
  setToken(token);
  try {
    const me = await getCurrentUserApi();
    return { user: me, token };
  } catch {
    return { user: mapUser(response.user), token };
  }
}

export async function registerApi(data: RegisterData): Promise<{ user: User; token: string }> {
  const payload: RegisterApiPayload = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    team: data.team?.trim() || undefined,
  };

  const { data: response } = await apiClient.post<AuthApiResponse>('/auth/register', payload);
  const token = mapAuthToken(response);
  setToken(token);
  try {
    const me = await getCurrentUserApi();
    return { user: me, token };
  } catch {
    return { user: mapUser(response.user), token };
  }
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', {
    email: email.trim().toLowerCase(),
  });
}

export async function getCurrentUserApi(): Promise<User> {
  const { data } = await apiClient.get<MeApiResponse>('/auth/me');
  return mapMe(data);
}
