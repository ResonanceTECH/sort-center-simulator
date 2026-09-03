from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps.scm_auth import get_auth_context, require_org_access, require_permission
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.core.pagination import paginate_query
from app.models.master_data import Carrier, NetworkNode, Product, Supplier
from app.models.shipment import Shipment, ShipmentItem
from app.schemas.scm.common import PaginatedOut, PaginationOut
from app.schemas.scm.mappers import shipment_to_detail, shipment_to_summary
from app.security.context import AuthContext
from app.services.shipment_service import ShipmentService

router = APIRouter(prefix="/shipments", tags=["shipments"])


class ShipmentItemIn(BaseModel):
    sku_id: UUID
    quantity: float


class CreateShipmentIn(BaseModel):
    supplier_id: UUID
    origin_id: UUID
    destination_id: UUID
    planned_pickup_at: datetime
    planned_delivery_at: datetime
    items: list[ShipmentItemIn]
    carrier_id: Optional[UUID] = None


class AssignCarrierIn(BaseModel):
    carrier_id: UUID


class TrackingIn(BaseModel):
    latitude: float
    longitude: float
    speed: Optional[float] = None
    recorded_at: datetime
    idempotency_key: Optional[str] = None


class ReportDelayIn(BaseModel):
    delay_minutes: int
    reason: Optional[str] = None


