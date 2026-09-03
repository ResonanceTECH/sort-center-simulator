# Sort Center Simulator

Веб-симулятор сортировочного центра для кейса **Logus Nova** (КЧ): настройка layout, сценарии, аналитический расчёт, trace-визуализация, статистика и сравнение прогонов.

## Стек


| Слой     | Технологии                                                                            |
| -------- | ------------------------------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, MUI, Recharts                                             |
| Backend  | FastAPI, SQLAlchemy, PostgreSQL                                                       |
| Движок   | `backend/sim/` — mesh-классификация (OBB + K-factor), дискретная физика, trace/events |


## Структура репозитория

```
sort-center-simulator/
├── frontend/          # SPA (проекты, сценарии, прогоны, RBAC)
├── backend/           # REST + WebSocket API, sim engine, PostgreSQL
└── README.md
```



## Быстрый старт



### 1. База данных

```bash
cd backend
docker compose up -d
```



### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API: [http://localhost:8000](http://localhost:8000)  
Swagger: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend

```bash
cd frontend
npm install
```

```bash
npm run dev
```

UI: [http://localhost:3000](http://localhost:3000)

### Демо-учётка (после seed)


| Email                | Пароль    |
| -------------------- | --------- |
| `demo@sortcenter.ru` | `demo123` |




## Пользовательский сценарий

```
Авторизация → Проекты → Открыть проект
  → Модель (2D editor) → Параметры → Сценарии
  → Расчёт (аналитика / имитация) → Прогоны → Результаты
  → Визуализация → Статистика → Сравнение
```



## Роли (RBAC)

`owner` · `editor` · `analyst` · `viewer` — матрица прав на бэкенде, приглашения по коду/ссылке (`/projects/join?code=...`).

## Режимы фронтенда


| `VITE_USE_API_MOCKS`  | Поведение                                 |
| --------------------- | ----------------------------------------- |
| `true` (по умолчанию) | Vite mock API, без backend                |
| `false`               | Proxy `/api` → `localhost:8000`, JWT auth |




## Тесты

```bash
# backend
cd backend && SKIP_DB_STARTUP=1 PYTHONPATH=. pytest tests/ -q

# frontend (all)
cd frontend && npm test

# frontend SCM smoke only
cd frontend && npm run test:scm
```

SCM acceptance checklist: [docs/scm-acceptance-checklist.md](./docs/scm-acceptance-checklist.md)  
Page map (дерево экранов): [docs/scm-page-map.md](./docs/scm-page-map.md)



## Документация по модулям

- [backend/README.md](./backend/README.md) — API, sim engine, переменные окружения
- [frontend/README.md](./frontend/README.md) — UI, маршруты, mock-режим



## Лицензия

См. [LICENSE](./LICENSE).