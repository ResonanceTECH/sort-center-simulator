from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps.scm_auth import require_permission
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.engines.eta.calculator import calculate_impact
from app.models.exception_models import ScmException
from app.models.master_data import Inventory
from app.models.shipment import Shipment, ShipmentItem
from app.schemas.scm.common import MetricOut
from app.security.context import AuthContext
from app.security.scope import apply_exception_scope

router = APIRouter(prefix="/exceptions", tags=["exceptions"])


@router.get("")
def list_exceptions(
    severity: Optional[str] = None,
    type: Optional[str] = None,
    status: Optional[str] = None,
    owner: Optional[UUID] = None,
    shipment: Optional[UUID] = None,
    supplier: Optional[UUID] = None,
    carrier: Optional[UUID] = None,
    ctx: AuthContext = Depends(require_permission("exception.read")),
    db: Session = Depends(get_db),
):
    stmt = apply_exception_scope(select(ScmException), ctx)
    if severity:
        stmt = stmt.where(ScmException.severity == severity)
    if type:
        stmt = stmt.where(ScmException.type == type)
    if status:
        stmt = stmt.where(ScmException.status == status)
    if owner:
        stmt = stmt.where(ScmException.owner_id == owner)
    if shipment:
        stmt = stmt.where(ScmException.shipment_id == shipment)
    if ctx.linked_supplier_id is None and supplier:
        stmt = stmt.where(ScmException.supplier_id == supplier)
    if ctx.linked_carrier_id is None and carrier:
        stmt = stmt.where(ScmException.carrier_id == carrier)

    items = db.scalars(stmt.order_by(ScmException.created_at.desc())).all()
    result = []
    for e in items:
        ship_ref = None
        route = "—"
        if e.shipment_id:
            ship = db.get(Shipment, e.shipment_id)
            if ship:
                ship_ref = ship.external_ref or str(ship.id)[:8]
                from app.models.master_data import NetworkNode
                origin = db.get(NetworkNode, ship.origin_id) if ship.origin_id else None
                dest = db.get(NetworkNode, ship.destination_id) if ship.destination_id else None
                if origin and dest:
                    route = f"{origin.name} → {dest.name}"
        result.append({
            "id": str(e.id),
            "shipmentId": ship_ref,
            "type": e.type,
            "severity": e.severity,
            "severityStatus": e.severity,
            "deviation": e.reason[:50],
            "probability": e.probability,
            "impact": MetricOut(label="Impact", value=round((e.probability or 0) * 100), unit="%", status=e.severity),
            "owner": str(e.owner_id) if e.owner_id else "—",
            "createdAt": e.created_at.isoformat(),
            "route": route,
        })
    return result


@router.get("/{exception_id}")
def get_exception(
    exception_id: UUID,
    ctx: AuthContext = Depends(require_permission("exception.read")),
    db: Session = Depends(get_db),
):
    e = db.get(ScmException, exception_id)
    if e is None:
        raise NotFoundError("EXCEPTION_NOT_FOUND", "Exception not found")
    if ctx.linked_supplier_id is not None and e.supplier_id != ctx.linked_supplier_id:
        raise NotFoundError("EXCEPTION_NOT_FOUND", "Exception not found")
    if ctx.linked_carrier_id is not None and e.carrier_id != ctx.linked_carrier_id:
        raise NotFoundError("EXCEPTION_NOT_FOUND", "Exception not found")
    if (
        ctx.linked_supplier_id is None
        and ctx.linked_carrier_id is None
        and e.organization_id != ctx.organization_id
    ):
        raise NotFoundError("EXCEPTION_NOT_FOUND", "Exception not found")
    ship_ref = None
    if e.shipment_id:
        ship = db.get(Shipment, e.shipment_id)
        ship_ref = ship.external_ref if ship else str(e.shipment_id)
    return {
        "id": str(e.id),
        "type": e.type,
        "severity": e.severity,
        "reason": e.reason,
        "shipment_id": ship_ref,
        "impact": {},
        "status": e.status,
        "owner_id": str(e.owner_id) if e.owner_id else None,
        "description": e.reason,
        "availableActions": ["CREATE_INCIDENT", "CREATE_SCENARIO", "ASSIGN_OWNER"],
    }


@router.get("/{exception_id}/impact")
def exception_impact(
    exception_id: UUID,
    ctx: AuthContext = Depends(require_permission("exception.read")),
    db: Session = Depends(get_db),
):
    e = db.get(ScmException, exception_id)
    if e is None:
        raise NotFoundError("EXCEPTION_NOT_FOUND", "Exception not found")
    if ctx.linked_supplier_id is not None and e.supplier_id != ctx.linked_supplier_id:
        raise NotFoundError("EXCEPTION_NOT_FOUND", "Exception not found")
    if ctx.linked_carrier_id is not None and e.carrier_id != ctx.linked_carrier_id:
        raise NotFoundError("EXCEPTION_NOT_FOUND", "Exception not found")
    if (
        ctx.linked_supplier_id is None
        and ctx.linked_carrier_id is None
        and e.organization_id != ctx.organization_id
    ):
        raise NotFoundError("EXCEPTION_NOT_FOUND", "Exception not found")

    affected_skus = []
    if e.shipment_id:
        items = db.scalars(select(ShipmentItem).where(ShipmentItem.shipment_id == e.shipment_id)).all()
        for item in items:
            affected_skus.append({"sku_id": str(item.sku_id), "quantity": item.quantity})

    inv = db.scalars(select(Inventory).where(Inventory.organization_id == ctx.organization_id).limit(1)).first()
    inventory_impact = {"projected_stock": 0, "safety_stock": 0, "stockout_probability": 0, "impact_status": "LOW"}
    if inv and affected_skus:
        inventory_impact = calculate_impact(
            affected_quantity=affected_skus[0]["quantity"],
            current_stock=inv.current_stock,
            safety_stock=inv.safety_stock,
            incoming=inv.incoming,
            daily_demand=500,
        )

    return {
        "affected_skus": affected_skus,
        "inventory": inventory_impact,
        "affected_orders": 12,
        "affected_warehouses": 2,
        "impact_status": inventory_impact.get("impact_status", "HIGH"),
    }
