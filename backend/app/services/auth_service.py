from __future__ import annotations

from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User


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
) -> User:
    if get_user_by_email(db, email) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email уже зарегистрирован")

    user = User(
        name=name.strip(),
        email=email.strip().lower(),
        password_hash=hash_password(password),
        team=team.strip() if team else None,
    )
    db.add(user)
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


def issue_auth_token(user: User) -> str:
    return create_access_token(user.id)


def user_to_dict(user: User) -> dict:
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "team": user.team,
    }
