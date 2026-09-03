from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.scm_auth import require_permission
from app.core.database import get_db
from app.models.platform import Notification
from app.security.context import AuthContext

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def list_notifications(
    ctx: AuthContext = Depends(require_permission("analytics.read")),
    db: Session = Depends(get_db),
):
    items = db.scalars(
        select(Notification)
        .where(Notification.organization_id == ctx.organization_id, Notification.user_id == ctx.user_id)
        .order_by(Notification.created_at.desc())
    ).all()
    return [
        {
            "id": str(n.id),
            "type": n.type,
            "title": n.title,
            "message": n.message,
            "isRead": n.is_read,
            "createdAt": n.created_at.isoformat(),
        }
        for n in items
    ]


@router.patch("/{notification_id}/read")
def mark_read(
    notification_id: UUID,
    ctx: AuthContext = Depends(require_permission("analytics.read")),
    db: Session = Depends(get_db),
):
    n = db.scalars(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == ctx.user_id,
        )
    ).first()
    if n:
        n.is_read = True
        db.commit()
    return {"id": str(notification_id), "isRead": True}
