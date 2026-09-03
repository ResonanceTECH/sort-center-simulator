from __future__ import annotations

from typing import Optional
from uuid import UUID

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, ForbiddenError, NotFoundError
from app.core.security import hash_password
from app.models.organization import Organization
from app.models.rbac import Role, UserOrganization, UserRole
from app.models.user import User
from app.services.audit_service import log_audit
from app.services.scm_auth_service import get_user_roles


class UserService:
    def __init__(self, db: Session, organization_id: UUID, actor_id: UUID) -> None:
        self.db = db
        self.organization_id = organization_id
        self.actor_id = actor_id

    def _ensure_org_member(self, user_id: UUID) -> UserOrganization:
        link = self.db.scalars(
            select(UserOrganization).where(
                UserOrganization.user_id == user_id,
                UserOrganization.organization_id == self.organization_id,
            )
        ).first()
        if link is None:
            raise NotFoundError("USER_NOT_FOUND", "User not found in organization")
        return link

    def list_users(self) -> list[User]:
        return list(
            self.db.scalars(
                select(User)
                .join(UserOrganization, UserOrganization.user_id == User.id)
                .where(UserOrganization.organization_id == self.organization_id)
                .order_by(User.name)
            ).all()
        )

    def get_user(self, user_id: UUID) -> User:
        self._ensure_org_member(user_id)
        user = self.db.get(User, user_id)
        if user is None:
            raise NotFoundError("USER_NOT_FOUND", "User not found")
        return user

    def user_to_dict(self, user: User) -> dict:
        roles = get_user_roles(self.db, user.id, self.organization_id)
        return {
            "id": str(user.id),
            "name": user.name,
            "email": user.email,
            "team": user.team,
            "organization_id": str(self.organization_id),
            "roles": [r.value for r in roles],
        }

    def create_user(
        self,
        *,
        name: str,
        email: str,
        password: str,
        team: Optional[str] = None,
        roles: Optional[list[str]] = None,
    ) -> User:
        normalized_email = email.strip().lower()
        existing = self.db.scalars(select(User).where(User.email == normalized_email)).first()
        if existing:
            link = self.db.scalars(
                select(UserOrganization).where(
                    UserOrganization.user_id == existing.id,
                    UserOrganization.organization_id == self.organization_id,
                )
            ).first()
            if link:
                raise ConflictError("USER_EXISTS", "User already exists in organization")
            self.db.add(UserOrganization(user_id=existing.id, organization_id=self.organization_id, is_primary=False))
            user = existing
        else:
            user = User(
                name=name.strip(),
                email=normalized_email,
                password_hash=hash_password(password),
                team=team.strip() if team else None,
            )
            self.db.add(user)
            self.db.flush()
            self.db.add(UserOrganization(user_id=user.id, organization_id=self.organization_id, is_primary=True))

        if roles:
            for role_code in roles:
                self._assign_role_code(user.id, role_code)

        log_audit(
            self.db,
            organization_id=self.organization_id,
            user_id=self.actor_id,
            entity_type="USER",
            entity_id=user.id,
            action="USER_CREATED",
            after=self.user_to_dict(user),
        )
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user(
        self,
        user_id: UUID,
        *,
        name: Optional[str] = None,
        email: Optional[str] = None,
        team: Optional[str] = None,
        password: Optional[str] = None,
    ) -> User:
        user = self.get_user(user_id)
        before = self.user_to_dict(user)

        if name is not None:
            user.name = name.strip()
        if email is not None:
            normalized = email.strip().lower()
            other = self.db.scalars(select(User).where(User.email == normalized, User.id != user.id)).first()
            if other:
                raise ConflictError("EMAIL_TAKEN", "Email already in use")
            user.email = normalized
        if team is not None:
            user.team = team.strip() or None
        if password:
            user.password_hash = hash_password(password)

        log_audit(
            self.db,
            organization_id=self.organization_id,
            user_id=self.actor_id,
            entity_type="USER",
            entity_id=user.id,
            action="USER_UPDATED",
            before=before,
            after=self.user_to_dict(user),
        )
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_user(self, user_id: UUID) -> None:
        if user_id == self.actor_id:
            raise ForbiddenError("CANNOT_DELETE_SELF", "Cannot delete your own account")

        user = self.get_user(user_id)
        before = self.user_to_dict(user)

        self.db.execute(
            delete(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.organization_id == self.organization_id,
            )
        )
        self.db.execute(
            delete(UserOrganization).where(
                UserOrganization.user_id == user_id,
                UserOrganization.organization_id == self.organization_id,
            )
        )

        log_audit(
            self.db,
            organization_id=self.organization_id,
            user_id=self.actor_id,
            entity_type="USER",
            entity_id=user.id,
            action="USER_DELETED",
            before=before,
        )

        remaining_orgs = self.db.scalars(
            select(UserOrganization).where(UserOrganization.user_id == user_id)
        ).all()
        if not remaining_orgs:
            self.db.delete(user)

        self.db.commit()

    def assign_role(self, user_id: UUID, role_id: UUID) -> User:
        self.get_user(user_id)
        role = self.db.scalars(
            select(Role).where(Role.id == role_id)
        ).first()
        if role is None:
            raise NotFoundError("ROLE_NOT_FOUND", "Role not found")

        exists = self.db.scalars(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id,
                UserRole.organization_id == self.organization_id,
            )
        ).first()
        if exists:
            return self.get_user(user_id)

        self.db.add(UserRole(user_id=user_id, role_id=role_id, organization_id=self.organization_id))
        log_audit(
            self.db,
            organization_id=self.organization_id,
            user_id=self.actor_id,
            entity_type="USER",
            entity_id=user_id,
            action="ROLE_ASSIGNED",
            after={"role": role.code},
        )
        self.db.commit()
        return self.get_user(user_id)

    def remove_role(self, user_id: UUID, role_id: UUID) -> User:
        self.get_user(user_id)
        role = self.db.get(Role, role_id)
        if role is None:
            raise NotFoundError("ROLE_NOT_FOUND", "Role not found")

        self.db.execute(
            delete(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role_id,
                UserRole.organization_id == self.organization_id,
            )
        )
        log_audit(
            self.db,
            organization_id=self.organization_id,
            user_id=self.actor_id,
            entity_type="USER",
            entity_id=user_id,
            action="ROLE_REMOVED",
            before={"role": role.code},
        )
        self.db.commit()
        return self.get_user(user_id)

    def _assign_role_code(self, user_id: UUID, role_code: str) -> None:
        role = self.db.scalars(select(Role).where(Role.code == role_code)).first()
        if role is None:
            return
        exists = self.db.scalars(
            select(UserRole).where(
                UserRole.user_id == user_id,
                UserRole.role_id == role.id,
                UserRole.organization_id == self.organization_id,
            )
        ).first()
        if not exists:
            self.db.add(UserRole(user_id=user_id, role_id=role.id, organization_id=self.organization_id))
