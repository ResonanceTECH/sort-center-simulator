from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from pydantic import BaseModel
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.api.deps.scm_auth import require_permission
from app.core.database import get_db
from app.core.pagination import paginate_query
from app.models.shipment import Shipment, ShipmentEvent, ShipmentItem
from app.schemas.scm.common import PaginationOut
from app.schemas.scm.mappers import shipment_to_detail, shipment_to_summary
from app.security.context import AuthContext
from app.security.scope import apply_shipment_scope, assert_shipment_scope
from app.security.shipment_actions import assert_shipment_action_allowed
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


def _get_shipment(db: Session, ctx: AuthContext, shipment_id: str) -> Shipment:
    try:
        uid = UUID(shipment_id)
        stmt = select(Shipment).where(Shipment.id == uid)
    except ValueError:
        stmt = select(Shipment).where(Shipment.external_ref == shipment_id)

    shipment = db.scalars(stmt).first()
    return assert_shipment_scope(shipment, ctx)


def _detail(db: Session, ctx: AuthContext, shipment: Shipment) -> dict:
    return shipment_to_detail(db, shipment, permissions=ctx.permissions).model_dump(by_alias=True)


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
    stmt = apply_shipment_scope(select(Shipment), ctx)
    if status:
        stmt = stmt.where(Shipment.status == status)
    if risk:
        stmt = stmt.where(Shipment.risk_status == risk)
    # Portal users cannot widen scope via query params
    if ctx.linked_supplier_id is None and supplier_id:
        stmt = stmt.where(Shipment.supplier_id == supplier_id)
    if ctx.linked_carrier_id is None and carrier_id:
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
    # Portal partners create only under their own partner id
    supplier_id = body.supplier_id
    carrier_id = body.carrier_id
    if ctx.linked_supplier_id is not None:
        supplier_id = ctx.linked_supplier_id
    if ctx.linked_carrier_id is not None:
        carrier_id = ctx.linked_carrier_id

    count = db.scalar(select(Shipment).where(Shipment.organization_id == ctx.organization_id).count()) or 0
    # Customer tenant owns the shipment row; portal creates against linked customer via supplier record
    owner_org_id = ctx.organization_id
    if ctx.linked_supplier_id is not None:
        from app.models.master_data import Supplier

        supplier = db.get(Supplier, ctx.linked_supplier_id)
        if supplier:
            owner_org_id = supplier.organization_id

    ref = f"SH-{100 + count:04d}"
    shipment = Shipment(
        organization_id=owner_org_id,
        external_ref=ref,
        supplier_id=supplier_id,
        carrier_id=carrier_id,
        origin_id=body.origin_id,
        destination_id=body.destination_id,
        status="PLANNED" if carrier_id else "DRAFT",
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
    return _detail(db, ctx, shipment)


@router.get("/{shipment_id}")
def get_shipment(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.read")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    return _detail(db, ctx, shipment)


def _run_action(
    db: Session,
    ctx: AuthContext,
    shipment_id: str,
    action: str,
    *,
    mutate=None,
    audit_extra: dict | None = None,
) -> dict:
    shipment = _get_shipment(db, ctx, shipment_id)
    assert_shipment_action_allowed(ctx, shipment, action)
    if mutate:
        mutate(shipment)
    svc = ShipmentService(db, shipment.organization_id)
    if action == "report_delay":
        # report_delay has no state transition in ACTION_TO_STATUS for delay-only
        svc._add_event(shipment, "DELAY_REPORTED", "Delay reported", (audit_extra or {}).get("reason"))
        db.commit()
        db.refresh(shipment)
        return _detail(db, ctx, shipment)
    result = svc.apply_action(shipment, action, user_id=ctx.user_id, audit_extra=audit_extra)
    return _detail(db, ctx, result)


@router.post("/{shipment_id}/assign-carrier")
def assign_carrier(
    shipment_id: str,
    body: AssignCarrierIn,
    ctx: AuthContext = Depends(require_permission("shipment.assign_carrier")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    assert_shipment_action_allowed(ctx, shipment, "assign_carrier")
    before_carrier = str(shipment.carrier_id) if shipment.carrier_id else None
    shipment.carrier_id = body.carrier_id
    svc = ShipmentService(db, shipment.organization_id)
    result = svc.apply_action(
        shipment,
        "assign_carrier",
        user_id=ctx.user_id,
        audit_extra={
            "before": {"carrier_id": before_carrier},
            "after": {"carrier_id": str(body.carrier_id)},
        },
    )
    return _detail(db, ctx, result)


@router.post("/{shipment_id}/accept")
def accept_shipment(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.accept")),
    db: Session = Depends(get_db),
):
    return _run_action(db, ctx, shipment_id, "accept")


@router.post("/{shipment_id}/reject")
def reject_shipment(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.reject")),
    db: Session = Depends(get_db),
):
    def clear_carrier(shipment: Shipment) -> None:
        shipment.carrier_id = None

    return _run_action(db, ctx, shipment_id, "reject", mutate=clear_carrier)


@router.post("/{shipment_id}/confirm-ready")
def confirm_ready(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.confirm_ready")),
    db: Session = Depends(get_db),
):
    return _run_action(db, ctx, shipment_id, "confirm_ready")


@router.post("/{shipment_id}/confirm-pickup")
def confirm_pickup(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.confirm_pickup")),
    db: Session = Depends(get_db),
):
    return _run_action(db, ctx, shipment_id, "confirm_pickup")


@router.post("/{shipment_id}/confirm-arrival")
def confirm_arrival(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.confirm_arrival")),
    db: Session = Depends(get_db),
):
    return _run_action(db, ctx, shipment_id, "confirm_arrival")


@router.post("/{shipment_id}/complete")
def complete_shipment(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.confirm_delivery")),
    db: Session = Depends(get_db),
):
    return _run_action(db, ctx, shipment_id, "complete")


@router.post("/{shipment_id}/cancel")
def cancel_shipment(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.cancel")),
    db: Session = Depends(get_db),
):
    return _run_action(db, ctx, shipment_id, "cancel")


@router.post("/{shipment_id}/report-delay")
def report_delay(
    shipment_id: str,
    body: ReportDelayIn,
    ctx: AuthContext = Depends(require_permission("shipment.report_delay")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    assert_shipment_action_allowed(ctx, shipment, "report_delay")
    shipment.deviation_minutes += body.delay_minutes
    svc = ShipmentService(db, shipment.organization_id)
    svc._add_event(shipment, "DELAY_REPORTED", "Delay reported", body.reason)
    db.commit()
    db.refresh(shipment)
    return _detail(db, ctx, shipment)


@router.post("/{shipment_id}/tracking", status_code=status.HTTP_201_CREATED)
def add_tracking(
    shipment_id: str,
    body: TrackingIn,
    ctx: AuthContext = Depends(require_permission("shipment.update_tracking")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
    assert_shipment_action_allowed(ctx, shipment, "update_tracking")
    svc = ShipmentService(db, shipment.organization_id)
    svc.add_tracking(
        shipment,
        latitude=body.latitude,
        longitude=body.longitude,
        speed=body.speed,
        recorded_at=body.recorded_at,
        idempotency_key=body.idempotency_key,
    )
    db.refresh(shipment)
    return _detail(db, ctx, shipment)


@router.get("/{shipment_id}/events")
def get_events(
    shipment_id: str,
    ctx: AuthContext = Depends(require_permission("shipment.read")),
    db: Session = Depends(get_db),
):
    shipment = _get_shipment(db, ctx, shipment_id)
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
