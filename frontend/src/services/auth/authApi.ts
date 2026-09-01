import { apiClient } from '@/api/client';
import { mapAuthToken, mapUser } from '@/api/mappers';
import type { AuthApiResponse, LoginData, RegisterData, User } from '@/types/auth';

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

  return {
    user: mapUser(response.user),
    token: mapAuthToken(response),
  };
}

export async function registerApi(data: RegisterData): Promise<{ user: User; token: string }> {
  const payload: RegisterApiPayload = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password,
    team: data.team?.trim() || undefined,
  };

  const { data: response } = await apiClient.post<AuthApiResponse>('/auth/register', payload);

  return {
    user: mapUser(response.user),
    token: mapAuthToken(response),
  };
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', {
    email: email.trim().toLowerCase(),
  });
}

export async function getCurrentUserApi(): Promise<User> {
  const { data } = await apiClient.get<AuthApiResponse['user']>('/auth/me');
  return mapUser(data);
}
