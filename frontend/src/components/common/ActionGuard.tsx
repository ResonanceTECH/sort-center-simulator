import type { ReactElement, ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface ActionGuardProps {
  permission: string | readonly string[];
  /** Also require API availableActions label (e.g. ASSIGN_CARRIER). */
  action?: string;
  availableActions?: string[];
  children: ReactElement;
  fallback?: ReactNode;
}

/**
 * Business-action gate — route access ≠ action access.
 * Hides children when permission (and optional state action) is missing.
 */
export function ActionGuard({
  permission,
  action,
  availableActions,
  children,
  fallback = null,
}: ActionGuardProps) {
  const { can, canPerformAction } = usePermissions();

  if (!can(permission)) {
    return fallback;
  }

  if (action && !canPerformAction(availableActions, action)) {
    return fallback;
  }

  return children;
}
