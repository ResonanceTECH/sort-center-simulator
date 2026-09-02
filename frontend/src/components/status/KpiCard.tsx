import { Box, Skeleton, Typography } from '@mui/material';
import { StatusChip } from '@/components/status/StatusChip';
import type { MetricValue } from '@/types/scm/metric';
import { LANDING } from '@/landing/styles/tokens';

export interface KpiCardProps {
  metric: MetricValue;
  onClick?: () => void;
  loading?: boolean;
}

export function KpiCard({ metric, onClick, loading }: KpiCardProps) {
  if (loading) {
    return (
      <Box
        sx={{
          p: 2.5,
          borderRadius: LANDING.radiusCard,
          bgcolor: LANDING.snow,
          border: `1px solid ${LANDING.border}`,
        }}
      >
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={36} sx={{ mt: 1 }} />
      </Box>
    );
  }

  return (
    <Box
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick();
            }
          : undefined
      }
      sx={{
        p: 2.5,
        borderRadius: LANDING.radiusCard,
        bgcolor: LANDING.snow,
        border: `1px solid ${LANDING.border}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        '&:hover': onClick
          ? { borderColor: LANDING.ember, boxShadow: LANDING.shadowPrimary }
          : undefined,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="caption" sx={{ color: LANDING.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {metric.label}
        </Typography>
        <StatusChip status={metric.status} />
      </Box>
      <Typography variant="h4" sx={{ fontWeight: 700, color: LANDING.ink, letterSpacing: '-0.02em' }}>
        {metric.value}{metric.unit ?? ''}
      </Typography>
      {metric.delta != null && (
        <Typography variant="caption" sx={{ color: LANDING.muted, mt: 0.5, display: 'block' }}>
          {metric.delta > 0 ? '+' : ''}{metric.delta}{metric.deltaUnit ?? ''}
          {metric.reason ? ` · ${metric.reason}` : ''}
        </Typography>
      )}
    </Box>
  );
}
