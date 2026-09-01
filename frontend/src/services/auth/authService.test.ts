import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/api/errors';
import * as authApi from '@/services/auth/authApi';
import {
  forgotPassword,
  getCurrentUser,
  getToken,
  login,
  logout,
  register,
} from '@/services/auth/authService';
import { removeToken } from '@/services/auth/tokenStorage';

describe('authService api mode', () => {
  beforeEach(() => {
    removeToken();
    vi.stubEnv('VITE_USE_API_MOCKS', 'false');
    vi.restoreAllMocks();
  });

  it('login stores token from API response', async () => {
    vi.spyOn(authApi, 'loginApi').mockResolvedValue({
      user: {
        id: 'user-1',
        name: 'Иван',
        email: 'ivan@example.com',
      },
      token: 'access-token',
    });

    const response = await login({
      email: 'ivan@example.com',
      password: 'secret',
      rememberMe: true,
    });

    expect(response.user.email).toBe('ivan@example.com');
    expect(getToken()).toBe('access-token');
  });

  it('register stores token from API response', async () => {
    vi.spyOn(authApi, 'registerApi').mockResolvedValue({
      user: {
        id: 'user-2',
        name: 'Мария',
        email: 'maria@example.com',
      },
      token: 'register-token',
    });

    await register({
      name: 'Мария',
      email: 'maria@example.com',
      password: 'secret123',
      confirmPassword: 'secret123',
      agreeToTerms: true,
    });

    expect(getToken()).toBe('register-token');
  });

  it('getCurrentUser returns null without token', async () => {
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('getCurrentUser returns user from API', async () => {
    vi.spyOn(authApi, 'getCurrentUserApi').mockResolvedValue({
      id: 'user-1',
      name: 'Иван',
      email: 'ivan@example.com',
    });

    localStorage.setItem('auth_token', 'token-1');

    await expect(getCurrentUser()).resolves.toEqual({
      id: 'user-1',
      name: 'Иван',
      email: 'ivan@example.com',
    });
  });

  it('getCurrentUser clears token on 401', async () => {
    vi.spyOn(authApi, 'getCurrentUserApi').mockRejectedValue(
      new ApiError('Требуется авторизация', { status: 401 }),
    );

    localStorage.setItem('auth_token', 'expired-token');

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(getToken()).toBeNull();
  });

  it('forgotPassword calls API endpoint', async () => {
    const forgotSpy = vi.spyOn(authApi, 'forgotPasswordApi').mockResolvedValue();

    await forgotPassword('ivan@example.com');

    expect(forgotSpy).toHaveBeenCalledWith('ivan@example.com');
  });

  it('logout removes token', () => {
    localStorage.setItem('auth_token', 'token-1');
    logout();
    expect(getToken()).toBeNull();
  });
});
