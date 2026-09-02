export type ProjectRole = 'owner' | 'editor' | 'analyst' | 'viewer';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export type PermissionResource =
  | 'project'
  | 'project_settings'
  | 'model'
  | 'model_blocks'
  | 'model_connections'
  | 'equipment_params'
  | 'flow_params'
  | 'scenarios'
  | 'simulation_run'
  | 'simulation_results'
  | 'statistics'
  | 'comparison'
  | 'visualization'
  | 'reports'
  | 'templates'
  | 'members';

export interface RoleCapabilities {
  deleteProject: boolean;
  copyProject: boolean;
  setDefaultScenario: boolean;
  exportCsv: boolean;
  manageMembers: boolean;
}

export interface ProjectAccess {
  role: ProjectRole;
  roleLabel: string;
  permissions: Partial<Record<PermissionResource, PermissionAction[]>>;
  capabilities: RoleCapabilities;
}

export interface ProjectMember {
  userId: string;
  name: string;
  email: string;
  role: ProjectRole;
  roleLabel: string;
  createdAt: string;
}

export interface ProjectInvitation {
  id: string;
  code: string;
  role: ProjectRole;
  roleLabel: string;
  linkPath: string;
  expiresAt?: string | null;
  maxUses?: number | null;
  useCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface InvitationPreview {
  code: string;
  projectId: string;
  projectName: string;
  role: ProjectRole;
  roleLabel: string;
  isValid: boolean;
  message?: string | null;
}
