import type { AppRole } from '@/types/scm/roles';

export interface User {
  id: string;
  name: string;
  email: string;
  team?: string;
  role: AppRole;
  organization?: string;
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
  id: string;
  name: string;
  email: string;
  team?: string;
  role?: AppRole;
  organization?: string;
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
