import { describe, expect, it } from 'vitest';
import { getApiBaseUrl, useApiMocks } from '@/config/env';

describe('env config', () => {
  it('useApiMocks is true by default in tests', () => {
    expect(useApiMocks()).toBe(true);
  });

  it('getApiBaseUrl falls back to /api/v1', () => {
    expect(getApiBaseUrl()).toBe('/api/v1');
  });
});
