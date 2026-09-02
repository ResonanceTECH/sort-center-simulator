import { Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/status/KpiCard';
import { KPI, PLATFORM_BRAND, SECTION_LABELS, SHIPMENT_ACTION_LABELS } from '@/constants/platformRu';
import { PortalLayout } from '@/layouts/PortalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

export function SupplierDashboardPage() {
  const navigate = useNavigate();

  return (
    <PortalLayout shell="supplier">
      <PageHeader title={PLATFORM_BRAND.supplier} subtitle="Главная — только данные вашей организации" />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <KpiCard metric={{ label: 'Открытые заказы', value: 12, status: 'NORMAL' }} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard metric={{ label: 'Ожидают подтверждения', value: 3, status: 'WARNING' }} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard metric={{ label: KPI.activeShipments, value: 8, status: 'NORMAL' }} />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard metric={{ label: KPI.otif, value: '84', unit: '%', status: 'WARNING' }} />
        </Grid>
      </Grid>

      <KitCard>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>{SECTION_LABELS.quickActions}</Typography>
        {[
          { label: SHIPMENT_ACTION_LABELS.CONFIRM_READY, to: '/supplier/orders' },
          { label: SHIPMENT_ACTION_LABELS.UPLOAD_DOCUMENTS, to: '/supplier/documents' },
          { label: SHIPMENT_ACTION_LABELS.REPORT_PROBLEM, to: '/supplier/incidents' },
        ].map((a) => (
          <Typography
            key={a.to}
            variant="body2"
            sx={{ py: 1.5, borderBottom: kit.border.hairline, cursor: 'pointer', '&:hover': { color: kit.color.accent } }}
            onClick={() => navigate(a.to)}
          >
            {a.label} →
          </Typography>
        ))}
      </KitCard>
    </PortalLayout>
  );
}
