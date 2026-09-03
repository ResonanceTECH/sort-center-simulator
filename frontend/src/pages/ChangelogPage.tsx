import { Navigate } from 'react-router-dom';

/** Public alias — content lives under docs support/changelog. */
export function ChangelogPage() {
  return <Navigate to="/docs/support/changelog" replace />;
}
