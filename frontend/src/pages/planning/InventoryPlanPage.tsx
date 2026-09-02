import { Box, Grid, Typography } from '@mui/material';
import { Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { NAV_LABELS, SECTION_LABELS } from '@/constants/platformRu';
import { useInventoryPlanQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export function InventoryPlanPage() {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useInventoryPlanQuery();

  return (
    <InternalLayout>
      <PageHeader title={NAV_LABELS.inventoryPlan} subtitle="Риск дефицита → SKU → Входящие поставки" />

      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <KitCard sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.inventoryLevel}</Typography>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={data.series}>
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: kit.color.muted }} />
                    <YAxis tick={{ fontSize: 12, fill: kit.color.muted }} />
                    <Tooltip />
                    <ReferenceLine y={data.series[0]?.safetyStock} stroke={kit.color.ember} strokeDasharray="4 4" label="Страховой запас" />
                    <Line type="monotone" dataKey="level" stroke={kit.color.obsidian} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </KitCard>

            {data.items.map((item) => (
              <KitCard key={item.sku} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>{item.name}</Typography>
                    <Typography variant="caption" sx={{ color: kit.color.muted }}>{item.sku}</Typography>
                  </Box>
                  <StatusChip status={item.stockoutRisk.status} label={`Дефицит ${item.stockoutRisk.value}${item.stockoutRisk.unit}`} />
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: kit.color.muted }}>Текущий запас</Typography>
                    <Typography variant="body2" fontWeight={600}>{item.currentStock.value}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: kit.color.muted }}>Дней запаса</Typography>
                    <Typography variant="body2" fontWeight={600}>{item.daysOfSupply.value}{item.daysOfSupply.unit}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="caption" sx={{ color: kit.color.muted }}>Входящие</Typography>
                    <Typography variant="body2" fontWeight={600}>{item.incoming.value}</Typography>
                  </Grid>
                </Grid>
                {item.incomingShipments.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>{SECTION_LABELS.incomingShipments}</Typography>
                    {item.incomingShipments.map((s) => (
                      <KitButton
                        key={s.id}
                        variant="ghost"
                        size="small"
                        onClick={() => navigate(`/shipments/${s.id}`)}
                        sx={{ mr: 1, mb: 1 }}
                      >
                        {s.id} · {s.quantity} ед.
                      </KitButton>
                    ))}
                  </Box>
                )}
              </KitCard>
            ))}
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
