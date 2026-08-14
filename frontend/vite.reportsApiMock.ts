import type { Plugin } from 'vite';

interface ReportRecord {
  id: string;
  name: string;
  project_id: string;
  project_name: string;
  scenario_id: string | null;
  scenario_name: string | null;
  type: string;
  format: string;
  status: string;
  created_at: string;
  file_size_bytes: number;
}

const reportsStore: ReportRecord[] = [
  {
    id: 'rep-1',
    name: 'Итоги симуляции — базовая смена',
    project_id: 'proj-1',
    project_name: 'Сортировочный центр 100К',
    scenario_id: 'proj-1-scn-1',
    scenario_name: 'Базовый сценарий',
    type: 'simulation',
    format: 'pdf',
    status: 'ready',
    created_at: '2026-08-10T14:32:00.000Z',
    file_size_bytes: 1_248_512,
  },
  {
    id: 'rep-2',
    name: 'Статистика пропускной способности',
    project_id: 'proj-1',
    project_name: 'Сортировочный центр 100К',
    scenario_id: 'proj-1-scn-2',
    scenario_name: 'Пиковая нагрузка',
    type: 'statistics',
    format: 'xlsx',
    status: 'ready',
    created_at: '2026-08-09T11:05:00.000Z',
    file_size_bytes: 428_032,
  },
  {
    id: 'rep-3',
    name: 'Сравнение сценариев A/B',
    project_id: 'proj-2',
    project_name: 'СЦ Северный хаб',
    scenario_id: null,
    scenario_name: null,
    type: 'comparison',
    format: 'pdf',
    status: 'processing',
    created_at: '2026-08-11T09:20:00.000Z',
    file_size_bytes: 0,
  },
  {
    id: 'rep-4',
    name: 'Экспорт параметров модели',
    project_id: 'proj-3',
    project_name: 'Сортировочный центр 250К',
    scenario_id: 'proj-3-scn-1',
    scenario_name: 'Базовый сценарий',
    type: 'export',
    format: 'json',
    status: 'ready',
    created_at: '2026-08-08T16:40:00.000Z',
    file_size_bytes: 86_400,
  },
  {
    id: 'rep-5',
    name: 'Отчёт по ошибкам конфигурации',
    project_id: 'proj-4',
    project_name: 'СЦ Юг — пилот',
    scenario_id: 'proj-4-scn-1',
    scenario_name: 'Базовый сценарий',
    type: 'statistics',
    format: 'csv',
    status: 'failed',
    created_at: '2026-08-07T08:15:00.000Z',
    file_size_bytes: 12_288,
  },
  {
    id: 'rep-6',
    name: 'Архивный отчёт Q2',
    project_id: 'proj-11',
    project_name: 'СЦ Архив 2024',
    scenario_id: 'proj-11-scn-1',
    scenario_name: 'Базовый сценарий',
    type: 'simulation',
    format: 'pdf',
    status: 'expired',
    created_at: '2025-12-01T10:00:00.000Z',
    file_size_bytes: 2_101_248,
  },
  {
    id: 'rep-7',
    name: 'Ночная смена — KPI',
    project_id: 'proj-9',
    project_name: 'СЦ 150К — ночная смена',
    scenario_id: 'proj-9-scn-1',
    scenario_name: 'Базовый сценарий',
    type: 'statistics',
    format: 'xlsx',
    status: 'ready',
    created_at: '2026-08-06T21:10:00.000Z',
    file_size_bytes: 512_000,
  },
  {
    id: 'rep-8',
    name: 'Сырые данные симуляции',
    project_id: 'proj-6',
    project_name: 'СЦ Восток — расширение',
    scenario_id: 'proj-6-scn-2',
    scenario_name: 'Пиковая нагрузка',
    type: 'export',
    format: 'csv',
    status: 'ready',
    created_at: '2026-08-05T13:55:00.000Z',
    file_size_bytes: 3_457_024,
  },
];

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

