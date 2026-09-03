"""SCM platform permission catalog and default role matrices.

Source of truth for seed (DB role_permissions) and runtime AuthContext (until
Stage 4 loads permissions from DB). Authorization is permission-based;
AppRole is a bag of permissions, not a hard-coded switch.
"""

from __future__ import annotations

from app.core.enums import AppRole

# ---------------------------------------------------------------------------
# Atomic permissions — resource.action (TZ §4)
# ---------------------------------------------------------------------------

ALL_PERMISSIONS: list[str] = [
    # Users / IAM
    "users.read",
    "users.create",
    "users.update",
    "users.delete",
    "users.manage_roles",
    "roles.read",
    "roles.create",
    "roles.update",
    "roles.delete",
    "permissions.read",
    "organization.read",
    "organization.create",
    "organization.update",
    "organization.delete",
    "integrations.read",
    "integrations.create",
    "integrations.update",
    "integrations.delete",
    "directories.read",
    "directories.create",
    "directories.update",
    "directories.delete",
    "audit.read",
    # Network / master data
    "network.read",
    "network.create",
    "network.update",
    "network.delete",
    "supplier.read",
    "supplier.create",
    "supplier.update",
    "supplier.delete",
    "carrier.read",
    "carrier.create",
    "carrier.update",
    "carrier.delete",
    "warehouse.read",
    "warehouse.create",
    "warehouse.update",
    "warehouse.delete",
    "route.read",
    "route.create",
    "route.update",
    "route.delete",
    # Planning
    "forecast.read",
    "forecast.create",
    "forecast.update",
    "forecast.delete",
    "forecast.calculate",
    "supply_plan.read",
    "supply_plan.create",
    "supply_plan.update",
    "supply_plan.delete",
    "supply_plan.calculate",
    "supply_plan.submit",
    "supply_plan.approve",
    "supply_plan.activate",
    "inventory_plan.read",
    "inventory_plan.create",
    "inventory_plan.update",
    "inventory_plan.delete",
    "inventory_plan.calculate",
    "transport_plan.read",
    "transport_plan.create",
    "transport_plan.update",
    "transport_plan.delete",
    "transport_plan.calculate",
    "transport_plan.submit",
    "transport_plan.approve",
    # Shipments / tracking
    "shipment.read",
    "shipment.create",
    "shipment.update",
    "shipment.assign_carrier",
    "shipment.change_route",
    "shipment.reschedule",
    "shipment.cancel",
    "shipment.accept",
    "shipment.reject",
    "shipment.assign_vehicle",
    "shipment.assign_driver",
    "shipment.confirm_ready",
    "shipment.confirm_pickup",
    "shipment.update_tracking",
    "shipment.update_eta",
    "shipment.report_delay",
    "shipment.confirm_arrival",
    "shipment.confirm_delivery",
    "tracking.read",
    "tracking.update",
    "eta.read",
    # Exceptions / incidents
    "exception.read",
    "exception.create",
    "exception.update",
    "exception.resolve",
    "incident.read",
    "incident.create",
    "incident.update",
    "incident.assign",
    "incident.resolve",
    "incident.close",
    # Scenarios / analytics / reports / docs
    "scenario.read",
    "scenario.create",
    "scenario.update",
    "scenario.delete",
    "scenario.run",
    "scenario.compare",
    "scenario.apply",
    "analytics.read",
    "analytics.export",
    "reports.read",
    "reports.create",
    "reports.update",
    "reports.delete",
    "documents.read",
    "documents.create",
    "documents.update",
    "documents.delete",
    # Portal own-resources
    "order.read",
    "order.update",
    "vehicle.read",
    "vehicle.create",
    "vehicle.update",
    "vehicle.delete",
    "driver.read",
    "driver.create",
    "driver.update",
    "driver.delete",
    "performance.read",
]

# Business / operational resources — ADMIN gets READ only on these
_ADMIN_BUSINESS_READ: set[str] = {
    "network.read",
    "supplier.read",
    "carrier.read",
    "warehouse.read",
    "route.read",
    "forecast.read",
    "supply_plan.read",
    "inventory_plan.read",
    "transport_plan.read",
    "shipment.read",
    "tracking.read",
    "eta.read",
    "exception.read",
    "incident.read",
    "scenario.read",
    "analytics.read",
    "reports.read",
    "documents.read",
    "order.read",
    "vehicle.read",
    "driver.read",
    "performance.read",
}

_ADMIN_IAM: set[str] = {
    "users.read",
    "users.create",
    "users.update",
    "users.delete",
    "users.manage_roles",
    "roles.read",
    "roles.create",
    "roles.update",
    "roles.delete",
    "permissions.read",
    "organization.read",
    "organization.create",
    "organization.update",
    "organization.delete",
    "integrations.read",
    "integrations.create",
    "integrations.update",
    "integrations.delete",
    "directories.read",
    "directories.create",
    "directories.update",
    "directories.delete",
    "audit.read",
}

