from __future__ import annotations

import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.run import Run
from app.models.scenario import Scenario
from sim.physics.discrete_backend import write_run_artifacts

DATA_DIR = Path(__file__).resolve().parents[2] / "data" / "runs"


def execute_run(run_id: UUID) -> None:
    from app.core.database import SessionLocal

    db = SessionLocal()
    try:
        run = db.get(Run, run_id)
        if run is None:
            return

        scenario = db.get(Scenario, run.scenario_id)
        if scenario is None:
            run.status = "failed"
            run.error_message = "Scenario not found"
            run.finished_at = datetime.now(timezone.utc)
            db.commit()
            return

        run.status = "running"
        run.progress = 0.1
        run.started_at = datetime.now(timezone.utc)
        db.commit()

        seed = run.seed if run.seed is not None else scenario.config.get("simulation", {}).get("seed", 42)
        from sim.physics.mujoco_backend import MujocoBackendNotReadyError, run_simulation

        try:
            output = run_simulation(scenario.config, seed=seed, mode=run.type)
        except MujocoBackendNotReadyError as exc:
            run.status = "failed"
            run.error_message = str(exc)
            run.finished_at = datetime.now(timezone.utc)
            db.commit()
            return

        artifacts_dir = DATA_DIR / str(run_id)
        write_run_artifacts(
            output,
            artifacts_dir,
            config=scenario.config,
            run_id=str(run_id),
        )

        run.artifacts_path = str(artifacts_dir)
        run.result = {
            "metrics": output.metrics,
            "expect_passed": output.expect_passed,
            "expect_failures": output.expect_failures,
            "seed": output.seed,
        }
        run.status = "completed_with_warnings" if not output.expect_passed else "completed"
        run.progress = 1.0
        run.finished_at = datetime.now(timezone.utc)

        project = db.get(Project, run.project_id)
        if project is not None:
            project.status = "completed" if output.expect_passed else "error"
            project.updated_at = datetime.now(timezone.utc)

        db.commit()
    except Exception as exc:
        db.rollback()
        run = db.get(Run, run_id)
        if run is not None:
            run.status = "failed"
            run.error_message = str(exc)
            run.finished_at = datetime.now(timezone.utc)
            db.commit()
    finally:
        db.close()


def execute_run_stub(run_id: UUID) -> None:
    """Backward-compatible alias used by background tasks."""
    execute_run(run_id)


def create_run(
    db: Session,
    project: Project,
    scenario: Scenario,
    *,
    run_type: str = "analytical",
    seed: Optional[int] = None,
) -> Run:
    now = datetime.now(timezone.utc)
    run = Run(
        project_id=project.id,
        scenario_id=scenario.id,
        scenario_version=scenario.version,
        name=f"Расчёт «{scenario.name}»",
        type=run_type,
        status="queued",
        progress=0.0,
        seed=seed or scenario.config.get("simulation", {}).get("seed"),
        created_at=now,
    )
    db.add(run)
    project.status = "running"
    project.updated_at = now
    db.commit()
    db.refresh(run)
    return run


def resolve_scenario(
    db: Session, project: Project, scenario_id: Optional[UUID]
) -> Optional[Scenario]:
    if scenario_id is not None:
        scenario = db.get(Scenario, scenario_id)
        if scenario is None or scenario.project_id != project.id:
            return None
        return scenario

    if project.default_scenario_id is not None:
        scenario = db.get(Scenario, project.default_scenario_id)
        if scenario is not None:
            return scenario

    return db.scalars(
        select(Scenario)
        .where(Scenario.project_id == project.id)
        .order_by(Scenario.is_default.desc(), Scenario.created_at.asc())
        .limit(1)
    ).first()


def run_to_summary(run: Run) -> dict:
    return {
        "id": run.id,
        "name": run.name,
        "status": run.status,
        "created_at": run.created_at,
        "scenario_id": run.scenario_id,
    }
