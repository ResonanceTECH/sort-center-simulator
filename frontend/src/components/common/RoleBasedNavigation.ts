import type { NavGroupConfig, NavItemConfig } from '@/constants/navigation';
import { can, canAny } from '@/utils/can';

export function navItemAllowed(
  item: NavItemConfig,
  permissions: readonly string[],
): boolean {
  if (!item.permission) return true;
  const needed = item.permission;
  if (item.requireAnyPermission) {
    return canAny(permissions, needed);
  }
  return can(permissions, needed);
}

/** Filter nav tree by permissions — keep role trees as presets. */
export function filterNavByPermissions(
  groups: NavGroupConfig[],
  permissions: readonly string[],
): NavGroupConfig[] {
  return groups
    .map((group) => {
      const items = group.items.filter((item) => navItemAllowed(item, permissions));
      if (items.length === 0) return null;
      return { ...group, items };
    })
    .filter(Boolean) as NavGroupConfig[];
}
