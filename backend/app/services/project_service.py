from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.run import Run
from app.models.scenario import Scenario
from app.models.user import User
from app.schemas.defaults import DEFAULT_SCENARIO_CONFIG

THUMBNAILS = [
    "/images/project-plan-1.svg",
    "/images/project-plan-2.svg",
    "/images/project-plan-3.svg",
    "/images/project-plan-4.svg",
    "/images/project-plan-5.svg",
    "/images/project-thumb-1.svg",
    "/images/project-thumb-2.svg",
]


def _last_result_label(status: Optional[str], run_name: Optional[str] = None) -> str:
    if status == "completed":
        return "Успешно"
    if status == "failed":
        return "Ошибка"
    if status == "running":
        return run_name or "Выполняется"
    if status == "queued":
        return "В очереди"
    return "Нет результатов"


def get_project_or_none(db: Session, project_id: UUID) -> Optional[Project]:
    return db.get(Project, project_id)


def get_project_with_relations(db: Session, project_id: UUID) -> Optional[Project]:
    stmt = (
        select(Project)
        .where(Project.id == project_id)
        .options(selectinload(Project.scenarios), selectinload(Project.runs))
    )
    return db.scalars(stmt).first()


def list_projects(
    db: Session,
    *,
    user_id: UUID,
    search: str = "",
    status: str = "all",
    sort: str = "recent",
    page: int = 1,
    page_size: int = 5,
) -> tuple[list[Project], int]:
    filters = [ProjectMember.user_id == user_id]
    if search.strip():
        filters.append(Project.name.ilike(f"%{search.strip()}%"))
    if status != "all":
        filters.append(Project.status == status)
    elif sort == "archived":
        filters.append(Project.status == "archived")

    count_stmt = (
        select(func.count(Project.id))
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .where(*filters)
    )
    total = db.scalar(count_stmt) or 0

    stmt = (
        select(Project)
        .join(ProjectMember, ProjectMember.project_id == Project.id)
        .where(*filters)
        .options(selectinload(Project.scenarios), selectinload(Project.runs))
    )

    if sort == "oldest":
        stmt = stmt.order_by(Project.updated_at.asc())
    elif sort == "name_asc":
        stmt = stmt.order_by(Project.name.asc())
    elif sort == "name_desc":
        stmt = stmt.order_by(Project.name.desc())
    else:
        stmt = stmt.order_by(Project.updated_at.desc())

    offset = max(0, (page - 1) * page_size)
    projects = list(db.scalars(stmt.offset(offset).limit(page_size)).all())
    return projects, total


def get_last_run(project: Project) -> Optional[Run]:
    if not project.runs:
        return None
    return max(project.runs, key=lambda r: r.created_at)


def create_project(
    db: Session,
    name: str,
    description: Optional[str],
    *,
    owner_user_id: UUID,
) -> Project:
    from app.services.membership_service import add_project_owner

    now = datetime.now(timezone.utc)
    project = Project(
        name=name,
        description=description or None,
        status="draft",
        updated_at=now,
        created_at=now,
    )
    db.add(project)
    db.flush()

    scenario = Scenario(
        project_id=project.id,
        name="Базовый сценарий",
        description="Сценарий по умолчанию",
        config=dict(DEFAULT_SCENARIO_CONFIG),
        is_default=True,
        updated_at=now,
        created_at=now,
    )
    db.add(scenario)
    db.flush()

    project.default_scenario_id = scenario.id
    owner = db.get(User, owner_user_id)
    if owner is not None:
        add_project_owner(db, project, owner)
    db.commit()
    db.refresh(project)
    return project


def thumbnail_for_index(index: int) -> str:
    return THUMBNAILS[index % len(THUMBNAILS)]
