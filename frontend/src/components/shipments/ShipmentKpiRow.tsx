import { Grid, Skeleton } from '@mui/material';
import { KpiCard } from '@/components/status/KpiCard';
import type { ShipmentOpsKpis } from '@/types/scm/shipment';

export type OpsKpiKey = keyof ShipmentOpsKpis;

interface ShipmentKpiRowProps {
  kpis?: ShipmentOpsKpis;
  loading?: boolean;
  onSelect?: (key: OpsKpiKey) => void;
}

const ORDER: OpsKpiKey[] = ['active', 'atRisk', 'delayed', 'noTracking', 'avgDeviation', 'otifToday'];

export function ShipmentKpiRow({ kpis, loading, onSelect }: ShipmentKpiRowProps) {
  if (loading || !kpis) {
    return (
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {ORDER.map((key) => (
          <Grid item xs={6} sm={4} md={2} key={key}>
            <Skeleton variant="rounded" height={88} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={1.5} sx={{ mb: 2 }}>
      {ORDER.map((key) => (
        <Grid item xs={6} sm={4} md={2} key={key}>
          <KpiCard metric={kpis[key]} onClick={onSelect ? () => onSelect(key) : undefined} />
        </Grid>
      ))}
    </Grid>
  );
}
