/** True when Vite dev mocks handle /api (default). Set VITE_USE_API_MOCKS=false for real backend. */
export function useApiMocks(): boolean {
  return import.meta.env.VITE_USE_API_MOCKS === 'true';
}

export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_BASE_URL ?? '/api/v1';
}
