import { Box, Typography } from '@mui/material';
import { ShipmentBoardCard } from '@/components/shipments/ShipmentBoardCard';
import { kit } from '@/ui-kit/tokens';
import type { ShipmentAction } from '@/constants/businessActions';
import type { ShipmentSummary } from '@/types/scm/shipment';

interface ShipmentBoardColumnProps {
  title: string;
  items: ShipmentSummary[];
  readOnly?: boolean;
  resolveActions: (shipment: ShipmentSummary) => ShipmentAction[];
  onOpen: (shipment: ShipmentSummary) => void;
  onAction?: (shipment: ShipmentSummary, action: ShipmentAction) => void;
}

export function ShipmentBoardColumn({
  title,
  items,
  readOnly,
  resolveActions,
  onOpen,
  onAction,
}: ShipmentBoardColumnProps) {
  return (
    <Box
      sx={{
        minWidth: { xs: 200, md: 220, lg: 240 },
        maxWidth: 260,
        flex: '0 0 auto',
        width: { xs: 200, md: 220, lg: 240 },
        bgcolor: kit.color.paper,
        borderRadius: kit.radius.panel,
        border: kit.border.hairline,
        p: 1,
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'calc(100vh - 320px)',
        minHeight: 360,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 0.5, mb: 1, flexShrink: 0 }}>
        <Typography variant="caption" fontWeight={700}>
          {title}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: kit.color.muted,
            bgcolor: kit.color.cloud,
            px: 0.75,
            borderRadius: kit.radius.badge,
            fontWeight: 600,
          }}
        >
          {items.length}
        </Typography>
      </Box>

      <Box sx={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1, flex: 1, pr: 0.25 }}>
        {items.length === 0 ? (
          <Typography variant="caption" sx={{ color: kit.color.muted, px: 0.5, py: 2 }}>
            Нет поставок на этом этапе
          </Typography>
        ) : (
          items.map((shipment) => (
            <ShipmentBoardCard
              key={shipment.id}
              shipment={shipment}
              actions={resolveActions(shipment)}
              readOnly={readOnly}
              onOpen={onOpen}
              onAction={onAction}
            />
          ))
        )}
      </Box>
    </Box>
  );
}
