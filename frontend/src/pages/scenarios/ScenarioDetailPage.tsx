import { Box, Grid, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, SECTION_LABELS, labelComparison, labelScenarioCategory } from '@/constants/platformRu';
import { useScenarioQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import { SCENARIO_STATUS_LABELS } from '@/types/stateMachines';

export function ScenarioDetailPage() {
  const { scenarioId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useScenarioQuery(scenarioId);

  return (
    <InternalLayout>
      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <PageHeader
              title={data.name}
              subtitle={SCENARIO_STATUS_LABELS[data.status]}
              breadcrumbs={[
                { label: 'Сценарии', to: '/scenarios' },
                { label: data.id },
              ]}
              actions={
                <>
                  <KitButton variant="ghost" onClick={() => navigate('/scenarios/compare')}>{COMMON.compare}</KitButton>
                  <KitButton variant="primary" onClick={() => navigate('/recommendations')}>Применить рекомендацию</KitButton>
                </>
              }
            />

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.parameters}</Typography>
                  {data.parameters.map((p) => (
                    <Box key={p.label} sx={{ py: 1, borderBottom: kit.border.hairline }}>
                      <Typography variant="caption" sx={{ color: kit.color.muted }}>{labelScenarioCategory(p.category)}</Typography>
                      <Typography variant="body2">{p.label}: {p.change}</Typography>
                    </Box>
                  ))}
                </KitCard>
              </Grid>
              <Grid item xs={12} md={8}>
                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.baselineVsScenario}</Typography>
                  {data.kpis.map((kpi) => (
                    <Box key={kpi.label} sx={{ py: 1.5, borderBottom: kit.border.hairline }}>
                      <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>{kpi.label}</Typography>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Typography variant="body2">Базовый: {kpi.values.baseline}{kpi.unit ?? ''}</Typography>
                        <Typography variant="body2">Сценарий: {kpi.values.scenario}{kpi.unit ?? ''}</Typography>
                        {kpi.semantic?.scenario && (
                          <StatusChip status="WARNING" label={labelComparison(kpi.semantic.scenario)} />
                        )}
                      </Box>
                    </Box>
                  ))}
                </KitCard>
              </Grid>
            </Grid>
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
