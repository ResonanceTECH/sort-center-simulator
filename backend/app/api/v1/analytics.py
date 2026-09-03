from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps.scm_auth import require_permission
from app.services.audit_service import audit_event_to_activity, list_audit_events
from app.core.database import get_db
from app.models.exception_models import ScmException
from app.models.shipment import Shipment
from app.security.context import AuthContext

router = APIRouter(tags=["analytics"])


@router.get("/control-tower")
def control_tower(
    ctx: AuthContext = Depends(require_permission("analytics.read")),
    db: Session = Depends(get_db),
):
    org_id = ctx.organization_id
    active = db.scalar(
        select(func.count()).select_from(Shipment).where(
            Shipment.organization_id == org_id,
            Shipment.status.in_(["IN_TRANSIT", "ASSIGNED", "ACCEPTED", "READY_FOR_PICKUP", "ARRIVED"]),
        )
    ) or 0
    at_risk = db.scalar(
        select(func.count()).select_from(Shipment).where(
            Shipment.organization_id == org_id,
            Shipment.risk_status.in_(["HIGH", "CRITICAL"]),
        )
    ) or 0
    delayed = db.scalar(
        select(func.count()).select_from(Shipment).where(
            Shipment.organization_id == org_id,
            Shipment.deviation_minutes > 60,
        )
    ) or 0
    avg_delay = db.scalar(
        select(func.avg(Shipment.deviation_minutes)).where(Shipment.organization_id == org_id)
    ) or 0

    exceptions = db.scalars(
        select(ScmException)
        .where(ScmException.organization_id == org_id, ScmException.status == "OPEN")
        .order_by(ScmException.created_at.desc())
        .limit(10)
    ).all()

    requires_attention = []
    for e in exceptions:
        ship = db.get(Shipment, e.shipment_id) if e.shipment_id else None
        requires_attention.append({
            "id": str(e.id),
            "shipmentId": ship.external_ref if ship else None,
            "type": e.type,
            "severity": e.severity,
            "severityStatus": e.severity,
            "deviation": e.reason[:40],
            "probability": e.probability,
            "owner": "—",
            "createdAt": e.created_at.isoformat(),
        })

    audit_events = list_audit_events(db, org_id, limit=10)
    recent_activity = [audit_event_to_activity(ev, db) for ev in audit_events]

    return {
        "kpis": [
            {"label": "OTIF", "value": "91.4", "unit": "%", "status": "WARNING", "delta": -2.1},
            {"label": "Active Shipments", "value": active, "status": "NORMAL"},
            {"label": "At Risk", "value": at_risk, "status": "HIGH"},
            {"label": "Delayed", "value": delayed, "status": "CRITICAL" if delayed > 5 else "WARNING"},
            {"label": "Stockout Risk", "value": "8.2", "unit": "%", "status": "WARNING"},
            {"label": "Average Delay", "value": round(float(avg_delay), 0), "unit": " мин", "status": "WARNING"},
        ],
        "requiresAttention": requires_attention,
        "insights": [
            {"id": "ins-1", "title": "Carrier B OTIF снизился", "description": "Основной вклад — маршрут Москва → СПб"},
        ],
        "recentActivity": recent_activity,
        "alertCounts": {"exceptions": len(exceptions), "incidents": 0},
        "otif": 0.914,
        "activeShipments": active,
        "atRisk": at_risk,
        "delayed": delayed,
        "stockoutRisk": 0.082,
        "averageDelayMinutes": float(avg_delay),
    }


@router.get("/analytics/service-level")
def analytics_service_level(ctx: AuthContext = Depends(require_permission("analytics.read")), db: Session = Depends(get_db)):
    return {"service_level": 0.93, "target": 0.95, "status": "TARGET_NOT_REACHED"}


@router.get("/analytics/suppliers")
def analytics_suppliers(ctx: AuthContext = Depends(require_permission("analytics.read")), db: Session = Depends(get_db)):
    from app.models.master_data import Supplier
    suppliers = db.scalars(select(Supplier).where(Supplier.organization_id == ctx.organization_id)).all()
    return [{"id": str(s.id), "name": s.name, "otif": s.otif} for s in suppliers]


@router.get("/analytics/carriers")
def analytics_carriers(ctx: AuthContext = Depends(require_permission("analytics.read")), db: Session = Depends(get_db)):
    from app.models.master_data import Carrier
    carriers = db.scalars(select(Carrier).where(Carrier.organization_id == ctx.organization_id)).all()
    return [{"id": str(c.id), "name": c.name, "otif": c.otif} for c in carriers]


@router.get("/analytics/insights")
def analytics_insights(ctx: AuthContext = Depends(require_permission("analytics.read")), db: Session = Depends(get_db)):
    return {
        "items": [
            {
                "type": "PERFORMANCE_DEGRADATION",
                "title": "Снижение OTIF Carrier B",
                "description": "OTIF снизился с 91% до 82%",
                "severity": "HIGH",
                "entity_type": "CARRIER",
            }
        ]
    }
