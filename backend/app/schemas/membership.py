from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ProjectMemberResponse(BaseModel):
    user_id: str
    name: str
    email: str
    role: str
    role_label: str
    created_at: datetime


class ProjectMembersListResponse(BaseModel):
    members: list[ProjectMemberResponse]


class UpdateMemberRoleRequest(BaseModel):
    role: str = Field(pattern="^(owner|editor|analyst|viewer)$")


class CreateInvitationRequest(BaseModel):
    role: str = Field(pattern="^(editor|analyst|viewer)$")
    expires_in_days: Optional[int] = Field(default=7, ge=1, le=90)
    max_uses: Optional[int] = Field(default=None, ge=1, le=1000)


class InvitationResponse(BaseModel):
    id: str
    code: str
    role: str
    role_label: str
    link_path: str
    expires_at: Optional[datetime] = None
    max_uses: Optional[int] = None
    use_count: int
    is_active: bool
    created_at: datetime


class InvitationsListResponse(BaseModel):
    invitations: list[InvitationResponse]


class AcceptInvitationRequest(BaseModel):
    code: str = Field(min_length=6, max_length=16)


class InvitationPreviewResponse(BaseModel):
    code: str
    project_id: str
    project_name: str
    role: str
    role_label: str
    is_valid: bool
    message: Optional[str] = None


class ProjectAccessResponse(BaseModel):
    role: str
    role_label: str
    permissions: dict[str, list[str]]
    capabilities: dict[str, bool]
