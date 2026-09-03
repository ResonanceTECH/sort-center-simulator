import { Box, Typography } from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { InternalLayout } from '@/layouts/InternalLayout';
import { getRolePermissions, type ScmPermission } from '@/constants/scmPermissions';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import { ROLE_LABELS, type AppRole } from '@/types/scm/roles';

const MATRIX_ROLES: AppRole[] = [
  'ADMIN',
  'SUPPLY_CHAIN_MANAGER',
  'SUPPLY_PLANNER',
  'LOGISTICS_MANAGER',
  'ANALYST',
];

const MATRIX_PERMISSIONS: ScmPermission[] = [
  'users.read',
  'users.create',
  'users.update',
  'users.delete',
  'shipment.read',
  'shipment.create',
  'shipment.update',
  'shipment.assign_carrier',
  'shipment.cancel',
  'supply_plan.read',
  'supply_plan.approve',
  'scenario.read',
  'scenario.create',
  'scenario.run',
  'scenario.compare',
  'scenario.apply',
];

export function AdminRolesPage() {
  const bags = Object.fromEntries(
    MATRIX_ROLES.map((role) => [role, new Set(getRolePermissions(role))]),
  ) as Record<AppRole, Set<string>>;

  return (
    <InternalLayout>
      <PageHeader
        title="Роли и права"
        subtitle="Матрица системных permissions (read-only). CRUD кастомных ролей — позже."
      />

      <KitCard variant="flat" padding="none" sx={{ overflow: 'auto' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <Box component="thead">
            <Box component="tr" sx={{ borderBottom: kit.border.hairline }}>
              <Box component="th" sx={{ p: 1.5, textAlign: 'left', position: 'sticky', left: 0, bgcolor: kit.color.card }}>
                Permission
              </Box>
              {MATRIX_ROLES.map((role) => (
                <Box component="th" key={role} sx={{ p: 1.5, textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {ROLE_LABELS[role]}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {MATRIX_PERMISSIONS.map((perm) => (
              <Box component="tr" key={perm} sx={{ borderBottom: kit.border.hairline }}>
                <Box component="td" sx={{ p: 1.5, position: 'sticky', left: 0, bgcolor: kit.color.card }}>
                  <Typography variant="caption" fontFamily="monospace">
                    {perm}
                  </Typography>
                </Box>
                {MATRIX_ROLES.map((role) => (
                  <Box component="td" key={role} sx={{ p: 1.5, textAlign: 'center' }}>
                    {bags[role].has(perm) ? '✓' : '—'}
                  </Box>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      </KitCard>
    </InternalLayout>
  );
}
