from __future__ import annotations

import json
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.scm_auth import require_permission
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.models.rbac import Role
from app.models.user import User
from app.schemas.users import AssignRoleIn, AuditEventOut, CreateUserIn, UpdateUserIn, UserOut, UserRoleOut
from app.security.context import AuthContext
from app.services.audit_service import list_audit_events
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])


def _parse_json(raw: Optional[str]) -> Optional[dict]:
    if not raw:
        return None
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else {"value": parsed}
    except json.JSONDecodeError:
        return {"raw": raw}


def _audit_to_out(event, db: Session) -> AuditEventOut:
    user_name = None
    if event.user_id:
        user = db.get(User, event.user_id)
        user_name = user.name if user else None
    return AuditEventOut(
        id=str(event.id),
        organization_id=str(event.organization_id),
        user_id=str(event.user_id) if event.user_id else None,
        user_name=user_name,
        entity_type=event.entity_type,
        entity_id=str(event.entity_id),
        action=event.action,
        before=_parse_json(event.before_json),
        after=_parse_json(event.after_json),
        created_at=event.created_at.isoformat(),
    )


@router.get("", response_model=list[UserOut])
def list_users(
    ctx: AuthContext = Depends(require_permission("users.read")),
    db: Session = Depends(get_db),
):
    svc = UserService(db, ctx.organization_id, ctx.user_id)
    return [UserOut(**svc.user_to_dict(u)) for u in svc.list_users()]


@router.get("/roles", response_model=list[UserRoleOut])
def list_roles(
    ctx: AuthContext = Depends(require_permission("roles.read")),
    db: Session = Depends(get_db),
):
    roles = db.scalars(select(Role).order_by(Role.name)).all()
    return [
        UserRoleOut(
            id=str(r.id),
            code=r.code,
            name=r.name,
            description=r.description,
            is_system=r.is_system,
            organization_id=str(r.organization_id) if r.organization_id else None,
        )
        for r in roles
    ]


@router.get("/audit-events", response_model=list[AuditEventOut])
def list_audit(
    entity_type: Optional[str] = None,
    entity_id: Optional[UUID] = None,
    user_id: Optional[UUID] = None,
    limit: int = Query(50, ge=1, le=200),
    ctx: AuthContext = Depends(require_permission("audit.read")),
    db: Session = Depends(get_db),
):
    events = list_audit_events(
        db,
        ctx.organization_id,
        entity_type=entity_type,
        entity_id=entity_id,
        user_id=user_id,
        limit=limit,
    )
    return [_audit_to_out(e, db) for e in events]


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: UUID,
    ctx: AuthContext = Depends(require_permission("users.read")),
    db: Session = Depends(get_db),
):
    svc = UserService(db, ctx.organization_id, ctx.user_id)
    user = svc.get_user(user_id)
    return UserOut(**svc.user_to_dict(user))


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    body: CreateUserIn,
    ctx: AuthContext = Depends(require_permission("users.create")),
    db: Session = Depends(get_db),
):
    svc = UserService(db, ctx.organization_id, ctx.user_id)
    user = svc.create_user(
        name=body.name,
        email=str(body.email),
        password=body.password,
        team=body.team,
        roles=body.roles,
    )
    return UserOut(**svc.user_to_dict(user))


@router.patch("/{user_id}", response_model=UserOut)
def update_user(
    user_id: UUID,
    body: UpdateUserIn,
    ctx: AuthContext = Depends(require_permission("users.update")),
    db: Session = Depends(get_db),
):
    svc = UserService(db, ctx.organization_id, ctx.user_id)
    user = svc.update_user(
        user_id,
        name=body.name,
        email=str(body.email) if body.email else None,
        team=body.team,
        password=body.password,
    )
    return UserOut(**svc.user_to_dict(user))


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: UUID,
    ctx: AuthContext = Depends(require_permission("users.delete")),
    db: Session = Depends(get_db),
):
    svc = UserService(db, ctx.organization_id, ctx.user_id)
    svc.delete_user(user_id)


@router.post("/{user_id}/roles", response_model=UserOut)
def assign_role(
    user_id: UUID,
    body: AssignRoleIn,
    ctx: AuthContext = Depends(require_permission("users.manage_roles")),
    db: Session = Depends(get_db),
):
    svc = UserService(db, ctx.organization_id, ctx.user_id)
    user = svc.assign_role(user_id, body.role_id)
    return UserOut(**svc.user_to_dict(user))


@router.delete("/{user_id}/roles/{role_id}", response_model=UserOut)
def remove_role(
    user_id: UUID,
    role_id: UUID,
    ctx: AuthContext = Depends(require_permission("users.manage_roles")),
    db: Session = Depends(get_db),
):
    svc = UserService(db, ctx.organization_id, ctx.user_id)
    user = svc.remove_role(user_id, role_id)
    return UserOut(**svc.user_to_dict(user))
