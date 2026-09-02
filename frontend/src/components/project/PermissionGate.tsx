import type { ReactNode } from 'react';
import { can, hasCapability } from '@/constants/permissions';
import { useProjectContext } from '@/context/projectContext';
import type { PermissionAction, PermissionResource, RoleCapabilities } from '@/types/rbac';

interface PermissionGateProps {
  resource?: PermissionResource;
  action?: PermissionAction;
  capability?: keyof RoleCapabilities;
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  resource,
  action,
  capability,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { access } = useProjectContext();

  const allowed =
    capability != null
      ? hasCapability(access, capability)
      : resource != null && action != null
        ? can(access, resource, action)
        : true;

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