function parseQuery(url: string): URLSearchParams {
  const idx = url.indexOf('?');
  return new URLSearchParams(idx >= 0 ? url.slice(idx + 1) : '');
}

function matchReportsRoute(url: string | undefined): {
  reportId: string;
  action: 'list' | 'item' | 'download';
  rawUrl: string;
} | null {
  if (!url) return null;
  const path = url.split('?')[0];

  if (path === '/api/v1/reports') {
    return { reportId: '', action: 'list', rawUrl: url };
  }

  const download = /^\/api\/v1\/reports\/([^/]+)\/download$/.exec(path);
  if (download) {
    return {
      reportId: decodeURIComponent(download[1]),
      action: 'download',
      rawUrl: url,
    };
  }

  const item = /^\/api\/v1\/reports\/([^/]+)$/.exec(path);
  if (item) {
    return {
      reportId: decodeURIComponent(item[1]),
      action: 'item',
      rawUrl: url,
    };
  }

  return null;
}

function filterReports(query: URLSearchParams): ReportRecord[] {
  const search = (query.get('search') ?? '').trim().toLowerCase();
  const type = query.get('type') ?? 'all';
  const status = query.get('status') ?? 'all';
  const format = query.get('format') ?? 'all';

  return reportsStore.filter((report) => {
    if (type !== 'all' && report.type !== type) return false;
    if (status !== 'all' && report.status !== status) return false;
    if (format !== 'all' && report.format !== format) return false;
    if (!search) return true;

    const haystack = [
      report.name,
      report.project_name,
      report.scenario_name ?? '',
      report.type,
      report.format,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

/** Dev mock for /api/v1/reports* */
export function reportsApiMockPlugin(): Plugin {
  return {
    name: 'reports-api-mock',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const route = matchReportsRoute(req.url);
        if (!route) {
          next();
          return;
        }

        const method = req.method ?? 'GET';

        try {
          if (route.action === 'list' && method === 'GET') {
            await wait(400);
            const filtered = filterReports(parseQuery(route.rawUrl)).sort(
              (a, b) => +new Date(b.created_at) - +new Date(a.created_at),
            );
            sendJson(res, 200, { items: filtered, total: filtered.length });
            return;
          }

          if (route.action === 'item' && method === 'GET') {
            await wait(250);
            const report = reportsStore.find((item) => item.id === route.reportId);
            if (!report) {
              sendJson(res, 404, { message: 'Отчёт не найден' });
              return;
            }
            sendJson(res, 200, report);
            return;
          }

          if (route.action === 'item' && method === 'DELETE') {
            await wait(300);
            const index = reportsStore.findIndex((item) => item.id === route.reportId);
            if (index === -1) {
              sendJson(res, 404, { message: 'Отчёт не найден' });
              return;
            }
            reportsStore.splice(index, 1);
            res.statusCode = 204;
            res.end();
            return;
          }

          if (route.action === 'download' && method === 'GET') {
            await wait(350);
            const report = reportsStore.find((item) => item.id === route.reportId);
            if (!report) {
              sendJson(res, 404, { message: 'Отчёт не найден' });
              return;
            }
            if (report.status !== 'ready') {
              sendJson(res, 409, { message: 'Отчёт ещё не готов к скачиванию' });
              return;
            }

            const body = [
              'report_id,name,project,scenario,type,format,status,created_at',
              [
                report.id,
                `"${report.name}"`,
                `"${report.project_name}"`,
                `"${report.scenario_name ?? ''}"`,
                report.type,
                report.format,
                report.status,
                report.created_at,
              ].join(','),
            ].join('\n');

            const filename = `${report.name.replace(/[^\wа-яА-ЯёЁ\- ]+/g, '').trim() || report.id}.${report.format === 'pdf' ? 'pdf' : report.format}`;
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader(
              'Content-Disposition',
              `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
            );
            res.end(body);
            return;
          }

          next();
        } catch {
          sendJson(res, 500, { message: 'Ошибка сервиса отчётов' });
        }
      });
    },
  };
}
