import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Grid, Typography } from '@mui/material';
import { EntityStates } from '@/components/common/EntityStates';
import { EntityTabs } from '@/components/common/EntityTabs';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, KPI, TAB_LABELS } from '@/constants/platformRu';
import { useSupplierQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import { SHIPMENT_STATUS_LABELS } from '@/types/stateMachines';

export function SupplierDetailPage() {
  const { supplierId = '' } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { data, isLoading, error, refetch } = useSupplierQuery(supplierId);

  return (
    <InternalLayout>
      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <PageHeader
              title={data.name}
              subtitle={`${data.region} · ${data.productGroup}`}
              breadcrumbs={[
                { label: 'Поставщики', to: '/suppliers' },
                { label: data.name },
              ]}
              actions={
                <KitButton variant="ghost" onClick={() => navigate(`/shipments?supplier=${data.id}`)}>
                  {TAB_LABELS.shipments}
                </KitButton>
              }
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6} sm={3}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{COMMON.risk}</Typography>
                  <StatusChip status={data.risk.status} label={String(data.risk.value)} />
                </KitCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{KPI.otif}</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {data.otif.value}{data.otif.unit}
                  </Typography>
                </KitCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{KPI.supplyShare}</Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {data.supplyShare.value}{data.supplyShare.unit}
                  </Typography>
                </KitCard>
              </Grid>
              <Grid item xs={6} sm={3}>
                <KitCard>
                  <Typography variant="caption" sx={{ color: kit.color.muted }}>{KPI.openIncidents}</Typography>
                  <Typography variant="h6" fontWeight={700}>{data.openIncidents}</Typography>
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
                      <Typography variant="body2"><strong>Телефон:</strong> {data.contactPhone}</Typography>
                      <Typography variant="body2"><strong>Адрес:</strong> {data.address}</Typography>
                    </KitCard>
                  ),
                },
                {
                  id: 'performance',
                  label: TAB_LABELS.performance,
                  content: (
                    <KitCard>
                      {data.slaMetrics.map((m) => (
                        <Box key={m.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                          <Typography variant="body2">{m.label}</Typography>
                          <StatusChip status={m.status} label={`${m.value}${m.unit ?? ''}`} />
                        </Box>
                      ))}
                      <KitButton
                        variant="ghost"
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/shipments?supplier=${data.id}&status=at-risk`)}
                      >
                        Просроченные поставки →
                      </KitButton>
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
                          sx={{ py: 1, borderBottom: kit.border.hairline, cursor: 'pointer' }}
                          onClick={() => navigate(`/shipments/${s.id}`)}
                        >
                          <Typography variant="body2" fontWeight={600}>{s.id}</Typography>
                          <Typography variant="caption" sx={{ color: kit.color.muted }}>{SHIPMENT_STATUS_LABELS[s.status as keyof typeof SHIPMENT_STATUS_LABELS] ?? s.status}</Typography>
                        </Box>
                      ))}
                    </KitCard>
                  ),
                },
                {
                  id: 'products',
                  label: TAB_LABELS.products,
                  content: (
                    <KitCard>
                      {data.products.map((p) => (
                        <Box key={p.sku} sx={{ py: 1, display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">{p.name} ({p.sku})</Typography>
                          <Typography variant="body2">{p.share}%</Typography>
                        </Box>
                      ))}
                    </KitCard>
                  ),
                },
                {
                  id: 'risks',
                  label: TAB_LABELS.risks,
                  content: (
                    <KitCard>
                      {data.risks.map((r) => (
                        <Box key={r.id} sx={{ py: 1.5 }}>
                          <StatusChip status={r.status} label={r.title} />
                          <Typography variant="body2" sx={{ mt: 0.5, color: kit.color.muted }}>{r.description}</Typography>
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
                        <Box
                          key={i.id}
                          sx={{ py: 1, cursor: 'pointer' }}
                          onClick={() => navigate(`/incidents/${i.id}`)}
                        >
                          <Typography variant="body2" fontWeight={600}>{i.title}</Typography>
                          <Typography variant="caption">{i.status}</Typography>
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
