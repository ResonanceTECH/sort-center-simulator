import axios from 'axios';
import { emitUnauthorized } from '@/api/authEvents';
import { ApiError } from '@/api/errors';
import { getToken, removeToken } from '@/services/auth/tokenStorage';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = axios.isAxiosError(error) ? error.config?.url ?? '' : '';
    const apiError = ApiError.fromAxiosError(error);

    if (
      apiError.status === 401 &&
      !url.includes('/auth/login') &&
      !url.includes('/auth/register')
    ) {
      removeToken();
      emitUnauthorized();
    }

    return Promise.reject(apiError);
  },
);
