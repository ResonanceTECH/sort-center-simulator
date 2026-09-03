import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RoleBasedRoute } from '@/components/common/RoleBasedRoute';
import { RouteLoader } from '@/components/shared/RouteLoader';
import { useAuth } from '@/hooks/useAuth';
import { ProjectLayout } from '@/layouts/ProjectLayout';
import { ScenarioLayout } from '@/layouts/ScenarioLayout';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { General } from '@/pages/General';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { Projects } from '@/pages/Projects';
import { Reports } from '@/pages/Reports';
import { Register } from '@/pages/Register';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { UiKitPage } from '@/pages/UiKitPage';
import { JoinProjectPage } from '@/pages/project/JoinProjectPage';
import { ProjectMembersPage } from '@/pages/project/ProjectMembersPage';
import { ProjectOverviewPage } from '@/pages/project/ProjectOverviewPage';
import { ProjectRouteNotFound } from '@/pages/project/ProjectRouteNotFound';
import { ProjectRunPage } from '@/pages/project/ProjectRunPage';
import {
  ProjectComparisonPage,
  ProjectRunsPage,
  ProjectScenariosPage,
  ProjectSimulationPage,
  ProjectStatisticsPage,
  ProjectVisualizationPage,
  ScenarioEditorPage,
  ScenarioParametersPage,
} from '@/pages/project/ProjectSectionPages';
import { internalScmRoutes, portalRoutes } from '@/routes/scmRoutes';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { resolveLandingPath } from '@/workspace/workspaceResolver';
import { WorkspaceResolver } from '@/components/common/WorkspaceResolver';

const LandingPage = lazy(() =>
  import('@/landing/pages/LandingPage').then((m) => ({ default: m.LandingPage })),
);

function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (isAuthenticated && user) {
    return <Navigate to={resolveLandingPath(user)} replace />;
  }

  return children;
}

export function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Suspense fallback={<RouteLoader />}>
            <LandingPage />
          </Suspense>
        }
      />

      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/ui-kit" element={<UiKitPage />} />
      <Route path="/roadmap" element={<RoadmapPage />} />
      <Route path="/projects/join" element={<JoinProjectPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleBasedRoute allowedShells={['internal', 'admin']} />}>
          {internalScmRoutes()}
          <Route path="/projects" element={<Projects />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/general" element={<General />} />
          <Route path="/templates" element={<PlaceholderPage title="Шаблоны" />} />
          <Route path="/docs" element={<PlaceholderPage title="Документация" />} />

          <Route path="/projects/:projectId" element={<ProjectLayout />}>
            <Route index element={<ProjectOverviewPage />} />
            <Route path="members" element={<ProjectMembersPage />} />
            <Route path="scenarios/:scenarioId" element={<ScenarioLayout />}>
              <Route index element={<Navigate to="editor" replace />} />
              <Route path="editor" element={<ScenarioEditorPage />} />
              <Route path="parameters" element={<ScenarioParametersPage />} />
              <Route path="*" element={<ProjectRouteNotFound />} />
            </Route>
            <Route path="scenarios" element={<ProjectScenariosPage />} />
            <Route path="simulation" element={<ProjectSimulationPage />} />
            <Route path="runs" element={<ProjectRunsPage />} />
            <Route path="runs/:runId" element={<ProjectRunPage />} />
            <Route path="statistics" element={<ProjectStatisticsPage />} />
            <Route path="visualization" element={<ProjectVisualizationPage />} />
            <Route path="comparison" element={<ProjectComparisonPage />} />
            <Route path="*" element={<ProjectRouteNotFound />} />
          </Route>
        </Route>

        {portalRoutes()}
        <Route path="/workspace" element={<WorkspaceResolver />} />
        <Route path="/403" element={<ForbiddenPage />} />
      </Route>

      <Route path="/dashboard" element={<WorkspaceResolver />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
