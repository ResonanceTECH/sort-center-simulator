from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps.auth import (
    get_current_user,
    require_comparison_read,
    require_model_update,
    require_project_read,
    require_project_update,
    require_run_create,
    require_run_read,
    require_scenario_create,
    require_scenario_read,
    require_scenario_update,
    require_capability,
)
from app.core.database import get_db
from app.core.permissions import ROLE_LABELS
from app.models.project import Project
from app.models.project_member import ProjectMember
from app.models.run import Run
from app.models.scenario import Scenario
from app.models.user import User
from app.schemas.project import (
    ActiveRunResponse,
    CreateProjectRequest,
    CreateProjectResponse,
    CreateRunRequest,
    CreateScenarioRequest,
    LastResultResponse,
    PatchProjectRequest,
    ProjectDetailResponse,
    ProjectListItemResponse,
    ProjectsListResponse,
    RunDetailResponse,
    RunSummaryResponse,
    ScenarioSummaryResponse,
    ScenariosListResponse,
)
from app.services.project_service import (
    create_project,
    get_last_run,
    get_project_or_none,
    get_project_with_relations,
    list_projects,
    thumbnail_for_index,
)
from app.services.artifacts_service import read_events, read_metrics, read_trace
from app.services.scenario_service import create_scenario, set_default_scenario
from app.services.run_service import (
    create_run,
    execute_run_stub,
    resolve_scenario,
    run_to_summary,
)

router = APIRouter(prefix="/projects", tags=["projects"])


def _build_list_item(project: Project, index: int) -> ProjectListItemResponse:
    last_run = get_last_run(project)
    last_status = last_run.status if last_run else None
    is_running = last_status in ("queued", "preparing", "running")

    return ProjectListItemResponse(
        id=project.id,
        name=project.name,
        updated_at=project.updated_at,
        status=project.status,
        thumbnail=thumbnail_for_index(index),
        thumbnail_alt=f"Превью проекта «{project.name}»",
        scenarios_count=len(project.scenarios),
        last_result=LastResultResponse(
            status=last_status,
            label=_last_result_label(last_status, last_run.name if last_run else None),
        ),
        active_run=ActiveRunResponse(
            progress=last_run.progress if last_run and is_running else 0,
            label=last_run.name if last_run else "Симуляция",
        )
        if is_running and last_run
        else None,
    )


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


