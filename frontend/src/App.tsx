import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { RouteLoader } from '@/components/shared/RouteLoader';
import { useAuth } from '@/hooks/useAuth';
import { ProjectLayout } from '@/layouts/ProjectLayout';
import { ScenarioLayout } from '@/layouts/ScenarioLayout';
import { General } from '@/pages/General';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import { Projects } from '@/pages/Projects';
import { Reports } from '@/pages/Reports';
import { Register } from '@/pages/Register';
import { ProjectOverviewPage } from '@/pages/project/ProjectOverviewPage';
import { ProjectRouteNotFound } from '@/pages/project/ProjectRouteNotFound';
import { ProjectRunPage } from '@/pages/project/ProjectRunPage';
import {
  ProjectComparisonPage,
  ProjectRunsPage,
  ProjectStatisticsPage,
  ProjectVisualizationPage,
  ScenarioEditorPage,
  ScenarioParametersPage,
} from '@/pages/project/ProjectSectionPages';

function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/projects" replace />;
  }

  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects" replace />} />

      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/projects" element={<Projects />} />

        <Route path="/projects/:projectId" element={<ProjectLayout />}>
          <Route index element={<ProjectOverviewPage />} />
          <Route path="scenarios/:scenarioId" element={<ScenarioLayout />}>
            <Route index element={<Navigate to="editor" replace />} />
            <Route path="editor" element={<ScenarioEditorPage />} />
            <Route path="parameters" element={<ScenarioParametersPage />} />
            <Route path="*" element={<ProjectRouteNotFound />} />
          </Route>
          <Route path="runs" element={<ProjectRunsPage />} />
          <Route path="runs/:runId" element={<ProjectRunPage />} />
          <Route path="statistics" element={<ProjectStatisticsPage />} />
          <Route path="visualization" element={<ProjectVisualizationPage />} />
          <Route path="comparison" element={<ProjectComparisonPage />} />
          <Route path="*" element={<ProjectRouteNotFound />} />
        </Route>

        <Route path="/templates" element={<PlaceholderPage title="Шаблоны" />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/docs" element={<PlaceholderPage title="Документация" />} />
        <Route path="/settings" element={<PlaceholderPage title="Настройки" />} />
        <Route path="/general" element={<General />} />
        <Route path="/editor" element={<PlaceholderPage title="Редактор" />} />
        <Route path="/parameters" element={<PlaceholderPage title="Параметры" />} />
        <Route path="/simulation" element={<PlaceholderPage title="Симуляция" />} />
        <Route path="/visualization" element={<PlaceholderPage title="Визуализация" />} />
        <Route path="/statistics" element={<PlaceholderPage title="Статистика" />} />
        <Route path="/comparison" element={<PlaceholderPage title="Сравнение" />} />
      </Route>

      <Route path="/dashboard" element={<Navigate to="/projects" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
