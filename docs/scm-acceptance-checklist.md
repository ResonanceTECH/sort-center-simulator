# SCM Platform — Acceptance Checklist (§68)

Чеклист приёмки веб-платформы управления цепочкой поставок (SCM).  
Используйте в mock-режиме (`VITE_USE_API_MOCKS=true`) для UI-проверок и в API-режиме (`false`) для интеграции с backend.

## Автоматические smoke-тесты (§66)

```bash
# Frontend — SCM smoke + mappers + role matrices
cd frontend && npm test

# Только SCM
cd frontend && npm run test:scm

# Backend SCM API
cd backend && SKIP_DB_STARTUP=1 PYTHONPATH=. pytest tests/api/test_scm_api.py -q
```

| Набор | Файлы | Что проверяет |
|-------|-------|---------------|
| Service smoke | `src/services/scm/scmSmoke.test.ts` | CT, shipments, scenario create/run/compare, incident comment, search, map, plan action |
| Mappers | `src/services/scm/scmMappers.test.ts` | DTO → domain для shipments, scenarios, incidents |
| Role matrix §40 | `src/constants/businessActions.test.ts` | Shipment actions по роли/статусу |
| Plan workflow §38 | `src/constants/planActions.test.ts` | Plan actions по роли/статусу |
| Routes §6 | `src/constants/scmRoutes.test.ts` | Уникальность nav paths internal + portal |

---

## Предусловия

- [ ] `cd frontend && npm install && npm run dev` — UI на http://localhost:3000
- [ ] Mock mode: `frontend/.env` → `VITE_USE_API_MOCKS=true`
- [ ] API mode (опционально): backend на :8000, `VITE_USE_API_MOCKS=false`
- [ ] Демо-пользователи (пароль `demo123`):

| Email | Роль | Shell |
|-------|------|-------|
| `demo@sortcenter.ru` | Supply Chain Manager | internal |
| `planner@scm.ru` | Supply Planner | internal |
| `logistics@scm.ru` | Logistics Manager | internal |
| `analyst@scm.ru` | Analyst | internal |
| `admin@scm.ru` | Admin | internal |
| `supplier@scm.ru` | Supplier | portal |
| `carrier@scm.ru` | Carrier | portal |

---

## A. Internal shell — обзор и исполнение

### A1 Control Tower (`/control-tower`)
- [ ] KPI-карточки отображаются
- [ ] Блок «Требует внимания» кликабелен → entity
- [ ] Activity timeline рендерится
- [ ] Realtime badge / SSE обновления (mock)

### A2 Поставки (`/shipments`, `/shipments/:id`)
- [ ] DataTable: пагинация, сортировка, URL sync (`?sortBy=&sortDir=`)
- [ ] Фильтры status/risk/supplier/carrier
- [ ] Detail: KPI, карта, timeline, SKU, exceptions, incidents, documents, activity
- [ ] Role actions §40: кнопки зависят от роли (логин под logistics vs supplier)

### A3 Отклонения и инциденты
- [ ] `/exceptions` — список + detail drawer/page
- [ ] `/incidents` — список + detail
- [ ] `/incidents/:id` — **добавление комментария** (§25) → появляется в списке + snackbar
- [ ] Resolve incident с ConfirmDialog

### A4 Карта (`/map`)
- [ ] MapLibre рендер, clustering, geofence polygons
- [ ] Realtime position updates (mock 4s)
- [ ] Layer toggles: shipments / routes / warehouses

---

## B. Планирование и стратегия

### B1 Master data
- [ ] `/network` — xyflow graph
- [ ] `/suppliers`, `/carriers` — списки + detail

### B2 Plans
- [ ] `/planning/demand`, `/planning/supply`, `/planning/inventory`, `/planning/transport`
- [ ] Plan status badge + workflow actions §38 (Calculate / Submit / Approve)
- [ ] ConfirmDialog на destructive/approve actions
- [ ] `/planning/plan-fact` — plan vs fact metrics

### B3 Сценарии (§27/30)
- [ ] `/scenarios` — карточки сценариев
- [ ] `/scenarios/new` — builder → create → run → redirect detail
- [ ] `/scenarios/compare` — выбор ≥2 сценариев, таблица KPI vs baseline
- [ ] `/recommendations` — apply с ConfirmDialog

---

## C. Portal shells

### C1 Supplier (`supplier@scm.ru`)
- [ ] Dashboard, orders, forecast, shipments (org-scoped)
- [ ] Documents, performance, incidents

### C2 Carrier (`carrier@scm.ru`)
- [ ] Trips — Accept / Report Delay
- [ ] Vehicles, map (org-filtered), documents, performance, incidents

---

## D. Cross-cutting

## D1 Navigation & RBAC (§4/6)
- [ ] **Четыре контура:** Admin / Internal / Supplier / Carrier — разные sidebar и landing
- [ ] Page Map: [scm-page-map.md](./scm-page-map.md)
- [ ] Логин → JTBD landing: `/home` (SCM/Log/Analyst), `/planning` (Planner), portal dashboards, `/admin`
- [ ] Planner: нет Live Map / Approve; Manager: есть Approve / Apply
- [ ] Logistics: нет Demand Forecast в sidebar; есть `/lanes`
- [ ] Analyst: analytics-first, без mutation actions на shipment
- [ ] Supplier/Carrier: только portal paths (`/supplier/dashboard`, `/carrier/dashboard`)
- [ ] Admin: `/admin/*` console (+ system health)

### D2 Search & notifications (§43/44)
- [ ] Global search в TopBar (≥2 символа) → dropdown + navigate
- [ ] Notification center → link на entity

### D3 UX patterns (§53/54/55)
- [ ] EntityStates: loading / error / empty
- [ ] ConfirmDialog на mutations
- [ ] Snackbar feedback
- [ ] ActivityTimeline на CT / shipment / incident

### D4 i18n
- [ ] UI на русском (`constants/platformRu.ts`)

---

## E. API mode (при `VITE_USE_API_MOCKS=false`)

- [ ] Login JWT → `/api/v1/auth/login`
- [ ] Shipments pagination 1-based на backend
- [ ] `GET /scenarios/{id}` — parameters + KPIs
- [ ] `POST /scenarios/comparison` — rows table
- [ ] `POST /incidents/{id}/comments` — author + timestamp
- [ ] Tenant isolation: чужой shipment → 404/403

---

## Известные ограничения (не блокируют mock-demo)

| Область | Статус |
|---------|--------|
| `/integrations` | Placeholder |
| Resilience landing section | Не в nav |
| Full a11y / responsive audit | Partial |
| E2E Playwright | Не настроен |
| Сквозной цикл exception→scenario→applied plan в одном wizard | Partial |

---

## Sign-off

| Роль | Имя | Дата | Mock ✅ | API ✅ |
|------|-----|------|---------|--------|
| Product | | | [ ] | [ ] |
| Engineering | | | [ ] | [ ] |
| QA | | | [ ] | [ ] |
