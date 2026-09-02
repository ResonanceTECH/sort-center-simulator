from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.scenario import Scenario
from app.schemas.defaults import DEFAULT_SCENARIO_CONFIG
from app.services.auth_service import get_user_by_email, register_user
from app.services.membership_service import add_project_owner, get_membership


def seed_demo_user(db: Session):
    user = get_user_by_email(db, "demo@sortcenter.ru")
    if user is None:
        user = register_user(
            db,
            name="Демо пользователь",
            email="demo@sortcenter.ru",
            password="demo123",
            team="Logus Nova",
        )
    return user


def seed_demo_project(db: Session) -> Optional[Project]:
    demo_user = seed_demo_user(db)

    existing = db.scalars(
        select(Project).where(Project.name == "СЦ Демо — Logus Nova")
    ).first()
    if existing is not None:
        if get_membership(db, existing.id, demo_user.id) is None:
            add_project_owner(db, existing, demo_user)
            db.commit()
        return existing

    from app.services.project_service import create_project

    project = create_project(
        db,
        name="СЦ Демо — Logus Nova",
        description="Демонстрационный проект сортировочного центра",
        owner_user_id=demo_user.id,
    )

    scenario = db.scalars(
        select(Scenario).where(Scenario.project_id == project.id)
    ).first()
    if scenario is not None:
        scenario.config = dict(DEFAULT_SCENARIO_CONFIG)
        scenario.name = "Базовый сценарий"
        db.commit()

    project.status = "ready"
    db.commit()
    db.refresh(project)
    return project