# Operational shipment actions (must NOT be on ADMIN / ANALYST by default)
OPERATIONAL_SHIPMENT_WRITES: frozenset[str] = frozenset(
    {
        "shipment.create",
        "shipment.update",
        "shipment.assign_carrier",
        "shipment.change_route",
        "shipment.reschedule",
        "shipment.cancel",
        "shipment.accept",
        "shipment.reject",
        "shipment.assign_vehicle",
        "shipment.assign_driver",
        "shipment.confirm_ready",
        "shipment.confirm_pickup",
        "shipment.update_tracking",
        "shipment.update_eta",
        "shipment.report_delay",
        "shipment.confirm_arrival",
        "shipment.confirm_delivery",
    }
)

FORBIDDEN_FOR_ADMIN_DEFAULT: frozenset[str] = OPERATIONAL_SHIPMENT_WRITES | frozenset(
    {
        "supply_plan.approve",
        "supply_plan.activate",
        "transport_plan.approve",
        "scenario.apply",
        "scenario.run",
        "incident.resolve",
        "incident.close",
        "exception.resolve",
    }
)


def _crud(resource: str) -> set[str]:
    return {f"{resource}.read", f"{resource}.create", f"{resource}.update", f"{resource}.delete"}


ROLE_PERMISSIONS: dict[AppRole, set[str]] = {
    # ------------------------------------------------------------------
    # ADMIN — IAM + directories; business data READ ONLY
    # ------------------------------------------------------------------
    AppRole.ADMIN: _ADMIN_IAM | _ADMIN_BUSINESS_READ,
    # ------------------------------------------------------------------
    # SUPPLY_CHAIN_MANAGER — full operational + strategy
    # ------------------------------------------------------------------
    AppRole.SUPPLY_CHAIN_MANAGER: {
        *_crud("network"),
        *_crud("supplier"),
        *_crud("carrier"),
        *_crud("warehouse"),
        *_crud("route"),
        *_crud("forecast"),
        "forecast.calculate",
        *_crud("supply_plan"),
        "supply_plan.calculate",
        "supply_plan.submit",
        "supply_plan.approve",
        "supply_plan.activate",
        *_crud("inventory_plan"),
        "inventory_plan.calculate",
        *_crud("transport_plan"),
        "transport_plan.calculate",
        "transport_plan.submit",
        "transport_plan.approve",
        "shipment.read",
        "shipment.create",
        "shipment.update",
        "shipment.assign_carrier",
        "shipment.change_route",
        "shipment.reschedule",
        "shipment.cancel",
        "shipment.confirm_ready",
        "shipment.confirm_pickup",
        "shipment.update_tracking",
        "shipment.update_eta",
        "shipment.report_delay",
        "shipment.confirm_arrival",
        "shipment.confirm_delivery",
        "tracking.read",
        "tracking.update",
        "eta.read",
        "exception.read",
        "exception.create",
        "exception.update",
        "exception.resolve",
        "incident.read",
        "incident.create",
        "incident.update",
        "incident.assign",
        "incident.resolve",
        "incident.close",
        *_crud("scenario"),
        "scenario.run",
        "scenario.compare",
        "scenario.apply",
        "analytics.read",
        "analytics.export",
        *_crud("reports"),
        *_crud("documents"),
        "organization.read",
        "directories.read",
        "performance.read",
    },
    # ------------------------------------------------------------------
    # SUPPLY_PLANNER — plans + scenarios; NO approve / apply / shipment ops
    # ------------------------------------------------------------------
    AppRole.SUPPLY_PLANNER: {
        "network.read",
        "network.update",
        "supplier.read",
        "supplier.update",
        "route.read",
        "route.create",
        "route.update",
        "warehouse.read",
        *_crud("forecast"),
        "forecast.calculate",
        "supply_plan.read",
        "supply_plan.create",
        "supply_plan.update",
        "supply_plan.delete",
        "supply_plan.calculate",
        "supply_plan.submit",
        # NO supply_plan.approve / activate
        "inventory_plan.read",
        "inventory_plan.create",
        "inventory_plan.update",
        "inventory_plan.delete",
        "inventory_plan.calculate",
        "transport_plan.read",
        "transport_plan.create",
        "transport_plan.update",
        "transport_plan.delete",
        "transport_plan.calculate",
        "shipment.read",
        "tracking.read",
        "eta.read",
        "exception.read",
        "incident.read",
        *_crud("scenario"),
        "scenario.run",
        "scenario.compare",
        # NO scenario.apply
        "analytics.read",
        "reports.read",
        "reports.create",
        "reports.update",
        "organization.read",
        "directories.read",
    },
    # ------------------------------------------------------------------
    # LOGISTICS_MANAGER — transport / shipments / incidents
    # ------------------------------------------------------------------
    AppRole.LOGISTICS_MANAGER: {
        "transport_plan.read",
        "transport_plan.create",
        "transport_plan.update",
        "transport_plan.delete",
        "transport_plan.calculate",
        "transport_plan.submit",
        "transport_plan.approve",
        *_crud("carrier"),
        *_crud("route"),
        "shipment.read",
        "shipment.create",
        "shipment.update",
        "shipment.assign_carrier",
        "shipment.change_route",
        "shipment.reschedule",
        "shipment.cancel",
        "shipment.confirm_arrival",
        "shipment.confirm_delivery",
        "tracking.read",
        "tracking.update",
        "eta.read",
        "shipment.update_tracking",
        "shipment.update_eta",
        "shipment.report_delay",
        "exception.read",
        "exception.create",
        "exception.update",
        "exception.resolve",
        "incident.read",
        "incident.create",
        "incident.update",
        "incident.assign",
        "incident.resolve",
        "incident.close",
        *_crud("documents"),
        "scenario.read",
        "scenario.create",
        "scenario.update",
        "scenario.run",
        "analytics.read",
        "reports.read",
        "reports.create",
        "reports.update",
        "network.read",
        "supplier.read",
        "warehouse.read",
        "organization.read",
        "performance.read",
    },
    # ------------------------------------------------------------------
    # ANALYST — analytics + scenarios; NO operational SoT writes
    # ------------------------------------------------------------------
    AppRole.ANALYST: {
        "network.read",
        "supplier.read",
        "carrier.read",
        "warehouse.read",
        "route.read",
        "forecast.read",
        "forecast.create",
        "forecast.update",
        "forecast.calculate",
        "supply_plan.read",
        "inventory_plan.read",
        "transport_plan.read",
        "shipment.read",
        "tracking.read",
        "eta.read",
        "exception.read",
        "incident.read",
        *_crud("scenario"),
        "scenario.run",
        "scenario.compare",
        # NO scenario.apply
        "analytics.read",
        "analytics.export",
        *_crud("reports"),
        "documents.read",
        "organization.read",
        "performance.read",
    },
    # ------------------------------------------------------------------
    # SUPPLIER — own org scope enforced later (Stage 6)
    # ------------------------------------------------------------------
    AppRole.SUPPLIER: {
        "organization.read",
        "organization.update",
        "order.read",
        "order.update",
        "forecast.read",
        "supply_plan.read",
        "shipment.read",
        "shipment.confirm_ready",
        "documents.read",
        "documents.create",
        "documents.update",
        "incident.read",
        "incident.create",
        "incident.update",
        "analytics.read",
        "performance.read",
        "exception.read",
    },
    # ------------------------------------------------------------------
    # CARRIER — assigned shipments only (scope Stage 6)
    # ------------------------------------------------------------------
    AppRole.CARRIER: {
        "organization.read",
        "organization.update",
        "shipment.read",
        "shipment.accept",
        "shipment.reject",
        "shipment.assign_vehicle",
        "shipment.assign_driver",
        "shipment.confirm_pickup",
        "shipment.update_tracking",
        "shipment.update_eta",
        "shipment.report_delay",
        "shipment.confirm_arrival",
        "shipment.confirm_delivery",
        "tracking.read",
        "tracking.update",
        "eta.read",
        *_crud("vehicle"),
        *_crud("driver"),
        "documents.read",
        "documents.create",
        "documents.update",
        "incident.read",
        "incident.create",
        "incident.update",
        "analytics.read",
        "performance.read",
        "exception.read",
    },
}


