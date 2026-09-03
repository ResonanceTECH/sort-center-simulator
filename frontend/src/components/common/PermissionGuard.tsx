import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  permission: string | readonly string[];
  /** If true, require any permission instead of all. */
  any?: boolean;
  children: ReactNode;
  /** Rendered when denied. Default: redirect /403 */
  fallback?: ReactNode | 'hide' | '403';
}

export function PermissionGuard({
  permission,
  any = false,
  children,
  fallback = '403',
}: PermissionGuardProps) {
  const { can, canAnyPermission } = usePermissions();
  const allowed = any ? canAnyPermission(permission) : can(permission);

  if (allowed) {
    return children;
  }

  if (fallback === 'hide') return null;
  if (fallback === '403') return <Navigate to="/403" replace />;
  return fallback;
}
