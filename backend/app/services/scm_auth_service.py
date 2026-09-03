from __future__ import annotations

import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.enums import AppRole, WorkspaceType
from app.core.security import create_access_token, hash_password, verify_password
from app.models.organization import Organization
from app.models.rbac import Permission, RefreshSession, Role, RolePermission, UserOrganization, UserRole
from app.models.user import User
from app.schemas.auth import MeResponse, MeUserOut, OrganizationOut


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    normalized = email.strip().lower()
    return db.scalars(select(User).where(User.email == normalized)).first()


def register_user(
    db: Session,
    *,
    name: str,
    email: str,
    password: str,
    team: Optional[str] = None,
    organization_name: str = "Default Organization",
) -> User:
    if get_user_by_email(db, email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email уже зарегистрирован")

    org = Organization(name=organization_name, type="CUSTOMER")
    db.add(org)
    db.flush()

    user = User(
        name=name.strip(),
        email=email.strip().lower(),
        password_hash=hash_password(password),
        team=team.strip() if team else None,
    )
    db.add(user)
    db.flush()

    db.add(UserOrganization(user_id=user.id, organization_id=org.id, is_primary=True))

    admin_role = db.scalars(select(Role).where(Role.code == AppRole.ADMIN.value)).first()
    if admin_role:
        db.add(UserRole(user_id=user.id, role_id=admin_role.id, organization_id=org.id))

    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User:
    user = get_user_by_email(db, email)
    if user is None or not verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
        )
    return user


def _hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def issue_auth_tokens(db: Session, user: User, *, device: str | None = None, ip: str | None = None) -> tuple[str, str]:
    access = create_access_token(user.id)
    refresh = secrets.token_urlsafe(48)
    session = RefreshSession(
        user_id=user.id,
        token_hash=_hash_refresh_token(refresh),
        expires_at=datetime.now(timezone.utc) + timedelta(days=30),
        device=device,
        ip=ip,
    )
    db.add(session)
    db.commit()
    return access, refresh


def refresh_access_token(db: Session, refresh_token: str) -> tuple[str, str]:
    token_hash = _hash_refresh_token(refresh_token)
    session = db.scalars(select(RefreshSession).where(RefreshSession.token_hash == token_hash)).first()
    if session is None or session.revoked_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    if session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    user = db.get(User, session.user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    session.revoked_at = datetime.now(timezone.utc)
    return issue_auth_tokens(db, user)


def revoke_refresh_token(db: Session, refresh_token: str) -> None:
    token_hash = _hash_refresh_token(refresh_token)
    session = db.scalars(select(RefreshSession).where(RefreshSession.token_hash == token_hash)).first()
    if session:
        session.revoked_at = datetime.now(timezone.utc)
        db.commit()


def get_user_roles(db: Session, user_id: UUID, organization_id: UUID) -> list[str]:
    """Return role codes for user in org (system + custom)."""
    rows = db.scalars(
        select(Role)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id, UserRole.organization_id == organization_id)
        .order_by(Role.code)
    ).all()
    return [r.code for r in rows]


def get_user_permissions(db: Session, user_id: UUID, organization_id: UUID) -> set[str]:
    """Load effective permissions from DB role_permissions (not hardcoded matrices)."""
    rows = db.scalars(
        select(Permission.code)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .join(Role, Role.id == RolePermission.role_id)
        .join(UserRole, UserRole.role_id == Role.id)
        .where(UserRole.user_id == user_id, UserRole.organization_id == organization_id)
    ).all()
    return set(rows)


def resolve_workspaces(role_codes: list[str]) -> list[str]:
    """Map assigned roles → product workspaces (4 shells)."""
    workspaces: set[str] = set()
    for code in role_codes:
        if code == AppRole.ADMIN.value:
            workspaces.add(WorkspaceType.ADMIN.value)
        elif code == AppRole.SUPPLIER.value:
            workspaces.add(WorkspaceType.SUPPLIER.value)
        elif code == AppRole.CARRIER.value:
            workspaces.add(WorkspaceType.CARRIER.value)
        elif code in {
            AppRole.SUPPLY_CHAIN_MANAGER.value,
            AppRole.SUPPLY_PLANNER.value,
            AppRole.LOGISTICS_MANAGER.value,
            AppRole.ANALYST.value,
        }:
            workspaces.add(WorkspaceType.INTERNAL.value)
        else:
            # Custom org roles default to INTERNAL unless named otherwise later
            workspaces.add(WorkspaceType.INTERNAL.value)
    order = [
        WorkspaceType.ADMIN.value,
        WorkspaceType.INTERNAL.value,
        WorkspaceType.SUPPLIER.value,
        WorkspaceType.CARRIER.value,
    ]
    return [w for w in order if w in workspaces]


def get_primary_organization_id(db: Session, user_id: UUID) -> UUID | None:
    link = db.scalars(
        select(UserOrganization)
        .where(UserOrganization.user_id == user_id, UserOrganization.is_primary.is_(True))
    ).first()
    if link:
        return link.organization_id
    link = db.scalars(select(UserOrganization).where(UserOrganization.user_id == user_id)).first()
    return link.organization_id if link else None


def get_primary_organization(db: Session, user_id: UUID) -> Organization | None:
    org_id = get_primary_organization_id(db, user_id)
    if org_id is None:
        return None
    return db.get(Organization, org_id)


def user_to_dict(db: Session, user: User) -> dict:
    org = get_primary_organization(db, user.id)
    roles: list[str] = []
    if org:
        roles = get_user_roles(db, user.id, org.id)
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "team": user.team,
        "organization_id": str(org.id) if org else None,
        "roles": roles,
        "role": roles[0] if roles else None,
    }


def build_me_response(db: Session, user: User) -> MeResponse:
    org = get_primary_organization(db, user.id)
    roles: list[str] = []
    permissions: list[str] = []
    workspaces: list[str] = []
    org_out: OrganizationOut | None = None

    if org:
        roles = get_user_roles(db, user.id, org.id)
        permissions = sorted(get_user_permissions(db, user.id, org.id))
        workspaces = resolve_workspaces(roles)
        org_out = OrganizationOut(id=str(org.id), name=org.name, type=org.type)

    return MeResponse(
        user=MeUserOut(id=str(user.id), name=user.name, email=user.email, team=user.team),
        organization=org_out,
        organization_type=org.type if org else None,
        roles=roles,
        permissions=permissions,
        available_workspaces=workspaces,
        id=str(user.id),
        name=user.name,
        email=user.email,
        team=user.team,
        organization_id=str(org.id) if org else None,
        role=roles[0] if roles else None,
    )


def issue_auth_token(user: User) -> str:
    return create_access_token(user.id)


def check_permission(db: Session, user_id: UUID, org_id: UUID, permission: str) -> bool:
    return permission in get_user_permissions(db, user_id, org_id)
