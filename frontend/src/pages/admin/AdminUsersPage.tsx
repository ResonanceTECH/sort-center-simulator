import { useMemo } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { COMMON } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { DEMO_USERS } from '@/mocks/authData';
import { KitCard } from '@/ui-kit/Card';
import { ROLE_LABELS } from '@/types/scm/roles';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
}

export function AdminUsersPage() {
  const users = useMemo<UserRow[]>(
    () =>
      DEMO_USERS.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: ROLE_LABELS[u.role],
        organization: u.organization ?? '—',
      })),
    [],
  );

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
    </InternalLayout>
  );
}
