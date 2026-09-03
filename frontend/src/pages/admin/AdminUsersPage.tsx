import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/common/PageHeader';
import { EntityStates } from '@/components/common/EntityStates';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { useApiMocks } from '@/config/env';
import { COMMON } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { DEMO_USERS } from '@/mocks/authData';
import { fetchUsersApi } from '@/services/scm/usersApi';
import { KitCard } from '@/ui-kit/Card';
import { ROLE_LABELS, type AppRole } from '@/types/scm/roles';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
}

function useAdminUsers() {
  const mocks = useApiMocks();
  return useQuery({
    queryKey: ['admin', 'users', mocks ? 'mock' : 'api'],
    queryFn: async (): Promise<UserRow[]> => {
      if (mocks) {
        return DEMO_USERS.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: ROLE_LABELS[u.role],
          organization: u.organization ?? '—',
        }));
      }
      const users = await fetchUsersApi();
      return users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.roles.map((r) => ROLE_LABELS[r as AppRole] ?? r).join(', ') || '—',
        organization: u.organization_id,
      }));
    },
  });
}

export function AdminUsersPage() {
  const { data: users = [], isLoading, error, refetch } = useAdminUsers();

  const columns = useMemo<DataTableColumn<UserRow>[]>(
    () => [
      { id: 'name', header: COMMON.name, cell: (row) => row.name },
      { id: 'email', header: COMMON.email, cell: (row) => row.email },
      { id: 'role', header: 'Роль', cell: (row) => row.role },
      { id: 'org', header: COMMON.organization, cell: (row) => row.organization },
    ],
    [],
  );

  return (
    <InternalLayout>
      <PageHeader title="Пользователи" subtitle="Управление пользователями — только ADMIN" />

      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        <KitCard variant="flat" padding="none">
          <DataTable
            data={users}
            columns={columns}
            total={users.length}
            page={0}
            pageSize={25}
            onPageChange={() => {}}
            getRowId={(row) => row.id}
          />
        </KitCard>
      </EntityStates>
    </InternalLayout>
  );
}
