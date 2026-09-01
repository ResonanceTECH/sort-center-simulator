export type NodeStatus =
  | 'default'
  | 'hover'
  | 'selected'
  | 'dragging'
  | 'disabled'
  | 'warning'
  | 'error'
  | 'running'
  | 'outdated';

export interface NodePosition {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  type: string;
  position: NodePosition;
  parameters: Record<string, unknown>;
  status?: NodeStatus;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
}

export interface Model {
  scenarioId: string;
  version: number;
  nodes: Node[];
  edges: Edge[];
}

export interface ModelApiResponse {
  scenario_id?: string;
  scenarioId?: string;
  version: number;
  nodes: Node[];
  edges: Edge[];
}
