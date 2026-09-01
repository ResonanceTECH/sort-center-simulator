import { describe, expect, it } from 'vitest';
import { getToken, removeToken, setToken } from '@/services/auth/tokenStorage';

describe('tokenStorage', () => {
  it('stores and reads token', () => {
    setToken('token-123');
    expect(getToken()).toBe('token-123');
  });

  it('removes token', () => {
    setToken('token-123');
    removeToken();
    expect(getToken()).toBeNull();
  });
});
