# SCM Page Map (целевое дерево экранов)

Источник: ТЗ «Дерево всех экранов». Фиксируем как **Page Map** продукта.

## Четыре контура

```text
AUTH → ROLE + PERMISSIONS
  ├── INTERNAL APP   (SCM / Planner / Logistics / Analyst)
  ├── SUPPLIER PORTAL
  ├── CARRIER PORTAL
  └── ADMIN CONSOLE
```

Внутренние роли **переиспользуют** страницы, но меняют: landing, sidebar, read/edit, actions.  
Supplier / Carrier / Admin — **отдельные** layouts и data scope.

## Landing pages

| Роль | Default route | Workspace |
|------|---------------|-----------|
| SCM | `/home` | Supply Chain Executive Overview |
| PLANNER | `/planning` | Planning Overview |
| LOGISTICS | `/home` | Logistics Control Tower hub |
| ANALYST | `/home` | Analytics Workspace hub |
| SUPPLIER | `/supplier/dashboard` | Own portal |
| CARRIER | `/carrier/dashboard` | Own portal |
| ADMIN | `/admin` | System Overview |

## INTERNAL — ключевые ветки

| Ветка | Base path | Статус |
|-------|-----------|--------|
| Home workspace | `/home` | skeleton (role cards) |
| Control Tower | `/control-tower`, `/alerts`, `/insights` | CT live; sub-routes skeleton |
| Network | `/network`, `/network/edit`, `/network/nodes/:id` | graph live; edit/node skeleton |
| Suppliers / Carriers | `/suppliers/*`, `/carriers/*` | list+detail live |
| Facilities | `/facilities/*` | skeleton |
| Lanes | `/lanes/*` | skeleton |
| Resilience | `/strategy/resilience` | skeleton |
| Planning | `/planning`, `/planning/demand|supply|inventory|transport|plan-fact` | plans live; overview new |
| Execution | `/shipments`, `/map`, `/exceptions`, `/incidents` | live |
| Analytics | `/analytics/*` | live |
| Scenarios | `/scenarios/*`, `/recommendations` | live |
| Reports | `/reports` | legacy + nav |

## EXTERNAL

| Portal | Base | Scope |
|--------|------|-------|
| Supplier | `/supplier/*` | **Own** orders/forecast/shipments/docs/incidents/KPI |
| Carrier | `/carrier/*` | **Assigned/own** trips/vehicles/drivers/tracking/KPI |

## ADMIN

`/admin`, `/admin/users|roles|organizations|integrations|dictionaries|audit|system`, `/settings`

## Shared

Global Search (TopBar), Notifications (TopBar), `/settings/*`, `/403|/404`

## Следующий артефакт

Матрица `Экран → Роль → CRUD/Action → API endpoint` — на базе этого дерева + `routePermissions.ts` + `scmPermissions.ts`.

См. также: [scm-acceptance-checklist.md](./scm-acceptance-checklist.md)
