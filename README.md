# Sort Center Simulator / SCM Platform

Монорепозиторий двух связанных продуктов:

1. **SCM Platform** — B2B-платформа управления цепочкой поставок (Control Tower, планирование, поставки, исключения, сценарии, порталы поставщика/перевозчика, admin).
2. **Sort Center Simulator** — симулятор сортировочного центра (Logus Nova / КЧ): layout, сценарии, аналитический расчёт, trace, статистика и сравнение прогонов.

Оба живут в одном SPA и одном FastAPI backend, но **разные домены авторизации**:

| Домен | Auth | Где |
| --- | --- | --- |
| SCM | JWT + organization roles/permissions (`/api/v1/auth/*`) | `/control-tower`, `/shipments`, portals, `/admin` |
| Project simulator | JWT + project membership (`owner` / `editor` / `analyst` / `viewer`) | `/projects/*` |

---

## Стек

| Слой | Технологии |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, MUI, TanStack Query, MapLibre, xyflow, Recharts |
| Backend | FastAPI, SQLAlchemy, PostgreSQL, JWT (access + refresh) |
| Движок симулятора | `backend/sim/` — mesh-классификация, дискретная физика, trace/events |
| Realtime (демо) | FE mock SSE; BE имеет stub `WS /api/v1/ws/events` (см. аудит) |

---

## Структура репозитория

```
sort-center-simulator/
├── frontend/                 # SPA: SCM + project simulator
│   ├── src/pages/            # экраны (shipments board, planning, portals, admin, projects)
│   ├── src/services/scm/     # SCM API + mocks + mappers
│   ├── src/constants/        # navigation, permissions, route ACL
│   └── src/workspace/        # landing / shell resolver
├── backend/
│   ├── app/api/v1/           # REST routers (auth, shipments, planning, projects, …)
│   ├── app/security/         # permission catalog, object scope, shipment actions
│   ├── app/db/scm_seed.py    # демо-организации, роли, поставки
│   └── sim/                  # движок симуляции СЦ
├── docs/
│   ├── scm-acceptance-checklist.md
│   └── scm-page-map.md
├── ROLE_PAGE_API_AUDIT.md    # полный аудит Role → Page → API
└── README.md
```

---

## Быстрый старт

### 1. PostgreSQL

```bash
cd backend
docker compose up -d
```

По умолчанию: `localhost:5433`, БД `sort_center`, user/pass `postgres`/`postgres`.

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

При старте (если не задан `SKIP_DB_STARTUP=1`):

- `create_all` таблиц;
- seed проекта симулятора;
- `seed_scm_demo` — организации, 7 ролей, permissions, демо-поставки.

| URL | |
| --- | --- |
| API | http://localhost:8000 |
| OpenAPI | http://localhost:8000/docs |
| Health | `GET /api/v1/health` |

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:3000

---

## Режимы фронтенда

| `VITE_USE_API_MOCKS` | Поведение |
| --- | --- |
| `true` (сейчас в `frontend/.env`) | SCM и auth идут через mock-сервисы; backend не обязателен для UI-демо |
| `false` | Proxy `/api` → `localhost:8000`, реальный JWT + RBAC + object scope |

```env
# frontend/.env
VITE_API_BASE_URL=/api/v1
VITE_USE_API_MOCKS=true
```

Для интеграционной проверки:

1. Поднять backend + Postgres.
2. Поставить `VITE_USE_API_MOCKS=false`.
3. Перелогиниться (токен из mock не валиден для API).

Подробный разрыв mock ↔ API: [`ROLE_PAGE_API_AUDIT.md`](./ROLE_PAGE_API_AUDIT.md).

---

## Демо-учётки (SCM)

Пароль по умолчанию: **`demo123`**.  
Исключение: `admin@sortcenter.ru` → **`admin123`**.

| Email | Роль | Workspace | Landing после login |
| --- | --- | --- | --- |
| `manager@demo.scm.ru` | SUPPLY_CHAIN_MANAGER | INTERNAL | `/control-tower` |
| `planner@demo.scm.ru` | SUPPLY_PLANNER | INTERNAL | `/planning` |
| `logistics@demo.scm.ru` | LOGISTICS_MANAGER | INTERNAL | `/shipments?view=board` |
| `demo@sortcenter.ru` | LOGISTICS_MANAGER (legacy) | INTERNAL | `/shipments?view=board` |
| `analyst@demo.scm.ru` | ANALYST | INTERNAL | `/analytics` |
| `admin@demo.scm.ru` | ADMIN | ADMIN | `/admin` |
| `admin@sortcenter.ru` | ADMIN (legacy) | ADMIN | `/admin` |
| `supplier@demo.scm.ru` | SUPPLIER | SUPPLIER portal | `/supplier/dashboard` |
| `carrier@demo.scm.ru` | CARRIER | CARRIER portal | `/carrier/dashboard` |

Также существуют алиасы вида `supplier@scm.ru` / `carrier@scm.ru` (см. seed / security tests).

---

## SCM: роли и workspaces

| Role | Workspace | Что делает |
| --- | --- | --- |
| **ADMIN** | Admin console | IAM, directories; business data **read-only** (без ops-write) |
| **SUPPLY_CHAIN_MANAGER** | Internal | Control Tower, стратегия, планы, approve/apply, полный ops |
| **SUPPLY_PLANNER** | Internal | Планы/сценарии; **нет** approve / shipment ops |
| **LOGISTICS_MANAGER** | Internal | Операционный board поставок, карта, exceptions/incidents |
| **ANALYST** | Internal | Analytics + scenarios; ops **read-only** (cancel → 403 на backend) |
| **SUPPLIER** | Supplier portal | Свои заказы/поставки (object scope по linked supplier) |
| **CARRIER** | Carrier portal | Assigned shipments (object scope по linked carrier) |

