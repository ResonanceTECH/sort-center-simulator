import { Box, Drawer, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ShipmentRiskBadge } from '@/components/shipments/ShipmentRiskBadge';
import { BOARD_COLUMN_LABELS, formatDeviation, formatTrackingAge } from '@/components/shipments/boardConstants';
import { COMMON, KPI, SHIPMENT_ACTION_LABELS } from '@/constants/platformRu';
import type { ShipmentAction } from '@/constants/businessActions';
import { KitButton } from '@/ui-kit/Button';
import { kit } from '@/ui-kit/tokens';
import type { ShipmentSummary } from '@/types/scm/shipment';

interface ShipmentQuickViewProps {
  shipment: ShipmentSummary | null;
  actions: ShipmentAction[];
  readOnly?: boolean;
  onClose: () => void;
  onAction?: (shipment: ShipmentSummary, action: ShipmentAction) => void;
}

export function ShipmentQuickView({
  shipment,
  actions,
  readOnly,
  onClose,
  onAction,
}: ShipmentQuickViewProps) {
  const navigate = useNavigate();

  return (
    <Drawer
      anchor="right"
      open={Boolean(shipment)}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 2.5 } }}
    >
      {shipment && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {shipment.id}
            </Typography>
            <ShipmentRiskBadge status={shipment.riskStatus} />
          </Box>
          <Typography variant="body2" sx={{ color: kit.color.muted, mb: 2 }}>
            {BOARD_COLUMN_LABELS[shipment.status]} · {shipment.origin} → {shipment.destination}
          </Typography>

          <Stack spacing={1.25} sx={{ mb: 2.5 }}>
            <Row label="Поставщик" value={shipment.supplierName} />
            <Row label="Перевозчик" value={shipment.carrierName} />
            {shipment.vehiclePlate && <Row label="ТС" value={shipment.vehiclePlate} />}
            <Row label={COMMON.status} value={BOARD_COLUMN_LABELS[shipment.status]} />
            <Row
              label="Planned ETA"
              value={new Date(shipment.plannedEta).toLocaleString('ru-RU')}
            />
            <Row
              label={KPI.forecastEta}
              value={new Date(shipment.forecastEta).toLocaleString('ru-RU')}
            />
            <Row label="Отклонение" value={formatDeviation(shipment.deviationMinutes)} />
            <Row
              label="Tracking"
              value={
                shipment.trackingStatus === 'NO_DATA'
                  ? 'нет данных'
                  : formatTrackingAge(shipment.lastTrackingAt)
              }
            />
            <Row label={KPI.slaRisk} value={`${shipment.slaRisk.value}${shipment.slaRisk.unit ?? ''}`} />
          </Stack>

          {!readOnly && actions.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {actions.slice(0, 4).map((action) => (
                <KitButton
                  key={action}
                  variant="ghost"
                  size="small"
                  onClick={() => onAction?.(shipment, action)}
                >
                  {SHIPMENT_ACTION_LABELS[action] ?? action}
                </KitButton>
              ))}
            </Box>
          )}

          <KitButton
            variant="primary"
            fullWidth
            onClick={() => navigate(`/shipments/${shipment.id}`)}
          >
            Открыть поставку
          </KitButton>
        </>
      )}
    </Drawer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" sx={{ color: kit.color.muted }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {value}
      </Typography>
    </Box>
  );
}
