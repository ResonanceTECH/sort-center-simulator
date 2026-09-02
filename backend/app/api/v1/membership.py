from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps.auth import get_current_user, get_project_membership, require_members_manage
from app.core.database import get_db
from app.models.project import Project
from app.models.user import User
from app.schemas.membership import (
    AcceptInvitationRequest,
    CreateInvitationRequest,
    InvitationPreviewResponse,
    InvitationResponse,
    InvitationsListResponse,
    ProjectAccessResponse,
    ProjectMemberResponse,
    ProjectMembersListResponse,
    UpdateMemberRoleRequest,
)
from app.services.membership_service import (
    accept_invitation,
    create_invitation,
    deactivate_invitation,
    get_access_for_user,
    get_membership,
    invitation_to_dict,
    list_invitations,
    list_project_members,
    member_to_dict,
    preview_invitation,
    remove_member,
    update_member_role,
)

router = APIRouter(tags=["membership"])


@router.get("/projects/{project_id}/access", response_model=ProjectAccessResponse)
def get_project_access(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectAccessResponse:
    profile = get_access_for_user(db, project_id, current_user.id)
    return ProjectAccessResponse(**profile)


@router.get("/projects/{project_id}/members", response_model=ProjectMembersListResponse)
def get_project_members(
    project_id: UUID,
    _membership=Depends(get_project_membership),
    db: Session = Depends(get_db),
) -> ProjectMembersListResponse:
    members = list_project_members(db, project_id)
    return ProjectMembersListResponse(
        members=[ProjectMemberResponse(**member_to_dict(member)) for member in members]
    )


@router.patch("/projects/{project_id}/members/{user_id}", response_model=ProjectMemberResponse)
def patch_member_role(
    project_id: UUID,
    user_id: UUID,
    body: UpdateMemberRoleRequest,
    actor: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectMemberResponse:
    membership = get_membership(db, project_id, actor.id)
    if membership is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="Нет доступа к проекту")
    updated = update_member_role(
        db,
        project_id,
        user_id,
        body.role,
        actor=membership,
    )
    db.refresh(updated, attribute_names=["user"])
    return ProjectMemberResponse(**member_to_dict(updated))


@router.delete("/projects/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_member(
    project_id: UUID,
    user_id: UUID,
    actor: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    membership = get_membership(db, project_id, actor.id)
    if membership is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="Нет доступа к проекту")
    remove_member(db, project_id, user_id, actor=membership)


@router.get("/projects/{project_id}/invitations", response_model=InvitationsListResponse)
def get_invitations(
    project_id: UUID,
    _membership=Depends(require_members_manage),
    db: Session = Depends(get_db),
) -> InvitationsListResponse:
    invitations = list_invitations(db, project_id)
    return InvitationsListResponse(
        invitations=[InvitationResponse(**invitation_to_dict(item)) for item in invitations]
    )


@router.post(
    "/projects/{project_id}/invitations",
    response_model=InvitationResponse,
    status_code=status.HTTP_201_CREATED,
)
def post_invitation(
    project_id: UUID,
    body: CreateInvitationRequest,
    current_user: User = Depends(get_current_user),
    _membership=Depends(require_members_manage),
    db: Session = Depends(get_db),
) -> InvitationResponse:
    project = db.get(Project, project_id)
    if project is None:
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Проект не найден")
    invitation = create_invitation(
        db,
        project,
        role=body.role,
        created_by=current_user,
        expires_in_days=body.expires_in_days,
        max_uses=body.max_uses,
    )
    return InvitationResponse(**invitation_to_dict(invitation))


@router.delete(
    "/projects/{project_id}/invitations/{invitation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_invitation(
    project_id: UUID,
    invitation_id: UUID,
    _membership=Depends(require_members_manage),
    db: Session = Depends(get_db),
) -> None:
    deactivate_invitation(db, project_id, invitation_id)


@router.get("/invitations/{code}/preview", response_model=InvitationPreviewResponse)
def get_invitation_preview(code: str, db: Session = Depends(get_db)) -> InvitationPreviewResponse:
    return InvitationPreviewResponse(**preview_invitation(db, code))


@router.post("/invitations/accept", response_model=ProjectAccessResponse)
def post_accept_invitation(
    body: AcceptInvitationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectAccessResponse:
    membership = accept_invitation(db, body.code, current_user)
    profile = get_access_for_user(db, membership.project_id, current_user.id)
    return ProjectAccessResponse(**profile)
