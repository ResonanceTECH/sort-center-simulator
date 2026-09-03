import { describe, expect, it } from 'vitest';
import {
  CARRIER_NAV_ITEMS,
  getNavGroupsForRole,
  INTERNAL_NAV_GROUPS,
  SUPPLIER_NAV_ITEMS,
} from '@/constants/navigation';

function collectPaths(groups: { items: { path: string }[] }[]): string[] {
  return groups.flatMap((g) => g.items.map((i) => i.path));
}

describe('SCM navigation routes (§6)', () => {
  it('defines unique manager reference nav paths', () => {
    const paths = collectPaths(INTERNAL_NAV_GROUPS);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).toContain('/control-tower');
    expect(paths).toContain('/shipments');
    expect(paths).toContain('/scenarios');
  });

  it('defines supplier and carrier portal paths', () => {
    const supplierPaths = SUPPLIER_NAV_ITEMS.map((i) => i.path);
    const carrierPaths = [...new Set(CARRIER_NAV_ITEMS.map((i) => i.path))];
    expect(new Set(supplierPaths).size).toBe(supplierPaths.length);
    expect(supplierPaths).toContain('/supplier/incidents');
    expect(carrierPaths).toContain('/carrier/map');
    expect(getNavGroupsForRole('SUPPLIER').length).toBeGreaterThan(3);
    expect(SUPPLIER_NAV_ITEMS.some((i) => i.path === '/supplier/dashboard')).toBe(true);
    expect(CARRIER_NAV_ITEMS.some((i) => i.path === '/carrier/dashboard')).toBe(true);
  });
});
