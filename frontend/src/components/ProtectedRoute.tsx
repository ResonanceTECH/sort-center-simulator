import { Navigate, Outlet } from 'react-router-dom';
import { RouteLoader } from '@/components/shared/RouteLoader';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
