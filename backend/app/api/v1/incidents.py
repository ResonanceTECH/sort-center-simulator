from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.scm_auth import require_permission
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.services.audit_service import log_audit
from app.models.exception_models import Incident, IncidentComment
from app.models.user import User
from app.security.context import AuthContext

router = APIRouter(prefix="/incidents", tags=["incidents"])


class CreateIncidentIn(BaseModel):
    title: str
    description: Optional[str] = None
    exception_id: Optional[UUID] = None
    shipment_id: Optional[UUID] = None


class CommentIn(BaseModel):
    message: str


def _serialize_comment(db: Session, comment: IncidentComment, ctx: AuthContext | None = None) -> dict:
    user = db.get(User, comment.author_id)
    role = ctx.roles[0] if ctx and ctx.roles else "—"
    return {
        "id": str(comment.id),
        "message": comment.message,
        "createdAt": comment.created_at.isoformat(),
        "author": user.name if user else "User",
        "role": role,
    }


@router.get("")
def list_incidents(
    status: Optional[str] = None,
    ctx: AuthContext = Depends(require_permission("incident.read")),
    db: Session = Depends(get_db),
):
    stmt = select(Incident).where(Incident.organization_id == ctx.organization_id)
    if status:
        stmt = stmt.where(Incident.status == status)
    items = db.scalars(stmt.order_by(Incident.created_at.desc())).all()
    return [
        {
            "id": str(i.id),
            "title": i.title,
            "status": i.status,
            "createdAt": i.created_at.isoformat(),
            "assigneeId": str(i.assignee_id) if i.assignee_id else None,
        }
        for i in items
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_incident(
    body: CreateIncidentIn,
    ctx: AuthContext = Depends(require_permission("incident.create")),
    db: Session = Depends(get_db),
):
    incident = Incident(
        organization_id=ctx.organization_id,
        title=body.title,
        description=body.description,
        exception_id=body.exception_id,
        shipment_id=body.shipment_id,
    )
    db.add(incident)
    db.flush()
    log_audit(
        db,
        organization_id=ctx.organization_id,
        user_id=ctx.user_id,
        entity_type="INCIDENT",
        entity_id=incident.id,
        action="INCIDENT_CREATED",
        after={"title": incident.title, "status": incident.status},
    )
    db.commit()
    db.refresh(incident)
    return {"id": str(incident.id), "status": incident.status}


@router.get("/{incident_id}")
def get_incident(
    incident_id: UUID,
    ctx: AuthContext = Depends(require_permission("incident.read")),
    db: Session = Depends(get_db),
):
    i = db.scalars(
        select(Incident).where(Incident.id == incident_id, Incident.organization_id == ctx.organization_id)
    ).first()
    if i is None:
        raise NotFoundError("INCIDENT_NOT_FOUND", "Incident not found")
    comments = db.scalars(select(IncidentComment).where(IncidentComment.incident_id == i.id)).all()
    return {
        "id": str(i.id),
        "title": i.title,
        "description": i.description,
        "status": i.status,
        "comments": [_serialize_comment(db, c) for c in comments],
        "availableActions": ["ASSIGN", "RESOLVE", "CLOSE"],
    }


@router.post("/{incident_id}/resolve")
def resolve_incident(
    incident_id: UUID,
    ctx: AuthContext = Depends(require_permission("incident.resolve")),
    db: Session = Depends(get_db),
):
    i = db.scalars(
        select(Incident).where(Incident.id == incident_id, Incident.organization_id == ctx.organization_id)
    ).first()
    if i is None:
        raise NotFoundError("INCIDENT_NOT_FOUND", "Incident not found")
    before = {"status": i.status}
    i.status = "RESOLVED"
    log_audit(
        db,
        organization_id=ctx.organization_id,
        user_id=ctx.user_id,
        entity_type="INCIDENT",
        entity_id=i.id,
        action="INCIDENT_RESOLVED",
        before=before,
        after={"status": i.status},
    )
    db.commit()
    return {"id": str(i.id), "status": i.status}


@router.post("/{incident_id}/comments", status_code=status.HTTP_201_CREATED)
def add_comment(
    incident_id: UUID,
    body: CommentIn,
    ctx: AuthContext = Depends(require_permission("incident.read")),
    db: Session = Depends(get_db),
):
    i = db.scalars(
        select(Incident).where(Incident.id == incident_id, Incident.organization_id == ctx.organization_id)
    ).first()
    if i is None:
        raise NotFoundError("INCIDENT_NOT_FOUND", "Incident not found")
    comment = IncidentComment(incident_id=i.id, author_id=ctx.user_id, message=body.message)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return _serialize_comment(db, comment, ctx)
