from __future__ import annotations

import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.permissions import ROLE_LABELS, assert_role, build_access_profile
from app.models.project import Project
from app.models.project_invitation import ProjectInvitation
from app.models.project_member import PROJECT_ROLES, ProjectMember
from app.models.user import User

INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def add_project_owner(db: Session, project: Project, user: User) -> ProjectMember:
    membership = ProjectMember(project_id=project.id, user_id=user.id, role="owner")
    db.add(membership)
    db.flush()
    return membership


def get_membership(
    db: Session, project_id: UUID, user_id: UUID
) -> Optional[ProjectMember]:
    return db.scalars(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
    ).first()


def list_project_members(db: Session, project_id: UUID) -> list[ProjectMember]:
    stmt = (
        select(ProjectMember)
        .where(ProjectMember.project_id == project_id)
        .options(selectinload(ProjectMember.user))
        .order_by(ProjectMember.created_at.asc())
    )
    return list(db.scalars(stmt).all())


def member_to_dict(member: ProjectMember) -> dict:
    return {
        "user_id": str(member.user_id),
        "name": member.user.name,
        "email": member.user.email,
        "role": member.role,
        "role_label": ROLE_LABELS.get(member.role, member.role),
        "created_at": member.created_at,
    }


def update_member_role(
    db: Session,
    project_id: UUID,
    target_user_id: UUID,
    role: str,
    *,
    actor: ProjectMember,
) -> ProjectMember:
    assert_role(role)
    if actor.role != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только владелец может менять роли")

    member = get_membership(db, project_id, target_user_id)
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Участник не найден")

    if member.role == "owner" and role != "owner":
        owners = db.scalars(
            select(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.role == "owner",
            )
        ).all()
        if len(owners) <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Нельзя снять роль у единственного владельца",
            )

    member.role = role
    db.commit()
    db.refresh(member)
    return member


def remove_member(
    db: Session,
    project_id: UUID,
    target_user_id: UUID,
    *,
    actor: ProjectMember,
) -> None:
    if actor.role != "owner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Только владелец может удалять участников")

    member = get_membership(db, project_id, target_user_id)
    if member is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Участник не найден")

    if member.role == "owner":
        owners = db.scalars(
            select(ProjectMember).where(
                ProjectMember.project_id == project_id,
                ProjectMember.role == "owner",
            )
        ).all()
        if len(owners) <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Нельзя удалить единственного владельца",
            )

    db.delete(member)
    db.commit()


def _generate_invite_code(length: int = 8) -> str:
    return "".join(secrets.choice(INVITE_ALPHABET) for _ in range(length))


def create_invitation(
    db: Session,
    project: Project,
    *,
    role: str,
    created_by: User,
    expires_in_days: Optional[int] = 7,
    max_uses: Optional[int] = None,
) -> ProjectInvitation:
    if role not in PROJECT_ROLES or role == "owner":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Недопустимая роль приглашения")

    for _ in range(10):
        code = _generate_invite_code()
        exists = db.scalars(select(ProjectInvitation).where(ProjectInvitation.code == code)).first()
        if exists is None:
            break
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Не удалось создать код")

    expires_at = None
    if expires_in_days:
        expires_at = datetime.now(timezone.utc) + timedelta(days=expires_in_days)

    invitation = ProjectInvitation(
        project_id=project.id,
        code=code,
        role=role,
        created_by_id=created_by.id,
        expires_at=expires_at,
        max_uses=max_uses,
        use_count=0,
        is_active=True,
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return invitation


def invitation_to_dict(invitation: ProjectInvitation) -> dict:
    return {
        "id": str(invitation.id),
        "code": invitation.code,
        "role": invitation.role,
        "role_label": ROLE_LABELS.get(invitation.role, invitation.role),
        "link_path": f"/projects/join?code={invitation.code}",
        "expires_at": invitation.expires_at,
        "max_uses": invitation.max_uses,
        "use_count": invitation.use_count,
        "is_active": invitation.is_active,
        "created_at": invitation.created_at,
    }


def list_invitations(db: Session, project_id: UUID) -> list[ProjectInvitation]:
    stmt = (
        select(ProjectInvitation)
        .where(ProjectInvitation.project_id == project_id)
        .order_by(ProjectInvitation.created_at.desc())
    )
    return list(db.scalars(stmt).all())


def deactivate_invitation(db: Session, project_id: UUID, invitation_id: UUID) -> None:
    invitation = db.get(ProjectInvitation, invitation_id)
    if invitation is None or invitation.project_id != project_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Приглашение не найдено")
    invitation.is_active = False
    db.commit()


def _as_utc(value: Optional[datetime]) -> Optional[datetime]:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)
    return value


def _validate_invitation(invitation: Optional[ProjectInvitation]) -> tuple[bool, str]:
    if invitation is None:
        return False, "Код приглашения не найден"
    if not invitation.is_active:
        return False, "Приглашение деактивировано"
    expires_at = _as_utc(invitation.expires_at)
    if expires_at and expires_at < datetime.now(timezone.utc):
        return False, "Срок действия приглашения истёк"
    if invitation.max_uses is not None and invitation.use_count >= invitation.max_uses:
        return False, "Лимит использований исчерпан"
    return True, ""


def preview_invitation(db: Session, code: str) -> dict:
    normalized = code.strip().upper()
    invitation = db.scalars(
        select(ProjectInvitation)
        .where(ProjectInvitation.code == normalized)
        .options(selectinload(ProjectInvitation.project))
    ).first()
    is_valid, message = _validate_invitation(invitation)
    project_name = invitation.project.name if invitation else ""
    project_id = str(invitation.project_id) if invitation else ""
    role = invitation.role if invitation else ""
    return {
        "code": normalized,
        "project_id": project_id,
        "project_name": project_name,
        "role": role,
        "role_label": ROLE_LABELS.get(role, role),
        "is_valid": is_valid,
        "message": message or None,
    }


def accept_invitation(db: Session, code: str, user: User) -> ProjectMember:
    normalized = code.strip().upper()
    invitation = db.scalars(
        select(ProjectInvitation)
        .where(ProjectInvitation.code == normalized)
        .options(selectinload(ProjectInvitation.project))
    ).first()
    is_valid, message = _validate_invitation(invitation)
    if not is_valid or invitation is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    existing = get_membership(db, invitation.project_id, user.id)
    if existing is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Вы уже участник проекта")

    membership = ProjectMember(
        project_id=invitation.project_id,
        user_id=user.id,
        role=invitation.role,
    )
    invitation.use_count += 1
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return membership


def get_access_for_user(db: Session, project_id: UUID, user_id: UUID) -> dict:
    membership = get_membership(db, project_id, user_id)
    if membership is None:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нет доступа к проекту")
    return build_access_profile(membership.role)
