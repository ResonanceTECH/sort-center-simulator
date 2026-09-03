import { describe, expect, it } from 'vitest';
import { can, canAny } from '@/utils/can';
import { filterNavByPermissions } from '@/components/common/RoleBasedNavigation';
import { getNavGroupsForRole } from '@/constants/navigation';
import { getRolePermissions } from '@/constants/scmPermissions';
import {
  landingForRole,
  resolveLandingPath,
  resolveShell,
  workspaceAllowsShell,
} from '@/workspace/workspaceResolver';
import type { User } from '@/types/auth';

function user(partial: Partial<User> & Pick<User, 'role'>): User {
  return {
    id: '1',
    name: 'T',
    email: 't@t.com',
    roles: [partial.role],
    permissions: [...getRolePermissions(partial.role)],
    availableWorkspaces: [],
    ...partial,
  };
}

describe('workspaceResolver', () => {
  it('maps TZ landings per role', () => {
    expect(landingForRole('ADMIN')).toBe('/admin');
    expect(landingForRole('SUPPLY_CHAIN_MANAGER')).toBe('/control-tower');
    expect(landingForRole('SUPPLY_PLANNER')).toBe('/planning');
    expect(landingForRole('LOGISTICS_MANAGER')).toBe('/shipments?view=board');
    expect(landingForRole('ANALYST')).toBe('/analytics');
    expect(landingForRole('SUPPLIER')).toBe('/supplier/dashboard');
    expect(landingForRole('CARRIER')).toBe('/carrier/dashboard');
  });

  it('prefers availableWorkspaces for shell landing', () => {
    expect(
      resolveLandingPath(
        user({
          role: 'SUPPLY_CHAIN_MANAGER',
          availableWorkspaces: ['ADMIN'],
        }),
      ),
    ).toBe('/admin');
  });

  it('resolves shell from workspaces', () => {
    expect(resolveShell(user({ role: 'SUPPLIER', availableWorkspaces: ['SUPPLIER'] }))).toBe('supplier');
    expect(workspaceAllowsShell(user({ role: 'ADMIN', availableWorkspaces: ['ADMIN'] }), 'admin')).toBe(true);
    expect(workspaceAllowsShell(user({ role: 'ADMIN', availableWorkspaces: ['ADMIN'] }), 'internal')).toBe(false);
  });
});

describe('can()', () => {
  it('requires all permissions by default', () => {
    expect(can(['shipment.read', 'shipment.cancel'], 'shipment.read')).toBe(true);
    expect(can(['shipment.read'], ['shipment.read', 'shipment.cancel'])).toBe(false);
    expect(canAny(['shipment.read'], ['shipment.cancel', 'shipment.read'])).toBe(true);
  });
});

describe('permission nav filter', () => {
  it('hides planner map and approve-related items via permissions', () => {
    const perms = getRolePermissions('SUPPLY_PLANNER');
    const groups = filterNavByPermissions(getNavGroupsForRole('SUPPLY_PLANNER'), perms);
    const paths = groups.flatMap((g) => g.items.map((i) => i.path));
    expect(paths).toContain('/planning');
    expect(paths).not.toContain('/map');
    expect(paths).not.toContain('/admin/users');
  });

  it('keeps logistics shipments board entry', () => {
    const perms = getRolePermissions('LOGISTICS_MANAGER');
    const groups = filterNavByPermissions(getNavGroupsForRole('LOGISTICS_MANAGER'), perms);
    const paths = groups.flatMap((g) => g.items.map((i) => i.path));
    expect(paths).toContain('/shipments?view=board');
    expect(paths).toContain('/shipments?view=table');
    expect(paths).toContain('/shipments?view=map');
  });
});

