import { useCallback, useMemo, useState, type MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Box, Drawer, Typography } from '@mui/material';
import { PageHeader } from '@/components/common/PageHeader';
import { StatusChip } from '@/components/status/StatusChip';
import { COMMON, NAV_LABELS, TAB_LABELS } from '@/constants/platformRu';
import { InternalLayout } from '@/layouts/InternalLayout';
import { KitCard } from '@/ui-kit/Card';
import { kit } from '@/ui-kit/tokens';
import type { SemanticStatus } from '@/types/scm/semantic';

type NetworkNodeData = {
  label: string;
  nodeType: string;
  risk: SemanticStatus;
  entityLink?: string;
};

function SupplyNode({ data, selected }: NodeProps<Node<NetworkNodeData>>) {
  return (
    <Box
      sx={{
        px: 2,
        py: 1.5,
        minWidth: 140,
        borderRadius: kit.radius.panel,
        border: selected ? `2px solid ${kit.color.obsidian}` : kit.border.hairline,
        bgcolor: kit.color.snow,
        boxShadow: kit.shadow.small,
        textAlign: 'center',
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0.4 }} />
      <Typography variant="caption" sx={{ color: kit.color.muted, display: 'block' }}>
        {data.nodeType}
      </Typography>
      <Typography variant="body2" fontWeight={700}>{data.label}</Typography>
      <StatusChip status={data.risk} label={String(data.risk)} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.4 }} />
    </Box>
  );
}

const nodeTypes = { supply: SupplyNode };

const INITIAL_NODES: Node<NetworkNodeData>[] = [
  { id: 'sup-a', type: 'supply', position: { x: 0, y: 0 }, data: { label: 'Поставщик A', nodeType: 'Поставщик', risk: 'NORMAL', entityLink: '/suppliers/sup-0' } },
  { id: 'sup-b', type: 'supply', position: { x: 200, y: 0 }, data: { label: 'Поставщик B', nodeType: 'Поставщик', risk: 'HIGH', entityLink: '/suppliers/sup-1' } },
  { id: 'sup-c', type: 'supply', position: { x: 400, y: 0 }, data: { label: 'Поставщик C', nodeType: 'Поставщик', risk: 'WARNING', entityLink: '/suppliers/sup-2' } },
  { id: 'wh-msk', type: 'supply', position: { x: 200, y: 140 }, data: { label: 'Склад Москва', nodeType: 'Склад', risk: 'NORMAL' } },
  { id: 'dc-a', type: 'supply', position: { x: 80, y: 280 }, data: { label: 'РЦ Регион A', nodeType: 'Распределительный центр', risk: 'NORMAL' } },
  { id: 'hub-b', type: 'supply', position: { x: 320, y: 280 }, data: { label: 'Хаб Регион B', nodeType: 'Хаб', risk: 'WARNING' } },
];

const INITIAL_EDGES: Edge[] = [
  { id: 'e1', source: 'sup-a', target: 'wh-msk', label: 'Поставка', animated: false },
  { id: 'e2', source: 'sup-b', target: 'wh-msk', label: 'Поставка', animated: true },
  { id: 'e3', source: 'sup-c', target: 'wh-msk' },
  { id: 'e4', source: 'wh-msk', target: 'dc-a', label: 'Транспортное плечо' },
  { id: 'e5', source: 'wh-msk', target: 'hub-b', label: 'Транспортное плечо' },
];

const DRAWER_TABS = [TAB_LABELS.overview, TAB_LABELS.capacity, TAB_LABELS.performance, TAB_LABELS.risks, TAB_LABELS.shipments, TAB_LABELS.relations];

export function NetworkPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Node<NetworkNodeData> | null>(null);

  const onNodeClick = useCallback((_: MouseEvent, node: Node<NetworkNodeData>) => {
    setSelected(node);
  }, []);

  const nodes = useMemo(() => INITIAL_NODES, []);
  const edges = useMemo(() => INITIAL_EDGES, []);

  return (
    <InternalLayout>
      <PageHeader title={NAV_LABELS.supplyNetwork} subtitle="Интерактивная цепочка — нажмите на узел для деталей" />

      <KitCard padding="none" sx={{ height: 560 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} color={kit.color.border} />
          <Controls />
          <MiniMap zoomable pannable />
        </ReactFlow>
      </KitCard>

      <Drawer anchor="right" open={Boolean(selected)} onClose={() => setSelected(null)}>
        {selected && (
          <Box sx={{ width: 360, p: 3 }}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>{selected.data.label}</Typography>
            <StatusChip status={selected.data.risk} label={selected.data.nodeType} />
            <Box sx={{ mt: 3 }}>
              {DRAWER_TABS.map((tab) => (
                <Typography key={tab} variant="body2" sx={{ py: 1, borderBottom: kit.border.hairline }}>
                  {tab}
                </Typography>
              ))}
            </Box>
            {selected.data.entityLink && (
              <Box
                component="button"
                onClick={() => navigate(selected.data.entityLink!)}
                sx={{
                  mt: 3,
                  border: kit.border.hairline,
                  borderRadius: kit.radius.button,
                  px: 2,
                  py: 1,
                  cursor: 'pointer',
                  bgcolor: kit.color.obsidian,
                  color: kit.color.snow,
                }}
              >
                {COMMON.openEntity}
              </Box>
            )}
          </Box>
        )}
      </Drawer>
    </InternalLayout>
  );
}
