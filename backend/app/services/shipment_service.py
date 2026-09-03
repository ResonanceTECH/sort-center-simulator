from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import ExceptionType, ShipmentEventType
from app.domain.shipments.state_machine import validate_transition, ACTION_TO_STATUS
from app.core.enums import ShipmentStatus
from app.engines.eta.calculator import calculate_eta, calculate_risk, calculate_impact, haversine_km
from app.models.exception_models import ExceptionRule, ScmException
from app.models.master_data import Carrier, Inventory, Product, Supplier
from app.models.shipment import Shipment, ShipmentEvent, TrackingPoint
from app.models.platform import OutboxEvent
from app.services.audit_service import log_audit


class ShipmentService:
    def __init__(self, db: Session, organization_id: UUID) -> None:
        self.db = db
        self.organization_id = organization_id

    def get_shipment(self, shipment_id: UUID) -> Shipment | None:
        return self.db.scalars(
            select(Shipment).where(
                Shipment.id == shipment_id,
                Shipment.organization_id == self.organization_id,
            )
        ).first()

    def apply_action(
        self,
        shipment: Shipment,
        action: str,
        *,
        user_id: UUID | None = None,
        commit: bool = True,
        audit_extra: Optional[dict] = None,
    ) -> Shipment:
        target = ACTION_TO_STATUS.get(action)
        if target is None:
            from app.core.errors import AppError
            raise AppError("INVALID_ACTION", f"Unknown action: {action}")

        current = ShipmentStatus(shipment.status)
        before_status = shipment.status
        validate_transition(current, target)
        shipment.status = target.value
        shipment.version += 1

        event_type_map = {
            "assign_carrier": ShipmentEventType.ASSIGNED,
            "accept": ShipmentEventType.ACCEPTED,
            "confirm_pickup": ShipmentEventType.PICKED_UP,
            "start": ShipmentEventType.IN_TRANSIT,
            "confirm_arrival": ShipmentEventType.ARRIVED,
            "complete": ShipmentEventType.DELIVERED,
            "cancel": ShipmentEventType.CANCELLED,
        }
        evt_type = event_type_map.get(action, ShipmentEventType.IN_TRANSIT)
        self._add_event(shipment, evt_type.value, f"Action: {action}")
        self._emit_outbox("shipment.updated", shipment.id, {"status": shipment.status})
        log_audit(
            self.db,
            organization_id=self.organization_id,
            user_id=user_id,
            entity_type="SHIPMENT",
            entity_id=shipment.id,
            action=f"SHIPMENT_{action.upper()}",
            before={"status": before_status, **(audit_extra or {}).get("before", {})},
            after={"status": shipment.status, "external_ref": shipment.external_ref, **(audit_extra or {}).get("after", {})},
        )
        if commit:
            self.db.commit()
            self.db.refresh(shipment)
        return shipment

    def add_tracking(
        self,
        shipment: Shipment,
        *,
        latitude: float,
        longitude: float,
        speed: float | None,
        recorded_at: datetime,
        idempotency_key: str | None = None,
    ) -> TrackingPoint:
        if idempotency_key:
            existing = self.db.scalars(
                select(TrackingPoint).where(TrackingPoint.idempotency_key == idempotency_key)
            ).first()
            if existing:
                return existing

        point = TrackingPoint(
            shipment_id=shipment.id,
            latitude=latitude,
            longitude=longitude,
            speed=speed,
            recorded_at=recorded_at,
            idempotency_key=idempotency_key,
        )
        self.db.add(point)

        dest = shipment.destination_id
        remaining_km = None
        if dest:
            from app.models.master_data import NetworkNode
            node = self.db.get(NetworkNode, dest)
            if node and node.latitude and node.longitude:
                remaining_km = haversine_km(latitude, longitude, node.latitude, node.longitude)

        stop_minutes = self._detect_stop_minutes(shipment.id)
        forecast_eta, deviation = calculate_eta(
            planned_delivery_at=shipment.planned_delivery_at,
            deviation_minutes=shipment.deviation_minutes,
            remaining_distance_km=remaining_km,
            current_speed_kmh=speed,
            stop_duration_minutes=stop_minutes,
        )
        shipment.forecast_eta = forecast_eta
        shipment.deviation_minutes = deviation

        carrier_otif = None
        if shipment.carrier_id:
            carrier = self.db.get(Carrier, shipment.carrier_id)
            carrier_otif = carrier.otif if carrier else None

        risk = calculate_risk(
            deviation_minutes=deviation,
            sla_risk_base=shipment.sla_risk or 0,
            stop_duration_minutes=stop_minutes,
            carrier_otif=carrier_otif,
        )
        shipment.sla_risk = risk["probability"]
        shipment.risk_status = risk["status"]

        self._add_event(shipment, ShipmentEventType.ETA_UPDATED.value, "ETA recalculated")
        self._emit_outbox("eta.updated", shipment.id, {"forecast_eta": forecast_eta.isoformat() if forecast_eta else None})
        self._check_exceptions(shipment, stop_minutes, risk["probability"])

        self.db.commit()
        self.db.refresh(point)
        return point

    def _detect_stop_minutes(self, shipment_id: UUID) -> float:
        points = list(
            self.db.scalars(
                select(TrackingPoint)
                .where(TrackingPoint.shipment_id == shipment_id)
                .order_by(TrackingPoint.recorded_at.desc())
                .limit(5)
            ).all()
        )
        if len(points) < 2:
            return 0.0
        stopped = [p for p in points if (p.speed or 0) < 5]
        if len(stopped) < 2:
            return 0.0
        delta = (stopped[0].recorded_at - stopped[-1].recorded_at).total_seconds() / 60
        return max(0.0, delta)

    def _check_exceptions(self, shipment: Shipment, stop_minutes: float, sla_prob: float) -> None:
        rules = self.db.scalars(
            select(ExceptionRule).where(
                ExceptionRule.organization_id == self.organization_id,
                ExceptionRule.is_active.is_(True),
            )
        ).all()
        for rule in rules:
            triggered = False
            if rule.rule_type == "STOP_DURATION" and stop_minutes > rule.threshold_value:
                triggered = True
            elif rule.rule_type == "SLA_RISK" and sla_prob * 100 > rule.threshold_value:
                triggered = True
            if triggered:
                self._create_exception(shipment, rule.exception_type, rule.name)

    def _create_exception(self, shipment: Shipment, exc_type: str, reason: str) -> None:
        existing = self.db.scalars(
            select(ScmException).where(
                ScmException.shipment_id == shipment.id,
                ScmException.type == exc_type,
                ScmException.status == "OPEN",
            )
        ).first()
        if existing:
            return

        exc = ScmException(
            organization_id=self.organization_id,
            type=exc_type,
            severity="CRITICAL" if exc_type == ExceptionType.VEHICLE_STOP.value else "HIGH",
            reason=reason,
            shipment_id=shipment.id,
            supplier_id=shipment.supplier_id,
            carrier_id=shipment.carrier_id,
            probability=shipment.sla_risk,
        )
        self.db.add(exc)
        self._add_event(shipment, ShipmentEventType.EXCEPTION_CREATED.value, reason)
        self._emit_outbox("exception.created", exc.id, {"type": exc_type})

    def _add_event(self, shipment: Shipment, event_type: str, title: str, description: str | None = None) -> None:
        self.db.add(
            ShipmentEvent(
                shipment_id=shipment.id,
                event_type=event_type,
                title=title,
                description=description,
            )
        )

    def _emit_outbox(self, event_type: str, entity_id: UUID, payload: dict) -> None:
        self.db.add(
            OutboxEvent(
                organization_id=self.organization_id,
                event_type=event_type,
                entity_id=entity_id,
                payload_json=json.dumps(payload),
            )
        )
