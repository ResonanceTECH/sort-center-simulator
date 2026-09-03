from __future__ import annotations

import json
from typing import Any, Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.platform import AuditEvent
from app.models.user import User


def _serialize(value: Any) -> Optional[str]:
    if value is None:
        return None
    if isinstance(value, str):
        return value
    return json.dumps(value, ensure_ascii=False, default=str)


def log_audit(
    db: Session,
    *,
    organization_id: UUID,
    user_id: Optional[UUID],
    entity_type: str,
    entity_id: UUID,
    action: str,
    before: Any = None,
    after: Any = None,
) -> AuditEvent:
    event = AuditEvent(
        organization_id=organization_id,
        user_id=user_id,
        entity_type=entity_type,
        entity_id=entity_id,
        action=action,
        before_json=_serialize(before),
        after_json=_serialize(after),
    )
    db.add(event)
    return event


def list_audit_events(
    db: Session,
    organization_id: UUID,
    *,
    entity_type: Optional[str] = None,
    entity_id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    limit: int = 50,
) -> list[AuditEvent]:
    stmt = (
        select(AuditEvent)
        .where(AuditEvent.organization_id == organization_id)
        .order_by(AuditEvent.created_at.desc())
        .limit(min(limit, 200))
    )
    if entity_type:
        stmt = stmt.where(AuditEvent.entity_type == entity_type)
    if entity_id:
        stmt = stmt.where(AuditEvent.entity_id == entity_id)
    if user_id:
        stmt = stmt.where(AuditEvent.user_id == user_id)
    return list(db.scalars(stmt).all())


def audit_event_to_activity(event: AuditEvent, db: Session) -> dict:
    actor = "Система"
    if event.user_id:
        user = db.get(User, event.user_id)
        if user:
            actor = user.name

    detail = event.action
    if event.before_json and event.after_json:
        detail = f"{event.action}: {event.before_json} → {event.after_json}"
    elif event.after_json:
        detail = f"{event.action}: {event.after_json}"

    return {
        "id": str(event.id),
        "timestamp": event.created_at.strftime("%H:%M"),
        "actor": actor,
        "action": event.action,
        "detail": detail[:200],
        "entityType": event.entity_type.lower(),
        "entityId": str(event.entity_id),
    }
