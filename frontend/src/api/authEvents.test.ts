import { describe, expect, it, vi } from 'vitest';
import { AUTH_UNAUTHORIZED_EVENT, emitUnauthorized, onUnauthorized } from '@/api/authEvents';

describe('authEvents', () => {
  it('calls subscriber on unauthorized event', () => {
    const callback = vi.fn();
    const unsubscribe = onUnauthorized(callback);

    emitUnauthorized();

    expect(callback).toHaveBeenCalledTimes(1);

    unsubscribe();
    emitUnauthorized();

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('uses shared event name', () => {
    const callback = vi.fn();
    window.addEventListener(AUTH_UNAUTHORIZED_EVENT, callback);

    emitUnauthorized();

    expect(callback).toHaveBeenCalledTimes(1);
    window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, callback);
  });
});
