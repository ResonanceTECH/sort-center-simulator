import axios from 'axios';
import type { ApiErrorBody } from '@/types/api';

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors?: Record<string, string[]>;
  readonly isNetworkError: boolean;

  constructor(
    message: string,
    options: {
      status: number;
      fieldErrors?: Record<string, string[]>;
      isNetworkError?: boolean;
    },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.fieldErrors = options.fieldErrors;
    this.isNetworkError = options.isNetworkError ?? false;
  }

  static fromAxiosError(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }

    if (!axios.isAxiosError(error)) {
      return new ApiError(
        error instanceof Error ? error.message : 'Произошла ошибка',
        { status: 0 },
      );
    }

    const status = error.response?.status ?? 0;
    const data = error.response?.data as ApiErrorBody | string | undefined;

    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return new ApiError('Превышено время ожидания ответа сервера', {
          status: 0,
          isNetworkError: true,
        });
      }
      return new ApiError('Нет соединения с сервером', {
        status: 0,
        isNetworkError: true,
      });
    }

    const { message, fieldErrors } = parseErrorBody(data);

    if (message) {
      return new ApiError(message, { status, fieldErrors });
    }

    return new ApiError(getStatusFallbackMessage(status), { status, fieldErrors });
  }
}

function parseErrorBody(
  data: ApiErrorBody | string | undefined,
): { message: string | null; fieldErrors?: Record<string, string[]> } {
  if (typeof data === 'string' && data.trim()) {
    return { message: data.trim() };
  }

  if (!data || typeof data !== 'object') {
    return { message: null };
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return { message: data.message.trim(), fieldErrors: data.errors };
  }

  if (typeof data.detail === 'string' && data.detail.trim()) {
    return { message: data.detail.trim() };
  }

  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const fieldErrors: Record<string, string[]> = {};
    const messages: string[] = [];

    for (const item of data.detail) {
      const field = item.loc.filter((part) => part !== 'body').join('.') || 'form';
      const msg = item.msg;
      fieldErrors[field] = [...(fieldErrors[field] ?? []), msg];
      messages.push(msg);
    }

    return {
      message: messages[0] ?? 'Некорректные данные запроса',
      fieldErrors,
    };
  }

  if (data.errors && Object.keys(data.errors).length > 0) {
    const firstField = Object.keys(data.errors)[0];
    const firstMessage = data.errors[firstField]?.[0];
    return {
      message: firstMessage ?? 'Некорректные данные запроса',
      fieldErrors: data.errors,
    };
  }

  return { message: null };
}

function getStatusFallbackMessage(status: number): string {
  if (status === 400) return 'Некорректные данные запроса';
  if (status === 401) return 'Требуется авторизация';
  if (status === 403) return 'Недостаточно прав для выполнения действия';
  if (status === 404) return 'Ресурс не найден';
  if (status >= 500) return 'Ошибка сервера. Попробуйте позже';
  return 'Произошла ошибка';
}
