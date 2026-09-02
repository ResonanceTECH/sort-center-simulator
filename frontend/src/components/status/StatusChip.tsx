import { Box, Chip, Typography } from '@mui/material';
import { labelSemantic, labelSeverity, SEVERITY_LABELS, SEMANTIC_LABELS } from '@/constants/platformRu';
import type { SemanticStatus } from '@/types/scm/semantic';
import { LANDING } from '@/landing/styles/tokens';

function formatChipLabel(label: string | undefined, status: SemanticStatus): string {
  if (!label) return labelSemantic(status);
  if (label in SEMANTIC_LABELS) return labelSemantic(label as SemanticStatus);
  if (label in SEVERITY_LABELS) return labelSeverity(label);
  return label;
}

const STATUS_CONFIG: Record<
  SemanticStatus,
  { color: string; bgcolor: string; label?: string }
> = {
  NORMAL: { color: LANDING.ink, bgcolor: '#e8f5e9' },
  INFO: { color: '#1565c0', bgcolor: '#e3f2fd' },
  WARNING: { color: '#e65100', bgcolor: '#fff3e0' },
  HIGH: { color: '#c62828', bgcolor: '#ffebee' },
  CRITICAL: { color: '#b71c1c', bgcolor: '#ffcdd2' },
  SUCCESS: { color: '#2e7d32', bgcolor: '#e8f5e9' },
  NO_DATA: { color: LANDING.muted, bgcolor: LANDING.paper },
};

export interface StatusChipProps {
  status: SemanticStatus;
  label?: string;
  size?: 'small' | 'medium';
  onClick?: () => void;
}

export function StatusChip({ status, label, size = 'small', onClick }: StatusChipProps) {
  const config = STATUS_CONFIG[status];
  const displayLabel = formatChipLabel(label, status);

  return (
    <Chip
      label={displayLabel}
      size={size}
      onClick={onClick}
      clickable={Boolean(onClick)}
      sx={{
        fontWeight: 600,
        fontSize: '0.6875rem',
        letterSpacing: '0.02em',
        color: config.color,
        bgcolor: config.bgcolor,
        border: 'none',
        height: size === 'small' ? 22 : 28,
      }}
    />
  );
}

export interface MetricDeltaProps {
  from: string | number;
  to: string | number;
  unit?: string;
  status?: SemanticStatus;
}

export function MetricDelta({ from, to, unit = '', status = 'WARNING' }: MetricDeltaProps) {
  const config = STATUS_CONFIG[status];
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
      <Typography component="span" variant="body2" sx={{ color: LANDING.muted }}>
        {from}{unit}
      </Typography>
      <Typography component="span" variant="body2" sx={{ color: LANDING.muted }}>
        →
      </Typography>
      <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: config.color }}>
        {to}{unit}
      </Typography>
    </Box>
  );
}
