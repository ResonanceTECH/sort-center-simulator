import { describe, expect, it } from 'vitest';
import { ApiError } from '@/api/errors';
import { getErrorMessage } from '@/utils/error';

describe('getErrorMessage', () => {
  it('returns ApiError message', () => {
    const error = new ApiError('Ошибка авторизации', { status: 401 });
    expect(getErrorMessage(error)).toBe('Ошибка авторизации');
  });

  it('returns Error message', () => {
    expect(getErrorMessage(new Error('Что-то пошло не так'))).toBe('Что-то пошло не так');
  });

  it('returns fallback for unknown values', () => {
    expect(getErrorMessage(null, 'Fallback')).toBe('Fallback');
  });
});
