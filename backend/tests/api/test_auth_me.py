"""GET /auth/me + DB-backed permissions."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.database import Base, SessionLocal, engine
from app.core.enums import AppRole
from app.db.scm_seed import seed_rbac, seed_scm_demo
from app.main import app
from app.models.rbac import Permission, Role, RolePermission
from app.services.scm_auth_service import get_primary_organization_id, get_user_by_email, get_user_permissions


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


def _login(client: TestClient, email: str, password: str = "demo123") -> dict[str, str]:
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def test_me_returns_roles_permissions_workspaces(client: TestClient):
    headers = _login(client, "demo@sortcenter.ru")
    resp = client.get("/api/v1/auth/me", headers=headers)
    assert resp.status_code == 200
    body = resp.json()

    assert body["user"]["email"] == "demo@sortcenter.ru"
    assert body["organization"]["name"]
    assert body["organization"]["type"] == "CUSTOMER"
    assert "LOGISTICS_MANAGER" in body["roles"]
    assert "shipment.read" in body["permissions"]
    assert "shipment.assign_carrier" in body["permissions"]
    assert "users.manage_roles" not in body["permissions"]
    assert body["available_workspaces"] == ["INTERNAL"]
    assert body["role"] == body["roles"][0]


def test_me_admin_workspace_and_no_ops_write(client: TestClient):
    headers = _login(client, "admin@sortcenter.ru", "admin123")
    body = client.get("/api/v1/auth/me", headers=headers).json()
    assert "ADMIN" in body["roles"]
    assert body["available_workspaces"] == ["ADMIN"]
    assert "users.manage_roles" in body["permissions"]
    assert "shipment.read" in body["permissions"]
    assert "shipment.assign_carrier" not in body["permissions"]
    assert "supply_plan.approve" not in body["permissions"]
    assert "scenario.apply" not in body["permissions"]


def test_auth_context_uses_db_permissions_not_stale_matrix(client: TestClient):
    """Revoke a DB permission → API must 403 even if ROLE_PERMISSIONS still has it."""
    db = SessionLocal()
    try:
        user = get_user_by_email(db, "demo@sortcenter.ru")
        assert user is not None
        org_id = get_primary_organization_id(db, user.id)
        assert org_id is not None

        role = db.scalars(select(Role).where(Role.code == AppRole.LOGISTICS_MANAGER.value)).first()
        perm = db.scalars(select(Permission).where(Permission.code == "shipment.assign_carrier")).first()
        assert role and perm
        link = db.scalars(
            select(RolePermission).where(
                RolePermission.role_id == role.id,
                RolePermission.permission_id == perm.id,
            )
        ).first()
        assert link is not None
        db.delete(link)
        db.commit()

        assert "shipment.assign_carrier" not in get_user_permissions(db, user.id, org_id)
    finally:
        db.close()

    headers = _login(client, "demo@sortcenter.ru")
    shipments = client.get("/api/v1/shipments?page_size=1", headers=headers).json()["items"]
    assert shipments
    sid = shipments[0]["id"]
    carriers = client.get("/api/v1/carriers", headers=headers)
    assert carriers.status_code == 200
    carrier_list = carriers.json()
    items = carrier_list if isinstance(carrier_list, list) else carrier_list.get("items", [])
    assert items
    carrier_id = items[0]["id"]
    resp = client.post(
        f"/api/v1/shipments/{sid}/assign-carrier",
        headers=headers,
        json={"carrier_id": carrier_id},
    )
    assert resp.status_code == 403

    # Restore matrices for sibling module tests sharing DB
    db = SessionLocal()
    try:
        seed_rbac(db)
    finally:
        db.close()
