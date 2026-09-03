import { Box, Button, Grid, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ActivityTimeline } from '@/components/common/ActivityTimeline';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { ContextualDocsLink } from '@/docs/components/ContextualDocsLink';
import { LiveMapPanel } from '@/components/maps/LiveMapPanel';
import { ExceptionCard } from '@/components/scenarios/ExceptionCard';
import { KpiCard } from '@/components/status/KpiCard';
import { StatusChip } from '@/components/status/StatusChip';
import { useLiveMapData } from '@/hooks/scm/useLiveMapData';
import { useControlTowerQuery, useIncidentsQuery } from '@/hooks/scm/useScmQueries';
import { NAV_LABELS, KPI, COMMON, SECTION_LABELS } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { LANDING } from '@/landing/styles/tokens';
import { kit } from '@/ui-kit/tokens';
import type { MapLayerType } from '@/types/scm/map';
import { INCIDENT_STATUS_LABELS } from '@/types/stateMachines';

const MAP_LAYERS: MapLayerType[] = ['shipments', 'routes', 'hubs', 'warehouses'];

export function ControlTowerPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useControlTowerQuery();
  const liveMap = useLiveMapData();
  const incidents = useIncidentsQuery({ page: 0, pageSize: 5 });

  return (
    <InternalLayout>
      <PageHeader
        title={NAV_LABELS.controlTower}
        subtitle="Что в цепочке требует вашего внимания сейчас?"
        actions={<ContextualDocsLink slug="getting-started/overview" />}
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

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: LANDING.radiusCard, mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Live Network
                    </Typography>
                    <Button size="small" onClick={() => navigate('/map')}>
                      Открыть карту
                    </Button>
                  </Box>
                  <EntityStates
                    loading={liveMap.isLoading}
                    error={liveMap.error?.message}
                    onRetry={() => void liveMap.refetch()}
                  >
                    {liveMap.data && (
                      <LiveMapPanel
                        data={liveMap.data}
                        activeLayers={MAP_LAYERS}
                        height={280}
                        fitToData
                        clustering
                        onMarkerSelect={(m) => {
                          if (m.shipmentId) navigate(`/shipments/${m.shipmentId}`);
                        }}
                      />
                    )}
                  </EntityStates>
                </Paper>

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: LANDING.radiusCard }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                    {SECTION_LABELS.recentActivity}
                  </Typography>
                  <ActivityTimeline items={data.recentActivity} />
                </Paper>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: LANDING.radiusCard, mb: 3 }}>
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

                <Paper variant="outlined" sx={{ p: 2.5, borderRadius: LANDING.radiusCard }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Недавние инциденты
                    </Typography>
                    <Button size="small" onClick={() => navigate('/incidents')}>
                      Все
                    </Button>
                  </Box>
                  <EntityStates
                    loading={incidents.isLoading}
                    error={incidents.error?.message}
                    onRetry={() => void incidents.refetch()}
                    empty={(incidents.data?.items.length ?? 0) === 0}
                    emptyTitle="Нет открытых инцидентов"
                  >
                    {incidents.data?.items.map((inc) => (
                      <Box
                        key={inc.id}
                        sx={{
                          py: 1.25,
                          borderBottom: kit.border.hairline,
                          cursor: 'pointer',
                          '&:hover': { color: kit.color.accent },
                        }}
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {inc.title}
                          </Typography>
                          <StatusChip
                            status={inc.severity}
                            label={INCIDENT_STATUS_LABELS[inc.status] ?? inc.status}
                          />
                        </Box>
                        <Typography variant="caption" sx={{ color: kit.color.muted }}>
                          {inc.shipmentId ?? inc.id}
                        </Typography>
                      </Box>
                    ))}
                  </EntityStates>
                </Paper>
              </Grid>
            </Grid>
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
