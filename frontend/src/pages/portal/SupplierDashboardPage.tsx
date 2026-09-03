import { useMemo } from 'react';
import { Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/status/KpiCard';
import { KPI, PLATFORM_BRAND, SECTION_LABELS, SHIPMENT_ACTION_LABELS } from '@/constants/platformRu';
import { useAuth } from '@/hooks/useAuth';
import { PortalLayout } from '@/layouts/PortalLayout';
import {
  filterShipmentsByOrganization,
  getPortalIncidents,
} from '@/mocks/scm/portalData';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';

/** Matches pending rows in SupplierOrdersPage ORDERS_MOCK. */
const ORDERS_AWAITING_CONFIRM = 2;

export function SupplierDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const org = user?.organization ?? 'Supplier Alpha';

  const shipments = useMemo(() => filterShipmentsByOrganization(org, 'supplier', 50), [org]);
  const active = shipments.filter((s) => !['DELIVERED', 'CANCELLED'].includes(s.status));
  const awaitingReady = shipments.filter((s) =>
    ['PLANNED', 'ASSIGNED', 'ACCEPTED'].includes(s.status),
  );
  const incidents = useMemo(() => getPortalIncidents('supplier', org), [org]);
  const todayReady = shipments.filter((s) => s.status === 'READY_FOR_PICKUP').length;
  const otif = Math.max(
    70,
    100 - Math.round(active.filter((s) => s.slaRisk.status === 'CRITICAL').length * 4),
  );

  return (
    <PortalLayout shell="supplier">
      <PageHeader
        title={PLATFORM_BRAND.supplier}
        subtitle={`${org} — только данные вашей организации`}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{ label: 'Открытые заказы', value: ORDERS_AWAITING_CONFIRM + 1, status: 'NORMAL' }}
            onClick={() => navigate('/supplier/orders')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{
              label: 'Ожидают подтверждения',
              value: ORDERS_AWAITING_CONFIRM,
              status: 'WARNING',
            }}
            onClick={() => navigate('/supplier/orders')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{ label: 'Поставки сегодня', value: todayReady, status: 'INFO' }}
            onClick={() => navigate('/supplier/shipments')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{ label: KPI.activeShipments, value: active.length, status: 'NORMAL' }}
            onClick={() => navigate('/supplier/shipments')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{
              label: 'Готовность к отгрузке',
              value: awaitingReady.length,
              status: awaitingReady.length > 0 ? 'WARNING' : 'NORMAL',
            }}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{
              label: KPI.otif,
              value: String(otif),
              unit: '%',
              status: otif < 90 ? 'WARNING' : 'SUCCESS',
            }}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{
              label: KPI.openIncidents,
              value: incidents.length,
              status: incidents.length > 0 ? 'HIGH' : 'SUCCESS',
            }}
            onClick={() => navigate('/supplier/incidents')}
          />
        </Grid>
      </Grid>

      <KitCard>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {SECTION_LABELS.quickActions}
        </Typography>
        {[
          { label: SHIPMENT_ACTION_LABELS.CONFIRM_READY, to: '/supplier/orders' },
          { label: SHIPMENT_ACTION_LABELS.UPLOAD_DOCUMENTS, to: '/supplier/documents' },
          { label: SHIPMENT_ACTION_LABELS.REPORT_PROBLEM, to: '/supplier/incidents' },
        ].map((a) => (
          <Typography
            key={a.to}
            variant="body2"
            sx={{
              py: 1.5,
              borderBottom: kit.border.hairline,
              cursor: 'pointer',
              '&:hover': { color: kit.color.accent },
            }}
            onClick={() => navigate(a.to)}
          >
            {a.label} →
          </Typography>
        ))}
      </KitCard>
    </PortalLayout>
  );
}
