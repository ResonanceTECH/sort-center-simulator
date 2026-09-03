import { lazy, Suspense, type ReactNode } from 'react';
import { Route } from 'react-router-dom';
import { RoleBasedRoute } from '@/components/common/RoleBasedRoute';
import { RouteLoader } from '@/components/shared/RouteLoader';

const ControlTowerPage = lazy(() =>
  import('@/pages/controlTower/ControlTowerPage').then((m) => ({ default: m.ControlTowerPage })),
);
const HomeWorkspacePage = lazy(() =>
  import('@/pages/home/HomeWorkspacePage').then((m) => ({ default: m.HomeWorkspacePage })),
);
const PlanningOverviewPage = lazy(() =>
  import('@/pages/planning/PlanningOverviewPage').then((m) => ({ default: m.PlanningOverviewPage })),
);
const ShipmentsPage = lazy(() =>
  import('@/pages/shipments/ShipmentsPage').then((m) => ({ default: m.ShipmentsPage })),
);
const ShipmentDetailPage = lazy(() =>
  import('@/pages/shipments/ShipmentDetailPage').then((m) => ({ default: m.ShipmentDetailPage })),
);
const ExceptionsPage = lazy(() =>
  import('@/pages/exceptions/ExceptionsPage').then((m) => ({ default: m.ExceptionsPage })),
);
const ExceptionDetailPage = lazy(() =>
  import('@/pages/exceptions/ExceptionDetailPage').then((m) => ({ default: m.ExceptionDetailPage })),
);
const NetworkPage = lazy(() =>
  import('@/pages/network/NetworkPage').then((m) => ({ default: m.NetworkPage })),
);
const SuppliersPage = lazy(() =>
  import('@/pages/suppliers/SuppliersPage').then((m) => ({ default: m.SuppliersPage })),
);
const SupplierDetailPage = lazy(() =>
  import('@/pages/suppliers/SupplierDetailPage').then((m) => ({ default: m.SupplierDetailPage })),
);
const CarriersPage = lazy(() =>
  import('@/pages/carriers/CarriersPage').then((m) => ({ default: m.CarriersPage })),
);
const CarrierDetailPage = lazy(() =>
  import('@/pages/carriers/CarrierDetailPage').then((m) => ({ default: m.CarrierDetailPage })),
);
const DemandForecastPage = lazy(() =>
  import('@/pages/planning/DemandForecastPage').then((m) => ({ default: m.DemandForecastPage })),
);
const SupplyPlanPage = lazy(() =>
  import('@/pages/planning/SupplyPlanPage').then((m) => ({ default: m.SupplyPlanPage })),
);
const InventoryPlanPage = lazy(() =>
  import('@/pages/planning/InventoryPlanPage').then((m) => ({ default: m.InventoryPlanPage })),
);
const TransportPlanPage = lazy(() =>
  import('@/pages/planning/TransportPlanPage').then((m) => ({ default: m.TransportPlanPage })),
);
const PlanFactPage = lazy(() =>
  import('@/pages/planning/PlanFactPage').then((m) => ({ default: m.PlanFactPage })),
);
const LiveMapPage = lazy(() =>
  import('@/pages/map/LiveMapPage').then((m) => ({ default: m.LiveMapPage })),
);
const IncidentsPage = lazy(() =>
  import('@/pages/incidents/IncidentsPage').then((m) => ({ default: m.IncidentsPage })),
);
const IncidentDetailPage = lazy(() =>
  import('@/pages/incidents/IncidentDetailPage').then((m) => ({ default: m.IncidentDetailPage })),
);
const AnalyticsOverviewPage = lazy(() =>
  import('@/pages/analytics/AnalyticsOverviewPage').then((m) => ({ default: m.AnalyticsOverviewPage })),
);
const AnalyticsSectionPage = lazy(() =>
  import('@/pages/analytics/AnalyticsSectionPage').then((m) => ({ default: m.AnalyticsSectionPage })),
);
const ScenariosPage = lazy(() =>
  import('@/pages/scenarios/ScenariosPage').then((m) => ({ default: m.ScenariosPage })),
);
const ScenarioBuilderPage = lazy(() =>
  import('@/pages/scenarios/ScenarioBuilderPage').then((m) => ({ default: m.ScenarioBuilderPage })),
);
const ScenarioComparePage = lazy(() =>
  import('@/pages/scenarios/ScenarioComparePage').then((m) => ({ default: m.ScenarioComparePage })),
);
const ScenarioDetailPage = lazy(() =>
  import('@/pages/scenarios/ScenarioDetailPage').then((m) => ({ default: m.ScenarioDetailPage })),
);
const RecommendationsPage = lazy(() =>
  import('@/pages/recommendations/RecommendationsPage').then((m) => ({ default: m.RecommendationsPage })),
);
const SettingsPage = lazy(() =>
  import('@/pages/admin/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);
const AdminUsersPage = lazy(() =>
  import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
);
const AdminRolesPage = lazy(() =>
  import('@/pages/admin/AdminRolesPage').then((m) => ({ default: m.AdminRolesPage })),
);
const ScmPlaceholderPage = lazy(() =>
  import('@/pages/scm/ScmPlaceholderPage').then((m) => ({ default: m.ScmPlaceholderPage })),
);
const SupplierDashboardPage = lazy(() =>
  import('@/pages/portal/SupplierDashboardPage').then((m) => ({ default: m.SupplierDashboardPage })),
);
const CarrierDashboardPage = lazy(() =>
  import('@/pages/portal/CarrierDashboardPage').then((m) => ({ default: m.CarrierDashboardPage })),
);
const SupplierOrdersPage = lazy(() =>
  import('@/pages/portal/SupplierPortalPages').then((m) => ({ default: m.SupplierOrdersPage })),
);
const SupplierShipmentsPage = lazy(() =>
  import('@/pages/portal/SupplierPortalPages').then((m) => ({ default: m.SupplierShipmentsPage })),
);
const CarrierTripsPage = lazy(() =>
  import('@/pages/portal/CarrierTripsPage').then((m) => ({ default: m.CarrierTripsPage })),
);
const PortalDocumentsPage = lazy(() =>
  import('@/pages/portal/PortalSharedPages').then((m) => ({ default: m.PortalDocumentsPage })),
);
const PortalPerformancePage = lazy(() =>
  import('@/pages/portal/PortalSharedPages').then((m) => ({ default: m.PortalPerformancePage })),
);
const SupplierForecastPage = lazy(() =>
  import('@/pages/portal/PortalSharedPages').then((m) => ({ default: m.SupplierForecastPage })),
);
const PortalIncidentsPage = lazy(() =>
  import('@/pages/portal/PortalExtraPages').then((m) => ({ default: m.PortalIncidentsPage })),
);
const CarrierVehiclesPage = lazy(() =>
  import('@/pages/portal/PortalExtraPages').then((m) => ({ default: m.CarrierVehiclesPage })),
);
const CarrierMapPage = lazy(() =>
  import('@/pages/portal/PortalExtraPages').then((m) => ({ default: m.CarrierMapPage })),
);

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<RouteLoader />}>{children}</Suspense>;
}

