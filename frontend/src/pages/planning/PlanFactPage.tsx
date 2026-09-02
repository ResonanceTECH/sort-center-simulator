import { Box, Grid, Typography } from '@mui/material';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { usePlanFactQuery } from '@/hooks/scm/useScmQueries';
import { NAV_LABELS, labelComparison } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export function PlanFactPage() {
  const { data, isLoading, error, refetch } = usePlanFactQuery();

  return (
    <InternalLayout>
      <PageHeader title={NAV_LABELS.planFact} subtitle={`Период: ${data?.period ?? '—'}`} />

      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <Grid container spacing={2}>
            {data.metrics.map((m) => (
              <Grid item xs={12} md={6} key={m.label}>
                <KitCard>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{m.label}</Typography>
                  <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: kit.color.muted }}>План</Typography>
                      <Typography variant="h5" fontWeight={700}>{m.values.plan}{m.unit ?? ''}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: kit.color.muted }}>Факт</Typography>
                      <Typography variant="h5" fontWeight={700}>{m.values.fact}{m.unit ?? ''}</Typography>
                    </Box>
                  </Box>
                  {m.semantic?.fact && (
                    <StatusChip status="WARNING" label={labelComparison(m.semantic.fact)} />
                  )}
                  {m.drillDown && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Причины отклонения</Typography>
                      {m.drillDown.map((d) => (
                        <Box key={d.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                          <Typography variant="body2">{d.label}</Typography>
                          <Typography variant="body2" sx={{ color: kit.color.ember }}>{d.delta} п.п.</Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </KitCard>
              </Grid>
            ))}
          </Grid>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
