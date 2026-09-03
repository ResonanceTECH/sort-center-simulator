from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.scm_auth import require_permission
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.models.master_data import Carrier
from app.schemas.scm.common import MetricOut
from app.security.context import AuthContext

router = APIRouter(prefix="/carriers", tags=["carriers"])


def _carrier_out(c: Carrier) -> dict:
    return {
        "id": str(c.id),
        "name": c.name,
        "status": c.status,
        "otif": MetricOut(label="OTIF", value=round((c.otif or 0) * 100, 1), unit="%"),
        "etaAccuracy": MetricOut(label="ETA Accuracy", value=round((c.eta_accuracy or 0) * 100, 1), unit="%"),
        "averageDelay": MetricOut(label="Avg Delay", value=c.average_delay_minutes or 0, unit=" мин"),
        "transitTime": MetricOut(label="Transit", value=c.transit_time_hours or 0, unit=" ч"),
        "incidentRate": c.incident_rate,
        "shipmentCount": c.shipment_count or 0,
        "risk": MetricOut(label="Risk", value=c.risk_status or "LOW", status=c.risk_status or "NORMAL"),
    }


@router.get("")
def list_carriers(
    search: Optional[str] = None,
    ctx: AuthContext = Depends(require_permission("carrier.read")),
    db: Session = Depends(get_db),
):
    stmt = select(Carrier).where(Carrier.organization_id == ctx.organization_id)
    if search:
        stmt = stmt.where(Carrier.name.ilike(f"%{search}%"))
    return [_carrier_out(c) for c in db.scalars(stmt).all()]


@router.get("/{carrier_id}")
def get_carrier(
    carrier_id: UUID,
    ctx: AuthContext = Depends(require_permission("carrier.read")),
    db: Session = Depends(get_db),
):
    c = db.scalars(
        select(Carrier).where(Carrier.id == carrier_id, Carrier.organization_id == ctx.organization_id)
    ).first()
    if c is None:
        raise NotFoundError("CARRIER_NOT_FOUND", "Carrier not found")
    return _carrier_out(c)


@router.get("/{carrier_id}/performance")
def carrier_performance(
    carrier_id: UUID,
    ctx: AuthContext = Depends(require_permission("carrier.read")),
    db: Session = Depends(get_db),
):
    c = db.scalars(
        select(Carrier).where(Carrier.id == carrier_id, Carrier.organization_id == ctx.organization_id)
    ).first()
    if c is None:
        raise NotFoundError("CARRIER_NOT_FOUND", "Carrier not found")
    return {
        "otif": c.otif,
        "eta_accuracy": c.eta_accuracy,
        "average_delay_minutes": c.average_delay_minutes,
        "transit_time_hours": c.transit_time_hours,
        "incident_rate": c.incident_rate,
        "shipment_count": c.shipment_count,
    }
