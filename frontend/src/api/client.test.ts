import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { emitUnauthorized } from '@/api/authEvents';
import { ApiError } from '@/api/errors';
import { apiClient } from '@/api/client';
import * as tokenStorage from '@/services/auth/tokenStorage';

vi.mock('@/api/authEvents', () => ({
  emitUnauthorized: vi.fn(),
}));

function createAxiosError(url: string, status: number, message: string): AxiosError {
  const error = new AxiosError(message);
  error.config = { headers: new AxiosHeaders(), url };
  error.response = {
    status,
    data: { message },
    statusText: 'Error',
    headers: {},
    config: error.config,
  };
  return error;
}

describe('apiClient response interceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('removes token and emits unauthorized on 401 for protected endpoints', async () => {
    const removeTokenSpy = vi.spyOn(tokenStorage, 'removeToken');
    const rejectHandler = apiClient.interceptors.response.handlers[0]?.rejected;
    expect(rejectHandler).toBeTypeOf('function');

    const error = createAxiosError('/projects', 401, 'Требуется авторизация');

    await expect(rejectHandler?.(error)).rejects.toBeInstanceOf(ApiError);
    expect(removeTokenSpy).toHaveBeenCalled();
    expect(emitUnauthorized).toHaveBeenCalled();
  });

  it('does not logout on 401 from login endpoint', async () => {
    const removeTokenSpy = vi.spyOn(tokenStorage, 'removeToken');
    const rejectHandler = apiClient.interceptors.response.handlers[0]?.rejected;

    const error = createAxiosError('/auth/login', 401, 'Неверный email или пароль');

    await expect(rejectHandler?.(error)).rejects.toBeInstanceOf(ApiError);
    expect(removeTokenSpy).not.toHaveBeenCalled();
    expect(emitUnauthorized).not.toHaveBeenCalled();
  });
});
