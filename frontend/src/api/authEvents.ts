export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized';

export function onUnauthorized(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
  return () => window.removeEventListener(AUTH_UNAUTHORIZED_EVENT, handler);
}

export function emitUnauthorized(): void {
  window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT));
}