@router.get("", response_model=ProjectsListResponse)
def get_projects(
    search: str = Query(default=""),
    status: str = Query(default="all"),
    sort: str = Query(default="recent"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=5, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProjectsListResponse:
    projects, total = list_projects(
        db,
        user_id=current_user.id,
        search=search,
        status=status,
        sort=sort,
        page=page,
        page_size=page_size,
    )
    offset = (page - 1) * page_size
    items = [_build_list_item(p, offset + i) for i, p in enumerate(projects)]
    return ProjectsListResponse(
        items=items,
        total_count=total,
        page=page,
        page_size=page_size,
        has_more=offset + len(items) < total,
        notifications=[],
    )


@router.post("", response_model=CreateProjectResponse, status_code=201)
def post_project(
    body: CreateProjectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CreateProjectResponse:
    project = create_project(
        db,
        body.name.strip(),
        body.description,
        owner_user_id=current_user.id,
    )
    scenario_id = project.default_scenario_id
    return CreateProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        updated_at=project.updated_at,
        created_at=project.created_at,
        scenarios_count=1,
        base_scenario_id=scenario_id,
    )


@router.get("/{project_id}", response_model=ProjectDetailResponse)
def get_project(
    project_id: UUID,
    membership: ProjectMember = Depends(require_project_read),
    db: Session = Depends(get_db),
) -> ProjectDetailResponse:
    project = get_project_with_relations(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")

    last_run = get_last_run(project)
    return ProjectDetailResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        updated_at=project.updated_at,
        created_at=project.created_at,
        default_scenario_id=project.default_scenario_id,
        last_run=RunSummaryResponse(**run_to_summary(last_run)) if last_run else None,
        my_role=membership.role,
        my_role_label=ROLE_LABELS.get(membership.role, membership.role),
    )


@router.patch("/{project_id}", response_model=CreateProjectResponse)
def patch_project(
    project_id: UUID,
    body: PatchProjectRequest,
    _membership: ProjectMember = Depends(require_project_update),
    db: Session = Depends(get_db),
) -> CreateProjectResponse:
    project = get_project_or_none(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")

    if body.name is not None:
        project.name = body.name.strip()
    if body.description is not None:
        project.description = body.description.strip() or None

    db.commit()
    db.refresh(project)
    scenarios_count = (
        db.scalar(select(func.count(Scenario.id)).where(Scenario.project_id == project.id)) or 0
    )
    return CreateProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        status=project.status,
        updated_at=project.updated_at,
        created_at=project.created_at,
        scenarios_count=scenarios_count,
        base_scenario_id=project.default_scenario_id,
    )


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: UUID,
    _membership: ProjectMember = Depends(require_capability("delete_project")),
    db: Session = Depends(get_db),
) -> None:
    project = get_project_or_none(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")
    db.delete(project)
    db.commit()


@router.get("/{project_id}/scenarios", response_model=ScenariosListResponse)
def get_scenarios(
    project_id: UUID,
    _membership: ProjectMember = Depends(require_scenario_read),
    db: Session = Depends(get_db),
) -> ScenariosListResponse:
    project = get_project_with_relations(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")

    scenarios = sorted(project.scenarios, key=lambda s: (not s.is_default, s.name))
    return ScenariosListResponse(
        scenarios=[
            ScenarioSummaryResponse(
                id=s.id,
                name=s.name,
                updated_at=s.updated_at,
                is_default=s.is_default or s.id == project.default_scenario_id,
            )
            for s in scenarios
        ]
    )


@router.post(
    "/{project_id}/scenarios",
    response_model=ScenarioSummaryResponse,
    status_code=201,
)
def post_scenario(
    project_id: UUID,
    body: CreateScenarioRequest,
    _membership: ProjectMember = Depends(require_scenario_create),
    db: Session = Depends(get_db),
) -> ScenarioSummaryResponse:
    project = get_project_with_relations(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")
    scenario = create_scenario(
        db,
        project,
        name=body.name,
        copy_from_id=body.copy_from_id,
    )
    return ScenarioSummaryResponse(
        id=scenario.id,
        name=scenario.name,
        updated_at=scenario.updated_at,
        is_default=scenario.is_default,
    )


@router.post("/{project_id}/scenarios/{scenario_id}/set-default")
def post_set_default_scenario(
    project_id: UUID,
    scenario_id: UUID,
    _membership: ProjectMember = Depends(require_capability("set_default_scenario")),
    db: Session = Depends(get_db),
) -> dict:
    project = get_project_with_relations(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")
    scenario = set_default_scenario(db, project, scenario_id)
    return {
        "id": scenario.id,
        "is_default": True,
        "default_scenario_id": project.default_scenario_id,
    }


@router.get("/{project_id}/scenarios/{scenario_id}/config")
def get_scenario_config(
    project_id: UUID,
    scenario_id: UUID,
    _membership: ProjectMember = Depends(require_scenario_read),
    db: Session = Depends(get_db),
) -> dict:
    scenario = _get_scenario_or_404(db, project_id, scenario_id)
    return scenario.config


@router.put("/{project_id}/scenarios/{scenario_id}/config")
def put_scenario_config(
    project_id: UUID,
    scenario_id: UUID,
    body: dict,
    _membership: ProjectMember = Depends(require_model_update),
    db: Session = Depends(get_db),
) -> dict:
    scenario = _get_scenario_or_404(db, project_id, scenario_id)
    scenario.config = body
    db.commit()
    db.refresh(scenario)
    return scenario.config


def _get_scenario_or_404(db: Session, project_id: UUID, scenario_id: UUID) -> Scenario:
    project = get_project_or_none(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")
    scenario = db.get(Scenario, scenario_id)
    if scenario is None or scenario.project_id != project_id:
        raise HTTPException(status_code=404, detail="Сценарий не найден")
    return scenario


@router.get("/{project_id}/scenarios/{scenario_id}")
def get_scenario(
    project_id: UUID,
    scenario_id: UUID,
    _membership: ProjectMember = Depends(require_scenario_read),
    db: Session = Depends(get_db),
) -> dict:
    project = get_project_or_none(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")

    scenario = db.get(Scenario, scenario_id)
    if scenario is None or scenario.project_id != project_id:
        raise HTTPException(status_code=404, detail="Сценарий не найден")

    return {
        "id": scenario.id,
        "project_id": scenario.project_id,
        "name": scenario.name,
        "description": scenario.description,
        "updated_at": scenario.updated_at,
        "version": scenario.version,
        "is_default": scenario.is_default,
        "config": scenario.config,
    }


@router.post("/{project_id}/runs", response_model=RunSummaryResponse, status_code=201)
def post_run(
    project_id: UUID,
    body: CreateRunRequest,
    background_tasks: BackgroundTasks,
    _membership: ProjectMember = Depends(require_run_create),
    db: Session = Depends(get_db),
) -> RunSummaryResponse:
    project = get_project_with_relations(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")

    if project.status == "archived":
        raise HTTPException(status_code=400, detail="Проект архивирован")

    scenario = resolve_scenario(db, project, body.scenario_id)
    if scenario is None:
        raise HTTPException(status_code=400, detail="Сценарий не найден")

    run = create_run(
        db,
        project,
        scenario,
        run_type=body.type,
        seed=body.seed,
    )
    background_tasks.add_task(execute_run_stub, run.id)
    return RunSummaryResponse(**run_to_summary(run))


@router.get("/{project_id}/runs", response_model=list[RunSummaryResponse])
def list_runs(
    project_id: UUID,
    _membership: ProjectMember = Depends(require_run_read),
    db: Session = Depends(get_db),
) -> list[RunSummaryResponse]:
    project = get_project_or_none(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")

    runs = db.scalars(
        select(Run)
        .where(Run.project_id == project_id)
        .order_by(Run.created_at.desc())
    ).all()
    return [RunSummaryResponse(**run_to_summary(run)) for run in runs]


@router.get("/{project_id}/runs/{run_id}", response_model=RunDetailResponse)
def get_run(
    project_id: UUID,
    run_id: UUID,
    _membership: ProjectMember = Depends(require_run_read),
    db: Session = Depends(get_db),
) -> RunDetailResponse:
    run = db.get(Run, run_id)
    if run is None or run.project_id != project_id:
        raise HTTPException(status_code=404, detail="Прогон не найден")
    return RunDetailResponse.model_validate(run)


@router.get("/{project_id}/runs/{run_id}/events")
def get_run_events(
    project_id: UUID,
    run_id: UUID,
    _membership: ProjectMember = Depends(require_run_read),
    db: Session = Depends(get_db),
) -> dict:
    run = db.get(Run, run_id)
    if run is None or run.project_id != project_id:
        raise HTTPException(status_code=404, detail="Прогон не найден")
    return {"events": read_events(run)}


@router.get("/{project_id}/runs/{run_id}/trace")
def get_run_trace(
    project_id: UUID,
    run_id: UUID,
    _membership: ProjectMember = Depends(require_run_read),
    db: Session = Depends(get_db),
) -> dict:
    run = db.get(Run, run_id)
    if run is None or run.project_id != project_id:
        raise HTTPException(status_code=404, detail="Прогон не найден")
    trace = read_trace(run)
    if trace is None:
        raise HTTPException(status_code=404, detail="Trace не найден")
    return trace


@router.get("/{project_id}/runs/{run_id}/metrics")
def get_run_metrics(
    project_id: UUID,
    run_id: UUID,
    _membership: ProjectMember = Depends(require_run_read),
    db: Session = Depends(get_db),
) -> dict:
    run = db.get(Run, run_id)
    if run is None or run.project_id != project_id:
        raise HTTPException(status_code=404, detail="Прогон не найден")
    metrics = read_metrics(run)
    if metrics is None:
        raise HTTPException(status_code=404, detail="Метрики не найдены")
    return {
        "metrics": metrics,
        "expect_passed": (run.result or {}).get("expect_passed"),
        "expect_failures": (run.result or {}).get("expect_failures", []),
    }


@router.get("/{project_id}/comparison")
def compare_runs(
    project_id: UUID,
    run_ids: str = Query(..., description="Comma-separated run UUIDs"),
    _membership: ProjectMember = Depends(require_comparison_read),
    db: Session = Depends(get_db),
) -> dict:
    project = get_project_or_none(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")

    ids = [part.strip() for part in run_ids.split(",") if part.strip()]
    if len(ids) < 2:
        raise HTTPException(status_code=400, detail="Нужно минимум 2 run_id")

    items = []
    for raw_id in ids:
        try:
            run_uuid = UUID(raw_id)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=f"Некорректный run_id: {raw_id}") from exc
        run = db.get(Run, run_uuid)
        if run is None or run.project_id != project_id:
            raise HTTPException(status_code=404, detail=f"Прогон не найден: {raw_id}")
        items.append(
            {
                "run_id": str(run.id),
                "name": run.name,
                "status": run.status,
                "created_at": run.created_at,
                "metrics": read_metrics(run),
                "expect_passed": (run.result or {}).get("expect_passed"),
            }
        )

    return {"runs": items}
