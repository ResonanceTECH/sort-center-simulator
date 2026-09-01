import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import { ApiError } from '@/api/errors';

function createAxiosError(
  status?: number,
  data?: unknown,
  code?: string,
): AxiosError {
  const error = new AxiosError('Request failed');
  error.config = { headers: new AxiosHeaders(), url: '/test' };
  if (status !== undefined) {
    error.response = {
      status,
      data,
      statusText: 'Error',
      headers: {},
      config: error.config,
    };
  }
  if (code) {
    error.code = code;
  }
  return error;
}

describe('ApiError', () => {
  it('parses message from response body', () => {
    const error = ApiError.fromAxiosError(
      createAxiosError(400, { message: 'Некорректный email' }),
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe('Некорректный email');
    expect(error.status).toBe(400);
  });

  it('parses FastAPI string detail', () => {
    const error = ApiError.fromAxiosError(
      createAxiosError(401, { detail: 'Неверный email или пароль' }),
    );

    expect(error.message).toBe('Неверный email или пароль');
    expect(error.status).toBe(401);
  });

  it('parses FastAPI validation detail array', () => {
    const error = ApiError.fromAxiosError(
      createAxiosError(422, {
        detail: [{ loc: ['body', 'email'], msg: 'value is not a valid email', type: 'value_error' }],
      }),
    );

    expect(error.message).toBe('value is not a valid email');
    expect(error.fieldErrors).toEqual({
      email: ['value is not a valid email'],
    });
  });

  it('parses field errors object', () => {
    const error = ApiError.fromAxiosError(
      createAxiosError(400, {
        errors: { password: ['Слишком короткий пароль'] },
      }),
    );

    expect(error.message).toBe('Слишком короткий пароль');
    expect(error.fieldErrors).toEqual({ password: ['Слишком короткий пароль'] });
  });

  it('returns network error when response is missing', () => {
    const error = ApiError.fromAxiosError(createAxiosError());

    expect(error.message).toBe('Нет соединения с сервером');
    expect(error.isNetworkError).toBe(true);
  });

  it('returns timeout message for aborted requests', () => {
    const error = ApiError.fromAxiosError(createAxiosError(undefined, undefined, 'ECONNABORTED'));

    expect(error.message).toBe('Превышено время ожидания ответа сервера');
    expect(error.isNetworkError).toBe(true);
  });

  it('uses status fallback when body has no message', () => {
    const error = ApiError.fromAxiosError(createAxiosError(404, {}));

    expect(error.message).toBe('Ресурс не найден');
    expect(error.status).toBe(404);
  });

  it('returns same instance when already ApiError', () => {
    const original = new ApiError('Ошибка', { status: 500 });
    expect(ApiError.fromAxiosError(original)).toBe(original);
  });
});
