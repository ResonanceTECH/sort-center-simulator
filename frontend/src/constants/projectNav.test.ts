import { describe, expect, it } from 'vitest';
import { mapProjectAccess } from '@/constants/permissions';
import {
  PROJECT_NAV_TABS,
  buildProjectNavContext,
  filterProjectNavTabs,
  resolveActiveProjectTab,
  resolveDefaultScenarioId,
} from '@/constants/projectNav';

const PROJECT_ID = 'proj-1';
const SCENARIO_ID = 'scn-default';

const ownerAccess = mapProjectAccess({
  role: 'owner',
  permissions: {
    project: ['read'],
    model: ['read'],
    equipment_params: ['read'],
    flow_params: ['read'],
    scenarios: ['read'],
    simulation_run: ['read'],
    simulation_results: ['read'],
    visualization: ['read'],
    statistics: ['read'],
    comparison: ['read'],
  },
  capabilities: {
    delete_project: true,
    manage_members: true,
    copy_project: true,
    export_csv: true,
    set_default_scenario: true,
  },
});

const viewerAccess = mapProjectAccess({
  role: 'viewer',
  permissions: {
    project: ['read'],
    model: ['read'],
    equipment_params: ['read'],
    flow_params: ['read'],
    scenarios: ['read'],
    simulation_run: ['read'],
    simulation_results: ['read'],
    visualization: ['read'],
    statistics: ['read'],
    comparison: ['read'],
  },
  capabilities: {
    delete_project: false,
    manage_members: false,
    copy_project: false,
    export_csv: false,
    set_default_scenario: false,
  },
});

describe('projectNav', () => {
  it('resolves default scenario from project data', () => {
    expect(resolveDefaultScenarioId('missing', ['a', 'b'])).toBe('a');
    expect(resolveDefaultScenarioId('a', ['a', 'b'])).toBe('a');
    expect(resolveDefaultScenarioId(null, [])).toBeNull();
  });

  it('builds model/parameters paths with default scenario', () => {
    const ctx = buildProjectNavContext(PROJECT_ID, SCENARIO_ID, [SCENARIO_ID, 'other']);
    const modelTab = PROJECT_NAV_TABS.find((tab) => tab.id === 'model');
    const parametersTab = PROJECT_NAV_TABS.find((tab) => tab.id === 'parameters');

    expect(modelTab?.getPath(ctx)).toBe(`/projects/${PROJECT_ID}/scenarios/${SCENARIO_ID}/editor`);
    expect(parametersTab?.getPath(ctx)).toBe(
      `/projects/${PROJECT_ID}/scenarios/${SCENARIO_ID}/parameters`,
    );
  });

  it('hides members tab for viewer', () => {
    const ownerTabs = filterProjectNavTabs(ownerAccess);
    const viewerTabs = filterProjectNavTabs(viewerAccess);

    expect(ownerTabs.some((tab) => tab.id === 'members')).toBe(true);
    expect(viewerTabs.some((tab) => tab.id === 'members')).toBe(false);
  });

  it('resolves active tab for nested routes', () => {
    expect(
      resolveActiveProjectTab(`/projects/${PROJECT_ID}/runs/run-42`, PROJECT_ID)?.id,
    ).toBe('runs');
    expect(
      resolveActiveProjectTab(
        `/projects/${PROJECT_ID}/scenarios/${SCENARIO_ID}/editor`,
        PROJECT_ID,
      )?.id,
    ).toBe('model');
    expect(
      resolveActiveProjectTab(
        `/projects/${PROJECT_ID}/scenarios/${SCENARIO_ID}/parameters`,
        PROJECT_ID,
      )?.id,
    ).toBe('parameters');
    expect(resolveActiveProjectTab(`/projects/${PROJECT_ID}/scenarios`, PROJECT_ID)?.id).toBe(
      'scenarios',
    );
    expect(resolveActiveProjectTab(`/projects/${PROJECT_ID}`, PROJECT_ID)?.id).toBe('overview');
  });
});
