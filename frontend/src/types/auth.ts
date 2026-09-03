import type { AppRole } from '@/types/scm/roles';

export type WorkspaceType = 'INTERNAL' | 'ADMIN' | 'SUPPLIER' | 'CARRIER';

export interface OrganizationInfo {
  id: string;
  name: string;
  type: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  team?: string;
  /** Primary role for routing / shell (first assigned). */
  role: AppRole;
  roles: AppRole[];
  permissions: string[];
  availableWorkspaces: WorkspaceType[];
  organization?: string;
  organizationId?: string;
  organizationInfo?: OrganizationInfo;
  organizationType?: string;
}

export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  team?: string;
  agreeToTerms: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserApiResponse {
  id?: string;
  name?: string;
  email?: string;
  team?: string;
  role?: AppRole | string;
  roles?: Array<AppRole | string>;
  organization?: string | OrganizationInfo;
  organization_id?: string;
  organizationId?: string;
  organization_type?: string;
  organizationType?: string;
  permissions?: string[];
  available_workspaces?: string[];
  availableWorkspaces?: string[];
  user?: {
    id: string;
    name: string;
    email: string;
    team?: string;
  };
}

export interface MeApiResponse {
  user: {
    id: string;
    name: string;
    email: string;
    team?: string;
  };
  organization?: OrganizationInfo | null;
  organization_type?: string;
  roles?: string[];
  permissions?: string[];
  available_workspaces?: string[];
  id?: string;
  name?: string;
  email?: string;
  team?: string;
  organization_id?: string;
  role?: string;
}

export interface AuthApiResponse {
  user: UserApiResponse;
  access_token?: string;
  token?: string;
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  team?: string;
  role: AppRole;
  organization?: string;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';