export function internalScmRoutes() {
  return (
    <>
      <Route path="/home" element={<Lazy><HomeWorkspacePage /></Lazy>} />
      <Route path="/control-tower" element={<Lazy><ControlTowerPage /></Lazy>} />
      <Route path="/control-tower/alerts" element={<Lazy><ScmPlaceholderPage title="Все предупреждения" /></Lazy>} />
      <Route path="/control-tower/insights" element={<Lazy><ScmPlaceholderPage title="Автоматические выводы" /></Lazy>} />

      <Route path="/shipments" element={<Lazy><ShipmentsPage /></Lazy>} />
      <Route path="/shipments/new" element={<Lazy><ScmPlaceholderPage title="Новая поставка" /></Lazy>} />
      <Route path="/shipments/:shipmentId" element={<Lazy><ShipmentDetailPage /></Lazy>} />
      <Route path="/exceptions" element={<Lazy><ExceptionsPage /></Lazy>} />
      <Route path="/exceptions/:exceptionId" element={<Lazy><ExceptionDetailPage /></Lazy>} />

      <Route path="/network" element={<Lazy><NetworkPage /></Lazy>} />
      <Route path="/network/edit" element={<Lazy><ScmPlaceholderPage title="Редактор сети" /></Lazy>} />
      <Route path="/network/nodes/:nodeId" element={<Lazy><ScmPlaceholderPage title="Узел сети" /></Lazy>} />
      <Route path="/facilities" element={<Lazy><ScmPlaceholderPage title="Склады / РЦ / хабы" /></Lazy>} />
      <Route path="/facilities/:facilityId" element={<Lazy><ScmPlaceholderPage title="Объект" /></Lazy>} />
      <Route path="/lanes" element={<Lazy><ScmPlaceholderPage title="Транспортные направления" /></Lazy>} />
      <Route path="/lanes/:laneId" element={<Lazy><ScmPlaceholderPage title="Направление" /></Lazy>} />

      <Route path="/suppliers" element={<Lazy><SuppliersPage /></Lazy>} />
      <Route path="/suppliers/new" element={<Lazy><ScmPlaceholderPage title="Новый поставщик" /></Lazy>} />
      <Route path="/suppliers/:supplierId" element={<Lazy><SupplierDetailPage /></Lazy>} />
      <Route path="/carriers" element={<Lazy><CarriersPage /></Lazy>} />
      <Route path="/carriers/new" element={<Lazy><ScmPlaceholderPage title="Новый перевозчик" /></Lazy>} />
      <Route path="/carriers/:carrierId" element={<Lazy><CarrierDetailPage /></Lazy>} />

      <Route path="/planning" element={<Lazy><PlanningOverviewPage /></Lazy>} />
      <Route path="/planning/demand" element={<Lazy><DemandForecastPage /></Lazy>} />
      <Route path="/planning/demand/new" element={<Lazy><ScmPlaceholderPage title="Новый прогноз" /></Lazy>} />
      <Route path="/planning/supply" element={<Lazy><SupplyPlanPage /></Lazy>} />
      <Route path="/planning/supply/new" element={<Lazy><ScmPlaceholderPage title="Новый план поставок" /></Lazy>} />
      <Route path="/planning/inventory" element={<Lazy><InventoryPlanPage /></Lazy>} />
      <Route path="/planning/inventory/new" element={<Lazy><ScmPlaceholderPage title="Новый план запасов" /></Lazy>} />
      <Route path="/planning/transport" element={<Lazy><TransportPlanPage /></Lazy>} />
      <Route path="/planning/transport/new" element={<Lazy><ScmPlaceholderPage title="Новый транспортный план" /></Lazy>} />
      <Route path="/planning/plan-fact" element={<Lazy><PlanFactPage /></Lazy>} />

      <Route path="/map" element={<Lazy><LiveMapPage /></Lazy>} />
      <Route path="/incidents" element={<Lazy><IncidentsPage /></Lazy>} />
      <Route path="/incidents/:incidentId" element={<Lazy><IncidentDetailPage /></Lazy>} />

      <Route path="/analytics" element={<Lazy><AnalyticsOverviewPage /></Lazy>} />
      <Route path="/analytics/service" element={<Lazy><AnalyticsSectionPage section="service" /></Lazy>} />
      <Route path="/analytics/suppliers" element={<Lazy><AnalyticsSectionPage section="suppliers" /></Lazy>} />
      <Route path="/analytics/carriers" element={<Lazy><AnalyticsSectionPage section="carriers" /></Lazy>} />
      <Route path="/analytics/routes" element={<Lazy><AnalyticsSectionPage section="routes" /></Lazy>} />
      <Route path="/analytics/inventory" element={<Lazy><AnalyticsSectionPage section="inventory" /></Lazy>} />
      <Route path="/analytics/risks" element={<Lazy><AnalyticsSectionPage section="risks" /></Lazy>} />

      <Route path="/scenarios" element={<Lazy><ScenariosPage /></Lazy>} />
      <Route path="/scenarios/new" element={<Lazy><ScenarioBuilderPage /></Lazy>} />
      <Route path="/scenarios/compare" element={<Lazy><ScenarioComparePage /></Lazy>} />
      <Route path="/scenarios/:scenarioId" element={<Lazy><ScenarioDetailPage /></Lazy>} />
      <Route path="/recommendations" element={<Lazy><RecommendationsPage /></Lazy>} />

      <Route path="/admin/users" element={<Lazy><AdminUsersPage /></Lazy>} />
      <Route path="/admin/roles" element={<Lazy><AdminRolesPage /></Lazy>} />
      <Route path="/admin" element={<Lazy><ScmPlaceholderPage title="Администрирование" subtitle="Обзор системы, доступов и интеграций" /></Lazy>} />
      <Route path="/admin/organizations" element={<Lazy><ScmPlaceholderPage title="Организации" /></Lazy>} />
      <Route path="/admin/integrations" element={<Lazy><ScmPlaceholderPage title="Интеграции" /></Lazy>} />
      <Route path="/admin/dictionaries" element={<Lazy><ScmPlaceholderPage title="Справочники" /></Lazy>} />
      <Route path="/admin/audit" element={<Lazy><ScmPlaceholderPage title="Audit Log" /></Lazy>} />
      <Route path="/admin/system" element={<Lazy><ScmPlaceholderPage title="System Health" subtitle="Jobs, failed jobs, health" /></Lazy>} />
      <Route path="/settings" element={<Lazy><SettingsPage /></Lazy>} />
      <Route path="/integrations" element={<Lazy><ScmPlaceholderPage title="Интеграции" /></Lazy>} />
      <Route path="/strategy/resilience" element={<Lazy><ScmPlaceholderPage title="Устойчивость" subtitle="Resilience / риск-контур сети поставок" /></Lazy>} />
    </>
  );
}

