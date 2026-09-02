import { Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/status/KpiCard';
import { COMMON, KPI, PLATFORM_BRAND, SECTION_LABELS } from '@/constants/platformRu';
import { PortalLayout } from '@/layouts/PortalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export function CarrierDashboardPage() {
  const navigate = useNavigate();

  return (
    <PortalLayout shell="carrier">
      <PageHeader title={PLATFORM_BRAND.carrier} subtitle="Назначенные поставки и текущие рейсы" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <KpiCard metric={{ label: 'Назначено', value: 6, status: 'NORMAL' }} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard metric={{ label: 'Ожидают принятия', value: 2, status: 'WARNING' }} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard metric={{ label: COMMON.inTransit, value: 4, status: 'INFO' }} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard metric={{ label: KPI.openIncidents, value: 1, status: 'HIGH' }} />
        </Grid>
      </Grid>

      <KitCard>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.assignedShipments}</Typography>
        {['SH-0184 · Принять', 'SH-0201 · В пути', 'SH-0210 · Подтвердить забор'].map((s) => (
          <Typography
            key={s}
            variant="body2"
            sx={{ py: 1.5, borderBottom: kit.border.hairline, cursor: 'pointer' }}
            onClick={() => navigate('/carrier/trips')}
          >
            {s}
          </Typography>
        ))}
      </KitCard>
    </PortalLayout>
  );
}
