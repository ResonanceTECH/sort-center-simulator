import { Box, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { useSupplyPlanQuery, useTransportPlanQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { StatusChip } from '@/components/status/StatusChip';
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
  const supply = useSupplyPlanQuery();
  const transport = useTransportPlanQuery();

  const statusFor = (kind?: 'supply' | 'transport') => {
    if (kind === 'supply') return supply.data?.status;
    if (kind === 'transport') return transport.data?.status;
    return undefined;
  };

  return (
    <InternalLayout>
      <PageHeader
        title="Планирование"
        subtitle="Текущий цикл: demand → supply → inventory → transport"
      />

      <KitCard sx={{ mb: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
          Цикл планирования
        </Typography>
        <Typography variant="body2" sx={{ color: kit.color.muted }}>
          Создайте / пересчитайте планы, отправьте на согласование. Утверждение и активация —
          у Supply Chain Manager.
        </Typography>
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
