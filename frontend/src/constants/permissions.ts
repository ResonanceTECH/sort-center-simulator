import type {
  InvitationPreview,
  PermissionAction,
  PermissionResource,
  ProjectAccess,
  ProjectInvitation,
  ProjectMember,
  ProjectRole,
  RoleCapabilities,
} from '@/types/rbac';

export const ROLE_LABELS: Record<ProjectRole, string> = {
  owner: 'Владелец',
  editor: 'Редактор',
  analyst: 'Аналитик',
  viewer: 'Наблюдатель',
};

export const INVITABLE_ROLES: ProjectRole[] = ['editor', 'analyst', 'viewer'];

function mapCapabilities(raw: Record<string, boolean>): RoleCapabilities {
  return {
    deleteProject: raw.delete_project ?? false,
    copyProject: raw.copy_project ?? false,
    setDefaultScenario: raw.set_default_scenario ?? false,
    exportCsv: raw.export_csv ?? false,
    manageMembers: raw.manage_members ?? false,
  };
}

export function mapProjectAccess(raw: {
  role: string;
  role_label?: string;
  roleLabel?: string;
  permissions?: Record<string, string[]>;
  capabilities?: Record<string, boolean>;
}): ProjectAccess {
  return {
    role: raw.role as ProjectRole,
    roleLabel: raw.role_label ?? raw.roleLabel ?? ROLE_LABELS[raw.role as ProjectRole] ?? raw.role,
    permissions: (raw.permissions ?? {}) as ProjectAccess['permissions'],
    capabilities: mapCapabilities(raw.capabilities ?? {}),
  };
}

export function can(
  access: ProjectAccess | null | undefined,
  resource: PermissionResource,
  action: PermissionAction,
): boolean {
  if (!access) return false;
  return (access.permissions[resource] ?? []).includes(action);
}

export function hasCapability(
  access: ProjectAccess | null | undefined,
  capability: keyof RoleCapabilities,
): boolean {
  if (!access) return false;
  return access.capabilities[capability] ?? false;
}

export function mapMember(raw: {
  user_id: string;
  name: string;
  email: string;
  role: string;
  role_label?: string;
  created_at: string;
}): ProjectMember {
  return {
    userId: raw.user_id,
    name: raw.name,
    email: raw.email,
    role: raw.role as ProjectRole,
    roleLabel: raw.role_label ?? ROLE_LABELS[raw.role as ProjectRole] ?? raw.role,
    createdAt: raw.created_at,
  };
}

export function mapInvitation(raw: {
  id: string;
  code: string;
  role: string;
  role_label?: string;
  link_path?: string;
  expires_at?: string | null;
  max_uses?: number | null;
  use_count?: number;
  is_active?: boolean;
  created_at: string;
}): ProjectInvitation {
  return {
    id: raw.id,
    code: raw.code,
    role: raw.role as ProjectRole,
    roleLabel: raw.role_label ?? ROLE_LABELS[raw.role as ProjectRole] ?? raw.role,
    linkPath: raw.link_path ?? `/projects/join?code=${raw.code}`,
    expiresAt: raw.expires_at,
    maxUses: raw.max_uses,
    useCount: raw.use_count ?? 0,
    isActive: raw.is_active ?? true,
    createdAt: raw.created_at,
  };
}

export function mapInvitationPreview(raw: {
  code: string;
  project_id: string;
  project_name: string;
  role: string;
  role_label?: string;
  is_valid: boolean;
  message?: string | null;
}): InvitationPreview {
  return {
    code: raw.code,
    projectId: raw.project_id,
    projectName: raw.project_name,
    role: raw.role as ProjectRole,
    roleLabel: raw.role_label ?? ROLE_LABELS[raw.role as ProjectRole] ?? raw.role,
    isValid: raw.is_valid,
    message: raw.message,
  };
}
