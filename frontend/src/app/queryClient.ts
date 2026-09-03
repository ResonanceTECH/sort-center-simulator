import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  controlTower: ['controlTower'] as const,
  shipments: (filters?: object) => ['shipments', filters] as const,
  shipment: (id: string) => ['shipment', id] as const,
  exceptions: (filters?: object) => ['exceptions', filters] as const,
  exception: (id: string) => ['exception', id] as const,
  suppliers: (filters?: object) => ['suppliers', filters] as const,
  supplier: (id: string) => ['supplier', id] as const,
  carriers: (filters?: object) => ['carriers', filters] as const,
  carrier: (id: string) => ['carrier', id] as const,
  incidents: (filters?: object) => ['incidents', filters] as const,
  incident: (id: string) => ['incident', id] as const,
  demandForecast: ['demandForecast'] as const,
  supplyPlan: ['supplyPlan'] as const,
  inventoryPlan: ['inventoryPlan'] as const,
  transportPlan: ['transportPlan'] as const,
  planFact: ['planFact'] as const,
  scenarios: (filters?: object) => ['scenarios', filters] as const,
  scenario: (id: string) => ['scenario', id] as const,
  scenarioCompare: (ids: string[]) => ['scenarioCompare', ids] as const,
  recommendations: ['recommendations'] as const,
  analyticsOverview: ['analyticsOverview'] as const,
  analyticsSection: (section: string) => ['analyticsSection', section] as const,
  globalSearch: (query: string) => ['globalSearch', query] as const,
  notifications: ['notifications'] as const,
  liveMap: ['liveMap'] as const,
};
