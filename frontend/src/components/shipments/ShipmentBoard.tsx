import { useMemo, useState } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Skeleton,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  BOARD_COLUMN_LABELS,
  BOARD_LIFECYCLE_COLUMNS,
  RISK_GROUP_LABELS,
  RISK_GROUP_ORDER,
  type BoardGroupBy,
} from '@/components/shipments/boardConstants';
import { ShipmentBoardColumn } from '@/components/shipments/ShipmentBoardColumn';
import { ShipmentQuickView } from '@/components/shipments/ShipmentQuickView';
import {
  resolveShipmentActions,
  type ShipmentAction,
} from '@/constants/businessActions';
import { SHIPMENT_ACTION_LABELS } from '@/constants/platformRu';
import { usePermissions } from '@/hooks/usePermissions';
import { useUiStore } from '@/store/uiStore';
import { kit } from '@/ui-kit/tokens';
import type { AppRole } from '@/types/scm/roles';
import type { SemanticStatus } from '@/types/scm/semantic';
import type { ShipmentSummary } from '@/types/scm/shipment';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { StatusChip } from '@/components/status/StatusChip';

interface ShipmentBoardProps {
  items: ShipmentSummary[];
  loading?: boolean;
  groupBy: BoardGroupBy;
  onGroupByChange: (value: BoardGroupBy) => void;
  hideDelivered?: boolean;
}

export function ShipmentBoard({
  items,
  loading,
  groupBy,
  onGroupByChange,
  hideDelivered = true,
}: ShipmentBoardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const showSnackbar = useUiStore((s) => s.showSnackbar);
  const { role, permissions, can } = usePermissions();
  const readOnly = !can('shipment.update') && !can('shipment.assign_carrier') && !can('shipment.cancel');

  const [quickView, setQuickView] = useState<ShipmentSummary | null>(null);

  const visibleItems = useMemo(
    () => (hideDelivered ? items.filter((s) => s.status !== 'DELIVERED') : items),
    [hideDelivered, items],
  );

  const columns = useMemo(() => {
    if (groupBy === 'risk') {
      return RISK_GROUP_ORDER.map((risk) => ({
        key: risk,
        title: RISK_GROUP_LABELS[risk] ?? risk,
        items: visibleItems.filter((s) => normalizeRisk(s.riskStatus) === risk).slice(0, 40),
      }));
    }
    return BOARD_LIFECYCLE_COLUMNS.filter((s) => !(hideDelivered && s === 'DELIVERED')).map(
      (status) => ({
        key: status,
        title: BOARD_COLUMN_LABELS[status],
        items: visibleItems.filter((s) => s.status === status).slice(0, 40),
      }),
    );
  }, [groupBy, hideDelivered, visibleItems]);

  const resolveActions = (shipment: ShipmentSummary): ShipmentAction[] => {
    if (readOnly) return [];
    let actions = resolveShipmentActions(
      role as AppRole | undefined,
      shipment.status,
      shipment.availableActions,
      permissions,
    );
    // High/critical extras for ops
    if (shipment.riskStatus === 'HIGH' || shipment.riskStatus === 'CRITICAL') {
      const extras: ShipmentAction[] = ['CREATE_INCIDENT', 'CREATE_SCENARIO'];
      for (const a of extras) {
        if (!actions.includes(a) && can(a === 'CREATE_SCENARIO' ? 'scenario.create' : 'incident.create')) {
          actions = [...actions, a];
        }
      }
    }
    return actions.filter((a) => a !== 'READ');
  };

  const handleAction = (shipment: ShipmentSummary, action: ShipmentAction) => {
    if (action === 'CREATE_INCIDENT') {
      navigate('/incidents');
      return;
    }
    if (action === 'CREATE_SCENARIO') {
      navigate('/scenarios/new');
      return;
    }
    if (action === 'CHANGE_CARRIER' || action === 'ASSIGN_CARRIER') {
      navigate(`/shipments/${shipment.id}`);
      return;
    }
    showSnackbar(`${SHIPMENT_ACTION_LABELS[action] ?? action}: ${shipment.id}`, 'info');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 1 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" width={220} height={420} />
        ))}
      </Box>
    );
  }

  if (isMobile) {
    return (
      <MobileShipmentList
        items={visibleItems}
        onOpen={setQuickView}
        quickView={quickView}
        resolveActions={resolveActions}
        readOnly={readOnly}
        onClose={() => setQuickView(null)}
        onAction={handleAction}
      />
    );
  }

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Группировать</InputLabel>
          <Select
            label="Группировать"
            value={groupBy}
            onChange={(e) => onGroupByChange(e.target.value as BoardGroupBy)}
          >
            <MenuItem value="status">По этапу</MenuItem>
            <MenuItem value="risk">По риску</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {visibleItems.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', border: kit.border.hairline, borderRadius: kit.radius.panel }}>
          <Typography fontWeight={700}>Нет активных поставок</Typography>
          <Typography variant="body2" sx={{ color: kit.color.muted, mt: 0.5 }}>
            Измените фильтры или создайте новую поставку
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            gap: 1.5,
            overflowX: 'auto',
            pb: 1,
            scrollBehavior: 'smooth',
          }}
        >
          {columns.map((col) => (
            <ShipmentBoardColumn
              key={col.key}
              title={col.title}
              items={col.items}
              readOnly={readOnly}
              resolveActions={resolveActions}
              onOpen={setQuickView}
              onAction={handleAction}
            />
          ))}
        </Box>
      )}

      <ShipmentQuickView
        shipment={quickView}
        actions={quickView ? resolveActions(quickView) : []}
        readOnly={readOnly}
        onClose={() => setQuickView(null)}
        onAction={handleAction}
      />
    </>
  );
}

function normalizeRisk(status: SemanticStatus): SemanticStatus {
  if (status === 'INFO' || status === 'SUCCESS') return 'NORMAL';
  return status;
}

function MobileShipmentList({
  items,
  onOpen,
  quickView,
  resolveActions,
  readOnly,
  onClose,
  onAction,
}: {
  items: ShipmentSummary[];
  onOpen: (s: ShipmentSummary) => void;
  quickView: ShipmentSummary | null;
  resolveActions: (s: ShipmentSummary) => ShipmentAction[];
  readOnly: boolean;
  onClose: () => void;
  onAction: (s: ShipmentSummary, a: ShipmentAction) => void;
}) {
  const columns: DataTableColumn<ShipmentSummary>[] = [
    { id: 'id', header: 'ID', cell: (row) => row.id },
    { id: 'route', header: 'Маршрут', cell: (row) => `${row.origin} → ${row.destination}` },
    {
      id: 'status',
      header: 'Статус',
      cell: (row) => BOARD_COLUMN_LABELS[row.status],
    },
    {
      id: 'risk',
      header: 'Риск',
      cell: (row) => <StatusChip status={row.riskStatus} label={row.riskStatus} />,
    },
  ];

  return (
    <>
      <Typography variant="body2" sx={{ color: kit.color.muted, mb: 1.5 }}>
        На мобильных board заменён списком поставок
      </Typography>
      <DataTable
        data={items.slice(0, 50)}
        columns={columns}
        total={items.length}
        page={0}
        pageSize={50}
        onPageChange={() => {}}
        onRowClick={onOpen}
        getRowId={(row) => row.id}
      />
      <ShipmentQuickView
        shipment={quickView}
        actions={quickView ? resolveActions(quickView) : []}
        readOnly={readOnly}
        onClose={onClose}
        onAction={onAction}
      />
    </>
  );
}
