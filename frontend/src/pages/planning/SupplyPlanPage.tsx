import { Box, Grid, LinearProgress, Typography } from '@mui/material';
import { EntityStates } from '@/components/common/EntityStates';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/status/KpiCard';
import { StatusChip } from '@/components/status/StatusChip';
import { NAV_LABELS, SECTION_LABELS } from '@/constants/platformRu';
import { useSupplyPlanQuery } from '@/hooks/scm/useScmQueries';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitButton } from '@/ui-kit/Button';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export function SupplyPlanPage() {
  const { data, isLoading, error, refetch } = useSupplyPlanQuery();

  return (
    <InternalLayout>
      <PageHeader
        title={NAV_LABELS.supplyPlan}
        subtitle="Спрос → Требуемые поставки → Распределение по поставщикам"
        actions={
          <>
            <KitButton variant="ghost">Сохранить черновик</KitButton>
            <KitButton variant="primary">Отправить на согласование</KitButton>
          </>
        }
      />

      <EntityStates loading={isLoading} error={error?.message} onRetry={() => void refetch()}>
        {data && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <KpiCard metric={data.demand} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <KpiCard metric={data.requiredSupply} />
              </Grid>
            </Grid>

            <KitCard sx={{ mb: 2 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.supplierAllocation}</Typography>
              {data.allocations.map((a) => (
                <Box key={a.supplierId} sx={{ py: 1.5, borderBottom: kit.border.hairline }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" fontWeight={600}>{a.supplierName}</Typography>
                    <Typography variant="body2">{a.allocated.toLocaleString('ru-RU')}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={a.utilization}
                    sx={{ height: 6, borderRadius: 3, mb: 0.5 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: kit.color.muted }}>
                      Мощность: {a.capacity.toLocaleString('ru-RU')} · {a.utilization}%
                    </Typography>
                    <StatusChip status={a.status} label={a.utilization > 90 ? 'Близко к лимиту' : 'OK'} />
                  </Box>
                </Box>
              ))}
            </KitCard>

            {data.violations.length > 0 && (
              <KitCard>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{SECTION_LABELS.constraintViolations}</Typography>
                {data.violations.map((v) => (
                  <StatusChip key={v.message} status={v.status} label={v.message} />
                ))}
              </KitCard>
            )}
          </>
        )}
      </EntityStates>
    </InternalLayout>
  );
}
