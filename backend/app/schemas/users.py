from __future__ import annotations

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserRoleOut(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    is_system: bool = False
    organization_id: Optional[str] = None


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    team: Optional[str] = None
    organization_id: str
    roles: list[str] = []


class CreateUserIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    team: Optional[str] = Field(default=None, max_length=120)
    roles: list[str] = Field(default_factory=list)


class UpdateUserIn(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    email: Optional[EmailStr] = None
    team: Optional[str] = Field(default=None, max_length=120)
    password: Optional[str] = Field(default=None, min_length=6, max_length=128)


class AssignRoleIn(BaseModel):
    role_id: UUID


class AuditEventOut(BaseModel):
    id: str
    organization_id: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None
    entity_type: str
    entity_id: str
    action: str
    before: Optional[dict] = None
    after: Optional[dict] = None
    created_at: str
