from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.scm_auth import require_permission
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.models.exception_models import ScmException
from app.models.master_data import Supplier
from app.models.shipment import Shipment
from app.schemas.scm.common import MetricOut
from app.security.context import AuthContext

router = APIRouter(prefix="/suppliers", tags=["suppliers"])


class SupplierOut(BaseModel):
    id: str
    name: str
    status: str
    status_semantic: str = "SUCCESS"
    otif: MetricOut
    reliability: MetricOut
    lead_time_days: MetricOut
    supply_share: MetricOut
    risk: MetricOut
    open_incidents: int = 0
    region: Optional[str] = None
    product_group: Optional[str] = None


def _supplier_out(s: Supplier) -> dict:
    return SupplierOut(
        id=str(s.id),
        name=s.name,
        status=s.status,
        statusSemantic="SUCCESS" if s.status == "ACTIVE" else "WARNING",
        otif=MetricOut(label="OTIF", value=round((s.otif or 0) * 100, 1), unit="%", status="SUCCESS"),
        reliability=MetricOut(label="Reliability", value=round((1 - (s.incident_rate or 0)) * 100, 1), unit="%"),
        leadTimeDays=MetricOut(label="Lead Time", value=round((s.average_lead_time_hours or 0) / 24, 1), unit=" д"),
        supplyShare=MetricOut(label="Supply Share", value=round((s.supply_share or 0) * 100, 1), unit="%"),
        risk=MetricOut(label="Risk", value=s.risk_status or "LOW", status=s.risk_status or "NORMAL"),
        openIncidents=0,
        region=s.region,
        productGroup=s.product_group,
    ).model_dump(by_alias=True)


@router.get("")
def list_suppliers(
    search: Optional[str] = None,
    status: Optional[str] = None,
    risk: Optional[str] = None,
    region: Optional[str] = None,
    product_group: Optional[str] = None,
    ctx: AuthContext = Depends(require_permission("supplier.read")),
    db: Session = Depends(get_db),
):
    stmt = select(Supplier).where(Supplier.organization_id == ctx.organization_id)
    if search:
        stmt = stmt.where(Supplier.name.ilike(f"%{search}%"))
    if status:
        stmt = stmt.where(Supplier.status == status)
    if risk:
        stmt = stmt.where(Supplier.risk_status == risk)
    if region:
        stmt = stmt.where(Supplier.region == region)
    if product_group:
        stmt = stmt.where(Supplier.product_group == product_group)
    items = db.scalars(stmt).all()
    return [_supplier_out(s) for s in items]


@router.get("/{supplier_id}")
def get_supplier(
    supplier_id: UUID,
    ctx: AuthContext = Depends(require_permission("supplier.read")),
    db: Session = Depends(get_db),
):
    s = db.scalars(
        select(Supplier).where(Supplier.id == supplier_id, Supplier.organization_id == ctx.organization_id)
    ).first()
    if s is None:
        raise NotFoundError("SUPPLIER_NOT_FOUND", "Supplier not found")
    detail = _supplier_out(s)
    detail["performance"] = {
        "otif": s.otif,
        "average_lead_time_hours": s.average_lead_time_hours,
        "incident_rate": s.incident_rate,
        "supply_share": s.supply_share,
        "risk_score": s.risk_score,
        "risk_status": s.risk_status,
    }
    return detail


@router.get("/{supplier_id}/performance")
def supplier_performance(
    supplier_id: UUID,
    ctx: AuthContext = Depends(require_permission("supplier.read")),
    db: Session = Depends(get_db),
):
    s = db.scalars(
        select(Supplier).where(Supplier.id == supplier_id, Supplier.organization_id == ctx.organization_id)
    ).first()
    if s is None:
        raise NotFoundError("SUPPLIER_NOT_FOUND", "Supplier not found")
    return {
        "otif": s.otif,
        "average_lead_time_hours": s.average_lead_time_hours,
        "incident_rate": s.incident_rate,
        "supply_share": s.supply_share,
        "risk_score": s.risk_score,
        "risk_status": s.risk_status,
    }