Sidebar строится **по роли** и дополнительно фильтруется **по permissions**.  
Route guard: shell ACL + `ROUTE_REQUIRED_PERMISSIONS` → `/403`.  
Action guard: `can()` / `ActionGuard` на кнопках; **безопасность — на backend** (`require_permission` + object scope).

### Операционный центр логиста

Основной workspace логиста:

- `/shipments?view=board` — Kanban по lifecycle (risk отдельно badge’ом)
- `/shipments?view=table` — таблица
- `/shipments?view=map` — карта в том же workspace

KPI, фильтры и view синхронизируются с URL.  
В mock-режиме KPI считает mock; на backend list пока без агрегатного блока `kpis` (см. аудит).

---

## Пользовательские сценарии

### SCM

```
Login → role landing
  INTERNAL: Control Tower / Planning / Shipments Board / Analytics
  ADMIN:    /admin
  PORTAL:   /supplier/* или /carrier/*

Поставки → Board/Table/Map → QuickView → Detail
  → assign / cancel / tracking (по permission)
Exceptions / Incidents → resolve / comments
Scenarios → create → run (poll) → compare → apply (только с scenario.apply)
```

### Симулятор СЦ

```
Авторизация → /projects → Открыть проект
  → Модель (2D) → Параметры → Сценарии
  → Расчёт → Прогоны → Результаты
  → Визуализация → Статистика → Сравнение
```

Приглашения в проект: `/projects/join?code=...`  
Роли проекта: `owner` · `editor` · `analyst` · `viewer`.

---

## Backend: ключевые SCM API

Префикс: `/api/v1`

| Группа | Примеры |
| --- | --- |
| Auth | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `GET /auth/me` |
| Shipments | `GET/POST /shipments`, `POST /shipments/{id}/assign-carrier`, `…/cancel`, `…/accept`, `…/tracking`, … |
| Exceptions / incidents | `GET /exceptions`, `GET/POST /incidents`, `POST …/resolve`, `POST …/comments` |
| Planning | `GET /supply-plans`, `/inventory-plans`, `/transport-plans`, `/plans/{id}/plan-fact` |
| Scenarios | `GET/POST /scenarios`, `POST …/runs`, `GET /scenario-runs/{id}`, `POST …/apply` |
| Analytics | `GET /control-tower`, `/analytics/service-level`, `/analytics/suppliers`, `/analytics/carriers` |
| Master data | `GET /network`, `/suppliers`, `/carriers` |
| Admin IAM | `GET/POST/PATCH /users`, `/users/roles`, `/users/audit-events` |

Object scope для поставок (и exceptions): supplier/carrier видят только свои объекты; чужой id → **404** (не 403), чтобы не светить существование.

Полный инвентарь и пробелы: [`ROLE_PAGE_API_AUDIT.md`](./ROLE_PAGE_API_AUDIT.md).

---

## Тесты

```bash
# Backend — unit/API/security (без авто-старта БД в lifespan)
cd backend
SKIP_DB_STARTUP=1 PYTHONPATH=. pytest tests/ -q

# Backend — SCM API + RBAC/scope
SKIP_DB_STARTUP=1 PYTHONPATH=. pytest tests/api/test_scm_api.py tests/security -q

# Frontend — все
cd frontend && npm test

# Frontend — SCM smoke + matrices + workspaces
cd frontend && npm run test:scm

# Production build
cd frontend && npm run build
```

Чеклист ручной приёмки SCM: [`docs/scm-acceptance-checklist.md`](./docs/scm-acceptance-checklist.md)  
Карта экранов: [`docs/scm-page-map.md`](./docs/scm-page-map.md)

---

## Документация

| Документ | Содержание |
| --- | --- |
| **In-app docs** | http://localhost:3000/docs — руководства, роли, API start, search ⌘K |
| [`DOCUMENTATION_AUDIT.md`](./DOCUMENTATION_AUDIT.md) | Аудит готовности контента |
| [`DOCUMENTATION_PLAN.md`](./DOCUMENTATION_PLAN.md) | IA и roadmap документации |
| [`ROLE_PAGE_API_AUDIT.md`](./ROLE_PAGE_API_AUDIT.md) | Аудит Role → Workspace → Page → Permission → API → Scope |
| [`docs/scm-acceptance-checklist.md`](./docs/scm-acceptance-checklist.md) | Приёмочный чеклист UI/API |
| [`docs/scm-page-map.md`](./docs/scm-page-map.md) | Дерево экранов по ролям |
| [`backend/README.md`](./backend/README.md) | API, sim engine, env |
| [`frontend/docs/api-contract.md`](./frontend/docs/api-contract.md) | Контракты FE (где актуально) |

---

## Известные ограничения (кратко)

- По умолчанию UI в **mock-режиме** — порталы и часть planning/analytics не равны «боевому» API.
- Ops Board KPI (`kpis` на list shipments) — на FE/mock есть, на backend list пока нет.
- Плановые business-actions (`approve` / `activate` / `calculate`) в permission-матрице есть, dedicated endpoints — частично/нет.
- Realtime SCM на FE — mock SSE; BE `WS /ws/events` без полноценной auth-модели.
- Admin console и portal detail-роуты (`…/:id`) — частично placeholder / mock.

Актуальный приоритетный план закрытия — раздел 17 в аудите.

---

## Лицензия

См. [LICENSE](./LICENSE).
