import { Box, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/status/KpiCard';
import { StatusChip } from '@/components/status/StatusChip';
import {
  useDemandForecastQuery,
  useInventoryPlanQuery,
  useSupplyPlanQuery,
  useTransportPlanQuery,
} from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import { PLAN_STATUS_LABELS } from '@/types/stateMachines';

const SECTIONS = [
  {
    title: 'Прогноз спроса',
    path: '/planning/demand',
    description: 'История, forecast, anomalies, versions',
  },
  {
    title: 'План поставок',
    path: '/planning/supply',
    description: 'Allocation, capacity, submit / approve',
    planKind: 'supply' as const,
  },
  {
    title: 'План запасов',
    path: '/planning/inventory',
    description: 'Safety stock, days of supply, stockout',
    planKind: 'inventory' as const,
  },
  {
    title: 'Транспортный план',
    path: '/planning/transport',
    description: 'Lanes, capacity, carrier allocation',
    planKind: 'transport' as const,
  },
  {
    title: 'План / Факт',
    path: '/planning/plan-fact',
    description: 'OTIF, volume, lead time, deviations',
  },
];

export function PlanningOverviewPage() {
  const navigate = useNavigate();
  const demand = useDemandForecastQuery();
  const supply = useSupplyPlanQuery();
  const inventory = useInventoryPlanQuery();
  const transport = useTransportPlanQuery();

  const demandGap =
    supply.data && typeof supply.data.requiredSupply.value === 'number' && typeof supply.data.demand.value === 'number'
      ? supply.data.requiredSupply.value - supply.data.demand.value
      : null;

  const inventoryRisk = inventory.data?.items.filter(
    (i) => i.stockoutRisk.status === 'HIGH' || i.stockoutRisk.status === 'CRITICAL',
  ).length;

  const transportDeficit = transport.data?.lanes.find((l) => (l.deficit?.value as number) > 0)?.deficit;

  const needsApproval =
    [supply.data?.status, transport.data?.status].filter((s) => s === 'REVIEW' || s === 'CALCULATED')
      .length;

  const statusFor = (kind?: 'supply' | 'transport' | 'inventory') => {
    if (kind === 'supply') return supply.data?.status;
    if (kind === 'transport') return transport.data?.status;
    if (kind === 'inventory') return inventory.data?.status;
    return undefined;
  };

  return (
    <InternalLayout>
      <PageHeader
        title="Планирование"
        subtitle={`Цикл ${demand.data?.period ?? '—'} · версия прогноза ${demand.data?.version ?? '—'}`}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={4} md={2}>
          <KpiCard
            metric={{
              label: 'Прогноз',
              value: demand.data?.version ?? '—',
              status: demand.data?.trend === 'UP' ? 'WARNING' : 'NORMAL',
            }}
            onClick={() => navigate('/planning/demand')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <KpiCard
            metric={{
              label: 'Demand Gap',
              value: demandGap != null ? Math.abs(demandGap) : '—',
              status: demandGap != null && demandGap > 0 ? 'WARNING' : 'NORMAL',
            }}
            onClick={() => navigate('/planning/supply')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <KpiCard
            metric={{
              label: 'Supply Gap',
              value: supply.data?.violations.length ?? 0,
              status: (supply.data?.violations.length ?? 0) > 0 ? 'HIGH' : 'SUCCESS',
            }}
            onClick={() => navigate('/planning/supply')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <KpiCard
            metric={{
              label: 'Inventory Risk',
              value: inventoryRisk ?? 0,
              status: (inventoryRisk ?? 0) > 0 ? 'HIGH' : 'NORMAL',
            }}
            onClick={() => navigate('/planning/inventory')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <KpiCard
            metric={{
              label: 'Транспорт',
              value: transportDeficit?.value ?? 'OK',
              unit: typeof transportDeficit?.value === 'number' ? ' т' : undefined,
              status: transportDeficit ? 'CRITICAL' : 'SUCCESS',
            }}
            onClick={() => navigate('/planning/transport')}
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <KpiCard
            metric={{
              label: 'На утверждение',
              value: needsApproval,
              status: needsApproval > 0 ? 'WARNING' : 'NORMAL',
            }}
            onClick={() => navigate('/planning/supply')}
          />
        </Grid>
      </Grid>

      <KitCard sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Текущий цикл планирования
        </Typography>
        <Typography variant="body2" sx={{ color: kit.color.muted }}>
          {demand.data?.seasonality ?? 'Demand → Supply → Inventory → Transport'}. Последний пересчёт:{' '}
          {demand.data?.lastCalculated
            ? new Date(demand.data.lastCalculated).toLocaleString('ru-RU')
            : '—'}
          . Утверждение и активация — у Supply Chain Manager.
        </Typography>
        {demand.data?.anomalies?.[0] && (
          <Typography variant="caption" sx={{ color: kit.color.muted, display: 'block', mt: 1 }}>
            Аномалия: {demand.data.anomalies[0].description}
          </Typography>
        )}
      </KitCard>

      <Grid container spacing={2}>
        {SECTIONS.map((section) => {
          const status = statusFor(section.planKind);
          return (
            <Grid item xs={12} md={6} key={section.path}>
              <KitCard
                sx={{ cursor: 'pointer', '&:hover': { borderColor: kit.color.iron } }}
                onClick={() => navigate(section.path)}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h6" fontWeight={700}>
                    {section.title}
                  </Typography>
                  {status && (
                    <StatusChip status="INFO" label={PLAN_STATUS_LABELS[status] ?? status} />
                  )}
                </Box>
                <Typography variant="body2" sx={{ color: kit.color.muted }}>
                  {section.description}
                </Typography>
              </KitCard>
            </Grid>
          );
        })}
      </Grid>
    </InternalLayout>
  );
}
