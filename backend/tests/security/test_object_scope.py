"""Object scope + shipment action guards."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.database import Base, SessionLocal, engine
from app.db.scm_seed import seed_scm_demo
from app.main import app
from app.models.master_data import Carrier, Supplier
from app.models.shipment import Shipment


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
    assert resp.status_code == 200, resp.text
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}


def test_supplier_sees_only_own_shipments(client: TestClient):
    headers = _login(client, "supplier@scm.ru")
    me = client.get("/api/v1/auth/me", headers=headers).json()
    assert me["organization"]["type"] == "SUPPLIER"
    assert me["available_workspaces"] == ["SUPPLIER"]

    listed = client.get("/api/v1/shipments?page_size=100", headers=headers)
    assert listed.status_code == 200
    items = listed.json()["items"]
    assert items
    assert all(i["supplierName"] == "Supplier Alpha" for i in items)

    # Foreign supplier shipment → 404
    db = SessionLocal()
    try:
        foreign = db.scalars(
            select(Shipment).join(Supplier, Supplier.id == Shipment.supplier_id).where(
                Supplier.name != "Supplier Alpha"
            )
        ).first()
        assert foreign is not None
        foreign_id = str(foreign.id)
    finally:
        db.close()

    resp = client.get(f"/api/v1/shipments/{foreign_id}", headers=headers)
    assert resp.status_code == 404


def test_carrier_sees_only_assigned_shipments(client: TestClient):
    headers = _login(client, "carrier@scm.ru")
    me = client.get("/api/v1/auth/me", headers=headers).json()
    assert me["organization"]["type"] == "CARRIER"
    assert "shipment.accept" in me["permissions"]

    listed = client.get("/api/v1/shipments?page_size=100", headers=headers)
    assert listed.status_code == 200
    items = listed.json()["items"]
    assert items
    assert all(i.get("carrierName") == "Carrier Vector" for i in items)

    db = SessionLocal()
    try:
        foreign = db.scalars(
            select(Shipment).join(Carrier, Carrier.id == Shipment.carrier_id).where(
                Carrier.name != "Carrier Vector"
            )
        ).first()
        assert foreign is not None
        foreign_id = str(foreign.id)
    finally:
        db.close()

    assert client.get(f"/api/v1/shipments/{foreign_id}", headers=headers).status_code == 404


def test_supplier_cannot_confirm_ready_on_foreign_shipment(client: TestClient):
    headers = _login(client, "supplier@scm.ru")
    db = SessionLocal()
    try:
        foreign = db.scalars(
            select(Shipment).join(Supplier, Supplier.id == Shipment.supplier_id).where(
                Supplier.name != "Supplier Alpha"
            )
        ).first()
        foreign_id = str(foreign.id)
    finally:
        db.close()
    resp = client.post(f"/api/v1/shipments/{foreign_id}/confirm-ready", headers=headers)
    assert resp.status_code == 404


def test_carrier_cannot_complete_before_arrived(client: TestClient):
    headers = _login(client, "carrier@scm.ru")
    listed = client.get("/api/v1/shipments?page_size=100", headers=headers).json()["items"]
    # Use ASSIGNED shipment — complete must fail state machine (409) after permission ok
    db = SessionLocal()
    try:
        assigned = db.scalars(
            select(Shipment)
            .join(Carrier, Carrier.id == Shipment.carrier_id)
            .where(Carrier.name == "Carrier Vector", Shipment.status == "ASSIGNED")
        ).first()
        assert assigned is not None
        sid = str(assigned.id)
    finally:
        db.close()

    resp = client.post(f"/api/v1/shipments/{sid}/complete", headers=headers)
    assert resp.status_code == 409


def test_carrier_accept_on_assigned(client: TestClient):
    headers = _login(client, "carrier@scm.ru")
    db = SessionLocal()
    try:
        assigned = db.scalars(
            select(Shipment)
            .join(Carrier, Carrier.id == Shipment.carrier_id)
            .where(Carrier.name == "Carrier Vector", Shipment.status == "ASSIGNED")
        ).first()
        sid = str(assigned.id)
    finally:
        db.close()

    resp = client.post(f"/api/v1/shipments/{sid}/accept", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "ACCEPTED"


def test_supplier_confirm_ready_on_own_accepted(client: TestClient):
    headers = _login(client, "supplier@scm.ru")
    db = SessionLocal()
    try:
        own = db.scalars(
            select(Shipment)
            .join(Supplier, Supplier.id == Shipment.supplier_id)
            .where(Supplier.name == "Supplier Alpha", Shipment.status == "ACCEPTED")
        ).first()
        assert own is not None
        sid = str(own.id)
    finally:
        db.close()

    resp = client.post(f"/api/v1/shipments/{sid}/confirm-ready", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "READY_FOR_PICKUP"


def test_logistics_cannot_accept_without_permission(client: TestClient):
    """LOGISTICS has no shipment.accept — carrier-only action."""
    headers = _login(client, "demo@sortcenter.ru")
    db = SessionLocal()
    try:
        shipment = db.scalars(select(Shipment).where(Shipment.status == "ASSIGNED")).first()
        if shipment is None:
            shipment = db.scalars(select(Shipment)).first()
            shipment.status = "ASSIGNED"
            db.commit()
        sid = str(shipment.id)
    finally:
        db.close()

    resp = client.post(f"/api/v1/shipments/{sid}/accept", headers=headers)
    assert resp.status_code == 403


def test_analyst_cannot_cancel_shipment(client: TestClient):
    # Ensure analyst user exists via admin create or skip if seed has none
    # Use register path: temporarily assign via DB
    from app.core.enums import AppRole
    from app.core.security import hash_password
    from app.models.organization import Organization
    from app.models.rbac import Role, UserOrganization, UserRole
    from app.models.user import User

    db = SessionLocal()
    try:
        org = db.scalars(select(Organization).where(Organization.name == "ООО Ритейл")).first()
        role = db.scalars(select(Role).where(Role.code == AppRole.ANALYST.value)).first()
        user = db.scalars(select(User).where(User.email == "analyst@scm.ru")).first()
        if user is None:
            user = User(
                name="Analyst",
                email="analyst@scm.ru",
                password_hash=hash_password("demo123"),
            )
            db.add(user)
            db.flush()
            db.add(UserOrganization(user_id=user.id, organization_id=org.id, is_primary=True))
            db.add(UserRole(user_id=user.id, role_id=role.id, organization_id=org.id))
            db.commit()
        shipment = db.scalars(select(Shipment).where(Shipment.status == "IN_TRANSIT")).first()
        sid = str(shipment.id)
    finally:
        db.close()

    headers = _login(client, "analyst@scm.ru")
    resp = client.post(f"/api/v1/shipments/{sid}/cancel", headers=headers)
    assert resp.status_code == 403
