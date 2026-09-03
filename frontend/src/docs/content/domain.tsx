import type { DocArticle } from '@/docs/types';
import { ApiRow, Callout, DocLink, InlineCode, P, Ul } from '@/docs/content/helpers';

const UPDATED = '2026-09-03';

export const domainArticles: DocArticle[] = [
  {
    slug: 'execution/shipments',
    title: 'Поставки (Shipment Workspace)',
    description: 'Единый workspace: Board, Table, Map; risk отдельно от lifecycle.',
    category: 'Исполнение',
    order: 10,
    roles: ['LOGISTICS_MANAGER', 'SUPPLY_CHAIN_MANAGER', 'SUPPLY_PLANNER', 'ANALYST'],
    status: 'partial',
    lastUpdated: UPDATED,
    keywords: ['shipments', 'board', 'kanban', 'eta', 'kpi'],
    productRoutes: ['/shipments'],
    prev: 'roles/logistics-manager',
    next: 'execution/exceptions',
    sections: [
      {
        id: 'why',
        title: 'Зачем',
        body: (
          <P>
            Операционный контроль текущих поставок: этап lifecycle, перевозчик, ETA, отклонение, риск
            SLA, актуальность tracking, допустимые действия.
          </P>
        ),
      },
      {
        id: 'who',
        title: 'Для кого',
        body: (
          <P>
            Logistics — полный ops; SCM — полный; Planner/Analyst — read-only board/actions. Supplier/Carrier
            используют порталы, не этот Board.
          </P>
        ),
      },
      {
        id: 'ui',
        title: 'Интерфейс',
        body: (
          <Ul
            items={[
              'Заголовок «Операционный центр»; Создать поставку при shipment.create.',
              'KPI (Active, At Risk, Delayed, No Tracking, avg ETA deviation, OTIF Today) — клик → фильтры.',
              'View switcher: Карта / Таблица / Доска → ?view=',
              'Фильтры в URL: search, status, risk, supplier, carrier, route, warehouse, tracking.',
              'Board: колонки PLANNED…DELIVERED; группировка по этапу или по риску; DELIVERED скрыт по умолчанию.',
              'Карточка: id, RiskBadge, supplier, route, progress, carrier, ETA, deviation, tracking age.',
              'Click → QuickView drawer → «Открыть поставку» → /shipments/:id.',
            ]}
          />
        ),
      },
      {
        id: 'rules',
        title: 'Business rules',
        body: (
          <>
            <P>
              Risk (HIGH/CRITICAL) — не колонка lifecycle. Произвольный drag lifecycle запрещён; переходы
              через API actions.
            </P>
            <Callout title="Данные KPI" tone="warn">
              В mock KPI считает frontend-mock service. Backend GET /shipments пока не возвращает блок
              kpis — при API mode mapper подставляет нули/дефолты.
            </Callout>
          </>
        ),
      },
      {
        id: 'api',
        title: 'API',
        body: (
          <>
            <ApiRow method="GET" path="/api/v1/shipments" note="list + scope" />
            <ApiRow method="GET" path="/api/v1/shipments/{id}" />
            <ApiRow method="POST" path="/api/v1/shipments/{id}/assign-carrier" />
            <ApiRow method="POST" path="/api/v1/shipments/{id}/cancel" />
            <ApiRow method="POST" path="/api/v1/shipments/{id}/report-delay" />
            <P>
              Полный список action endpoints — OpenAPI и{' '}
              <DocLink to="/docs/developers/api-getting-started">API getting started</DocLink>.
            </P>
          </>
        ),
      },
      {
        id: 'next',
        title: 'Следующий шаг',
        body: (
          <P>
            <DocLink to="/docs/execution/exceptions">Отклонения</DocLink> ·{' '}
            <DocLink to="/docs/getting-started/quickstart">Quickstart</DocLink>
          </P>
        ),
      },
    ],
  },
  {
    slug: 'execution/exceptions',
    title: 'Отклонения (Exceptions)',
    description: 'Сигналы о сбоях исполнения, связанные с поставкой и impact.',
    category: 'Исполнение',
    order: 20,
    roles: ['LOGISTICS_MANAGER', 'SUPPLY_CHAIN_MANAGER', 'ANALYST'],
    status: 'partial',
    lastUpdated: UPDATED,
    keywords: ['exception', 'отклонение', 'sla', 'impact'],
    productRoutes: ['/exceptions'],
    prev: 'execution/shipments',
    next: 'planning/overview',
    sections: [
      {
        id: 'why',
        title: 'Зачем',
        body: (
          <P>
            Exception — зафиксированное отклонение (остановка, срыв ETA и т.п.), не замена статуса
            Shipment. Ведёт к оценке impact и при необходимости к Incident.
          </P>
        ),
      },
      {
        id: 'ui',
        title: 'Интерфейс',
        body: (
          <Ul
            items={[
              <>Список <InlineCode>/exceptions</InlineCode>, карточка/detail <InlineCode>/exceptions/:id</InlineCode>.</>,
              'Связь с shipment, severity, impact endpoint на backend.',
            ]}
          />
        ),
      },
      {
        id: 'api',
        title: 'API',
        body: (
          <>
            <ApiRow method="GET" path="/api/v1/exceptions" note="scoped" />
            <ApiRow method="GET" path="/api/v1/exceptions/{id}" />
            <ApiRow method="GET" path="/api/v1/exceptions/{id}/impact" />
            <Callout title="Ограничение" tone="warn">
              Resolve/assign exception endpoints пока отсутствуют — не описывайте их как готовый workflow.
            </Callout>
          </>
        ),
      },
      {
        id: 'related',
        title: 'Связанные материалы',
        body: (
          <P>
            Дальше: создать Incident из UI (POST /incidents) · разобрать через{' '}
            <DocLink to="/docs/scenarios/overview">Scenario</DocLink>.
          </P>
        ),
      },
    ],
  },
  {
    slug: 'planning/overview',
    title: 'Планирование',
    description: 'Контур Forecast → Supply / Inventory / Transport → Plan/Fact.',
    category: 'Планирование',
    order: 10,
    roles: ['SUPPLY_PLANNER', 'SUPPLY_CHAIN_MANAGER'],
    status: 'partial',
    lastUpdated: UPDATED,
    keywords: ['planning', 'forecast', 'supply plan', 'plan-fact'],
    productRoutes: ['/planning', '/planning/demand', '/planning/supply', '/planning/transport'],
    prev: 'execution/exceptions',
    next: 'scenarios/overview',
    sections: [
      {
        id: 'why',
        title: 'Зачем',
        body: (
          <P>
            Согласовать спрос, закупки/поставки, запасы и транспортную мощность до старта исполнения.
          </P>
        ),
      },
      {
        id: 'pages',
        title: 'Страницы',
        body: (
          <Ul
            items={[
              <>Overview <InlineCode>/planning</InlineCode></>,
              <>Demand <InlineCode>/planning/demand</InlineCode> — в API mode без dedicated forecast endpoint (stub/mapper).</>,
              <>Supply / Inventory / Transport / Plan-Fact — list plans с backend при mocks off.</>,
            ]}
          />
        ),
      },
      {
        id: 'workflow',
        title: 'Целевой approval workflow',
        body: (
          <Callout title="Permissions vs endpoints" tone="warn">
            В матрице есть supply_plan.submit / approve / activate. Dedicated calculate/approve endpoints
            на backend ещё не реализованы — не проводите demo «approve в проде» как закрытый контур.
            Planner не имеет approve в матрице.
          </Callout>
        ),
      },
      {
        id: 'api',
        title: 'API (факт)',
        body: (
          <>
            <ApiRow method="GET" path="/api/v1/supply-plans" />
            <ApiRow method="GET" path="/api/v1/inventory-plans" />
            <ApiRow method="GET" path="/api/v1/transport-plans" />
            <ApiRow method="GET" path="/api/v1/plans/{id}/plan-fact" />
          </>
        ),
      },
    ],
  },
  {
    slug: 'scenarios/overview',
    title: 'Сценарии (What-if)',
    description: 'Создание, run, сравнение и apply с версионированием плана.',
    category: 'Сценарии',
    order: 10,
    roles: ['SUPPLY_CHAIN_MANAGER', 'SUPPLY_PLANNER', 'ANALYST', 'LOGISTICS_MANAGER'],
    status: 'partial',
    lastUpdated: UPDATED,
    keywords: ['scenario', 'what-if', 'compare', 'apply'],
    productRoutes: ['/scenarios', '/scenarios/new', '/scenarios/compare'],
    prev: 'planning/overview',
    next: 'developers/api-getting-started',
    sections: [
      {
        id: 'why',
        title: 'Зачем',
        body: (
          <P>
            Оценить последствия решения (другой carrier mix, задержка, перераспределение) до изменения
            активного плана.
          </P>
        ),
      },
      {
        id: 'flow',
        title: 'Workflow',
        body: (
          <Ul
            items={[
              'Создать сценарий (/scenarios/new) с параметрами.',
              'Run → backend 202 QUEUED → poll GET /scenario-runs/{id} до COMPLETED/FAILED.',
              'Compare на /scenarios/compare.',
              'Recommendations — выборка с GET /scenarios/{id}/recommendations.',
              'Apply (scenario.apply) → создаёт новую версию плана (POST …/apply).',
            ]}
          />
        ),
      },
      {
        id: 'perms',
        title: 'Permissions',
        body: (
          <P>
            Run/compare — Planner/Analyst/SCM/Logistics (по матрице). Apply — SCM (не Planner/Analyst/Admin
            ops).
          </P>
        ),
      },
    ],
  },
  {
    slug: 'developers/api-getting-started',
    title: 'API: начало работы',
    description: 'Auth, me, shipments, OpenAPI — только существующие endpoints.',
    category: 'Разработчикам',
    order: 10,
    roles: ['DEVELOPER'],
    status: 'implemented',
    lastUpdated: UPDATED,
    keywords: ['api', 'jwt', 'openapi', 'auth', 'shipments'],
    prev: 'scenarios/overview',
    next: 'reference/glossary',
    sections: [
      {
        id: 'base',
        title: 'База',
        body: (
          <Ul
            items={[
              <>Base URL: <InlineCode>/api/v1</InlineCode></>,
              <>
                Interactive OpenAPI: <DocLink to="http://localhost:8000/docs">localhost:8000/docs</DocLink>
              </>,
              <>Schema: <InlineCode>/openapi.json</InlineCode></>,
            ]}
          />
        ),
      },
      {
        id: 'auth',
        title: 'Authentication',
        body: (
          <>
            <ApiRow method="POST" path="/api/v1/auth/login" note="access_token + refresh_token" />
            <ApiRow method="POST" path="/api/v1/auth/refresh" />
            <ApiRow method="POST" path="/api/v1/auth/logout" />
            <ApiRow method="GET" path="/api/v1/auth/me" note="roles, permissions, workspaces, org" />
            <P>Authorization: Bearer &lt;access_token&gt;</P>
          </>
        ),
      },
      {
        id: 'rbac',
        title: 'RBAC и scope',
        body: (
          <P>
            Недостаточно permission — для поставок проверяется object scope (supplier/carrier linked org).
            Чужой объект → 404. Analyst cancel → 403.
          </P>
        ),
      },
      {
        id: 'shipments',
        title: 'Shipments (пример)',
        body: (
          <>
            <ApiRow method="GET" path="/api/v1/shipments?page=1&page_size=50" />
            <ApiRow method="POST" path="/api/v1/shipments/{id}/assign-carrier" note='{"carrier_id":"…"}' />
            <P>Пагинация 1-based page на backend; FE маппит в 0-based для таблиц.</P>
          </>
        ),
      },
      {
        id: 'errors',
        title: 'Ошибки',
        body: (
          <Ul
            items={[
              '401 — нет/битый токен',
              '403 — FORBIDDEN (permission)',
              '404 — not found или out-of-scope shipment',
              '422 — validation',
            ]}
          />
        ),
      },
      {
        id: 'realtime',
        title: 'Realtime',
        body: (
          <Callout title="Не готово к production" tone="warn">
            FE использует mock SSE. Backend WS /api/v1/ws/events без полноценной auth — не подключайте как
            secure channel.
          </Callout>
        ),
      },
    ],
  },
  {
    slug: 'reference/glossary',
    title: 'Глоссарий',
    description: 'Ключевые термины платформы.',
    category: 'Справочник',
    order: 10,
    roles: ['ALL'],
    status: 'implemented',
    lastUpdated: UPDATED,
    keywords: ['glossary', 'otif', 'eta', 'sla', 'scenario'],
    prev: 'developers/api-getting-started',
    next: 'support/faq',
    sections: [
      {
        id: 'terms',
        title: 'Термины',
        body: (
          <Ul
            items={[
              <><strong>OTIF</strong> — On Time In Full, доля поставок вовремя и полностью.</>,
              <><strong>ETA</strong> — ожидаемое время прибытия (plan vs forecast).</>,
              <><strong>SLA</strong> — договорной уровень сервиса; риск SLA на карточке поставки.</>,
              <><strong>Supply Network</strong> — узлы и связи (склады, хабы, маршруты).</>,
              <><strong>Supplier / Carrier</strong> — поставщик / перевозчик.</>,
              <><strong>Transport Lane</strong> — транспортное направление (lane).</>,
              <><strong>Safety Stock / Days of Supply / Stockout</strong> — запас, дни покрытия, дефицит.</>,
              <><strong>Forecast / Plan</strong> — прогноз спроса / план (supply, inventory, transport).</>,
              <><strong>Shipment</strong> — поставка с lifecycle статусами.</>,
              <><strong>Tracking</strong> — трекинг позиции/событий.</>,
              <><strong>Exception</strong> — отклонение исполнения.</>,
              <><strong>Incident</strong> — инцидент с владельцем/комментариями/resolve.</>,
              <><strong>Baseline / Scenario / Recommendation</strong> — база, what-if, рекомендация.</>,
              <><strong>Control Tower</strong> — оперативный обзор KPI и алертов.</>,
            ]}
          />
        ),
      },
    ],
  },
  {
    slug: 'support/faq',
    title: 'FAQ',
    description: 'Частые вопросы по ролям, доступу и демо.',
    category: 'Поддержка',
    order: 10,
    roles: ['ALL'],
    status: 'implemented',
    lastUpdated: UPDATED,
    keywords: ['faq', '403', 'mock', 'login'],
    prev: 'reference/glossary',
    next: 'support/known-limitations',
    sections: [
      {
        id: 'general',
        title: 'Общее',
        body: (
          <Ul
            items={[
              <>Почему пустые KPI на Board в API mode? — backend list без kpis; см. ограничения.</>,
              <>Где документация OpenAPI? — <InlineCode>http://localhost:8000/docs</InlineCode>.</>,
            ]}
          />
        ),
      },
      {
        id: 'access',
        title: 'Доступ',
        body: (
          <Ul
            items={[
              '403 на странице — нет route permission или shell.',
              'Analyst не видит Cancel / получает 403 на API — ожидаемо.',
              'Supplier не видит чужие поставки — object scope (404).',
            ]}
          />
        ),
      },
      {
        id: 'demo',
        title: 'Демо',
        body: (
          <P>
            Учётки и пароли — в README. Mock по умолчанию; для RBAC выключите{' '}
            <InlineCode>VITE_USE_API_MOCKS</InlineCode>.
          </P>
        ),
      },
    ],
  },
  {
    slug: 'support/known-limitations',
    title: 'Известные ограничения',
    description: 'Честный список gaps продукта.',
    category: 'Поддержка',
    order: 20,
    roles: ['ALL', 'DEVELOPER'],
    status: 'implemented',
    lastUpdated: UPDATED,
    keywords: ['limitations', 'gaps', 'planned'],
    prev: 'support/faq',
    next: 'support/changelog',
    sections: [
      {
        id: 'list',
        title: 'Список',
        body: (
          <Ul
            items={[
              'Default mock mode маскирует контрактные дыры.',
              'Portal UI (orders, vehicles) — mock; APIs missing.',
              'Plan approve/calculate endpoints missing.',
              'Demand forecast API missing.',
              'Exception resolve API missing.',
              'Realtime: mock SSE; WS stub unauthenticated (не использовать как secure channel).',
              'GET /scenario-runs/{id}/results — риск IDOR без org filter (backend).',
              'Reports SCM path vs project reports — mismatch.',
              'Resilience / многие */new — placeholders.',
              'Network page UI — inline mock; apiGetNetwork не подключён.',
              'Нет MFA / compliance claims.',
            ]}
          />
        ),
      },
      {
        id: 'audit',
        title: 'Детали',
        body: (
          <P>
            Полный аудит: файлы <InlineCode>ROLE_PAGE_API_AUDIT.md</InlineCode>,{' '}
            <InlineCode>DOCUMENTATION_AUDIT.md</InlineCode> в корне репозитория.
          </P>
        ),
      },
    ],
  },
  {
    slug: 'support/changelog',
    title: 'Changelog',
    description: 'Краткая история изменений продукта.',
    category: 'Поддержка',
    order: 30,
    roles: ['ALL'],
    status: 'implemented',
    lastUpdated: UPDATED,
    keywords: ['changelog', 'release'],
    productRoutes: ['/changelog'],
    prev: 'support/known-limitations',
    sections: [
      {
        id: 'v0',
        title: '0.1.0 — 2026-09-03',
        body: (
          <Ul
            items={[
              'Added: in-app /docs shell, search, role guides, shipments/planning/exceptions/scenarios docs.',
              'Added: SCM RBAC, /auth/me, shipment actions + object scope, logistics Board workspace.',
              'Changed: README dual-product; logistics landing → shipments board.',
              'Known: mocks default; portal/plan approve gaps — see limitations.',
            ]}
          />
        ),
      },
    ],
  },
];
