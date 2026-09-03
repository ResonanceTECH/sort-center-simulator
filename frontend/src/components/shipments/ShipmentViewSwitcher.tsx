import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import MapOutlined from '@mui/icons-material/MapOutlined';
import TableRowsOutlined from '@mui/icons-material/TableRowsOutlined';
import ViewKanbanOutlined from '@mui/icons-material/ViewKanbanOutlined';
import { kit } from '@/ui-kit/tokens';
import type { ShipmentsView } from '@/components/shipments/boardConstants';

interface ShipmentViewSwitcherProps {
  value: ShipmentsView;
  onChange: (view: ShipmentsView) => void;
}

export function ShipmentViewSwitcher({ value, onChange }: ShipmentViewSwitcherProps) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, next: ShipmentsView | null) => {
        if (next) onChange(next);
      }}
      sx={{
        bgcolor: kit.color.snow,
        '& .MuiToggleButton-root': {
          textTransform: 'none',
          px: 1.5,
          fontSize: '0.8125rem',
          borderColor: kit.color.border,
          '&.Mui-selected': {
            bgcolor: 'rgba(9, 9, 11, 0.08)',
            borderColor: kit.color.iron,
            fontWeight: 600,
          },
        },
      }}
    >
      <ToggleButton value="map">
        <MapOutlined sx={{ fontSize: 18, mr: 0.75 }} />
        Карта
      </ToggleButton>
      <ToggleButton value="table">
        <TableRowsOutlined sx={{ fontSize: 18, mr: 0.75 }} />
        Таблица
      </ToggleButton>
      <ToggleButton value="board">
        <ViewKanbanOutlined sx={{ fontSize: 18, mr: 0.75 }} />
        Доска
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
