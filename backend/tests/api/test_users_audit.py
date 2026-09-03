from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.core.database import Base, SessionLocal, engine
from app.db.scm_seed import seed_scm_demo


@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_scm_demo(db)
    finally:
        db.close()
    with TestClient(app) as c:
        yield c


def _admin_headers(client: TestClient) -> dict[str, str]:
    resp = client.post("/api/v1/auth/login", json={"email": "admin@sortcenter.ru", "password": "admin123"})
    assert resp.status_code == 200
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def _user_headers(client: TestClient) -> dict[str, str]:
    resp = client.post("/api/v1/auth/login", json={"email": "demo@sortcenter.ru", "password": "demo123"})
    assert resp.status_code == 200
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def test_users_forbidden_for_non_admin(client: TestClient):
    headers = _user_headers(client)
    resp = client.get("/api/v1/users", headers=headers)
    assert resp.status_code == 403


def test_users_crud_and_audit(client: TestClient):
    headers = _admin_headers(client)

    list_resp = client.get("/api/v1/users", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) >= 2

    create_resp = client.post(
        "/api/v1/users",
        headers=headers,
        json={
            "name": "Test Analyst",
            "email": "analyst@test.ru",
            "password": "test1234",
            "team": "QA",
            "roles": ["ANALYST"],
        },
    )
    assert create_resp.status_code == 201
    user = create_resp.json()
    user_id = user["id"]
    assert "ANALYST" in user["roles"]

    patch_resp = client.patch(
        f"/api/v1/users/{user_id}",
        headers=headers,
        json={"name": "Test Analyst Updated"},
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["name"] == "Test Analyst Updated"

    roles_resp = client.get("/api/v1/users/roles", headers=headers)
    assert roles_resp.status_code == 200
    planner_role = next(r for r in roles_resp.json() if r["code"] == "SUPPLY_PLANNER")

    assign_resp = client.post(
        f"/api/v1/users/{user_id}/roles",
        headers=headers,
        json={"role_id": planner_role["id"]},
    )
    assert assign_resp.status_code == 200
    assert "SUPPLY_PLANNER" in assign_resp.json()["roles"]

    audit_resp = client.get("/api/v1/users/audit-events", headers=headers)
    assert audit_resp.status_code == 200
    actions = [e["action"] for e in audit_resp.json()]
    assert "USER_CREATED" in actions
    assert "USER_UPDATED" in actions
    assert "ROLE_ASSIGNED" in actions

    delete_resp = client.delete(f"/api/v1/users/{user_id}", headers=headers)
    assert delete_resp.status_code == 204
