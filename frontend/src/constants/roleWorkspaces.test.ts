import { describe, expect, it } from 'vitest';
import { getNavGroupsForRole, NAV_BY_ROLE } from '@/constants/navigation';
import { canAccessRoute } from '@/constants/routePermissions';
import { roleHasPermission } from '@/constants/scmPermissions';
import { getAppShell, getDefaultRoute, type AppRole } from '@/types/scm/roles';

const ROLES: AppRole[] = [
  'ADMIN',
  'SUPPLY_CHAIN_MANAGER',
  'SUPPLY_PLANNER',
  'LOGISTICS_MANAGER',
  'ANALYST',
  'SUPPLIER',
  'CARRIER',
];

function collectPaths(role: AppRole): string[] {
  return getNavGroupsForRole(role).flatMap((g) => g.items.map((i) => i.path));
}

describe('role workspaces (TZ screens & access)', () => {
  it('maps each role to a distinct product shell', () => {
    expect(getAppShell('ADMIN')).toBe('admin');
    expect(getAppShell('SUPPLY_CHAIN_MANAGER')).toBe('internal');
    expect(getAppShell('SUPPLIER')).toBe('supplier');
    expect(getAppShell('CARRIER')).toBe('carrier');
  });

  it('uses JTBD landing pages per role', () => {
    expect(getDefaultRoute('ADMIN')).toBe('/admin');
    expect(getDefaultRoute('SUPPLY_CHAIN_MANAGER')).toBe('/control-tower');
    expect(getDefaultRoute('SUPPLY_PLANNER')).toBe('/planning');
    expect(getDefaultRoute('LOGISTICS_MANAGER')).toBe('/shipments?view=board');
    expect(getDefaultRoute('ANALYST')).toBe('/analytics');
    expect(getDefaultRoute('SUPPLIER')).toBe('/supplier/dashboard');
    expect(getDefaultRoute('CARRIER')).toBe('/carrier/dashboard');
  });

  it('defines unique nav paths for every role workspace', () => {
    for (const role of ROLES) {
      const paths = collectPaths(role);
      expect(paths.length).toBeGreaterThan(0);
      expect(new Set(paths).size).toBe(paths.length);
      expect(NAV_BY_ROLE[role]).toBeTruthy();
    }
  });

  it('keeps sidebar items within route ACL for that role', () => {
    for (const role of ROLES) {
      for (const path of collectPaths(role)) {
        expect(canAccessRoute(role, path), `${role} → ${path}`).toBe(true);
      }
    }
  });

  it('blocks portal paths for internal roles and vice versa', () => {
    expect(canAccessRoute('SUPPLY_CHAIN_MANAGER', '/supplier')).toBe(false);
    expect(canAccessRoute('SUPPLIER', '/control-tower')).toBe(false);
    expect(canAccessRoute('CARRIER', '/planning/demand')).toBe(false);
    expect(canAccessRoute('ANALYST', '/admin/users')).toBe(false);
    expect(canAccessRoute('ADMIN', '/admin/users')).toBe(true);
  });

  it('separates approve/apply permissions (planner vs manager)', () => {
    expect(roleHasPermission('SUPPLY_PLANNER', 'supply_plan.approve')).toBe(false);
    expect(roleHasPermission('SUPPLY_CHAIN_MANAGER', 'supply_plan.approve')).toBe(true);
    expect(roleHasPermission('ANALYST', 'scenario.apply')).toBe(false);
    expect(roleHasPermission('SUPPLY_CHAIN_MANAGER', 'scenario.apply')).toBe(true);
    expect(roleHasPermission('LOGISTICS_MANAGER', 'shipment.assign_carrier')).toBe(true);
  });

  it('gives planner a planning-first sidebar without admin console', () => {
    const paths = collectPaths('SUPPLY_PLANNER');
    expect(paths).toContain('/planning');
    expect(paths).toContain('/planning/demand');
    expect(paths).toContain('/scenarios');
    expect(paths).not.toContain('/admin');
    expect(paths).not.toContain('/map');
  });

  it('gives logistics an ops sidebar without demand forecast', () => {
    const paths = collectPaths('LOGISTICS_MANAGER');
    expect(paths).toContain('/shipments?view=board');
    expect(paths).toContain('/shipments?view=table');
    expect(paths).toContain('/shipments?view=map');
    expect(paths).toContain('/lanes');
    expect(paths).not.toContain('/planning/demand');
  });
});

