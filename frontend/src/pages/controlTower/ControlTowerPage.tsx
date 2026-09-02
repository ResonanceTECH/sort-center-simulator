import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ActivityTimeline } from '@/components/common/ActivityTimeline';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { ExceptionCard } from '@/components/scenarios/ExceptionCard';
import { KpiCard } from '@/components/status/KpiCard';
import { useControlTowerQuery } from '@/hooks/scm/useScmQueries';
import { NAV_LABELS, KPI, COMMON, SECTION_LABELS } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { LANDING } from '@/landing/styles/tokens';

export function ControlTowerPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useControlTowerQuery();

  return (
    <InternalLayout>
      <PageHeader
        title={NAV_LABELS.controlTower}
        subtitle="Что в цепочке требует вашего внимания сейчас?"
      />

      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {data.kpis.map((kpi) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={kpi.label}>
                  <KpiCard
                    metric={kpi}
                    onClick={
                      kpi.label === KPI.atRisk
                        ? () => navigate('/exceptions?severity=CRITICAL')
                        : kpi.label === KPI.delayed
                          ? () => navigate('/shipments?status=at-risk')
                          : undefined
                    }
                  />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={7}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: LANDING.radiusCard, mb: 3 }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {SECTION_LABELS.requiresAttention}
                    </Typography>
                    <Button size="small" onClick={() => navigate('/exceptions')}>
                      {COMMON.allExceptions}
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {data.requiresAttention.map((exc) => (
                      <ExceptionCard
                        key={exc.id}
                        exception={exc}
                        onClick={() => navigate(`/exceptions/${exc.id}`)}
                      />
                    ))}
                  </Box>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: LANDING.radiusCard }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    {SECTION_LABELS.recentActivity}
                  </Typography>
                  <ActivityTimeline items={data.recentActivity} />
                </Paper>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: LANDING.radiusCard }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    {SECTION_LABELS.insights}
                  </Typography>
                  {data.insights.map((insight) => (
                    <Box
                      key={insight.id}
                      sx={{
                        p: 1.5,
                        mb: 1.5,
                        borderRadius: LANDING.radiusButton,
                        bgcolor: LANDING.paper,
                        cursor: insight.link ? 'pointer' : 'default',
                      }}
                      onClick={insight.link ? () => navigate(insight.link!) : undefined}
                    >
                      <Typography variant="subtitle2" fontWeight={700}>
                        {insight.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: LANDING.muted }}>
                        {insight.description}
                      </Typography>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
