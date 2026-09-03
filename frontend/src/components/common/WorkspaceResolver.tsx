import { Navigate } from 'react-router-dom';
import { RouteLoader } from '@/components/shared/RouteLoader';
import { useAuth } from '@/hooks/useAuth';
import { resolveLandingPath } from '@/workspace/workspaceResolver';

/** Post-auth redirect into the correct workspace landing. */
export function WorkspaceResolver() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={resolveLandingPath(user)} replace />;
}
