import { Box, LinearProgress, Stack, Typography } from '@mui/material';
import { OZON } from '@/theme';

const previewBoxSx = {
  height: '100%',
  p: 2.5,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
} as const;

export function MonitorPreview() {
  return (
    <Box sx={{ height: '100%', bgcolor: '#fff' }}>
      <Box
        component="img"
        src="/images/project-plan-1.svg"
        alt=""
        sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
      />
    </Box>
  );
}

export function PredictPreview() {
  const stats = [
    { label: 'Forecast demand', value: '108 700' },
    { label: 'Growth vs prev.', value: '+6.3%' },
    { label: 'Forecast accuracy', value: '92.1%' },
    { label: 'Required supply', value: '112 000' },
  ];

  return (
    <Box sx={previewBoxSx}>
      {stats.map((stat) => (
        <Box
          key={stat.label}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1.5,
            borderRadius: '12px',
            border: '1px solid #ececee',
            bgcolor: '#fff',
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', color: 'rgba(0,26,52,0.64)' }}>{stat.label}</Typography>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: OZON.darkSpace }}>{stat.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export function DetectPreview() {
  const shipments = [
    { id: 'SH-1842', status: 'CRITICAL', detail: 'ETA +4 h' },
    { id: 'SH-1931', status: 'HIGH', detail: 'Risk 82%' },
    { id: 'SH-2017', status: 'HIGH', detail: 'SLA 76%' },
  ];

  return (
    <Box sx={{ ...previewBoxSx, justifyContent: 'space-between' }}>
      <Box
        component="img"
        src="/images/project-plan-3.svg"
        alt=""
        sx={{ width: '100%', flex: 1, objectFit: 'cover', objectPosition: 'top center', borderRadius: '12px', border: '1px solid #ececee' }}
      />
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between">
          <Typography sx={{ fontSize: '0.8125rem', color: 'rgba(0,26,52,0.64)' }}>Requires attention</Typography>
          <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: OZON.blue }}>17</Typography>
        </Stack>
        <LinearProgress variant="determinate" value={11} sx={{ height: 6, borderRadius: 3 }} />
        <Stack spacing={0.75}>
          {shipments.map((shipment) => (
            <Stack key={shipment.id} direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: OZON.darkSpace }}>{shipment.id}</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: 'rgba(0,26,52,0.64)' }}>
                {shipment.status} · {shipment.detail}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

function loadBar(label: string, value: number, critical?: boolean) {
  return (
    <Box key={label}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
        <Typography sx={{ fontSize: '0.875rem', color: OZON.darkSpace }}>{label}</Typography>
        <Typography
          sx={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: critical ? OZON.darkSpace : OZON.blue,
          }}
        >
          {value}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 8,
          borderRadius: 4,
          bgcolor: 'rgba(0,26,52,0.08)',
          '& .MuiLinearProgress-bar': {
            bgcolor: critical ? OZON.darkSpace : value >= 80 ? OZON.morningBlue : OZON.blue,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );
}

export function AnalyzePreview() {
  return (
    <Box sx={previewBoxSx}>
      {loadBar('SLA breach probability', 87, true)}
      {loadBar('Stockout risk (SKU A-142)', 74, true)}
      {loadBar('Affected customer orders', 62)}
      {loadBar('Inventory vs safety stock', 38)}
    </Box>
  );
}

export function SimulatePreview() {
  const rows = [
    { label: 'Supplier B capacity −40%', value: 'Stockout 31%' },
    { label: 'Route Moscow → SPB closed', value: 'OTIF 79%' },
    { label: 'Demand +25%', value: 'Capacity 105%' },
  ];

  return (
    <Box sx={previewBoxSx}>
      {rows.map((row) => (
        <Box
          key={row.label}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2,
            py: 1.75,
            borderRadius: '12px',
            border: '1px solid #ececee',
            bgcolor: '#fff',
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', color: 'rgba(0,26,52,0.64)' }}>{row.label}</Typography>
          <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: OZON.darkSpace }}>{row.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export function DecidePreview() {
  const rows = [
    { label: 'Base', otif: '92%', cost: '12.4 M', stockout: '7%' },
    { label: 'Scenario A', otif: '79%', cost: '13.1 M', stockout: '31%' },
    { label: 'Scenario B', otif: '91%', cost: '12.9 M', stockout: '9%', highlight: true },
  ];

  return (
    <Box sx={previewBoxSx}>
      {rows.map((row) => (
        <Box
          key={row.label}
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: '12px',
            border: `1px solid ${row.highlight ? OZON.blue : '#ececee'}`,
            bgcolor: row.highlight ? 'rgba(0,91,255,0.06)' : '#fff',
          }}
        >
          <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: OZON.darkSpace, mb: 0.75 }}>
            {row.label}
          </Typography>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(0,26,52,0.64)' }}>OTIF {row.otif}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(0,26,52,0.64)' }}>Cost {row.cost}</Typography>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(0,26,52,0.64)' }}>Stockout {row.stockout}</Typography>
          </Stack>
        </Box>
      ))}
    </Box>
  );
}

export function ReplanPreview() {
  const metrics = [
    { label: 'Allocation Supplier B', value: '35% → 20%' },
    { label: 'Carrier risk', value: 'MEDIUM → HIGH' },
    { label: 'Projected OTIF', value: '89% → 94%' },
    { label: 'Рекомендация', value: 'Scenario B', success: true },
  ];

  return (
    <Box sx={{ ...previewBoxSx, justifyContent: 'center' }}>
      <Typography sx={{ fontSize: '1rem', fontWeight: 600, color: OZON.darkSpace, mb: 1 }}>
        Replan
      </Typography>
      <Stack spacing={1.25}>
        {metrics.map((metric) => (
          <Stack key={metric.label} direction="row" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: '0.875rem', color: 'rgba(0,26,52,0.64)' }}>{metric.label}</Typography>
            <Typography
              sx={{
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: metric.success ? OZON.morningBlue : OZON.darkSpace,
              }}
            >
              {metric.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

/** @deprecated Use renamed previews from workflow scroll */
export const EditorPreview = MonitorPreview;
export const ParametersPreview = PredictPreview;
export const SimulationPreview = DetectPreview;
export const BottlenecksPreview = AnalyzePreview;
export const ComparePreview = SimulatePreview;
export const RecommendationPreview = ReplanPreview;
