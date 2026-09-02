import os

os.environ.setdefault("SKIP_DB_STARTUP", "1")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session_factory = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    import app.core.database as database_module

    original_engine = database_module.engine
    original_session_local = database_module.SessionLocal
    database_module.engine = engine
    database_module.SessionLocal = session_factory

    def override_get_db():
        db = session_factory()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as test_client:
        yield test_client
    app.dependency_overrides.clear()
    database_module.engine = original_engine
    database_module.SessionLocal = original_session_local
    Base.metadata.drop_all(engine)


@pytest.fixture
def auth_user(client: TestClient) -> dict:
    response = client.post(
        "/api/v1/auth/register",
        json={
            "name": "Тестовый пользователь",
            "email": "tester@example.com",
            "password": "testpass123",
        },
    )
    assert response.status_code == 201
    body = response.json()
    return {
        "user": body["user"],
        "token": body["access_token"],
        "headers": {"Authorization": f"Bearer {body['access_token']}"},
    }


@pytest.fixture
def auth_headers(auth_user: dict) -> dict[str, str]:
    return auth_user["headers"]


@pytest.fixture
def project_id(client: TestClient, auth_headers: dict[str, str]) -> str:
    response = client.post(
        "/api/v1/projects",
        json={"name": "Тестовый проект", "description": "Для API тестов"},
        headers=auth_headers,
    )
    assert response.status_code == 201
    return response.json()["id"]
