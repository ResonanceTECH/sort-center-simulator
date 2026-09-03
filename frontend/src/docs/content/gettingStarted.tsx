import type { DocArticle } from '@/docs/types';
import { Callout, DocLink, InlineCode, P, Ul } from '@/docs/content/helpers';

const UPDATED = '2026-09-03';

export const gettingStartedArticles: DocArticle[] = [
  {
    slug: 'getting-started/introduction',
    title: 'Введение',
    description: 'Что такое платформа и какую задачу она решает.',
    category: 'Начало работы',
    order: 10,
    roles: ['ALL'],
    status: 'implemented',
    lastUpdated: UPDATED,
    keywords: ['введение', 'scm', 'цепочка поставок', 'обзор'],
    next: 'getting-started/overview',
    sections: [
      {
        id: 'what',
        title: 'Что это',
        body: (
          <>
            <P>
              Платформа объединяет операционный контроль цепочки поставок (SCM) и симулятор
              сортировочного центра. Документация в первую очередь описывает SCM: сеть, планы,
              поставки (Shipment), отклонения (Exception), инциденты, сценарии «что если».
            </P>
            <P>
              Симулятор СЦ живёт в разделе <InlineCode>/projects</InlineCode> и использует
              отдельную модель прав проекта — не путайте её с ролями SCM.
            </P>
          </>
        ),
      },
      {
        id: 'problem',
        title: 'Какую проблему решает',
        body: (
          <Ul
            items={[
              'Один контур видимости: план → исполнение → риск → реакция.',
              'Ролевые рабочие места вместо общего «дашборда для всех».',
              'Действия с проверкой permissions и object scope на backend (поставки).',
              'What-if сценарии без немедленной подмены активного плана.',
            ]}
          />
        ),
      },
      {
        id: 'audience',
        title: 'Для кого',
        body: (
          <Ul
            items={[
              'Supply Chain Manager, Planner, Logistics Manager, Analyst — внутренние роли.',
              'Supplier и Carrier — отдельные порталы со своим scope.',
              'Administrator — IAM и справочники.',
              'Разработчики и интеграторы — REST API и OpenAPI.',
            ]}
          />
        ),
      },
      {
        id: 'honesty',
        title: 'Как читать статусы',
        body: (
          <Callout title="Честность по реализации" tone="warn">
            Часть UI работает в демо через mocks (<InlineCode>VITE_USE_API_MOCKS=true</InlineCode>).
            В статьях мы не выдаём запущенные интеграции ERP/TMS или MFA за готовые. Смотрите{' '}
            <DocLink to="/docs/support/known-limitations">известные ограничения</DocLink>.
          </Callout>
        ),
      },
    ],
  },
  {
    slug: 'getting-started/overview',
    title: 'Обзор платформы',
    description: 'Модули продукта и полный цикл PLAN → EXECUTE → … → REPLAN.',
    category: 'Начало работы',
    order: 20,
    roles: ['ALL'],
    status: 'partial',
    lastUpdated: UPDATED,
    keywords: ['модули', 'control tower', 'workflow', 'обзор'],
    productRoutes: ['/control-tower', '/planning', '/shipments', '/scenarios'],
    prev: 'getting-started/introduction',
    next: 'getting-started/architecture',
    sections: [
      {
        id: 'modules',
        title: 'Модули',
        body: (
          <Ul
            items={[
              <>
                <strong>Control Tower</strong> — сводные KPI и «требует внимания» (
                <InlineCode>/control-tower</InlineCode>).
              </>,
              <>
                <strong>Стратегия</strong> — сеть, поставщики, перевозчики (
                <InlineCode>/network</InlineCode>, <InlineCode>/suppliers</InlineCode>,{' '}
                <InlineCode>/carriers</InlineCode>). Resilience — пока placeholder.
              </>,
              <>
                <strong>Планирование</strong> — demand / supply / inventory / transport / plan-fact.
              </>,
              <>
                <strong>Исполнение</strong> — Shipment Workspace (board/table/map), exceptions,
                incidents, live map.
              </>,
              <>
                <strong>Analytics & Scenarios</strong> — аналитика, what-if, рекомендации.
              </>,
              <>
                <strong>Порталы</strong> — Supplier / Carrier (UI в основном mock; scope на API для
                shipments готов).
              </>,
              <>
                <strong>Admin</strong> — пользователи, роли, аудит (частично).
              </>,
            ]}
          />
        ),
      },
      {
        id: 'loop',
        title: 'Операционный цикл',
        body: (
          <>
            <P>PLAN → EXECUTE → MONITOR → DETECT → ANALYZE → SIMULATE → DECIDE → REPLAN</P>
            <P>
              Пример: отклонение ETA на Board → Exception → Incident → Scenario → сравнение →
              решение (в т.ч. apply сценария с правом <InlineCode>scenario.apply</InlineCode>, что
              создаёт новую версию плана, а не silent overwrite).
            </P>
          </>
        ),
      },
      {
        id: 'entities',
        title: 'Основные сущности',
        body: (
          <P>
            Supplier, Carrier, Warehouse/Hub (узлы сети), Transport Lane, SKU, Forecast, Plan,
            Shipment, Tracking, ETA, Exception, Incident, Scenario, Recommendation. Определения — в{' '}
            <DocLink to="/docs/reference/glossary">глоссарии</DocLink>.
          </P>
        ),
      },
    ],
  },
  {
    slug: 'getting-started/architecture',
    title: 'Архитектура',
    description: 'Frontend, backend, два домена auth, mocks vs API.',
    category: 'Начало работы',
    order: 30,
    roles: ['DEVELOPER', 'ALL'],
    status: 'implemented',
    lastUpdated: UPDATED,
    keywords: ['архитектура', 'fastapi', 'react', 'rbac', 'mock'],
    prev: 'getting-started/overview',
    next: 'getting-started/quickstart',
    sections: [
      {
        id: 'stack',
        title: 'Стек',
        body: (
          <Ul
            items={[
              'Frontend: React 19, Vite, MUI, TanStack Query, MapLibre.',
              'Backend: FastAPI, SQLAlchemy, PostgreSQL, JWT access+refresh.',
              'API prefix: /api/v1 · OpenAPI: http://localhost:8000/docs',
            ]}
          />
        ),
      },
      {
        id: 'domains',
        title: 'Два домена авторизации',
        body: (
          <>
            <P>
              <strong>SCM:</strong> организация, роли (7), atomic permissions, object scope для
              поставок поставщика/перевозчика.
            </P>
            <P>
              <strong>Project simulator:</strong> членство в проекте (owner/editor/analyst/viewer)
              на <InlineCode>/projects/*</InlineCode>.
            </P>
          </>
        ),
      },
      {
        id: 'modes',
        title: 'Mock vs API',
        body: (
          <Callout title="По умолчанию UI в mock-режиме">
            <InlineCode>VITE_USE_API_MOCKS=true</InlineCode> обслуживает SCM через{' '}
            <InlineCode>scmMock</InlineCode>. Для проверки RBAC/scope поставьте{' '}
            <InlineCode>false</InlineCode>, поднимите backend и перелогиньтесь.
          </Callout>
        ),
      },
      {
        id: 'guards',
        title: 'Три уровня контроля',
        body: (
          <Ul
            items={[
              'Navigation — пункты меню по role + permission.',
              'Route — RoleBasedRoute + ROUTE_REQUIRED_PERMISSIONS → /403.',
              'Action — ActionGuard / can(); на backend require_permission (+ scope для shipments).',
            ]}
          />
        ),
      },
    ],
  },
  {
    slug: 'getting-started/quickstart',
    title: 'Quickstart',
    description: 'End-to-end путь логиста / SCM: от входа до сценария.',
    category: 'Начало работы',
    order: 40,
    roles: ['SUPPLY_CHAIN_MANAGER', 'LOGISTICS_MANAGER'],
    status: 'partial',
    lastUpdated: UPDATED,
    keywords: ['quickstart', 'демо', 'board', 'incident', 'scenario'],
    productRoutes: ['/control-tower', '/shipments', '/exceptions', '/incidents', '/scenarios'],
    prev: 'getting-started/architecture',
    next: 'roles/logistics-manager',
    sections: [
      {
        id: 'prep',
        title: 'Подготовка',
        body: (
          <Ul
            items={[
              <>
                Войдите как <InlineCode>logistics@demo.scm.ru</InlineCode> /{' '}
                <InlineCode>demo123</InlineCode> (landing: <InlineCode>/shipments?view=board</InlineCode>
                ) или <InlineCode>manager@demo.scm.ru</InlineCode> (landing:{' '}
                <InlineCode>/control-tower</InlineCode>).
              </>,
              'Для UI-демо достаточно mock-режима. Для реальных 403/scope — API mode.',
            ]}
          />
        ),
      },
      {
        id: 'steps',
        title: 'Шаги',
        body: (
          <Ul
            items={[
              <>
                Откройте Control Tower (<InlineCode>/control-tower</InlineCode>) — KPI и блок внимания.
              </>,
              <>
                Перейдите в Поставки. Переключатели <strong>Доска / Таблица / Карта</strong> —
                query <InlineCode>?view=</InlineCode>.
              </>,
              'Клик по карточке → QuickView drawer → «Открыть поставку».',
              'На detail / board actions: Assign Carrier, Cancel — только при наличии permission.',
              'Откройте Exceptions → связанный shipment → при необходимости Incident.',
              <>
                Создайте сценарий (<InlineCode>/scenarios/new</InlineCode>), запустите Run, сравните
                на <InlineCode>/scenarios/compare</InlineCode>. Apply доступен ролям с{' '}
                <InlineCode>scenario.apply</InlineCode> (не Planner/Analyst).
              </>,
            ]}
          />
        ),
      },
      {
        id: 'after',
        title: 'Что происходит после действий',
        body: (
          <Ul
            items={[
              'Assign carrier на API: POST …/assign-carrier → статус ASSIGNED (при валидном переходе).',
              'Cancel: POST …/cancel → CANCELLED; Analyst получит 403.',
              'Scenario apply: новая версия плана, не silent overwrite Active Plan.',
              'В mock-режиме часть действий показывает snackbar без вызова API.',
            ]}
          />
        ),
      },
    ],
  },
];
