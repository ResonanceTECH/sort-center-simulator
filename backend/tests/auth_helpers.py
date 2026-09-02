from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.security import create_access_token
from app.models.user import User


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


def auth_headers_for_user(user: User) -> dict[str, str]:
    token = create_access_token(user.id)
    return {"Authorization": f"Bearer {token}"}
