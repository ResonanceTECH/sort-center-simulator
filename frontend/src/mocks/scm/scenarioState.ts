import { KPI } from '@/constants/platformRu';
import { getScenarioDetail, SCENARIOS_MOCK } from '@/mocks/scm/scmData';
import type { ComparisonSemantic } from '@/types/scm/semantic';
import type {
  CreateScenarioInput,
  ScenarioComparisonData,
  ScenarioDetail,
  ScenarioSummary,
} from '@/types/scm/scenario';

const BASELINE = {
  otif: '92%',
  cost: '12.4M',
  leadTime: '2.8d',
  stockout: '7%',
};

const COMPARISON_BY_ID: Record<string, Record<string, { value: string; semantic?: ComparisonSemantic }>> = {
  'scn-001': {
    otif: { value: '79%', semantic: 'RISK' },
    cost: { value: '13.1M' },
    leadTime: { value: '4.2d', semantic: 'RISK' },
    stockout: { value: '31%', semantic: 'RISK' },
  },
  'scn-002': {
    otif: { value: '93%', semantic: 'BEST' },
    cost: { value: '12.9M' },
    leadTime: { value: '3.0d' },
    stockout: { value: '9%', semantic: 'TARGET_REACHED' },
  },
};

let scenarios: ScenarioSummary[] = [...SCENARIOS_MOCK];
let nextId = 3;

function buildKpis(scenarioId: string) {
  const preset = COMPARISON_BY_ID[scenarioId];
  if (!preset) {
    return [
      { label: 'OTIF', baseline: 92, unit: '%', values: { baseline: 92, scenario: 91 }, semantic: { scenario: 'TARGET_REACHED' as const } },
      { label: KPI.stockoutRisk, baseline: 7, unit: '%', values: { baseline: 7, scenario: 8 } },
      { label: 'Логистические затраты', baseline: '12.4M', values: { baseline: '12.4M', scenario: '12.5M' } },
    ];
  }
  return [
    {
      label: 'OTIF',
      baseline: 92,
      unit: '%',
      values: { baseline: 92, scenario: parseInt(preset.otif?.value ?? '91', 10) },
      semantic: preset.otif?.semantic ? { scenario: preset.otif.semantic } : undefined,
    },
    {
      label: KPI.stockoutRisk,
      baseline: 7,
      unit: '%',
      values: { baseline: 7, scenario: parseInt(preset.stockout?.value ?? '8', 10) },
      semantic: preset.stockout?.semantic ? { scenario: preset.stockout.semantic } : undefined,
    },
    {
      label: 'Логистические затраты',
      baseline: '12.4M',
      values: { baseline: '12.4M', scenario: preset.cost?.value ?? '12.5M' },
    },
  ];
}

export function listScenarioState(): ScenarioSummary[] {
  return scenarios;
}

export function getScenarioState(id: string): ScenarioDetail | null {
  const summary = scenarios.find((s) => s.id === id);
  if (!summary) return getScenarioDetail(id);
  const base = getScenarioDetail(id);
  return {
    ...(base ?? summary),
    ...summary,
    parameters: base?.parameters ?? [],
    kpis: base?.kpis ?? buildKpis(id),
    availableActions: base?.availableActions ?? ['RUN', 'COMPARE'],
  };
}

export function createScenarioState(input: CreateScenarioInput): ScenarioDetail {
  const id = `scn-${String(nextId++).padStart(3, '0')}`;
  const summary: ScenarioSummary = {
    id,
    name: input.name,
    createdBy: 'Вы',
    status: 'DRAFT',
    basePlan: 'Supply Plan v3.2',
    createdAt: new Date().toISOString(),
  };
  scenarios = [summary, ...scenarios];
  return {
    ...summary,
    parameters: input.parameters,
    kpis: [],
    availableActions: ['RUN', 'COMPARE'],
  };
}

export async function runScenarioState(id: string): Promise<{ runId: string; status: string }> {
  scenarios = scenarios.map((s) =>
    s.id === id
      ? { ...s, status: 'RUNNING' as const, progress: 10, progressMessage: 'Загрузка базового плана...' }
      : s,
  );

  await new Promise((r) => setTimeout(r, 400));
  scenarios = scenarios.map((s) =>
    s.id === id ? { ...s, progress: 67, progressMessage: 'Оптимизация перевозок...' } : s,
  );

  await new Promise((r) => setTimeout(r, 400));
  scenarios = scenarios.map((s) =>
    s.id === id
      ? {
          ...s,
          status: 'COMPLETED' as const,
          progress: 100,
          progressMessage: undefined,
          lastCalculation: new Date().toISOString(),
          recommendationStatus: 'RISK' as const,
        }
      : s,
  );

  return { runId: `run-${id}`, status: 'COMPLETED' };
}

export function compareScenariosState(ids: string[]): ScenarioComparisonData {
  const selected = scenarios.filter((s) => ids.includes(s.id));
  const rowDefs = [
    { kpi: 'OTIF', key: 'otif' as const, baseline: BASELINE.otif },
    { kpi: 'Стоимость', key: 'cost' as const, baseline: BASELINE.cost },
    { kpi: 'Lead time', key: 'leadTime' as const, baseline: BASELINE.leadTime },
    { kpi: 'Риск дефицита', key: 'stockout' as const, baseline: BASELINE.stockout },
  ];

  let bestScenarioId: string | undefined;
  let bestOtif = -1;

  const rows = rowDefs.map(({ kpi, key, baseline }) => {
    const values: Record<string, string> = {};
    const semantic: Record<string, ComparisonSemantic> = {};
    for (const scenario of selected) {
      const cell = COMPARISON_BY_ID[scenario.id]?.[key];
      values[scenario.id] = cell?.value ?? '—';
      if (cell?.semantic) semantic[scenario.id] = cell.semantic;
      if (key === 'otif') {
        const otif = parseInt(cell?.value ?? '0', 10);
        if (otif > bestOtif) {
          bestOtif = otif;
          bestScenarioId = scenario.id;
        }
      }
    }
    return { kpi, baseline, values, semantic: Object.keys(semantic).length ? semantic : undefined };
  });

  return {
    scenarios: selected.map((s) => ({ id: s.id, name: s.name })),
    rows,
    bestScenarioId,
  };
}
