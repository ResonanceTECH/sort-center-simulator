/** Pure permission helpers — prefer backend /auth/me permissions. */

export function normalizePermissions(
  permissions: readonly string[] | undefined | null,
): readonly string[] {
  return permissions ?? [];
}

export function can(
  permissions: readonly string[] | undefined | null,
  permission: string | readonly string[],
): boolean {
  const bag = normalizePermissions(permissions);
  if (bag.length === 0) return false;
  const needed = typeof permission === 'string' ? [permission] : [...permission];
  if (needed.length === 0) return true;
  return needed.every((p) => bag.includes(p));
}

export function canAny(
  permissions: readonly string[] | undefined | null,
  permission: string | readonly string[],
): boolean {
  const bag = normalizePermissions(permissions);
  if (bag.length === 0) return false;
  const needed = typeof permission === 'string' ? [permission] : [...permission];
  return needed.some((p) => bag.includes(p));
}
