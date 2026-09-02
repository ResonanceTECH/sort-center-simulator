from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class RunSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    status: str
    created_at: datetime
    scenario_id: UUID


class ProjectDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: Optional[str] = None
    status: str
    updated_at: datetime
    created_at: datetime
    default_scenario_id: Optional[UUID] = None
    last_run: Optional[RunSummaryResponse] = None
    my_role: Optional[str] = None
    my_role_label: Optional[str] = None


class ScenarioSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    updated_at: datetime
    is_default: bool = False


class ScenariosListResponse(BaseModel):
    scenarios: list[ScenarioSummaryResponse]


class LastResultResponse(BaseModel):
    status: Optional[str]
    label: str


class ActiveRunResponse(BaseModel):
    progress: float
    label: str


class ProjectListItemResponse(BaseModel):
    id: UUID
    name: str
    updated_at: datetime
    status: str
    thumbnail: str
    thumbnail_alt: str
    scenarios_count: int
    last_result: LastResultResponse
    active_run: Optional[ActiveRunResponse] = None


class ProjectsListResponse(BaseModel):
    items: list[ProjectListItemResponse]
    total_count: int
    page: int
    page_size: int
    has_more: bool
    notifications: list = Field(default_factory=list)


class CreateProjectRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    description: Optional[str] = None
    creation_mode: Optional[str] = None
    template_id: Optional[str] = None


class PatchProjectRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=120)
    description: Optional[str] = None


class CreateProjectResponse(BaseModel):
    id: UUID
    name: str
    description: Optional[str] = None
    status: str
    updated_at: datetime
    created_at: datetime
    scenarios_count: int = 1
    base_scenario_id: Optional[UUID] = None


class CreateScenarioRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    copy_from_id: Optional[UUID] = None


class CreateRunRequest(BaseModel):
    scenario_id: Optional[UUID] = None
    type: Literal["analytical", "simulation"] = "analytical"
    seed: Optional[int] = None


class RunDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_id: UUID
    scenario_id: UUID
    scenario_version: int
    name: str
    type: str
    status: str
    progress: float
    seed: Optional[int] = None
    result: Optional[dict] = None
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
