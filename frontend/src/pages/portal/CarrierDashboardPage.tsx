import { useMemo } from 'react';
import { Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/common/PageHeader';
import { KpiCard } from '@/components/status/KpiCard';
import { COMMON, KPI, PLATFORM_BRAND, SECTION_LABELS } from '@/constants/platformRu';
import { useAuth } from '@/hooks/useAuth';
import { PortalLayout } from '@/layouts/PortalLayout';
import {
  filterShipmentsByOrganization,
  getPortalIncidents,
  getPortalVehicles,
} from '@/mocks/scm/portalData';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import { SHIPMENT_STATUS_LABELS } from '@/types/stateMachines';

export function CarrierDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const org = user?.organization ?? 'Carrier Vector';

  const shipments = useMemo(() => filterShipmentsByOrganization(org, 'carrier', 50), [org]);
  const awaiting = shipments.filter((s) => s.status === 'ASSIGNED');
  const assignedToday = shipments.filter((s) =>
    ['ASSIGNED', 'ACCEPTED', 'READY_FOR_PICKUP'].includes(s.status),
  );
  const inTransit = shipments.filter((s) => s.status === 'IN_TRANSIT');
  const atRisk = shipments.filter(
    (s) => s.slaRisk.status === 'CRITICAL' || s.slaRisk.status === 'HIGH',
  );
  const incidents = useMemo(() => getPortalIncidents('carrier', org), [org]);
  const vehicles = useMemo(() => getPortalVehicles(org), [org]);
  const trackingIssues = vehicles.filter((v) => v.status === 'WARNING' || v.status === 'CRITICAL').length;
  const otif = Math.max(72, 98 - atRisk.length * 3);
  const etaAccuracy = Math.max(75, 96 - trackingIssues * 4);

  const focusList = [...awaiting, ...inTransit, ...assignedToday]
    .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i)
    .slice(0, 6);

  return (
    <PortalLayout shell="carrier">
      <PageHeader title={PLATFORM_BRAND.carrier} subtitle={`${org} — назначенные перевозки`} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{
              label: 'Ожидают принятия',
              value: awaiting.length,
              status: awaiting.length > 0 ? 'WARNING' : 'SUCCESS',
            }}
            onClick={() => navigate('/carrier/trips')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{ label: 'Назначено сегодня', value: assignedToday.length, status: 'NORMAL' }}
            onClick={() => navigate('/carrier/shipments')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{ label: COMMON.inTransit, value: inTransit.length, status: 'INFO' }}
            onClick={() => navigate('/carrier/trips')}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{
              label: KPI.atRisk,
              value: atRisk.length,
              status: atRisk.length > 0 ? 'HIGH' : 'SUCCESS',
            }}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KpiCard
            metric={{
              label: 'Tracking issues',
              value: trackingIssues,
              status: trackingIssues > 0 ? 'WARNING' : 'NORMAL',
            }}
            onClick={() => navigate('/carrier/vehicles')}
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
              label: KPI.etaAccuracy,
              value: String(etaAccuracy),
              unit: '%',
              status: etaAccuracy < 90 ? 'WARNING' : 'SUCCESS',
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
            onClick={() => navigate('/carrier/incidents')}
          />
        </Grid>
      </Grid>

      <KitCard>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          {SECTION_LABELS.assignedShipments}
        </Typography>
        {focusList.length === 0 && (
          <Typography variant="body2" sx={{ color: kit.color.muted }}>
            Нет назначенных поставок
          </Typography>
        )}
        {focusList.map((s) => (
          <Typography
            key={s.id}
            variant="body2"
            sx={{
              py: 1.5,
              borderBottom: kit.border.hairline,
              cursor: 'pointer',
              '&:hover': { color: kit.color.accent },
            }}
            onClick={() => navigate('/carrier/trips')}
          >
            {s.id} · {SHIPMENT_STATUS_LABELS[s.status] ?? s.status} · {s.origin} → {s.destination}
          </Typography>
        ))}
      </KitCard>
    </PortalLayout>
  );
}
