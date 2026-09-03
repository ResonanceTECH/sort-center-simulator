import { beforeEach, describe, expect, it } from 'vitest';
import { DEMO_USERS } from '@/mocks/authData';
import {
  addIncidentComment,
  compareScenarios,
  createScenario,
  executePlanAction,
  fetchControlTower,
  fetchGlobalSearch,
  fetchIncident,
  fetchLiveMap,
  fetchScenarios,
  fetchShipment,
  fetchShipments,
  runScenario,
} from '@/services/scm/scmService';
import { sortRows } from '@/utils/tableSort';

describe('SCM mock service smoke (§66)', () => {
  beforeEach(async () => {
    const { listScenarioState } = await import('@/mocks/scm/scenarioState');
    expect(listScenarioState().length).toBeGreaterThan(0);
  });

  it('exposes seven demo personas for role-based flows', () => {
    const roles = new Set(DEMO_USERS.map((u) => u.role));
    expect(DEMO_USERS).toHaveLength(7);
    expect(roles).toEqual(
      new Set([
        'SUPPLY_CHAIN_MANAGER',
        'SUPPLY_PLANNER',
        'LOGISTICS_MANAGER',
        'SUPPLIER',
        'CARRIER',
        'ADMIN',
        'ANALYST',
      ]),
    );
  });

  it('loads control tower KPIs', async () => {
    const data = await fetchControlTower();
    expect(data.kpis.length).toBeGreaterThan(0);
    expect(data.alertCounts).toBeDefined();
  });

  it('loads shipments list with sort + pagination contract', async () => {
    const page = await fetchShipments({ page: 0, pageSize: 10, sortBy: 'id', sortDir: 'asc' });
    expect(page.items.length).toBeLessThanOrEqual(10);
    expect(page.total).toBeGreaterThan(100);

    const sorted = sortRows(page.items, 'id', 'asc');
    const ids = sorted.map((row) => row.id);
    expect(ids).toEqual([...ids].sort());
  });

  it('loads shipment detail with timeline sections', async () => {
    const list = await fetchShipments({ page: 0, pageSize: 1 });
    const id = list.items[0]?.id;
    expect(id).toBeTruthy();

    const detail = await fetchShipment(id!);
    expect(detail.skus).toBeDefined();
    expect(detail.documents).toBeDefined();
    expect(detail.mapView.markers).toBeDefined();
  });

  it('runs scenario builder flow: create → run → compare', async () => {
    const created = await createScenario({
      name: 'Smoke test scenario',
      parameters: [{ category: 'Demand', label: 'Спрос', change: '+10%' }],
    });
    expect(created.id).toMatch(/^scn-/);
    expect(created.parameters).toHaveLength(1);

    const run = await runScenario(created.id);
    expect(run.status).toBe('COMPLETED');

    const scenarios = await fetchScenarios();
    const compareIds = scenarios.items.slice(0, 2).map((s) => s.id);
    expect(compareIds.length).toBeGreaterThanOrEqual(2);

    const comparison = await compareScenarios(compareIds);
    expect(comparison.scenarios.length).toBeGreaterThanOrEqual(2);
    expect(comparison.rows.some((r) => r.kpi === 'OTIF')).toBe(true);
  });

  it('adds incident comment via mutation service', async () => {
    const before = await fetchIncident('inc-001');
    const comment = await addIncidentComment('inc-001', 'Smoke test comment', {
      name: 'Tester',
      role: 'Manager',
    });
    expect(comment.message).toBe('Smoke test comment');

    const after = await fetchIncident('inc-001');
    expect(after.comments.length).toBeGreaterThan(before.comments.length);
    expect(after.comments.some((c) => c.id === comment.id)).toBe(true);
  });

  it('searches entities and loads live map layers', async () => {
    const results = await fetchGlobalSearch('SH-');
    expect(results.length).toBeGreaterThan(0);

    const map = await fetchLiveMap();
    expect(map.markers.length).toBeGreaterThan(0);
    expect(map.geofences).toBeDefined();
  });

  it('executes supply plan workflow action in mock', async () => {
    const result = await executePlanAction('supply', 'CALCULATE');
    expect(result.status).toBeDefined();
    expect(result.availableActions).toBeDefined();
  });
});
