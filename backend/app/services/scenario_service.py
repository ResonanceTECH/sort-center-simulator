from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.scenario import Scenario
from app.schemas.defaults import DEFAULT_SCENARIO_CONFIG


def create_scenario(
    db: Session,
    project: Project,
    *,
    name: str,
    copy_from_id: Optional[UUID] = None,
) -> Scenario:
    now = datetime.now(timezone.utc)
    config = dict(DEFAULT_SCENARIO_CONFIG)

    if copy_from_id is not None:
        source = db.get(Scenario, copy_from_id)
        if source is None or source.project_id != project.id:
            raise HTTPException(status_code=404, detail="Исходный сценарий не найден")
        config = dict(source.config)

    scenario = Scenario(
        project_id=project.id,
        name=name.strip(),
        description=None,
        config=config,
        is_default=False,
        updated_at=now,
        created_at=now,
    )
    db.add(scenario)
    project.updated_at = now
    db.commit()
    db.refresh(scenario)
    return scenario


def set_default_scenario(db: Session, project: Project, scenario_id: UUID) -> Scenario:
    scenario = db.get(Scenario, scenario_id)
    if scenario is None or scenario.project_id != project.id:
        raise HTTPException(status_code=404, detail="Сценарий не найден")

    for item in project.scenarios:
        item.is_default = item.id == scenario.id

    project.default_scenario_id = scenario.id
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(scenario)
    return scenario
