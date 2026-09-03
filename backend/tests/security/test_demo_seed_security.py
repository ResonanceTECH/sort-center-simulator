"""Stage 14 — API security: permissions, scope, action guards."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select

from app.core.database import Base, SessionLocal, engine
from app.core.enums import AppRole
from app.db.scm_seed import (
    CUSTOMER_ORG_NAME,
    seed_scm_demo,
)
from app.main import app
from app.models.master_data import Carrier, Product, Supplier, Warehouse
from app.models.organization import Organization
from app.models.planning import DemandForecast, InventoryPlan, SupplyPlan, TransportPlan
from app.models.rbac import Role, UserRole
from app.models.scenario_models import Recommendation, ScmScenario
from app.models.shipment import Shipment
from app.models.exception_models import Incident, ScmException
from app.models.user import User
from app.models.master_data import NetworkConnection, NetworkNode


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


def test_demo_seed_volume_and_coverage(client: TestClient):
    db = SessionLocal()
    try:
        org = db.scalars(select(Organization).where(Organization.name == CUSTOMER_ORG_NAME)).first()
        assert org is not None

        assert db.scalar(select(func.count()).select_from(Supplier).where(Supplier.organization_id == org.id)) >= 5
        assert db.scalar(select(func.count()).select_from(Carrier).where(Carrier.organization_id == org.id)) >= 4
        assert db.scalar(select(func.count()).select_from(Warehouse).where(Warehouse.organization_id == org.id)) >= 5
        assert db.scalar(select(func.count()).select_from(NetworkNode).where(NetworkNode.organization_id == org.id)) >= 5
        assert (
            db.scalar(
                select(func.count()).select_from(NetworkConnection).where(NetworkConnection.organization_id == org.id)
            )
            >= 10
        )
        assert db.scalar(select(func.count()).select_from(Product).where(Product.organization_id == org.id)) >= 30
        assert db.scalar(select(func.count()).select_from(Shipment).where(Shipment.organization_id == org.id)) >= 50
        assert (
            db.scalar(select(func.count()).select_from(DemandForecast).where(DemandForecast.organization_id == org.id))
            >= 3
        )
        assert db.scalar(select(func.count()).select_from(SupplyPlan).where(SupplyPlan.organization_id == org.id)) >= 2
        assert (
            db.scalar(select(func.count()).select_from(InventoryPlan).where(InventoryPlan.organization_id == org.id))
            >= 2
        )
        assert (
            db.scalar(select(func.count()).select_from(TransportPlan).where(TransportPlan.organization_id == org.id))
            >= 2
        )
        assert (
            db.scalar(select(func.count()).select_from(ScmException).where(ScmException.organization_id == org.id)) >= 10
        )
        assert db.scalar(select(func.count()).select_from(Incident).where(Incident.organization_id == org.id)) >= 5
        assert (
            db.scalar(select(func.count()).select_from(ScmScenario).where(ScmScenario.organization_id == org.id)) >= 4
        )
        assert (
            db.scalar(
                select(func.count()).select_from(Recommendation).where(Recommendation.organization_id == org.id)
            )
            >= 3
        )

        statuses = set(db.scalars(select(Shipment.status).where(Shipment.organization_id == org.id)).all())
        for required in (
            "PLANNED",
            "ASSIGNED",
            "ACCEPTED",
            "READY_FOR_PICKUP",
            "IN_TRANSIT",
            "ARRIVED",
            "DELIVERED",
        ):
            assert required in statuses, f"missing status {required}"

        risks = set(
            r for r in db.scalars(select(Shipment.risk_status).where(Shipment.organization_id == org.id)).all() if r
        )
        for required in ("NORMAL", "MEDIUM", "HIGH", "CRITICAL", "NO_DATA"):
            assert required in risks, f"missing risk {required}"

        # All 7 roles present
        role_codes = set(db.scalars(select(Role.code)).all())
        for code in AppRole:
            assert code.value in role_codes

        emails = {
            "admin@demo.scm.ru",
            "manager@demo.scm.ru",
            "planner@demo.scm.ru",
            "logistics@demo.scm.ru",
            "analyst@demo.scm.ru",
            "supplier@demo.scm.ru",
            "carrier@demo.scm.ru",
            "demo@sortcenter.ru",
            "supplier@scm.ru",
            "carrier@scm.ru",
        }
        for email in emails:
            assert db.scalars(select(User).where(User.email == email)).first(), email
    finally:
        db.close()


def test_demo_accounts_me_workspaces(client: TestClient):
    cases = [
        ("manager@demo.scm.ru", "demo123", "SUPPLY_CHAIN_MANAGER", ["INTERNAL"]),
        ("planner@demo.scm.ru", "demo123", "SUPPLY_PLANNER", ["INTERNAL"]),
        ("logistics@demo.scm.ru", "demo123", "LOGISTICS_MANAGER", ["INTERNAL"]),
        ("analyst@demo.scm.ru", "demo123", "ANALYST", ["INTERNAL"]),
        ("admin@demo.scm.ru", "demo123", "ADMIN", ["ADMIN"]),
        ("supplier@demo.scm.ru", "demo123", "SUPPLIER", ["SUPPLIER"]),
        ("carrier@demo.scm.ru", "demo123", "CARRIER", ["CARRIER"]),
    ]
    for email, password, role, workspaces in cases:
        headers = _login(client, email, password)
        body = client.get("/api/v1/auth/me", headers=headers).json()
        assert role in body["roles"], email
        assert body["available_workspaces"] == workspaces, email


def test_supplier_scope_only_alpha(client: TestClient):
    headers = _login(client, "supplier@demo.scm.ru")
    items = client.get("/api/v1/shipments?page_size=100", headers=headers).json()["items"]
    assert items
    assert all(i["supplierName"] == "Supplier Alpha" for i in items)


def test_carrier_scope_only_vector(client: TestClient):
    headers = _login(client, "carrier@demo.scm.ru")
    items = client.get("/api/v1/shipments?page_size=100", headers=headers).json()["items"]
    assert items
    assert all(i.get("carrierName") == "Carrier Vector" for i in items)


def test_planner_cannot_apply_scenario(client: TestClient):
    headers = _login(client, "planner@demo.scm.ru")
    me = client.get("/api/v1/auth/me", headers=headers).json()
    assert "supply_plan.approve" not in me["permissions"]
    assert "scenario.apply" not in me["permissions"]

    listed = client.get("/api/v1/scenarios", headers=headers)
    assert listed.status_code == 200
    scenarios = listed.json()
    items = scenarios if isinstance(scenarios, list) else scenarios.get("items", scenarios)
    assert items
    sid = items[0]["id"] if isinstance(items[0], dict) else items[0]
    resp = client.post(f"/api/v1/scenarios/{sid}/apply", headers=headers)
    assert resp.status_code == 403


def test_analyst_cannot_cancel_or_assign(client: TestClient):
    headers = _login(client, "analyst@demo.scm.ru")
    me = client.get("/api/v1/auth/me", headers=headers).json()
    assert "shipment.cancel" not in me["permissions"]
    assert "shipment.assign_carrier" not in me["permissions"]
    assert "scenario.apply" not in me["permissions"]

    db = SessionLocal()
    try:
        shipment = db.scalars(select(Shipment).where(Shipment.status == "IN_TRANSIT")).first()
        assert shipment is not None
        sid = str(shipment.id)
        carrier = db.scalars(select(Carrier)).first()
        carrier_id = str(carrier.id)
    finally:
        db.close()

    assert client.post(f"/api/v1/shipments/{sid}/cancel", headers=headers).status_code == 403
    assert (
        client.post(
            f"/api/v1/shipments/{sid}/assign-carrier",
            headers=headers,
            json={"carrier_id": carrier_id},
        ).status_code
        == 403
    )


def test_admin_cannot_perform_ops_writes(client: TestClient):
    headers = _login(client, "admin@demo.scm.ru")
    me = client.get("/api/v1/auth/me", headers=headers).json()
    assert "users.manage_roles" in me["permissions"]
    assert "shipment.assign_carrier" not in me["permissions"]
    assert "shipment.cancel" not in me["permissions"]

    db = SessionLocal()
    try:
        shipment = db.scalars(select(Shipment)).first()
        sid = str(shipment.id)
    finally:
        db.close()

    assert client.post(f"/api/v1/shipments/{sid}/cancel", headers=headers).status_code == 403


def test_manager_can_apply_scenario(client: TestClient):
    headers = _login(client, "manager@demo.scm.ru")
    me = client.get("/api/v1/auth/me", headers=headers).json()
    assert "scenario.apply" in me["permissions"]
    assert "supply_plan.approve" in me["permissions"]

    listed = client.get("/api/v1/scenarios", headers=headers)
    assert listed.status_code == 200
    payload = listed.json()
    items = payload if isinstance(payload, list) else payload.get("items", [])
    assert items
    sid = items[0]["id"]
    resp = client.post(f"/api/v1/scenarios/{sid}/apply", headers=headers)
    assert resp.status_code in (200, 201)


def test_logistics_has_assign_not_accept(client: TestClient):
    headers = _login(client, "logistics@demo.scm.ru")
    me = client.get("/api/v1/auth/me", headers=headers).json()
    assert "shipment.assign_carrier" in me["permissions"]
    assert "shipment.accept" not in me["permissions"]

    db = SessionLocal()
    try:
        shipment = db.scalars(select(Shipment).where(Shipment.status == "ASSIGNED")).first()
        sid = str(shipment.id)
    finally:
        db.close()

    assert client.post(f"/api/v1/shipments/{sid}/accept", headers=headers).status_code == 403


def test_supplier_cannot_see_foreign_incident_shipment(client: TestClient):
    headers = _login(client, "supplier@scm.ru")
    db = SessionLocal()
    try:
        foreign = db.scalars(
            select(Shipment)
            .join(Supplier, Supplier.id == Shipment.supplier_id)
            .where(Supplier.name != "Supplier Alpha")
        ).first()
        assert foreign is not None
        foreign_id = str(foreign.id)
    finally:
        db.close()
    assert client.get(f"/api/v1/shipments/{foreign_id}", headers=headers).status_code == 404