export function portalRoutes() {
  return (
    <>
      <Route element={<RoleBasedRoute allowedShells={['supplier']} />}>
        <Route path="/supplier" element={<Lazy><SupplierDashboardPage /></Lazy>} />
        <Route path="/supplier/dashboard" element={<Lazy><SupplierDashboardPage /></Lazy>} />
        <Route path="/supplier/orders" element={<Lazy><SupplierOrdersPage /></Lazy>} />
        <Route path="/supplier/forecast" element={<Lazy><SupplierForecastPage /></Lazy>} />
        <Route path="/supplier/shipments" element={<Lazy><SupplierShipmentsPage /></Lazy>} />
        <Route path="/supplier/documents" element={<Lazy><PortalDocumentsPage shell="supplier" /></Lazy>} />
        <Route path="/supplier/incidents" element={<Lazy><PortalIncidentsPage shell="supplier" /></Lazy>} />
        <Route path="/supplier/notifications" element={<Lazy><ScmPlaceholderPage title="Уведомления" shell="supplier" /></Lazy>} />
        <Route path="/supplier/performance" element={<Lazy><PortalPerformancePage shell="supplier" /></Lazy>} />
        <Route path="/supplier/settings" element={<Lazy><ScmPlaceholderPage title="Профиль организации" shell="supplier" /></Lazy>} />
      </Route>

      <Route element={<RoleBasedRoute allowedShells={['carrier']} />}>
        <Route path="/carrier" element={<Lazy><CarrierDashboardPage /></Lazy>} />
        <Route path="/carrier/dashboard" element={<Lazy><CarrierDashboardPage /></Lazy>} />
        <Route path="/carrier/shipments" element={<Lazy><CarrierDashboardPage /></Lazy>} />
        <Route path="/carrier/trips" element={<Lazy><CarrierTripsPage /></Lazy>} />
        <Route path="/carrier/completed" element={<Lazy><ScmPlaceholderPage title="Завершённые рейсы" shell="carrier" /></Lazy>} />
        <Route path="/carrier/vehicles" element={<Lazy><CarrierVehiclesPage /></Lazy>} />
        <Route path="/carrier/drivers" element={<Lazy><ScmPlaceholderPage title="Водители" shell="carrier" /></Lazy>} />
        <Route path="/carrier/map" element={<Lazy><CarrierMapPage /></Lazy>} />
        <Route path="/carrier/incidents" element={<Lazy><PortalIncidentsPage shell="carrier" /></Lazy>} />
        <Route path="/carrier/documents" element={<Lazy><PortalDocumentsPage shell="carrier" /></Lazy>} />
        <Route path="/carrier/notifications" element={<Lazy><ScmPlaceholderPage title="Уведомления" shell="carrier" /></Lazy>} />
        <Route path="/carrier/performance" element={<Lazy><PortalPerformancePage shell="carrier" /></Lazy>} />
        <Route path="/carrier/settings" element={<Lazy><ScmPlaceholderPage title="Профиль" shell="carrier" /></Lazy>} />
      </Route>
    </>
  );
}
