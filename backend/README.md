# Backend — Sort Center Simulator

FastAPI-сервис: REST + WebSocket, PostgreSQL, движок симуляции в `sim/`.

## Требования

- Python 3.9+
- Docker (PostgreSQL)
- Опционально: системные libs для `trimesh` / `scipy`

## Установка

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Переменные окружения

Файл `backend/.env` (не коммитится):

| Переменная | По умолчанию | Описание |
|------------|--------------|----------|
| `DATABASE_URL` | `postgresql+psycopg://postgres:postgres@localhost:5433/sort_center` | PostgreSQL |
| `API_HOST` | `0.0.0.0` | Хост uvicorn |
| `API_PORT` | `8000` | Порт API |
| `CORS_ORIGINS` | `http://localhost:3000` | Origins через запятую |
| `SECRET_KEY` | `dev-secret-change-me` | Секрет JWT (сменить в prod) |

Для тестов без поднятия БД при старте приложения:

```bash
export SKIP_DB_STARTUP=1
```

## База данных

```bash
docker compose up -d
```

При первом запуске API:

- создаются таблицы (`create_all`);
- seed: проект «СЦ Демо — Logus Nova», пользователь `demo@sortcenter.ru` / `demo123`.

Миграций Alembic пока нет — схема управляется через SQLAlchemy models.

## Запуск

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Health: `GET /api/v1/health`
- OpenAPI: http://localhost:8000/docs

## Архитектура

```
app/
├── api/v1/          # routes: auth, projects, catalog, membership, ws
├── core/            # config, database, security (JWT), permissions (RBAC)
├── models/          # Project, Scenario, Run, User, ProjectMember, …
├── services/        # business logic
├── schemas/         # Pydantic DTO
└── db/seed.py       # демо-данные

sim/
├── classifier/      # mesh → OBB → zone (trimesh + shapely)
├── catalog/         # products.json, STL meshes
├── physics/         # discrete_backend (MVP), mujoco_backend (stub)
└── reporting/       # metrics, trace.json, events.jsonl
```

Артефакты прогонов: `backend/data/runs/{run_id}/` (`events.jsonl`, `trace.json`, `summary.json`).

## API (кратко)

### Auth

| Метод | Путь |
|-------|------|
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |
| GET | `/api/v1/auth/me` |

Заголовок: `Authorization: Bearer <token>`.

### Проекты и сценарии

| Метод | Путь |
|-------|------|
| GET/POST | `/api/v1/projects` |
| GET/PATCH/DELETE | `/api/v1/projects/{id}` |
| GET/POST | `/api/v1/projects/{id}/scenarios` |
| GET/PUT | `/api/v1/projects/{id}/scenarios/{sid}/config` |
| POST | `/api/v1/projects/{id}/scenarios/{sid}/set-default` |

### Прогоны

| Метод | Путь |
|-------|------|
| POST | `/api/v1/projects/{id}/runs` — `type`: `analytical` \| `simulation` |
| GET | `/api/v1/projects/{id}/runs`, `.../runs/{rid}` |
| GET | `.../runs/{rid}/events`, `.../trace`, `.../metrics` |
| GET | `/api/v1/projects/{id}/comparison?run_ids=a,b` |

### Участники и приглашения

| Метод | Путь |
|-------|------|
| GET | `/api/v1/projects/{id}/access` |
| GET/POST | `/api/v1/projects/{id}/invitations` |
| POST | `/api/v1/invitations/accept` |
| GET | `/api/v1/invitations/{code}/preview` |

### WebSocket

`WS /api/v1/projects/{pid}/runs/{rid}/live` — replay trace frames.

### Каталог

`GET /api/v1/catalog/products`, `POST .../classify-preview`.

## Движок симуляции

- **analytical** — `sim/physics/discrete_backend.py` (основной MVP).
- **simulation** — `mujoco_backend.py` (stub, возвращает failed до подключения MuJoCo).

Классификация изделий — по **mesh + OBB + K-factor**, не по bbox каталога.

## Тесты

```bash
SKIP_DB_STARTUP=1 PYTHONPATH=. pytest tests/ -q
```

SQLite in-memory в `conftest.py`, auth fixture с Bearer-токеном.

## Связка с фронтендом

В `frontend/.env`:

```env
VITE_USE_API_MOCKS=false
VITE_API_BASE_URL=/api/v1
```

Vite проксирует `/api` на `:8000` (включая WebSocket).
