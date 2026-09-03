from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from app.core.database import SessionLocal
from app.models.scenario_models import ScenarioResult, ScenarioRun
from app.workers.celery_app import celery_app


@celery_app.task(name="run_scenario_task", bind=True)
def run_scenario_task(self, run_id: str) -> dict:
    db = SessionLocal()
    try:
        run = db.get(ScenarioRun, UUID(run_id))
        if run is None:
            return {"error": "run not found"}
        run.status = "RUNNING"
        run.progress = 10
        run.stage = "LOADING_BASE_PLAN"
        db.commit()

        for progress, stage in [(40, "CALCULATING_SUPPLY"), (67, "OPTIMIZING_TRANSPORT_CAPACITY"), (90, "FINALIZING")]:
            run.progress = progress
            run.stage = stage
            db.commit()

        result = ScenarioResult(
            run_id=run.id,
            service_level=0.93,
            otif=0.91,
            logistics_cost=12_900_000,
            average_lead_time_hours=72,
            stockout_risk=0.09,
            risk_status="LOW",
            semantic_status="BEST",
        )
        db.add(result)
        run.status = "COMPLETED"
        run.progress = 100
        run.completed_at = datetime.now(timezone.utc)
        scenario = run.scenario
        if scenario is not None:
            scenario.status = "COMPLETED"
        db.commit()
        return {"run_id": run_id, "status": "COMPLETED"}
    finally:
        db.close()


@celery_app.task(name="run_forecast_task")
def run_forecast_task(run_id: str) -> dict:
    db = SessionLocal()
    try:
        from app.models.planning import ForecastRun
        run = db.get(ForecastRun, UUID(run_id))
        if run is None:
            return {"error": "not found"}
        run.status = "RUNNING"
        run.progress = 50
        db.commit()
        run.status = "COMPLETED"
        run.progress = 100
        run.completed_at = datetime.now(timezone.utc)
        db.commit()
        return {"run_id": run_id, "status": "COMPLETED"}
    finally:
        db.close()
