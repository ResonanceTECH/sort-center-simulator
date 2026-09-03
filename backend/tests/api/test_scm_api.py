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


def test_login_and_control_tower(client: TestClient):
    resp = client.post("/api/v1/auth/login", json={"email": "demo@sortcenter.ru", "password": "demo123"})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["roles"]

    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    ct = client.get("/api/v1/control-tower", headers=headers)
    assert ct.status_code == 200
    assert "activeShipments" in ct.json() or "kpis" in ct.json()


def test_shipments_pagination(client: TestClient):
    login = client.post("/api/v1/auth/login", json={"email": "demo@sortcenter.ru", "password": "demo123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    resp = client.get("/api/v1/shipments?page=1&page_size=10", headers=headers)
    assert resp.status_code == 200
    body = resp.json()
    assert len(body["items"]) <= 10
    assert body["pagination"]["total"] >= 1


def test_tenant_isolation(client: TestClient):
    login = client.post("/api/v1/auth/login", json={"email": "demo@sortcenter.ru", "password": "demo123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    resp = client.get("/api/v1/shipments/00000000-0000-0000-0000-000000000099", headers=headers)
    assert resp.status_code in (403, 404)


def test_state_machine_invalid_transition(client: TestClient):
    login = client.post("/api/v1/auth/login", json={"email": "demo@sortcenter.ru", "password": "demo123"})
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    shipments = client.get("/api/v1/shipments?page_size=1", headers=headers).json()["items"]
    sid = shipments[0]["id"]
    # IN_TRANSIT shipment cannot complete without arrival
    resp = client.post(f"/api/v1/shipments/{sid}/complete", headers=headers)
    assert resp.status_code == 409


def test_scenario_comparison(client: TestClient):
    login = client.post("/api/v1/auth/login", json={"email": "demo@sortcenter.ru", "password": "demo123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    scenarios = client.get("/api/v1/scenarios", headers=headers).json()
    assert len(scenarios) >= 1
    ids = [s["id"] for s in scenarios[:2]]
    if len(ids) < 2:
        ids = ids * 2
    resp = client.post("/api/v1/scenarios/comparison", headers=headers, json={"scenario_ids": ids})
    assert resp.status_code == 200
    body = resp.json()
    assert "rows" in body
    assert body["rows"]


def test_incident_comment(client: TestClient):
    login = client.post("/api/v1/auth/login", json={"email": "demo@sortcenter.ru", "password": "demo123"})
    headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
    incidents = client.get("/api/v1/incidents", headers=headers).json()
    if not incidents:
        pytest.skip("no incidents seeded")
    incident_id = incidents[0]["id"]
    resp = client.post(
        f"/api/v1/incidents/{incident_id}/comments",
        headers=headers,
        json={"message": "API smoke comment"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["message"] == "API smoke comment"
    assert body["author"]

    detail = client.get(f"/api/v1/incidents/{incident_id}", headers=headers).json()
    assert any(c["message"] == "API smoke comment" for c in detail["comments"])
