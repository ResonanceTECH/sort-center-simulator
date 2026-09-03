import { Box, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/PageHeader';
import { EntityStates } from '@/components/common/EntityStates';
import { KpiCard } from '@/components/status/KpiCard';
import { useApiMocks } from '@/config/env';
import { DEMO_USERS } from '@/mocks/authData';
import { InternalLayout } from '@/layouts/InternalLayout';
import { fetchUsersApi } from '@/services/scm/usersApi';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import { ROLE_LABELS, type AppRole } from '@/types/scm/roles';

const INTEGRATIONS = [
  { id: 'erp', name: 'ERP Connector', status: 'ACTIVE' as const },
  { id: 'tms', name: 'TMS Feed', status: 'ACTIVE' as const },
  { id: 'wms', name: 'WMS Sync', status: 'FAILED' as const },
  { id: 'edi', name: 'EDI Gateway', status: 'ACTIVE' as const },
];

const SECURITY_EVENTS = [
  { id: 'e1', time: '14:12', text: 'Назначение роли LOGISTICS_MANAGER → logistics@scm.ru' },
  { id: 'e2', time: '13:40', text: 'Неуспешный вход: unknown@ext.ru' },
  { id: 'e3', time: '11:05', text: 'Обновление permissions: SUPPLY_PLANNER' },
  { id: 'e4', time: '09:22', text: 'Refresh session revoked (admin@scm.ru)' },
];

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const mocks = useApiMocks();
  const usersQuery = useQuery({
    queryKey: ['admin', 'dashboard', 'users', mocks ? 'mock' : 'api'],
    queryFn: async () => {
      if (mocks) return DEMO_USERS;
      return fetchUsersApi();
    },
  });

  const users = usersQuery.data ?? [];
  const orgCount = new Set(
    users.map((u) => {
      if ('organization' in u && u.organization) return u.organization;
      if ('organization_id' in u && typeof u.organization_id === 'string') return u.organization_id;
      return '—';
    }),
  ).size;
  const activeIntegrations = INTEGRATIONS.filter((i) => i.status === 'ACTIVE').length;
  const failedIntegrations = INTEGRATIONS.filter((i) => i.status === 'FAILED').length;

  return (
    <InternalLayout>
      <PageHeader
        title="Администрирование"
        subtitle="Пользователи, роли, организации и интеграции — только ADMIN"
      />

      <EntityStates
        loading={usersQuery.isLoading}
        error={usersQuery.error?.message}
        onRetry={() => void usersQuery.refetch()}
      >
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard
              metric={{ label: 'Пользователи', value: users.length, status: 'NORMAL' }}
              onClick={() => navigate('/admin/users')}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard
              metric={{ label: 'Организации', value: orgCount, status: 'NORMAL' }}
              onClick={() => navigate('/admin/organizations')}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard
              metric={{ label: 'Интеграции', value: activeIntegrations, status: 'SUCCESS' }}
              onClick={() => navigate('/admin/integrations')}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard
              metric={{ label: 'Сбои интеграций', value: failedIntegrations, status: 'CRITICAL' }}
              onClick={() => navigate('/admin/integrations')}
            />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard metric={{ label: 'Активные сессии', value: Math.max(users.length - 1, 1), status: 'INFO' }} />
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <KpiCard
              metric={{ label: 'Роли', value: Object.keys(ROLE_LABELS).length, status: 'NORMAL' }}
              onClick={() => navigate('/admin/roles')}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <KitCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Недавние security events
              </Typography>
              {SECURITY_EVENTS.map((e) => (
                <Box
                  key={e.id}
                  sx={{
                    py: 1.25,
                    borderBottom: kit.border.hairline,
                    display: 'flex',
                    gap: 1.5,
                  }}
                >
                  <Typography variant="caption" sx={{ color: kit.color.muted, minWidth: 40 }}>
                    {e.time}
                  </Typography>
                  <Typography variant="body2">{e.text}</Typography>
                </Box>
              ))}
              <Typography
                variant="body2"
                sx={{ mt: 2, cursor: 'pointer', color: kit.color.accent }}
                onClick={() => navigate('/admin/audit')}
              >
                Открыть Audit Log →
              </Typography>
            </KitCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <KitCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Быстрые переходы
              </Typography>
              {(
                [
                  { label: 'Пользователи', to: '/admin/users' },
                  { label: 'Роли и права', to: '/admin/roles' },
                  { label: 'Организации', to: '/admin/organizations' },
                  { label: 'Интеграции', to: '/admin/integrations' },
                  { label: 'Audit Log', to: '/admin/audit' },
                ] as const
              ).map((link) => (
                <Typography
                  key={link.to}
                  variant="body2"
                  sx={{
                    py: 1.25,
                    borderBottom: kit.border.hairline,
                    cursor: 'pointer',
                    '&:hover': { color: kit.color.accent },
                  }}
                  onClick={() => navigate(link.to)}
                >
                  {link.label} →
                </Typography>
              ))}
            </KitCard>
          </Grid>
        </Grid>
      </EntityStates>
    </InternalLayout>
  );
}

/** Thin list pages for admin stubs — reuse DEMO_USERS / static rows. */
export function AdminOrganizationsPage() {
  const orgs = [...new Set(DEMO_USERS.map((u) => u.organization).filter(Boolean))] as string[];
  return (
    <InternalLayout>
      <PageHeader title="Организации" subtitle="Тенанты платформы" />
      <KitCard>
        {orgs.map((org) => (
          <Box key={org} sx={{ py: 1.5, borderBottom: kit.border.hairline }}>
            <Typography fontWeight={600}>{org}</Typography>
            <Typography variant="caption" sx={{ color: kit.color.muted }}>
              Пользователей:{' '}
              {DEMO_USERS.filter((u) => u.organization === org).length} · роли:{' '}
              {[
                ...new Set(
                  DEMO_USERS.filter((u) => u.organization === org).map(
                    (u) => ROLE_LABELS[u.role as AppRole] ?? u.role,
                  ),
                ),
              ].join(', ')}
            </Typography>
          </Box>
        ))}
      </KitCard>
    </InternalLayout>
  );
}

export function AdminIntegrationsPage() {
  return (
    <InternalLayout>
      <PageHeader title="Интеграции" subtitle="Коннекторы ERP / TMS / WMS / EDI" />
      <KitCard>
        {INTEGRATIONS.map((item) => (
          <Box
            key={item.id}
            sx={{ py: 1.5, borderBottom: kit.border.hairline, display: 'flex', justifyContent: 'space-between' }}
          >
            <Typography fontWeight={600}>{item.name}</Typography>
            <Typography
              variant="caption"
              sx={{ color: item.status === 'FAILED' ? kit.color.accent : kit.color.success }}
            >
              {item.status}
            </Typography>
          </Box>
        ))}
      </KitCard>
    </InternalLayout>
  );
}

export function AdminAuditPage() {
  return (
    <InternalLayout>
      <PageHeader title="Audit Log" subtitle="Назначения ролей, permissions, сессии" />
      <KitCard>
        {SECURITY_EVENTS.map((e) => (
          <Box key={e.id} sx={{ py: 1.5, borderBottom: kit.border.hairline, display: 'flex', gap: 2 }}>
            <Typography variant="caption" sx={{ color: kit.color.muted, minWidth: 48 }}>
              {e.time}
            </Typography>
            <Typography variant="body2">{e.text}</Typography>
          </Box>
        ))}
      </KitCard>
    </InternalLayout>
  );
}
