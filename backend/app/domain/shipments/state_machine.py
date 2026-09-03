from __future__ import annotations

from app.core.enums import ShipmentStatus
from app.core.errors import AppError

# Valid transitions per spec §38
SHIPMENT_TRANSITIONS: dict[ShipmentStatus, set[ShipmentStatus]] = {
    ShipmentStatus.DRAFT: {ShipmentStatus.PLANNED, ShipmentStatus.CANCELLED},
    ShipmentStatus.PLANNED: {ShipmentStatus.ASSIGNED, ShipmentStatus.CANCELLED},
    ShipmentStatus.ASSIGNED: {ShipmentStatus.ACCEPTED, ShipmentStatus.PLANNED, ShipmentStatus.CANCELLED},
    ShipmentStatus.ACCEPTED: {ShipmentStatus.READY_FOR_PICKUP, ShipmentStatus.CANCELLED},
    ShipmentStatus.READY_FOR_PICKUP: {ShipmentStatus.IN_TRANSIT, ShipmentStatus.CANCELLED},
    ShipmentStatus.IN_TRANSIT: {ShipmentStatus.ARRIVED, ShipmentStatus.CANCELLED},
    ShipmentStatus.ARRIVED: {ShipmentStatus.DELIVERED},
    ShipmentStatus.DELIVERED: set(),
    ShipmentStatus.CANCELLED: set(),
}

ACTION_TO_STATUS: dict[str, ShipmentStatus] = {
    "assign_carrier": ShipmentStatus.ASSIGNED,
    "accept": ShipmentStatus.ACCEPTED,
    "reject": ShipmentStatus.PLANNED,
    "confirm_ready": ShipmentStatus.READY_FOR_PICKUP,
    "confirm_pickup": ShipmentStatus.IN_TRANSIT,
    "start": ShipmentStatus.IN_TRANSIT,
    "confirm_arrival": ShipmentStatus.ARRIVED,
    "complete": ShipmentStatus.DELIVERED,
    "cancel": ShipmentStatus.CANCELLED,
}


def validate_transition(current: ShipmentStatus, target: ShipmentStatus) -> None:
    allowed = SHIPMENT_TRANSITIONS.get(current, set())
    if target not in allowed:
        raise AppError(
            "SHIPMENT_INVALID_STATE",
            f"Transition {current.value} → {target.value} is not allowed",
            status_code=409,
            details={"current": current.value, "target": target.value},
        )


def available_actions(status: ShipmentStatus) -> list[str]:
    mapping: dict[ShipmentStatus, list[str]] = {
        ShipmentStatus.DRAFT: ["ASSIGN_CARRIER", "CANCEL"],
        ShipmentStatus.PLANNED: ["ASSIGN_CARRIER", "CANCEL"],
        ShipmentStatus.ASSIGNED: ["ACCEPT", "REJECT", "CANCEL"],
        ShipmentStatus.ACCEPTED: ["CONFIRM_READY", "CONFIRM_PICKUP", "CANCEL"],
        ShipmentStatus.READY_FOR_PICKUP: ["CONFIRM_PICKUP", "CANCEL"],
        ShipmentStatus.IN_TRANSIT: ["REPORT_DELAY", "CONFIRM_ARRIVAL", "CANCEL"],
        ShipmentStatus.ARRIVED: ["COMPLETE"],
        ShipmentStatus.DELIVERED: [],
        ShipmentStatus.CANCELLED: [],
    }
    return mapping.get(status, [])
