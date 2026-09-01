# Backend

Минимальное окружение: FastAPI + PostgreSQL.

## Зависимости

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## База данных

```bash
docker compose up -d
```

## Запуск API

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/api/v1/health

## Переменные окружения

См. `.env`:

- `DATABASE_URL` — PostgreSQL
- `API_HOST`, `API_PORT` — сервер
- `CORS_ORIGINS` — фронтенд (по умолчанию `http://localhost:3000`)
- `SECRET_KEY` — для JWT позже
