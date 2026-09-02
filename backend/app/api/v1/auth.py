from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user
from app.core.database import get_db
from app.schemas.auth import (
    AuthResponse,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    UserResponse,
)
from app.services.auth_service import (
    authenticate_user,
    issue_auth_token,
    register_user,
    user_to_dict,
)

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = register_user(
        db,
        name=body.name,
        email=str(body.email),
        password=body.password,
        team=body.team,
    )
    token = issue_auth_token(user)
    user_response = UserResponse(**user_to_dict(user))
    return AuthResponse(user=user_response, access_token=token, token=token)


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = authenticate_user(db, str(body.email), body.password)
    token = issue_auth_token(user)
    user_response = UserResponse(**user_to_dict(user))
    return AuthResponse(user=user_response, access_token=token, token=token)


@router.get("/me", response_model=UserResponse)
def me(current_user=Depends(get_current_user)) -> UserResponse:
    return UserResponse(**user_to_dict(current_user))


@router.post("/forgot-password", status_code=status.HTTP_204_NO_CONTENT)
def forgot_password(_body: ForgotPasswordRequest) -> None:
    return None
