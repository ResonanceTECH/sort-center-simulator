import { describe, expect, it } from 'vitest';
import { can, mapProjectAccess } from '@/constants/permissions';

describe('permissions', () => {
  it('maps owner capabilities from API payload', () => {
    const access = mapProjectAccess({
      role: 'owner',
      role_label: 'Владелец',
      permissions: { project: ['read', 'update', 'delete'] },
      capabilities: {
        delete_project: true,
        manage_members: true,
        copy_project: true,
        export_csv: true,
        set_default_scenario: true,
      },
    });

    expect(access.capabilities.manageMembers).toBe(true);
    expect(can(access, 'project', 'delete')).toBe(true);
  });

  it('viewer cannot create simulation runs', () => {
    const access = mapProjectAccess({
      role: 'viewer',
      permissions: { simulation_run: ['read'] },
      capabilities: {
        delete_project: false,
        manage_members: false,
        copy_project: false,
        export_csv: false,
        set_default_scenario: false,
      },
    });

    expect(can(access, 'simulation_run', 'create')).toBe(false);
    expect(can(access, 'simulation_run', 'read')).toBe(true);
  });
});
