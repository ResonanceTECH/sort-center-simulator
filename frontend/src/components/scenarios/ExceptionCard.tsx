import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { labelExceptionType } from '@/constants/platformRu';
import { StatusChip } from '@/components/status/StatusChip';
import type { ExceptionSummary } from '@/types/scm/exception';
import { LANDING } from '@/landing/styles/tokens';

export interface ExceptionCardProps {
  exception: ExceptionSummary;
  onClick?: () => void;
}

export function ExceptionCard({ exception, onClick }: ExceptionCardProps) {
  return (
    <Box
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      sx={{
        p: 2,
        borderRadius: LANDING.radiusCard,
        bgcolor: LANDING.snow,
        border: `1px solid ${LANDING.border}`,
        borderLeft: `4px solid ${
          exception.severity === 'CRITICAL'
            ? '#b71c1c'
            : exception.severity === 'HIGH'
              ? '#e65100'
              : LANDING.border
        }`,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { borderColor: LANDING.ember } : undefined,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Box>
          <Typography variant="subtitle2" fontWeight={700}>
            {exception.shipmentId}
          </Typography>
          <Typography variant="caption" sx={{ color: LANDING.muted }}>
            {exception.route}
          </Typography>
        </Box>
        <StatusChip status={exception.severityStatus} label={exception.severity} />
      </Box>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {labelExceptionType(exception.type)}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ color: LANDING.muted }}>
          Отклонение: {exception.deviation}
        </Typography>
        <Typography variant="caption" sx={{ color: LANDING.muted }}>
          Влияние: {exception.impact.value}{exception.impact.unit ?? ''}
        </Typography>
        <Typography variant="caption" sx={{ color: LANDING.muted }}>
          {exception.owner}
        </Typography>
      </Box>
      <Typography
        component={RouterLink}
        to={`/shipments/${exception.shipmentId}`}
        variant="caption"
        onClick={(e) => e.stopPropagation()}
        sx={{ color: LANDING.ember, display: 'inline-block', mt: 1, textDecoration: 'none' }}
      >
        Открыть поставку →
      </Typography>
    </Box>
  );
}
