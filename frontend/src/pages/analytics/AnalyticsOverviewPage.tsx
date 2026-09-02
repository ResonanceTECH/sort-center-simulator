import { useNavigate } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { MetricBarChart } from '@/components/charts/MetricBarChart';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/status/KpiCard';
import { SECTION_LABELS } from '@/constants/platformRu';
import { useAnalyticsOverviewQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export function AnalyticsOverviewPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useAnalyticsOverviewQuery();

  return (
    <InternalLayout>
      <PageHeader
        title="Аналитика"
        subtitle="График помогает найти причину, а не просто отображает показатель"
      />

      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {data.kpis.map((k) => (
                <Grid item xs={12} sm={6} key={k.label}>
                  <KpiCard metric={k.metric} onClick={k.link ? () => navigate(k.link!) : undefined} />
                </Grid>
              ))}
            </Grid>

            <KitCard sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.otifTrend}</Typography>
              <MetricBarChart
                data={data.otifTrend}
                onBarClick={(p) => p.drillDownLink && navigate(p.drillDownLink)}
              />
              <Typography variant="caption" sx={{ color: kit.color.muted }}>
                OTIF ↓ → По поставщику → По маршруту → Затронутые поставки
              </Typography>
            </KitCard>

            <KitCard>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.topIssues}</Typography>
              {data.topIssues.map((issue) => (
                <Box
                  key={issue.label}
                  sx={{
                    py: 1.5,
                    borderBottom: kit.border.hairline,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: kit.color.subtle },
                  }}
                  onClick={() => navigate(issue.link)}
                >
                  <Typography variant="body2" fontWeight={600}>{issue.label}</Typography>
                  <Typography variant="body2" sx={{ color: kit.color.ember }}>{issue.value} п.п.</Typography>
                </Box>
              ))}
            </KitCard>
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