@router.get("")
def list_shipments(
    search: Optional[str] = None,
    status: Optional[str] = None,
    risk: Optional[str] = None,
    supplier_id: Optional[UUID] = None,
    carrier_id: Optional[UUID] = None,
    warehouse_id: Optional[UUID] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    sort: Optional[str] = None,
    order: str = Query("desc"),
    ctx: AuthContext = Depends(require_permission("shipment.read")),
    db: Session = Depends(get_db),
):
    stmt = select(Shipment).where(Shipment.organization_id == ctx.organization_id)
    if status:
        stmt = stmt.where(Shipment.status == status)
    if risk:
        stmt = stmt.where(Shipment.risk_status == risk)
    if supplier_id:
        stmt = stmt.where(Shipment.supplier_id == supplier_id)
    if carrier_id:
        stmt = stmt.where(Shipment.carrier_id == carrier_id)
    if warehouse_id:
        stmt = stmt.where(or_(Shipment.origin_id == warehouse_id, Shipment.destination_id == warehouse_id))
    if date_from:
        stmt = stmt.where(Shipment.planned_delivery_at >= date_from)
    if date_to:
        stmt = stmt.where(Shipment.planned_delivery_at <= date_to)
    if search:
        stmt = stmt.where(Shipment.external_ref.ilike(f"%{search}%"))

    sort_col = Shipment.planned_delivery_at
    if sort == "planned_delivery_at":
        sort_col = Shipment.planned_delivery_at
    stmt = stmt.order_by(sort_col.desc() if order == "desc" else sort_col.asc())

    items, meta = paginate_query(db, stmt, page=page, page_size=page_size)
    return {
        "items": [shipment_to_summary(db, s).model_dump(by_alias=True) for s in items],
        "pagination": PaginationOut(**meta.model_dump()).model_dump(),
        "total": meta.total,
        "page": meta.page,
        "pageSize": meta.page_size,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_shipment(
    body: CreateShipmentIn,
    ctx: AuthContext = Depends(require_permission("shipment.create")),
    db: Session = Depends(get_db),
):
    count = db.scalar(select(Shipment).where(Shipment.organization_id == ctx.organization_id).count()) or 0
    ref = f"SH-{100 + count:04d}"
    shipment = Shipment(
        organization_id=ctx.organization_id,
        external_ref=ref,
        supplier_id=body.supplier_id,
        carrier_id=body.carrier_id,
        origin_id=body.origin_id,
        destination_id=body.destination_id,
        status="PLANNED" if body.carrier_id else "DRAFT",
        planned_pickup_at=body.planned_pickup_at,
        planned_delivery_at=body.planned_delivery_at,
        forecast_eta=body.planned_delivery_at,
    )
    db.add(shipment)
    db.flush()
    for item in body.items:
        db.add(ShipmentItem(shipment_id=shipment.id, sku_id=item.sku_id, quantity=item.quantity))
    db.commit()
    db.refresh(shipment)
    return shipment_to_detail(db, shipment).model_dump(by_alias=True)


@router.get("/{shipment_id}")
def get_shipment(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.read")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    return shipment_to_detail(db, shipment).model_dump(by_alias=True)


def _get_shipment(db: Session, ctx: AuthContext, shipment_id: str) -> Shipment:
    from uuid import UUID
    filters = [Shipment.organization_id == ctx.organization_id]
    try:
        uid = UUID(shipment_id)
        filters.append(Shipment.id == uid)
    except ValueError:
        filters.append(Shipment.external_ref == shipment_id)

    shipment = db.scalars(select(Shipment).where(*filters)).first()
    if shipment is None:
        raise NotFoundError("SHIPMENT_NOT_FOUND", "Shipment not found")
    require_org_access(shipment.organization_id, ctx)
    return shipment


@router.post("/{shipment_id}/assign-carrier")
def assign_carrier(
    shipment_id: str,
    body: AssignCarrierIn,
    ctx: AuthContext = Depends(require_permission("shipment.assign_carrier")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    before_carrier = str(shipment.carrier_id) if shipment.carrier_id else None
    shipment.carrier_id = body.carrier_id
    svc = ShipmentService(db, ctx.organization_id)
    result = svc.apply_action(
        shipment,
        "assign_carrier",
        user_id=ctx.user_id,
        audit_extra={
            "before": {"carrier_id": before_carrier},
            "after": {"carrier_id": str(body.carrier_id)},
        },
    )
    return shipment_to_detail(db, result).model_dump(by_alias=True)


@router.post("/{shipment_id}/accept")
def accept_shipment(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.accept")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    svc = ShipmentService(db, ctx.organization_id)
    return shipment_to_detail(db, svc.apply_action(shipment, "accept", user_id=ctx.user_id)).model_dump(by_alias=True)


@router.post("/{shipment_id}/confirm-pickup")
def confirm_pickup(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.confirm_pickup")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    svc = ShipmentService(db, ctx.organization_id)
    return shipment_to_detail(db, svc.apply_action(shipment, "confirm_pickup", user_id=ctx.user_id)).model_dump(by_alias=True)


@router.post("/{shipment_id}/confirm-arrival")
def confirm_arrival(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.confirm_arrival")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    svc = ShipmentService(db, ctx.organization_id)
    return shipment_to_detail(db, svc.apply_action(shipment, "confirm_arrival", user_id=ctx.user_id)).model_dump(by_alias=True)


@router.post("/{shipment_id}/complete")
def complete_shipment(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.confirm_delivery")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    svc = ShipmentService(db, ctx.organization_id)
    return shipment_to_detail(db, svc.apply_action(shipment, "complete", user_id=ctx.user_id)).model_dump(by_alias=True)


@router.post("/{shipment_id}/cancel")
def cancel_shipment(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.cancel")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    svc = ShipmentService(db, ctx.organization_id)
    return shipment_to_detail(db, svc.apply_action(shipment, "cancel", user_id=ctx.user_id)).model_dump(by_alias=True)


@router.post("/{shipment_id}/report-delay")
def report_delay(
    shipment_id: str,
    body: ReportDelayIn,
    ctx: AuthContext = Depends(require_permission("shipment.report_delay")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    shipment.deviation_minutes += body.delay_minutes
    svc = ShipmentService(db, ctx.organization_id)
    svc._add_event(shipment, "DELAY_REPORTED", "Delay reported", body.reason)
    db.commit()
    return shipment_to_detail(db, shipment).model_dump(by_alias=True)


@router.post("/{shipment_id}/tracking", status_code=status.HTTP_201_CREATED)
def add_tracking(
    shipment_id: str,
    body: TrackingIn,
    ctx: AuthContext = Depends(require_permission("shipment.update_tracking")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    svc = ShipmentService(db, ctx.organization_id)
    svc.add_tracking(
        shipment,
        latitude=body.latitude,
        longitude=body.longitude,
        speed=body.speed,
        recorded_at=body.recorded_at,
        idempotency_key=body.idempotency_key,
    )
    db.refresh(shipment)
    return shipment_to_detail(db, shipment).model_dump(by_alias=True)


@router.get("/{shipment_id}/events")
def get_events(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.read")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    from app.models.shipment import ShipmentEvent
    events = db.scalars(
        select(ShipmentEvent).where(ShipmentEvent.shipment_id == shipment.id).order_by(ShipmentEvent.created_at)
    ).all()
    return [
        {
            "id": str(e.id),
            "type": e.event_type,
            "title": e.title,
            "description": e.description,
            "created_at": e.created_at.isoformat(),
        }
        for e in events
    ]
