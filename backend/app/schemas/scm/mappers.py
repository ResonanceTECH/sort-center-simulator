from __future__ import annotations

from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.enums import ShipmentStatus
from app.domain.shipments.state_machine import available_actions
from app.models.exception_models import Incident, ScmException
from app.models.master_data import Carrier, NetworkNode, Product, Supplier
from app.models.shipment import Shipment, ShipmentEvent, ShipmentItem
from app.schemas.scm.common import MetricOut, ShipmentDetailOut, ShipmentSummaryOut


def _node_name(db: Session, node_id: UUID | None) -> str:
    if not node_id:
        return "—"
    node = db.get(NetworkNode, node_id)
    return node.name if node else "—"


def shipment_to_summary(db: Session, s: Shipment) -> ShipmentSummaryOut:
    supplier = db.get(Supplier, s.supplier_id)
    carrier = db.get(Carrier, s.carrier_id) if s.carrier_id else None
    ref = s.external_ref or str(s.id)[:8].upper()
    return ShipmentSummaryOut(
        id=ref,
        supplierId=str(s.supplier_id),
        supplierName=supplier.name if supplier else "—",
        carrierId=str(s.carrier_id) if s.carrier_id else None,
        carrierName=carrier.name if carrier else None,
        origin=_node_name(db, s.origin_id),
        destination=_node_name(db, s.destination_id),
        status=s.status,
        pickupAt=s.planned_pickup_at.isoformat() if s.planned_pickup_at else None,
        plannedEta=s.planned_delivery_at.isoformat() if s.planned_delivery_at else None,
        forecastEta=s.forecast_eta.isoformat() if s.forecast_eta else None,
        deviationMinutes=s.deviation_minutes,
        slaRisk=MetricOut(
            label="SLA Risk",
            value=round((s.sla_risk or 0) * 100, 1),
            unit="%",
            status=s.risk_status or "NORMAL",
        ),
    )


def shipment_to_detail(db: Session, s: Shipment) -> ShipmentDetailOut:
    summary = shipment_to_summary(db, s)
    items = db.query(ShipmentItem).filter(ShipmentItem.shipment_id == s.id).all()
    skus = []
    for item in items:
        product = db.get(Product, item.sku_id)
        skus.append({
            "sku": product.sku if product else str(item.sku_id),
            "name": product.name if product else "—",
            "quantity": int(item.quantity),
        })

    exceptions = db.query(ScmException).filter(
        ScmException.shipment_id == s.id,
        ScmException.status.in_(["OPEN", "IN_PROGRESS"]),
    ).all()
    exc_out = [{"id": str(e.id), "type": e.type, "severity": e.severity} for e in exceptions]

    incidents = db.query(Incident).filter(Incident.shipment_id == s.id).all()
    inc_out = [{"id": str(i.id), "title": i.title, "status": i.status} for i in incidents]

    events = db.query(ShipmentEvent).filter(ShipmentEvent.shipment_id == s.id).order_by(ShipmentEvent.created_at).all()
    timeline = [
        {
            "id": str(ev.id),
            "timestamp": ev.created_at.strftime("%H:%M"),
            "type": ev.event_type.lower(),
            "title": ev.title,
            "description": ev.description,
        }
        for ev in events
    ]

    ref = s.external_ref or str(s.id)[:8].upper()
    return ShipmentDetailOut(
        **summary.model_dump(by_alias=True),
        orderId=f"ORD-{ref}",
        skus=skus,
        exceptions=exc_out,
        incidents=inc_out,
        timeline=timeline,
        availableActions=available_actions(ShipmentStatus(s.status)),
    )
