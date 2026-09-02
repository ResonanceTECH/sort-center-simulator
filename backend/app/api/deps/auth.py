from __future__ import annotations

from typing import Callable, Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.permissions import Action, Resource, can, get_capabilities
from app.core.security import decode_access_token
from app.models.project_member import ProjectMember
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Требуется авторизация",
        )

    user_id = decode_access_token(credentials.credentials)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен",
        )

    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )
    return user


def get_project_membership(
    project_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectMember:
    membership = db.scalars(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
    ).first()
    if membership is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нет доступа к проекту")
    return membership


def require_permission(resource: Resource, action: Action) -> Callable:
    def checker(membership: ProjectMember = Depends(get_project_membership)) -> ProjectMember:
        if not can(membership.role, resource, action):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для этого действия",
            )
        return membership

    return checker


def require_capability(capability: str) -> Callable:
    def checker(membership: ProjectMember = Depends(get_project_membership)) -> ProjectMember:
        caps = get_capabilities(membership.role)
        if not getattr(caps, capability, False):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Недостаточно прав для этого действия",
            )
        return membership

    return checker


require_project_read = require_permission(Resource.PROJECT, Action.READ)
require_project_update = require_permission(Resource.PROJECT_SETTINGS, Action.UPDATE)
require_model_update = require_permission(Resource.EQUIPMENT_PARAMS, Action.UPDATE)
require_scenario_read = require_permission(Resource.SCENARIOS, Action.READ)
require_scenario_create = require_permission(Resource.SCENARIOS, Action.CREATE)
require_scenario_update = require_permission(Resource.SCENARIOS, Action.UPDATE)
require_run_create = require_permission(Resource.SIMULATION_RUN, Action.CREATE)
require_run_read = require_permission(Resource.SIMULATION_RESULTS, Action.READ)
require_comparison_read = require_permission(Resource.COMPARISON, Action.READ)
require_members_manage = require_permission(Resource.MEMBERS, Action.CREATE)
