import { ApiError } from '@/api/errors';
import {
  forgotPasswordApi,
  getCurrentUserApi,
  loginApi,
  registerApi,
} from '@/services/auth/authApi';
import {
  forgotPasswordMock,
  getCurrentUserMock,
  loginMock,
  registerMock,
} from '@/services/auth/authMock';
import { getToken, removeToken, setToken } from '@/services/auth/tokenStorage';
import type { AuthResponse, LoginData, RegisterData, User } from '@/types/auth';

const useApiMocks = () => import.meta.env.VITE_USE_API_MOCKS === 'true';

export { getToken, removeToken, setToken } from '@/services/auth/tokenStorage';

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = useApiMocks() ? await loginMock(data) : await loginApi(data);
  setToken(response.token);
  return response;
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = useApiMocks() ? await registerMock(data) : await registerApi(data);
  setToken(response.token);
  return response;
}

export async function forgotPassword(email: string): Promise<void> {
  if (useApiMocks()) {
    await forgotPasswordMock(email);
    return;
  }

  await forgotPasswordApi(email);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) {
    return null;
  }

  if (useApiMocks()) {
    const user = await getCurrentUserMock(token);
    if (!user) {
      removeToken();
    }
    return user;
  }

  try {
    return await getCurrentUserApi();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      removeToken();
      return null;
    }
    throw error;
  }
}

export function logout(): void {
  removeToken();
}