def role_has_permission(role: AppRole, permission: str) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, set())


def user_has_permission(roles: list[AppRole], permission: str) -> bool:
    return any(role_has_permission(role, permission) for role in roles)


def permissions_for_roles(roles: list[AppRole]) -> set[str]:
    out: set[str] = set()
    for role in roles:
        out.update(ROLE_PERMISSIONS.get(role, set()))
    return out


def assert_matrices_valid() -> None:
    """Dev/test invariant: every matrix entry is in the catalog; ADMIN has no ops writes."""
    catalog = set(ALL_PERMISSIONS)
    for role, perms in ROLE_PERMISSIONS.items():
        unknown = perms - catalog
        if unknown:
            raise AssertionError(f"{role}: unknown permissions {sorted(unknown)}")
    admin = ROLE_PERMISSIONS[AppRole.ADMIN]
    leaked = admin & FORBIDDEN_FOR_ADMIN_DEFAULT
    if leaked:
        raise AssertionError(f"ADMIN must not have operational writes: {sorted(leaked)}")
    for forbidden in ("supply_plan.approve", "scenario.apply", "shipment.update", "shipment.cancel"):
        if forbidden in ROLE_PERMISSIONS[AppRole.ANALYST]:
            raise AssertionError(f"ANALYST must not have {forbidden}")
        if forbidden in ROLE_PERMISSIONS[AppRole.SUPPLY_PLANNER] and forbidden != "shipment.update":
            if forbidden in ("supply_plan.approve", "scenario.apply"):
                raise AssertionError(f"SUPPLY_PLANNER must not have {forbidden}")
