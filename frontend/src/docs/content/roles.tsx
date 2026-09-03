import type { DocArticle } from '@/docs/types';
import { Callout, DocLink, InlineCode, P, Ul } from '@/docs/content/helpers';

const UPDATED = '2026-09-03';

function roleArticle(
  partial: Omit<DocArticle, 'sections' | 'lastUpdated' | 'category'> & {
    sections: DocArticle['sections'];
  },
): DocArticle {
  return { category: 'Роли', lastUpdated: UPDATED, ...partial };
}

export const roleArticles: DocArticle[] = [
  roleArticle({
    slug: 'roles/supply-chain-manager',
    title: 'Supply Chain Manager',
    description: 'Владелец сквозного контура plan–execute–decide.',
    order: 10,
    roles: ['SUPPLY_CHAIN_MANAGER'],
    status: 'implemented',
    keywords: ['scm', 'control tower', 'approve'],
    productRoutes: ['/control-tower'],
    next: 'roles/supply-planner',
    sections: [
      {
        id: 'who',
        title: 'Назначение и JTBD',
        body: (
          <P>
            Держать OTIF и риски под контролем: видеть Control Tower, утверждать планы, применять
            сценарии, эскалировать exceptions/incidents.
          </P>
        ),
      },
      {
        id: 'landing',
        title: 'Landing и разделы',
        body: (
          <Ul
            items={[
              <>Landing: <InlineCode>/control-tower</InlineCode></>,
              'Sidebar: стратегия, планирование, исполнение, аналитика, сценарии, отчёты.',
              'Полные operational + planning write permissions (включая approve/apply).',
            ]}
          />
        ),
      },
      {
        id: 'cannot',
        title: 'Недоступно',
        body: <P>Admin IAM (users/roles CRUD) — зона ADMIN. Порталы supplier/carrier — отдельные shells.</P>,
      },
      {
        id: 'flow',
        title: 'Типовой день',
        body: (
          <P>
            CT → at-risk shipments → Exception/Incident → Scenario compare → Apply / replan → проверка
            Plan/Fact.
          </P>
        ),
      },
    ],
  }),
  roleArticle({
    slug: 'roles/supply-planner',
    title: 'Supply Planner',
    description: 'Планирование спроса и поставок без operational SoT-write.',
    order: 20,
    roles: ['SUPPLY_PLANNER'],
    status: 'partial',
    keywords: ['planner', 'forecast', 'supply plan'],
    productRoutes: ['/planning'],
    prev: 'roles/supply-chain-manager',
    next: 'roles/logistics-manager',
    sections: [
      {
        id: 'who',
        title: 'JTBD',
        body: <P>Собрать и сдать планы (submit), прогнать сценарии; не утверждать и не ломать execution SoT.</P>,
      },
      {
        id: 'landing',
        title: 'Landing',
        body: (
          <Ul
            items={[
              <>Landing: <InlineCode>/planning</InlineCode></>,
              'Demand / Supply / Inventory / Transport / Plan-Fact, сеть, сценарии, аналитика.',
            ]}
          />
        ),
      },
      {
        id: 'perms',
        title: 'Permissions',
        body: (
          <>
            <P>
              Есть: forecast/supply/inventory/transport CRUD+calculate+submit, scenario run/compare, shipment.read.
            </P>
            <Callout title="Нет" tone="warn">
              <InlineCode>supply_plan.approve</InlineCode>, <InlineCode>scenario.apply</InlineCode>, shipment
              write. Dedicated approve API на backend пока отсутствует — UI-действия в mock не равны
              production workflow.
            </Callout>
          </>
        ),
      },
    ],
  }),
  roleArticle({
    slug: 'roles/logistics-manager',
    title: 'Logistics Manager',
    description: 'Операционный центр поставок: Board, карта, exceptions.',
    order: 30,
    roles: ['LOGISTICS_MANAGER'],
    status: 'implemented',
    keywords: ['logistics', 'board', 'shipments', 'eta'],
    productRoutes: ['/shipments?view=board', '/map', '/exceptions', '/incidents'],
    prev: 'roles/supply-planner',
    next: 'roles/analyst',
    sections: [
      {
        id: 'who',
        title: 'JTBD',
        body: (
          <P>
            За секунды видеть активные поставки, риск SLA, ETA deviation, перевозчика и доступные
            действия.
          </P>
        ),
      },
      {
        id: 'landing',
        title: 'После входа',
        body: (
          <Ul
            items={[
              <>Landing: <InlineCode>/shipments?view=board</InlineCode> — «Операционный центр».</>,
              'Sidebar: Обзор → Транспорт → Контроль → Аналитика → Операционные сценарии.',
              <>
                Workspace: <DocLink to="/docs/execution/shipments">Board / Table / Map</DocLink>.
              </>,
            ]}
          />
        ),
      },
      {
        id: 'actions',
        title: 'Основные действия',
        body: (
          <Ul
            items={[
              'Assign / change carrier, cancel, report delay, tracking updates (по permission).',
              'Create incident, открыть exception, запустить operational scenario.',
              'Create shipment — кнопка при shipment.create (форма new пока placeholder).',
            ]}
          />
        ),
      },
      {
        id: 'flow',
        title: 'Ежедневный workflow',
        body: (
          <P>
            KPI At Risk / Delayed → фильтр Board → QuickView → действие или Incident → при системном
            сбое — Scenario.
          </P>
        ),
      },
    ],
  }),
  roleArticle({
    slug: 'roles/analyst',
    title: 'Analyst',
    description: 'Аналитика и сценарии без изменения operational SoT.',
    order: 40,
    roles: ['ANALYST'],
    status: 'implemented',
    keywords: ['analyst', 'otif', 'scenario'],
    productRoutes: ['/analytics', '/scenarios'],
    prev: 'roles/logistics-manager',
    next: 'roles/supplier',
    sections: [
      {
        id: 'who',
        title: 'JTBD',
        body: <P>Объяснять OTIF/риски, строить what-if, сравнивать сценарии; не cancel shipment и не apply в прод-план.</P>,
      },
      {
        id: 'landing',
        title: 'Landing',
        body: (
          <Ul
            items={[
              <>Landing: <InlineCode>/analytics</InlineCode></>,
              'Read-доступ к source data (shipments, plans); scenario create/run/compare.',
            ]}
          />
        ),
      },
      {
        id: 'security',
        title: 'Ограничения',
        body: (
          <Callout title="Backend">
            POST /shipments/&#123;id&#125;/cancel → 403. Нет shipment.update / scenario.apply в матрице роли.
          </Callout>
        ),
      },
    ],
  }),
  roleArticle({
    slug: 'roles/supplier',
    title: 'Supplier',
    description: 'Портал поставщика: свои заказы и поставки.',
    order: 50,
    roles: ['SUPPLIER'],
    status: 'mock',
    keywords: ['supplier', 'portal', 'confirm ready'],
    productRoutes: ['/supplier/dashboard', '/supplier/shipments'],
    prev: 'roles/analyst',
    next: 'roles/carrier',
    sections: [
      {
        id: 'who',
        title: 'JTBD',
        body: <P>Подтверждать готовность, видеть свои поставки/инциденты/документы, следить за performance.</P>,
      },
      {
        id: 'landing',
        title: 'Landing и shell',
        body: (
          <Ul
            items={[
              <>Landing: <InlineCode>/supplier/dashboard</InlineCode>, shell supplier.</>,
              'Чужой internal sidebar недоступен (RoleBasedRoute).',
            ]}
          />
        ),
      },
      {
        id: 'scope',
        title: 'Object scope',
        body: (
          <Callout title="Важно">
            На API GET /shipments ограничен linked supplier; чужой id → 404. UI портала сейчас в основном
            mock/hardcoded — не считайте клиентский фильтр защитой.
          </Callout>
        ),
      },
      {
        id: 'limits',
        title: 'Ограничения этапа',
        body: <P>Orders API и detail-роуты :id отсутствуют. Confirm order в UI может быть snackbar-only.</P>,
      },
    ],
  }),
  roleArticle({
    slug: 'roles/carrier',
    title: 'Carrier',
    description: 'Портал перевозчика: assigned shipments и исполнение рейса.',
    order: 60,
    roles: ['CARRIER'],
    status: 'mock',
    keywords: ['carrier', 'accept', 'pickup', 'tracking'],
    productRoutes: ['/carrier/dashboard', '/carrier/shipments'],
    prev: 'roles/supplier',
    next: 'roles/administrator',
    sections: [
      {
        id: 'who',
        title: 'JTBD',
        body: (
          <P>
            Accept/Reject, назначить ТС/водителя, confirm pickup/arrival/delivery, report delay,
            обновлять tracking — в рамках permissions и assigned scope.
          </P>
        ),
      },
      {
        id: 'api',
        title: 'Backend vs UI',
        body: (
          <P>
            Action endpoints (accept, confirm-pickup, …) на backend есть. Портальный UI и vehicles/drivers
            API — mock / missing. Scope: только shipments с carrier_id своей организации.
          </P>
        ),
      },
    ],
  }),
  roleArticle({
    slug: 'roles/administrator',
    title: 'Administrator',
    description: 'IAM и админ-консоль без автоматического business-write.',
    order: 70,
    roles: ['ADMIN'],
    status: 'partial',
    keywords: ['admin', 'users', 'roles', 'audit'],
    productRoutes: ['/admin', '/admin/users', '/admin/roles'],
    prev: 'roles/carrier',
    next: 'execution/shipments',
    sections: [
      {
        id: 'who',
        title: 'JTBD',
        body: <P>Пользователи, роли, организации, интеграции, audit — без операционных write на shipments/plans.</P>,
      },
      {
        id: 'landing',
        title: 'Landing',
        body: (
          <Ul
            items={[
              <>Landing: <InlineCode>/admin</InlineCode></>,
              'Business data: read-only permissions в матрице ADMIN.',
            ]}
          />
        ),
      },
      {
        id: 'ui',
        title: 'Состояние UI',
        body: (
          <P>
            Users/roles list и статическая permission matrix есть. User/Role detail, полноценные
            integrations CRUD — partial/planned.
          </P>
        ),
      },
    ],
  }),
];
