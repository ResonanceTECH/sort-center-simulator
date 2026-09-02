import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { EntityStates } from '@/components/common/EntityStates';
import { EntityTabs } from '@/components/common/EntityTabs';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, KPI, TAB_LABELS } from '@/constants/platformRu';
import { useCarrierQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export function CarrierDetailPage() {
  const { carrierId = '' } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { data, isLoading, error, refetch } = useCarrierQuery(carrierId);

  return (
    <InternalLayout>
      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <PageHeader
              title={data.name}
              breadcrumbs={[
                { label: 'Перевозчики', to: '/carriers' },
                { label: data.name },
              ]}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{KPI.otif}</Typography>
                  <Typography variant="h6" fontWeight={700}>{data.otif.value}{data.otif.unit}</Typography>
                </KitCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{KPI.etaAccuracy}</Typography>
                  <Typography variant="h6" fontWeight={700}>{data.etaAccuracy.value}{data.etaAccuracy.unit}</Typography>
                </KitCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>ТС</Typography>
                  <Typography variant="h6" fontWeight={700}>{data.vehiclesCount}</Typography>
                </KitCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{COMMON.risk}</Typography>
                  <StatusChip status={data.risk.status} label={String(data.risk.value)} />
                </KitCard>
              </Grid>
            </Grid>

            <EntityTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabs={[
                {
                  id: 'overview',
                  label: TAB_LABELS.overview,
                  content: (
                    <KitCard>
                      <Typography variant="body2"><strong>{COMMON.email}:</strong> {data.contactEmail}</Typography>
                      <Typography variant="body2"><strong>{TAB_LABELS.shipments}:</strong> {data.shipmentCount}</Typography>
                      <Typography variant="body2"><strong>{TAB_LABELS.routes}:</strong> {data.routesCount}</Typography>
                    </KitCard>
                  ),
                },
                {
                  id: 'routes',
                  label: TAB_LABELS.routes,
                  content: (
                    <KitCard>
                      {data.routes.map((r) => (
                        <Box key={r.id} sx={{ py: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{r.name}</Typography>
                          <Typography variant="body2">{r.utilization}% загр. · {r.volume} т</Typography>
                        </Box>
                      ))}
                    </KitCard>
                  ),
                },
                {
                  id: 'shipments',
                  label: TAB_LABELS.shipments,
                  content: (
                    <KitCard>
                      {data.recentShipments.map((s) => (
                        <Box
                          key={s.id}
                          sx={{ py: 1, cursor: 'pointer', borderBottom: kit.border.hairline }}
                          onClick={() => navigate(`/shipments/${s.id}`)}
                        >
                          <Typography variant="body2" fontWeight={600}>{s.id}</Typography>
                        </Box>
                      ))}
                    </KitCard>
                  ),
                },
                {
                  id: 'incidents',
                  label: TAB_LABELS.incidents,
                  content: (
                    <KitCard>
                      {data.incidents.map((i) => (
                        <Box key={i.id} sx={{ py: 1, cursor: 'pointer' }} onClick={() => navigate(`/incidents/${i.id}`)}>
                          <Typography variant="body2" fontWeight={600}>{i.title}</Typography>
                        </Box>
                      ))}
                    </KitCard>
                  ),
                },
              ]}
            />
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
