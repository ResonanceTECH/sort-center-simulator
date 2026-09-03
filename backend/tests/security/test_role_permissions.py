"""Default RBAC permission matrices (TZ §4–5)."""

from __future__ import annotations

from app.core.enums import AppRole
from app.security.permissions import (
    ALL_PERMISSIONS,
    FORBIDDEN_FOR_ADMIN_DEFAULT,
    OPERATIONAL_SHIPMENT_WRITES,
    ROLE_PERMISSIONS,
    assert_matrices_valid,
    role_has_permission,
)


def test_catalog_unique_and_nonempty():
    assert len(ALL_PERMISSIONS) == len(set(ALL_PERMISSIONS))
    assert len(ALL_PERMISSIONS) >= 80


def test_matrices_valid():
    assert_matrices_valid()


def test_admin_has_iam_not_ops_writes():
    admin = ROLE_PERMISSIONS[AppRole.ADMIN]
    assert "users.manage_roles" in admin
    assert "roles.create" in admin
    assert "permissions.read" in admin
    assert "audit.read" in admin
    assert "shipment.read" in admin
    assert "supply_plan.read" in admin
    assert "scenario.read" in admin
    assert not (admin & FORBIDDEN_FOR_ADMIN_DEFAULT)
    assert not (admin & OPERATIONAL_SHIPMENT_WRITES)
    assert "shipment.assign_carrier" not in admin
    assert "supply_plan.approve" not in admin
    assert "scenario.apply" not in admin


def test_planner_cannot_approve_or_apply():
    planner = ROLE_PERMISSIONS[AppRole.SUPPLY_PLANNER]
    assert "supply_plan.submit" in planner
    assert "supply_plan.calculate" in planner
    assert "scenario.run" in planner
    assert "scenario.compare" in planner
    assert "supply_plan.approve" not in planner
    assert "supply_plan.activate" not in planner
    assert "scenario.apply" not in planner
    assert "shipment.assign_carrier" not in planner
    assert "users.manage_roles" not in planner


def test_analyst_no_operational_sot():
    analyst = ROLE_PERMISSIONS[AppRole.ANALYST]
    assert "analytics.export" in analyst
    assert "scenario.compare" in analyst
    assert "shipment.read" in analyst
    assert "shipment.update" not in analyst
    assert "shipment.cancel" not in analyst
    assert "shipment.confirm_delivery" not in analyst
    assert "supply_plan.approve" not in analyst
    assert "scenario.apply" not in analyst


def test_logistics_shipment_actions():
    logistics = ROLE_PERMISSIONS[AppRole.LOGISTICS_MANAGER]
    assert "shipment.assign_carrier" in logistics
    assert "shipment.cancel" in logistics
    assert "users.create" not in logistics
    assert "forecast.calculate" not in logistics


def test_supplier_and_carrier_scoped_actions():
    supplier = ROLE_PERMISSIONS[AppRole.SUPPLIER]
    carrier = ROLE_PERMISSIONS[AppRole.CARRIER]
    assert "shipment.confirm_ready" in supplier
    assert "shipment.confirm_pickup" not in supplier
    assert "shipment.accept" in carrier
    assert "shipment.confirm_delivery" in carrier
    assert "forecast.read" not in carrier
    assert "supply_plan.approve" not in carrier
    assert "scenario.apply" not in supplier


def test_manager_has_approve_and_apply():
    mgr = ROLE_PERMISSIONS[AppRole.SUPPLY_CHAIN_MANAGER]
    assert role_has_permission(AppRole.SUPPLY_CHAIN_MANAGER, "supply_plan.approve")
    assert "scenario.apply" in mgr
    assert "shipment.assign_carrier" in mgr


def test_every_role_covered():
    assert set(ROLE_PERMISSIONS.keys()) == set(AppRole)
