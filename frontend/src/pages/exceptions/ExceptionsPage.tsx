import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { ContextualDocsLink } from '@/docs/components/ContextualDocsLink';
import { ExceptionCard } from '@/components/scenarios/ExceptionCard';
import { FilterBar } from '@/components/tables/FilterBar';
import { useExceptionsQuery } from '@/hooks/scm/useScmQueries';
import { useUrlFilters } from '@/hooks/useUrlFilters';
import { COMMON, NAV_LABELS, labelSeverity } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';

const DEFAULT_FILTERS = {
  severity: undefined as string | undefined,
  type: undefined as string | undefined,
};

export function ExceptionsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useUrlFilters(DEFAULT_FILTERS);
  const { data, isLoading, error, refetch } = useExceptionsQuery(filters);

  return (
    <InternalLayout>
      <PageHeader
        title="Отклонения"
        subtitle="Рабочая очередь — только то, что требует внимания"
        breadcrumbs={[
          { label: NAV_LABELS.controlTower, to: '/control-tower' },
          { label: 'Отклонения' },
        ]}
        actions={<ContextualDocsLink slug="execution/exceptions" />}
      />

      <FilterBar
        fields={[
          {
            key: 'severity',
            label: COMMON.severity,
            type: 'select',
            options: [
              { value: 'CRITICAL', label: labelSeverity('CRITICAL') },
              { value: 'HIGH', label: labelSeverity('HIGH') },
              { value: 'MEDIUM', label: labelSeverity('MEDIUM') },
            ],
          },
        ]}
        values={filters}
        onChange={setFilters}
      />

      <EntityStates
        loading={isLoading}
        error={error?.message}
        onRetry={() => void refetch()}
        empty={data?.items.length === 0}
        emptyTitle="Нет критических отклонений"
        emptyDescription="Все поставки в пределах SLA"
      >
        {data && (
          <Grid container spacing={2}>
            {data.items.map((exc) => (
              <Grid item xs={12} md={6} key={exc.id}>
                <ExceptionCard
                  exception={exc}
                  onClick={() => navigate(`/exceptions/${exc.id}`)}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
