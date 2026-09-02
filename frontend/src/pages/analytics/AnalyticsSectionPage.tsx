import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';
import { MetricBarChart } from '@/components/charts/MetricBarChart';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/status/KpiCard';
import { ANALYTICS_SECTION_TITLES } from '@/constants/platformRu';
import { useAnalyticsSectionQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

interface AnalyticsSectionPageProps {
  section: keyof typeof ANALYTICS_SECTION_TITLES;
}

export function AnalyticsSectionPage({ section }: AnalyticsSectionPageProps) {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useAnalyticsSectionQuery(section);

  return (
    <InternalLayout>
      <PageHeader
        title={ANALYTICS_SECTION_TITLES[section]}
        breadcrumbs={[
          { label: 'Аналитика', to: '/analytics' },
          { label: ANALYTICS_SECTION_TITLES[section] },
        ]}
      />

      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <KitCard sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {data.kpis.map((k) => (
                <KpiCard key={k.label} metric={k.metric} />
              ))}
            </KitCard>

            <KitCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>График: {data.title}</Typography>
              <MetricBarChart
                data={data.chart}
                onBarClick={(p) => p.drillDownLink && navigate(p.drillDownLink)}
              />
              {data.drillDownHint && (
                <Typography variant="caption" sx={{ color: kit.color.muted, mt: 1, display: 'block' }}>
                  {data.drillDownHint}
                </Typography>
              )}
            </KitCard>
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
