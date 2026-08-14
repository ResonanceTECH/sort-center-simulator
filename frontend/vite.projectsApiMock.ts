import type { Plugin } from 'vite';

interface ProjectBody {
  name?: unknown;
  description?: unknown;
}

interface MockScenario {
  id: string;
  name: string;
  updated_at: string;
  is_default: boolean;
}

interface MockRun {
  id: string;
  name: string;
  status: string;
  created_at: string;
  scenario_id: string;
}

interface MockProject {
  id: string;
  name: string;
  description: string | null;
  status: string;
  updated_at: string;
  created_at: string;
  default_scenario_id: string | null;
  scenarios: MockScenario[];
  last_run: MockRun | null;
  runs: MockRun[];
}

function readJsonBody(req: import('http').IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw) as unknown);
      } catch {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(
  res: import('http').ServerResponse,
  status: number,
  payload: unknown,
): void {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function hoursToday(h: number, m: number): string {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function daysAgo(days: number, h = 12, m = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

type RouteAction = 'root' | 'item' | 'scenarios' | 'runs' | 'copies' | 'archive';

function matchProjectRoute(url: string | undefined): {
  projectId: string;
  action: RouteAction;
} | null {
  if (!url) return null;
  const path = url.split('?')[0];

  if (path === '/api/v1/projects') {
    return { projectId: '', action: 'root' };
  }

  const scenarios = /^\/api\/v1\/projects\/([^/]+)\/scenarios$/.exec(path);
  if (scenarios) {
    return { projectId: decodeURIComponent(scenarios[1]), action: 'scenarios' };
  }

  const runs = /^\/api\/v1\/projects\/([^/]+)\/runs$/.exec(path);
  if (runs) {
    return { projectId: decodeURIComponent(runs[1]), action: 'runs' };
  }

  const copies = /^\/api\/v1\/projects\/([^/]+)\/copies$/.exec(path);
  if (copies) {
    return { projectId: decodeURIComponent(copies[1]), action: 'copies' };
  }

  const archive = /^\/api\/v1\/projects\/([^/]+)\/archive$/.exec(path);
  if (archive) {
    return { projectId: decodeURIComponent(archive[1]), action: 'archive' };
  }

  const item = /^\/api\/v1\/projects\/([^/]+)$/.exec(path);
  if (item) {
    return { projectId: decodeURIComponent(item[1]), action: 'item' };
  }

  return null;
}

const SCENARIO_NAMES = [
  'Базовый сценарий',
  'Пиковая нагрузка',
  'Ночная смена',
  'Расширение линий',
  'Аварийный режим',
  'Тестовый прогон',
];

function buildScenarios(projectId: string, updatedAt: string, count: number): MockScenario[] {
  const n = Math.max(count, 1);
  return Array.from({ length: n }, (_, index) => ({
    id: `${projectId}-scn-${index + 1}`,
    name: SCENARIO_NAMES[index] ?? `Сценарий ${index + 1}`,
    updated_at: index === 0 ? updatedAt : daysAgo(index, 10 + index, 15),
    is_default: index === 0,
  }));
}

function createProjectSeed(input: {
  id: string;
  name: string;
  description: string;
  status: string;
  updatedAt: string;
  scenariosCount: number;
  lastRun?: Omit<MockRun, 'scenario_id'> & { scenarioIndex?: number };
}): MockProject {
  const scenarios = buildScenarios(input.id, input.updatedAt, input.scenariosCount);
  const runs: MockRun[] = [];

  if (input.lastRun) {
    const scenario = scenarios[input.lastRun.scenarioIndex ?? 0] ?? scenarios[0];
    runs.push({
      id: input.lastRun.id,
      name: input.lastRun.name,
      status: input.lastRun.status,
      created_at: input.lastRun.created_at,
      scenario_id: scenario.id,
    });
  }

  return {
    id: input.id,
    name: input.name,
    description: input.description,
    status: input.status,
    updated_at: input.updatedAt,
    created_at: input.updatedAt,
    default_scenario_id: scenarios[0]?.id ?? null,
    scenarios,
    last_run: runs[0] ?? null,
    runs,
  };
}

function createDefaultScenario(projectId: string, updatedAt: string): MockScenario {
  return {
    id: `${projectId}-scn-1`,
    name: 'Базовый сценарий',
    updated_at: updatedAt,
    is_default: true,
  };
}

function toProjectResponse(project: MockProject) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    updated_at: project.updated_at,
    created_at: project.created_at,
    default_scenario_id: project.default_scenario_id,
    last_run: project.last_run,
  };
}

function buildSeedProjects(): MockProject[] {
  return [
    createProjectSeed({
      id: 'proj-1',
      name: 'Сортировочный центр 100К',
      description: 'Модель СЦ на 100 тысяч отправлений в сутки',
      status: 'completed',
      updatedAt: hoursToday(14, 32),
      scenariosCount: 3,
      lastRun: {
        id: 'proj-1-run-1',
        name: 'Расчёт базового сценария',
        status: 'completed',
        created_at: hoursToday(14, 32),
      },
    }),
    createProjectSeed({
      id: 'proj-2',
      name: 'СЦ Северный хаб',
      description: 'Северный хаб: конвейеры и зоны сортировки',
      status: 'completed',
      updatedAt: daysAgo(1, 18, 5),
      scenariosCount: 2,
      lastRun: {
        id: 'proj-2-run-1',
        name: 'Пиковая нагрузка',
        status: 'completed',
        created_at: daysAgo(1, 18, 5),
      },
    }),
    createProjectSeed({
      id: 'proj-3',
      name: 'Сортировочный центр 250К',
      description: 'Крупный СЦ 250К с несколькими линиями',
      status: 'completed',
      updatedAt: '2025-10-12T09:15:00.000Z',
      scenariosCount: 5,
      lastRun: {
        id: 'proj-3-run-1',
        name: 'Полный суточный цикл',
        status: 'completed',
        created_at: '2025-10-12T09:15:00.000Z',
      },
    }),
    createProjectSeed({
      id: 'proj-4',
      name: 'СЦ Юг — пилот',
      description: 'Пилотный проект южного СЦ',
      status: 'error',
      updatedAt: '2025-10-10T11:20:00.000Z',
      scenariosCount: 2,
      lastRun: {
        id: 'proj-4-run-1',
        name: 'Расчёт с ошибкой',
        status: 'failed',
        created_at: '2025-10-10T11:20:00.000Z',
      },
    }),
    createProjectSeed({
      id: 'proj-5',
      name: 'Черновик СЦ 80К',
      description: 'Черновик конфигурации СЦ 80К',
      status: 'draft',
      updatedAt: '2025-10-05T16:45:00.000Z',
      scenariosCount: 1,
    }),
    createProjectSeed({
      id: 'proj-6',
      name: 'СЦ Восток — расширение',
      description: 'Расширение восточного сортировочного центра',
      status: 'completed',
      updatedAt: daysAgo(2, 11, 10),
      scenariosCount: 4,
      lastRun: {
        id: 'proj-6-run-active',
        name: 'Пиковая нагрузка',
        status: 'running',
        created_at: hoursAgo(1),
      },
    }),
    createProjectSeed({
      id: 'proj-7',
      name: 'Мини-хаб 40К',
      description: 'Компактный мини-хаб на 40К',
      status: 'draft',
      updatedAt: daysAgo(3, 9, 0),
      scenariosCount: 1,
    }),
    createProjectSeed({
      id: 'proj-8',
      name: 'СЦ Центральный',
      description: 'Центральный СЦ, отладка потоков',
      status: 'error',
      updatedAt: daysAgo(4, 15, 40),
      scenariosCount: 3,
      lastRun: {
        id: 'proj-8-run-1',
        name: 'Ночной сценарий',
        status: 'failed',
        created_at: daysAgo(4, 15, 40),
      },
    }),
    createProjectSeed({
      id: 'proj-9',
      name: 'СЦ 150К — ночная смена',
      description: 'Моделирование ночной смены',
      status: 'completed',
      updatedAt: daysAgo(5, 20, 15),
      scenariosCount: 2,
      lastRun: {
        id: 'proj-9-run-active',
        name: 'Ночной сценарий',
        status: 'running',
        created_at: hoursAgo(2),
      },
    }),
    createProjectSeed({
      id: 'proj-10',
      name: 'Тестовый полигон',
      description: 'Песочница для экспериментов',
      status: 'draft',
      updatedAt: daysAgo(6, 8, 30),
      scenariosCount: 1,
    }),
    createProjectSeed({
      id: 'proj-11',
      name: 'СЦ Архив 2024',
      description: 'Архивный проект 2024 года',
      status: 'archived',
      updatedAt: daysAgo(30, 12, 0),
      scenariosCount: 6,
      lastRun: {
        id: 'proj-11-run-1',
        name: 'Итоговый расчёт',
        status: 'completed',
        created_at: daysAgo(30, 12, 0),
      },
    }),
    createProjectSeed({
      id: 'proj-12',
      name: 'СЦ Запад — stage 2',
      description: 'Вторая очередь западного СЦ',
      status: 'completed',
      updatedAt: daysAgo(7, 14, 0),
      scenariosCount: 4,
      lastRun: {
        id: 'proj-12-run-1',
        name: 'Stage 2 baseline',
        status: 'completed',
        created_at: daysAgo(7, 14, 0),
      },
    }),
  ];
}

/** Dev mock for /api/v1/projects* until real backend is wired. */
export function projectsApiMockPlugin(): Plugin {
  const projects = new Map<string, MockProject>();

  for (const seed of buildSeedProjects()) {
    projects.set(seed.id, seed);
  }

  return {
    name: 'projects-api-mock',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const route = matchProjectRoute(req.url);
        if (!route) {
          next();
          return;
        }

        const method = req.method ?? 'GET';

        try {
          // GET /api/v1/projects/{projectId}
          if (route.action === 'item' && method === 'GET') {
            const project = projects.get(route.projectId);
            if (!project) {
              sendJson(res, 404, { message: 'Проект не найден' });
              return;
            }
            await wait(350);
            sendJson(res, 200, toProjectResponse(project));
            return;
          }

          // GET /api/v1/projects/{projectId}/scenarios
          if (route.action === 'scenarios' && method === 'GET') {
            const project = projects.get(route.projectId);
            if (!project) {
              sendJson(res, 404, { message: 'Проект не найден' });
              return;
            }
            await wait(300);
            sendJson(res, 200, { scenarios: project.scenarios });
            return;
          }

          // POST /api/v1/projects/{projectId}/runs
          if (route.action === 'runs' && method === 'POST') {
            const project = projects.get(route.projectId);
            if (!project) {
              sendJson(res, 404, { message: 'Проект не найден' });
              return;
            }

            await wait(400);
            const now = new Date().toISOString();
            const scenarioId =
              project.default_scenario_id ?? project.scenarios[0]?.id ?? `${project.id}-scn-1`;
            const run: MockRun = {
              id: `${project.id}-run-${Date.now()}`,
              name: 'Новый расчёт',
              status: 'queued',
              created_at: now,
              scenario_id: scenarioId,
            };
            project.runs = [run, ...project.runs];
            project.last_run = run;
            project.updated_at = now;
            projects.set(project.id, project);

            sendJson(res, 201, run);
            return;
          }

          // POST /api/v1/projects
          if (route.action === 'root' && method === 'POST') {
            const body = (await readJsonBody(req)) as ProjectBody;
            const name = typeof body.name === 'string' ? body.name.trim() : '';
            const description =
              typeof body.description === 'string' ? body.description.trim() : '';

            if (!name) {
              sendJson(res, 400, {
                message: 'Название проекта обязательно',
                errors: { name: ['Название проекта обязательно'] },
              });
              return;
            }

            if (name.length > 120) {
              sendJson(res, 400, {
                message: 'Название слишком длинное (максимум 120 символов)',
                errors: { name: ['Максимум 120 символов'] },
              });
              return;
            }

            await wait(450);
            const now = new Date().toISOString();
            const id = `proj-${Date.now()}`;
            const scenario = createDefaultScenario(id, now);
            const project: MockProject = {
              id,
              name,
              description: description || null,
              status: 'draft',
              updated_at: now,
              created_at: now,
              default_scenario_id: scenario.id,
              scenarios: [scenario],
              last_run: null,
              runs: [],
            };
            projects.set(id, project);

            sendJson(res, 201, {
              id,
              name,
              description: description || null,
              status: 'draft',
              updated_at: now,
              created_at: now,
              scenarios_count: 1,
            });
            return;
          }

          // PATCH /api/v1/projects/{projectId}
          if (route.action === 'item' && method === 'PATCH') {
            const body = (await readJsonBody(req)) as ProjectBody;
            const name = typeof body.name === 'string' ? body.name.trim() : undefined;
            const description =
              typeof body.description === 'string' ? body.description.trim() : undefined;

            if (name !== undefined && !name) {
              sendJson(res, 400, {
                message: 'Название проекта обязательно',
                errors: { name: ['Название проекта обязательно'] },
              });
              return;
            }

            if (name && name.length > 120) {
              sendJson(res, 400, {
                message: 'Название слишком длинное (максимум 120 символов)',
                errors: { name: ['Максимум 120 символов'] },
              });
              return;
            }

            await wait(350);
            const now = new Date().toISOString();
            const existing = projects.get(route.projectId);
            if (existing) {
              if (name !== undefined) existing.name = name;
              if (description !== undefined) existing.description = description || null;
              existing.updated_at = now;
              projects.set(existing.id, existing);
              sendJson(res, 200, {
                id: existing.id,
                name: existing.name,
                description: existing.description,
                status: existing.status,
                updated_at: now,
              });
              return;
            }

            sendJson(res, 200, {
              id: route.projectId,
              name: name ?? `Проект ${route.projectId}`,
              description: description ?? null,
              status: 'draft',
              updated_at: now,
            });
            return;
          }

          // POST /api/v1/projects/{projectId}/copies
          if (route.action === 'copies' && method === 'POST') {
            await wait(400);
            const now = new Date().toISOString();
            const source = projects.get(route.projectId);
            const id = `proj-copy-${Date.now()}`;
            const scenario = createDefaultScenario(id, now);
            const copy: MockProject = {
              id,
              name: source ? `${source.name} (копия)` : `Копия ${route.projectId}`,
              description: source?.description ?? null,
              status: 'draft',
              updated_at: now,
              created_at: now,
              default_scenario_id: scenario.id,
              scenarios: [scenario],
              last_run: null,
              runs: [],
            };
            projects.set(id, copy);

            sendJson(res, 201, {
              id,
              name: copy.name,
              description: copy.description,
              status: 'draft',
              updated_at: now,
              created_at: now,
              scenarios_count: 1,
              source_project_id: route.projectId,
            });
            return;
          }

          // POST /api/v1/projects/{projectId}/archive
          if (route.action === 'archive' && method === 'POST') {
            await wait(350);
            const now = new Date().toISOString();
            const existing = projects.get(route.projectId);
            if (existing) {
              existing.status = 'archived';
              existing.updated_at = now;
              projects.set(existing.id, existing);
            }
            sendJson(res, 200, {
              id: route.projectId,
              status: 'archived',
              updated_at: now,
            });
            return;
          }

          // DELETE /api/v1/projects/{projectId}
          if (route.action === 'item' && method === 'DELETE') {
            await wait(350);
            projects.delete(route.projectId);
            res.statusCode = 204;
            res.end();
            return;
          }

          next();
        } catch {
          sendJson(res, 400, { message: 'Некорректное тело запроса' });
        }
      });
    },
  };
}
