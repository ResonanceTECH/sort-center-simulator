"""Shipment business-action permission + state guards."""

from __future__ import annotations

from app.core.enums import ShipmentStatus
from app.core.errors import ForbiddenError
from app.domain.shipments.state_machine import ACTION_TO_STATUS, available_actions, validate_transition
from app.models.shipment import Shipment
from app.security.context import AuthContext

# action key (API) → required permission
SHIPMENT_ACTION_PERMISSIONS: dict[str, str] = {
    "assign_carrier": "shipment.assign_carrier",
    "accept": "shipment.accept",
    "reject": "shipment.reject",
    "confirm_ready": "shipment.confirm_ready",
    "confirm_pickup": "shipment.confirm_pickup",
    "confirm_arrival": "shipment.confirm_arrival",
    "complete": "shipment.confirm_delivery",
    "cancel": "shipment.cancel",
    "report_delay": "shipment.report_delay",
    "update_tracking": "shipment.update_tracking",
    "update_eta": "shipment.update_eta",
    "change_route": "shipment.change_route",
    "reschedule": "shipment.reschedule",
}

# API availableActions labels → action keys
ACTION_LABEL_TO_KEY: dict[str, str] = {
    "ASSIGN_CARRIER": "assign_carrier",
    "ACCEPT": "accept",
    "REJECT": "reject",
    "CONFIRM_READY": "confirm_ready",
    "CONFIRM_PICKUP": "confirm_pickup",
    "CONFIRM_ARRIVAL": "confirm_arrival",
    "COMPLETE": "complete",
    "CANCEL": "cancel",
    "REPORT_DELAY": "report_delay",
}


def permission_for_action(action: str) -> str:
    perm = SHIPMENT_ACTION_PERMISSIONS.get(action)
    if perm is None:
        from app.core.errors import AppError

        raise AppError("INVALID_ACTION", f"Unknown action: {action}")
    return perm


def assert_shipment_action_allowed(ctx: AuthContext, shipment: Shipment, action: str) -> None:
    """Check permission + valid state transition for a business action."""
    required = permission_for_action(action)
    if required not in ctx.permissions:
        raise ForbiddenError(
            "FORBIDDEN",
            "Insufficient permissions for shipment action",
            details={"required": required, "action": action},
        )

    target = ACTION_TO_STATUS.get(action)
    if target is not None:
        validate_transition(ShipmentStatus(shipment.status), target)
        return

    # Actions without status transition still have lifecycle constraints
    label = next((lbl for lbl, key in ACTION_LABEL_TO_KEY.items() if key == action), None)
    if label and label not in available_actions(ShipmentStatus(shipment.status)):
        from app.core.errors import AppError

        raise AppError(
            "SHIPMENT_INVALID_STATE",
            f"Action {action} is not allowed in status {shipment.status}",
            status_code=409,
            details={"current": shipment.status, "action": action},
        )


def filter_available_actions(status: str, permissions: set[str]) -> list[str]:
    """State-machine actions intersected with caller's permissions."""
    labels = available_actions(ShipmentStatus(status))
    out: list[str] = []
    for label in labels:
        key = ACTION_LABEL_TO_KEY.get(label)
        if key is None:
            continue
        required = SHIPMENT_ACTION_PERMISSIONS.get(key)
        if required and required in permissions:
            out.append(label)
    return out
