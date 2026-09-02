import { Box, Typography } from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { InternalLayout } from '@/layouts/InternalLayout';
import { ROUTE_PERMISSIONS } from '@/constants/routePermissions';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import { ROLE_LABELS, type AppRole } from '@/types/scm/roles';

const INTERNAL_ROLES: AppRole[] = [
  'ADMIN',
  'SUPPLY_CHAIN_MANAGER',
  'SUPPLY_PLANNER',
  'LOGISTICS_MANAGER',
  'ANALYST',
];

export function AdminRolesPage() {
  const routes = Object.keys(ROUTE_PERMISSIONS).slice(0, 12);

  return (
    <InternalLayout>
      <PageHeader title="Роли" subtitle="Матрица доступа: роль → маршрут" />

      <KitCard variant="flat" padding="none" sx={{ overflow: 'auto' }}>
        <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <Box component="thead">
            <Box component="tr" sx={{ borderBottom: kit.border.hairline }}>
              <Box component="th" sx={{ p: 1.5, textAlign: 'left' }}>Маршрут</Box>
              {INTERNAL_ROLES.map((role) => (
                <Box component="th" key={role} sx={{ p: 1.5, textAlign: 'center' }}>
                  {ROLE_LABELS[role]}
                </Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {routes.map((route) => (
              <Box component="tr" key={route} sx={{ borderBottom: kit.border.hairline }}>
                <Box component="td" sx={{ p: 1.5 }}>
                  <Typography variant="caption">{route}</Typography>
                </Box>
                {INTERNAL_ROLES.map((role) => (
                  <Box component="td" key={role} sx={{ p: 1.5, textAlign: 'center' }}>
                    {ROUTE_PERMISSIONS[route]?.[role] ?? '—'}
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
