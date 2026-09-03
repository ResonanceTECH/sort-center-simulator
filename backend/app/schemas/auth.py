from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    team: Optional[str] = Field(default=None, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class UserResponse(BaseModel):
    """Compact user payload on login/register (backward compatible)."""

    id: str
    name: str
    email: str
    team: Optional[str] = None
    organization_id: Optional[str] = None
    roles: list[str] = []
    role: Optional[str] = None


class OrganizationOut(BaseModel):
    id: str
    name: str
    type: str


class MeUserOut(BaseModel):
    id: str
    name: str
    email: str
    team: Optional[str] = None


class MeResponse(BaseModel):
    """GET /auth/me — session context for workspace + permission checks."""

    user: MeUserOut
    organization: Optional[OrganizationOut] = None
    organization_type: Optional[str] = None
    roles: list[str] = []
    permissions: list[str] = []
    available_workspaces: list[str] = []
    # Flat aliases for older FE mappers / smoke checks
    id: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    team: Optional[str] = None
    organization_id: Optional[str] = None
    role: Optional[str] = None


class AuthResponse(BaseModel):
    user: UserResponse
    access_token: str
    token: str
