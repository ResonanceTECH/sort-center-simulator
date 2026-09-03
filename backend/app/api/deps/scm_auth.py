from __future__ import annotations

from typing import Callable, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import ForbiddenError
from app.core.security import decode_access_token
from app.models.user import User
from app.security.context import AuthContext
from app.services.scm_auth_service import get_primary_organization_id, get_user_roles
from app.security.permissions import ROLE_PERMISSIONS

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Требуется авторизация")
    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Недействительный токен")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Пользователь не найден")
    return user


def get_auth_context(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AuthContext:
    org_id = get_primary_organization_id(db, user.id)
    if org_id is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No organization assigned")
    roles = get_user_roles(db, user.id, org_id)
    permissions: set[str] = set()
    for role in roles:
        permissions.update(ROLE_PERMISSIONS.get(role, set()))
    return AuthContext(
        user_id=user.id,
        organization_id=org_id,
        roles=roles,
        permissions=permissions,
    )


def require_permission(permission: str) -> Callable:
    def checker(ctx: AuthContext = Depends(get_auth_context)) -> AuthContext:
        if permission not in ctx.permissions:
            raise ForbiddenError("FORBIDDEN", "Insufficient permissions", details={"required": permission})
        return ctx

    return checker


def require_any_permission(*permissions: str) -> Callable:
    required = tuple(permissions)

    def checker(ctx: AuthContext = Depends(get_auth_context)) -> AuthContext:
        if not any(p in ctx.permissions for p in required):
            raise ForbiddenError(
                "FORBIDDEN",
                "Insufficient permissions",
                details={"required_any": list(required)},
            )
        return ctx

    return checker


def require_org_access(entity_org_id: UUID, ctx: AuthContext) -> None:
    if entity_org_id != ctx.organization_id:
        raise ForbiddenError("TENANT_ISOLATION", "Access denied to resource in another organization")
