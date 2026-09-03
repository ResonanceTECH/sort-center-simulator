from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Request, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.api.deps.scm_auth import get_current_user
from app.core.database import get_db
from app.schemas.auth import ForgotPasswordRequest, MeResponse, RegisterRequest, UserResponse
from app.services.auth_service import register_user as legacy_register
from app.services.scm_auth_service import (
    authenticate_user,
    build_me_response,
    issue_auth_tokens,
    refresh_access_token,
    revoke_refresh_token,
    user_to_dict,
)
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    refresh_token: str
    token: str


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, request: Request, db: Session = Depends(get_db)) -> AuthResponse:
    from app.services.scm_auth_service import register_user
    user = register_user(
        db,
        name=body.name,
        email=str(body.email),
        password=body.password,
        team=body.team,
    )
    access, refresh = issue_auth_tokens(db, user, ip=request.client.host if request.client else None)
    user_response = UserResponse(**user_to_dict(db, user))
    return AuthResponse(user=user_response, access_token=access, refresh_token=refresh, token=access)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)) -> AuthResponse:
    user = authenticate_user(db, str(body.email), body.password)
    access, refresh = issue_auth_tokens(db, user, ip=request.client.host if request.client else None)
    user_response = UserResponse(**user_to_dict(db, user))
    return AuthResponse(user=user_response, access_token=access, refresh_token=refresh, token=access)


@router.post("/refresh", response_model=AuthResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)) -> AuthResponse:
    access, refresh = refresh_access_token(db, body.refresh_token)
    from app.core.security import decode_access_token
    user_id = decode_access_token(access)
    user = db.get(User, user_id)
    user_response = UserResponse(**user_to_dict(db, user))
    return AuthResponse(user=user_response, access_token=access, refresh_token=refresh, token=access)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(body: LogoutRequest, db: Session = Depends(get_db)) -> None:
    revoke_refresh_token(db, body.refresh_token)


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)) -> MeResponse:
    return build_me_response(db, current_user)


@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
def forgot_password(_body: ForgotPasswordRequest) -> None:
    return None
