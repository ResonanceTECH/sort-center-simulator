import { Box, IconButton, Menu, MenuItem, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import LocalShippingOutlined from '@mui/icons-material/LocalShippingOutlined';
import { useState, type MouseEvent } from 'react';
import { ShipmentRiskBadge } from '@/components/shipments/ShipmentRiskBadge';
import { formatDeviation, formatTrackingAge } from '@/components/shipments/boardConstants';
import { SHIPMENT_ACTION_LABELS } from '@/constants/platformRu';
import type { ShipmentAction } from '@/constants/businessActions';
import { kit } from '@/ui-kit/tokens';
import type { ShipmentSummary } from '@/types/scm/shipment';

interface ShipmentBoardCardProps {
  shipment: ShipmentSummary;
  actions: ShipmentAction[];
  readOnly?: boolean;
  onOpen: (shipment: ShipmentSummary) => void;
  onAction?: (shipment: ShipmentSummary, action: ShipmentAction) => void;
}

export function ShipmentBoardCard({
  shipment,
  actions,
  readOnly,
  onOpen,
  onAction,
}: ShipmentBoardCardProps) {
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const riskAccent =
    shipment.riskStatus === 'CRITICAL'
      ? kit.color.accent
      : shipment.riskStatus === 'HIGH'
        ? '#c62828'
        : shipment.riskStatus === 'WARNING'
          ? '#e65100'
          : kit.color.border;

  const openMenu = (e: MouseEvent) => {
    e.stopPropagation();
    setAnchor(e.currentTarget as HTMLElement);
  };

  return (
    <Box
      onClick={() => onOpen(shipment)}
      sx={{
        p: 1.25,
        borderRadius: kit.radius.button,
        bgcolor: kit.color.card,
        border: `1px solid ${kit.color.border}`,
        borderLeft: `3px solid ${riskAccent}`,
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 0.12s ease, box-shadow 0.12s ease',
        '&:hover': {
          borderColor: kit.color.iron,
          boxShadow: '0 1px 4px rgba(9,9,11,0.08)',
          '& .card-actions': { opacity: 1 },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5, mb: 0.5 }}>
        <Typography variant="subtitle2" fontWeight={700} fontSize="0.8125rem">
          {shipment.id}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
          <ShipmentRiskBadge status={shipment.riskStatus} />
          {!readOnly && actions.length > 0 && (
            <IconButton
              className="card-actions"
              size="small"
              onClick={openMenu}
              sx={{ opacity: { xs: 1, md: 0 }, p: 0.25 }}
            >
              <MoreVertIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}
        </Box>
      </Box>

      <Typography variant="caption" sx={{ color: kit.color.muted, display: 'block' }}>
        {shipment.supplierName}
      </Typography>
      <Typography variant="caption" fontWeight={600} sx={{ display: 'block', mb: 0.75 }}>
        {shipment.origin} → {shipment.destination}
      </Typography>

      <ProgressBar progress={shipment.progress} inTransit={shipment.status === 'IN_TRANSIT'} />

      <Typography variant="caption" sx={{ color: kit.color.muted, display: 'block', mt: 0.75 }}>
        {shipment.carrierName}
        {shipment.vehiclePlate ? ` · ${shipment.vehiclePlate}` : ''}
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75, gap: 1 }}>
        <Box>
          <Typography variant="caption" sx={{ color: kit.color.muted, display: 'block', fontSize: '0.65rem' }}>
            Plan
          </Typography>
          <Typography variant="caption" fontWeight={600}>
            {formatTime(shipment.plannedEta)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" sx={{ color: kit.color.muted, display: 'block', fontSize: '0.65rem' }}>
            Forecast
          </Typography>
          <Typography variant="caption" fontWeight={600}>
            {formatTime(shipment.forecastEta)}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography
          variant="caption"
          sx={{
            color: shipment.deviationMinutes >= 30 ? kit.color.accent : kit.color.muted,
            fontWeight: shipment.deviationMinutes >= 30 ? 700 : 400,
          }}
        >
          {formatDeviation(shipment.deviationMinutes)}
        </Typography>
        <Typography variant="caption" sx={{ color: kit.color.muted }}>
          {shipment.trackingStatus === 'NO_DATA' ? 'нет tracking' : formatTrackingAge(shipment.lastTrackingAt)}
        </Typography>
      </Box>

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        onClick={(e) => e.stopPropagation()}
      >
        {actions.map((action) => (
          <MenuItem
            key={action}
            dense
            onClick={() => {
              setAnchor(null);
              onAction?.(shipment, action);
            }}
          >
            {SHIPMENT_ACTION_LABELS[action] ?? action}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

function ProgressBar({ progress, inTransit }: { progress: number; inTransit: boolean }) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <Box sx={{ position: 'relative', height: 10, my: 0.5 }}>
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: 2,
          bgcolor: kit.color.cloud,
          transform: 'translateY(-50%)',
          borderRadius: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          width: `${pct}%`,
          top: '50%',
          height: 2,
          bgcolor: kit.color.obsidian,
          transform: 'translateY(-50%)',
          borderRadius: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: `calc(${pct}% - 8px)`,
          top: '50%',
          transform: 'translateY(-50%)',
          color: kit.color.obsidian,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {inTransit ? (
          <LocalShippingOutlined sx={{ fontSize: 14 }} />
        ) : (
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: kit.color.obsidian }} />
        )}
      </Box>
    </Box>
  );
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}
