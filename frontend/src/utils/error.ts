import axios from 'axios';

export function getErrorMessage(error: unknown, fallback = 'Произошла ошибка'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; detail?: string; error?: string }
      | string
      | undefined;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
      if (typeof data.detail === 'string' && data.detail.trim()) {
        return data.detail;
      }
      if (typeof data.error === 'string' && data.error.trim()) {
        return data.error;
      }
    }

    if (error.response?.status === 400) {
      return 'Некорректные данные запроса';
    }
    if (error.response?.status === 401) {
      return 'Требуется авторизация';
    }
    if (error.response?.status === 403) {
      return 'Недостаточно прав для выполнения действия';
    }
    if (error.response?.status === 404) {
      return 'Ресурс не найден';
    }
    if (error.response?.status && error.response.status >= 500) {
      return 'Ошибка сервера. Попробуйте позже';
    }
    if (error.code === 'ECONNABORTED') {
      return 'Превышено время ожидания ответа сервера';
    }
    if (!error.response) {
      return 'Нет соединения с сервером';
    }
  }

  return error instanceof Error ? error.message : fallback;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export { delay };
