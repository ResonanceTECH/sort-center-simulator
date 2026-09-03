from __future__ import annotations

import json
from typing import Any, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.api.deps.scm_auth import require_any_permission, require_permission
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.models.planning import InventoryPlan, SupplyPlan, TransportPlan
from app.models.scenario_models import Recommendation, ScmScenario, ScenarioParameter, ScenarioResult, ScenarioRun
from app.services.audit_service import log_audit
from app.security.context import AuthContext

router = APIRouter(tags=["planning"])
scenarios_router = APIRouter(prefix="/scenarios", tags=["scenarios"])

BASELINE_METRICS = {
    "otif": 0.92,
    "logistics_cost": 12_400_000.0,
    "average_lead_time_hours": 67.2,
    "stockout_risk": 0.07,
}

DISPLAY_PLACEHOLDER_ENTITY_ID = UUID(int=0)


def _latest_run(db: Session, scenario_id: UUID) -> ScenarioRun | None:
    return db.scalars(
        select(ScenarioRun)
        .where(ScenarioRun.scenario_id == scenario_id)
        .order_by(ScenarioRun.created_at.desc())
    ).first()


def _latest_result(db: Session, scenario_id: UUID) -> ScenarioResult | None:
    run = _latest_run(db, scenario_id)
    if run is None:
        return None
    return db.scalars(select(ScenarioResult).where(ScenarioResult.run_id == run.id)).first()


def _format_parameters(params: list[ScenarioParameter]) -> list[dict[str, str]]:
    return [
        {
            "category": p.category,
            "label": p.parameter,
            "change": p.operation if p.value == 0 else f"{p.operation} {p.value}",
        }
        for p in params
    ]


def _format_cost(value: float | None) -> str:
    if value is None:
        return "—"
    if value >= 1_000_000:
        return f"{value / 1_000_000:.1f}M"
    return f"{value:,.0f}"


def _format_lead_time(hours: float | None) -> str:
    if hours is None:
        return "—"
    return f"{hours / 24:.1f}d"


def _semantic_for_metric(metric: str, baseline: float, scenario: float | None) -> str | None:
    if scenario is None:
        return None
    if metric in {"otif", "service_level"}:
        if scenario >= baseline:
            return "BEST" if scenario > baseline else "TARGET_REACHED"
        return "RISK"
    if metric == "stockout_risk":
        if scenario <= baseline:
            return "TARGET_REACHED" if scenario < baseline else "BEST"
        return "RISK"
    if metric == "logistics_cost":
        return "RISK" if scenario > baseline else "BEST"
    if metric == "average_lead_time_hours":
        return "RISK" if scenario > baseline else "BEST"
    return None


def _scenario_kpis(result: ScenarioResult | None) -> list[dict[str, Any]]:
    baseline_otif = BASELINE_METRICS["otif"] * 100
    baseline_stockout = BASELINE_METRICS["stockout_risk"] * 100
    scenario_otif = (result.otif * 100) if result and result.otif is not None else None
    scenario_stockout = (result.stockout_risk * 100) if result and result.stockout_risk is not None else None
    kpis: list[dict[str, Any]] = [
        {
            "label": "OTIF",
            "baseline": baseline_otif,
            "unit": "%",
            "values": {"baseline": baseline_otif, "scenario": scenario_otif},
            "semantic": {"scenario": _semantic_for_metric("otif", BASELINE_METRICS["otif"], result.otif if result else None)},
        },
        {
            "label": "Риск дефицита",
            "baseline": baseline_stockout,
            "unit": "%",
            "values": {"baseline": baseline_stockout, "scenario": scenario_stockout},
            "semantic": {"scenario": _semantic_for_metric("stockout_risk", BASELINE_METRICS["stockout_risk"], result.stockout_risk if result else None)},
        },
        {
            "label": "Логистические затраты",
            "baseline": _format_cost(BASELINE_METRICS["logistics_cost"]),
            "values": {
                "baseline": _format_cost(BASELINE_METRICS["logistics_cost"]),
                "scenario": _format_cost(result.logistics_cost if result else None),
            },
        },
        {
            "label": "Lead time",
            "baseline": _format_lead_time(BASELINE_METRICS["average_lead_time_hours"]),
            "values": {
                "baseline": _format_lead_time(BASELINE_METRICS["average_lead_time_hours"]),
                "scenario": _format_lead_time(result.average_lead_time_hours if result else None),
            },
            "semantic": {
                "scenario": _semantic_for_metric(
                    "average_lead_time_hours",
                    BASELINE_METRICS["average_lead_time_hours"],
                    result.average_lead_time_hours if result else None,
                )
            },
        },
    ]
    return kpis


def _scenario_summary(db: Session, scenario: ScmScenario) -> dict[str, Any]:
    run = _latest_run(db, scenario.id)
    base_plan = db.get(SupplyPlan, scenario.base_plan_id) if scenario.base_plan_id else None
    result = _latest_result(db, scenario.id)
    return {
        "id": str(scenario.id),
        "name": scenario.name,
        "status": run.status if run and run.status in {"QUEUED", "RUNNING"} else scenario.status,
        "created_by": "System",
        "base_plan": base_plan.name if base_plan else "Supply Plan Q3",
        "created_at": scenario.created_at.isoformat() if scenario.created_at else None,
        "progress": run.progress if run else None,
        "progress_message": run.stage if run else None,
        "recommendation_status": result.semantic_status if result else None,
    }


def _comparison_rows(db: Session, scenario_ids: list[UUID]) -> tuple[list[dict[str, Any]], list[dict[str, str]], UUID | None]:
    scenarios: list[dict[str, str]] = []
    scenario_metrics: dict[str, dict[str, float | None]] = {}
    best_id: UUID | None = scenario_ids[0] if scenario_ids else None
    best_otif = -1.0

    for sid in scenario_ids:
        scenario = db.get(ScmScenario, sid)
        if scenario is None:
            continue
        scenarios.append({"id": str(scenario.id), "name": scenario.name})
        result = _latest_result(db, sid)
        metrics = {
            "otif": result.otif if result else None,
            "logistics_cost": result.logistics_cost if result else None,
            "average_lead_time_hours": result.average_lead_time_hours if result else None,
            "stockout_risk": result.stockout_risk if result else None,
        }
        scenario_metrics[str(scenario.id)] = metrics
        if metrics["otif"] is not None and metrics["otif"] > best_otif:
            best_otif = metrics["otif"]
            best_id = sid

    baseline_display = {
        "otif": f"{BASELINE_METRICS['otif'] * 100:.0f}%",
        "logistics_cost": _format_cost(BASELINE_METRICS["logistics_cost"]),
        "average_lead_time_hours": _format_lead_time(BASELINE_METRICS["average_lead_time_hours"]),
        "stockout_risk": f"{BASELINE_METRICS['stockout_risk'] * 100:.0f}%",
    }

    row_defs = [
        ("OTIF", "otif", lambda v: f"{v * 100:.0f}%" if v is not None else "—", "otif"),
        ("Стоимость", "logistics_cost", _format_cost, "logistics_cost"),
        ("Lead time", "average_lead_time_hours", _format_lead_time, "average_lead_time_hours"),
        ("Риск дефицита", "stockout_risk", lambda v: f"{v * 100:.0f}%" if v is not None else "—", "stockout_risk"),
    ]

    rows: list[dict[str, Any]] = []
    for label, key, fmt, semantic_key in row_defs:
        values: dict[str, str] = {}
        semantic: dict[str, str] = {}
        baseline_raw = BASELINE_METRICS[semantic_key]
        for scenario in scenarios:
            raw = scenario_metrics.get(scenario["id"], {}).get(key)
            values[scenario["id"]] = fmt(raw) if raw is not None else "—"
            sem = _semantic_for_metric(semantic_key, baseline_raw, raw)
            if sem:
                semantic[scenario["id"]] = sem
        rows.append(
            {
                "kpi": label,
                "baseline": baseline_display[key],
                "values": values,
                "semantic": semantic,
            }
        )

    return rows, scenarios, best_id


@router.get("/supply-plans")
def list_supply_plans(ctx: AuthContext = Depends(require_permission("supply_plan.read")), db: Session = Depends(get_db)):
    plans = db.scalars(select(SupplyPlan).where(SupplyPlan.organization_id == ctx.organization_id)).all()
    return [{"id": str(p.id), "name": p.name, "status": p.status, "version": p.version} for p in plans]


@router.get("/inventory-plans")
def list_inventory_plans(ctx: AuthContext = Depends(require_permission("inventory_plan.read")), db: Session = Depends(get_db)):
    plans = db.scalars(select(InventoryPlan).where(InventoryPlan.organization_id == ctx.organization_id)).all()
    return [{"id": str(p.id), "name": p.name, "status": p.status} for p in plans]


@router.get("/transport-plans")
def list_transport_plans(ctx: AuthContext = Depends(require_permission("transport_plan.read")), db: Session = Depends(get_db)):
    plans = db.scalars(select(TransportPlan).where(TransportPlan.organization_id == ctx.organization_id)).all()
    return [{"id": str(p.id), "name": p.name, "status": p.status} for p in plans]


@router.get("/inventory")
def get_inventory(
    warehouse_id: Optional[UUID] = None,
    sku_id: Optional[UUID] = None,
    ctx: AuthContext = Depends(require_permission("warehouse.read")),
    db: Session = Depends(get_db),
):
    from app.models.master_data import Inventory
    stmt = select(Inventory).where(Inventory.organization_id == ctx.organization_id)
    if warehouse_id:
        stmt = stmt.where(Inventory.warehouse_id == warehouse_id)
    if sku_id:
        stmt = stmt.where(Inventory.sku_id == sku_id)
    items = db.scalars(stmt).all()
    return [
        {
            "sku_id": str(i.sku_id),
            "warehouse_id": str(i.warehouse_id),
            "current_stock": i.current_stock,
            "incoming": i.incoming,
            "safety_stock": i.safety_stock,
            "days_of_supply": i.days_of_supply,
            "stockout_probability": i.stockout_probability,
            "status": i.status,
        }
        for i in items
    ]


@router.get("/plans/{plan_id}/plan-fact")
def plan_fact(
    plan_id: UUID,
    ctx: AuthContext = Depends(
        require_any_permission("supply_plan.read", "inventory_plan.read", "transport_plan.read")
    ),
    db: Session = Depends(get_db),
):
    return {
        "otif": {"plan": 0.95, "fact": 0.89, "delta": -0.06},
        "lead_time": {"plan": 16, "fact": 17.7},
    }


class ScenarioChangeIn(BaseModel):
    entity_type: str
    entity_id: UUID
    parameter: str
    operation: str
    value: float


class ScenarioDisplayParamIn(BaseModel):
    category: str
    label: str
    change: str


class CreateScenarioIn(BaseModel):
    name: str
    base_plan_id: Optional[UUID] = None
    changes: list[ScenarioChangeIn] = []
    parameters: list[ScenarioDisplayParamIn] = []


class ComparisonIn(BaseModel):
    scenario_ids: list[UUID]


@scenarios_router.get("")
def list_scenarios(ctx: AuthContext = Depends(require_permission("scenario.read")), db: Session = Depends(get_db)):
    items = db.scalars(
        select(ScmScenario)
        .where(ScmScenario.organization_id == ctx.organization_id)
        .order_by(ScmScenario.created_at.desc())
    ).all()
    return [_scenario_summary(db, s) for s in items]


@scenarios_router.get("/{scenario_id}")
def get_scenario(
    scenario_id: UUID,
    ctx: AuthContext = Depends(require_permission("scenario.read")),
    db: Session = Depends(get_db),
):
    scenario = db.scalars(
        select(ScmScenario)
        .where(ScmScenario.id == scenario_id, ScmScenario.organization_id == ctx.organization_id)
        .options(selectinload(ScmScenario.parameters))
    ).first()
    if scenario is None:
        raise NotFoundError("SCENARIO_NOT_FOUND", "Scenario not found")
    result = _latest_result(db, scenario.id)
    summary = _scenario_summary(db, scenario)
    return {
        **summary,
        "parameters": _format_parameters(scenario.parameters),
        "kpis": _scenario_kpis(result),
        "available_actions": ["RUN", "COMPARE", "CREATE_RECOMMENDATION", "APPLY"] if result else ["RUN", "COMPARE"],
    }


@scenarios_router.post("", status_code=status.HTTP_201_CREATED)
def create_scenario(
    body: CreateScenarioIn,
    ctx: AuthContext = Depends(require_permission("scenario.create")),
    db: Session = Depends(get_db),
):
    scenario = ScmScenario(
        organization_id=ctx.organization_id,
        name=body.name,
        base_plan_id=body.base_plan_id,
    )
    db.add(scenario)
    db.flush()
    for ch in body.changes:
        db.add(ScenarioParameter(
            scenario_id=scenario.id,
            category=ch.entity_type,
            entity_type=ch.entity_type,
            entity_id=ch.entity_id,
            parameter=ch.parameter,
            operation=ch.operation,
            value=ch.value,
        ))
    for param in body.parameters:
        db.add(ScenarioParameter(
            scenario_id=scenario.id,
            category=param.category,
            entity_type=param.category,
            entity_id=DISPLAY_PLACEHOLDER_ENTITY_ID,
            parameter=param.label,
            operation=param.change,
            value=0.0,
        ))
    db.commit()
    db.refresh(scenario)
    return {"id": str(scenario.id), "name": scenario.name, "status": scenario.status}


@scenarios_router.post("/{scenario_id}/runs", status_code=status.HTTP_202_ACCEPTED)
def run_scenario(
    scenario_id: UUID,
    ctx: AuthContext = Depends(require_permission("scenario.run")),
    db: Session = Depends(get_db),
):
    scenario = db.scalars(
        select(ScmScenario).where(ScmScenario.id == scenario_id, ScmScenario.organization_id == ctx.organization_id)
    ).first()
    if scenario is None:
        raise NotFoundError("SCENARIO_NOT_FOUND", "Scenario not found")
    run = ScenarioRun(scenario_id=scenario.id, organization_id=ctx.organization_id, status="QUEUED")
    db.add(run)
    db.commit()
    db.refresh(run)
    try:
        from app.workers.tasks import run_scenario_task
        run_scenario_task.delay(str(run.id))
    except Exception:
        run_scenario_task(str(run.id))
    return {"run_id": str(run.id), "status": "QUEUED"}


@router.get("/scenario-runs/{run_id}")
def get_scenario_run(run_id: UUID, ctx: AuthContext = Depends(require_permission("scenario.read")), db: Session = Depends(get_db)):
    run = db.scalars(
        select(ScenarioRun).where(ScenarioRun.id == run_id, ScenarioRun.organization_id == ctx.organization_id)
    ).first()
    if run is None:
        raise NotFoundError("RUN_NOT_FOUND", "Scenario run not found")
    return {"status": run.status, "progress": run.progress, "stage": run.stage}


@router.get("/scenario-runs/{run_id}/results")
def scenario_results(run_id: UUID, ctx: AuthContext = Depends(require_permission("scenario.read")), db: Session = Depends(get_db)):
    result = db.scalars(select(ScenarioResult).where(ScenarioResult.run_id == run_id)).first()
    if result is None:
        return {"status": "PENDING"}
    return {
        "service_level": result.service_level,
        "otif": result.otif,
        "logistics_cost": result.logistics_cost,
        "average_lead_time_hours": result.average_lead_time_hours,
        "stockout_risk": result.stockout_risk,
        "risk_status": result.risk_status,
    }


@scenarios_router.post("/comparison")
def compare_scenarios(
    body: ComparisonIn,
    ctx: AuthContext = Depends(require_permission("scenario.read")),
    db: Session = Depends(get_db),
):
    owned_ids = db.scalars(
        select(ScmScenario.id).where(
            ScmScenario.organization_id == ctx.organization_id,
            ScmScenario.id.in_(body.scenario_ids),
        )
    ).all()
    rows, scenarios, best_id = _comparison_rows(db, list(owned_ids))
    return {
        "scenarios": scenarios,
        "rows": rows,
        "best_scenario_id": str(best_id) if best_id else None,
    }


@scenarios_router.get("/{scenario_id}/recommendations")
def get_recommendations(
    scenario_id: UUID,
    ctx: AuthContext = Depends(require_permission("scenario.read")),
    db: Session = Depends(get_db),
):
    rec = db.scalars(
        select(Recommendation).where(
            Recommendation.scenario_id == scenario_id,
            Recommendation.organization_id == ctx.organization_id,
        )
    ).first()
    if rec is None:
        return {"recommendation": None}
    effects = json.loads(rec.effects_json) if rec.effects_json else {}
    return {
        "recommendation": {
            "action": rec.action,
            "description": rec.description,
            "effects": effects,
            "semantic_status": rec.semantic_status,
        }
    }


@scenarios_router.post("/{scenario_id}/apply", status_code=status.HTTP_201_CREATED)
def apply_scenario(
    scenario_id: UUID,
    ctx: AuthContext = Depends(require_permission("scenario.apply")),
    db: Session = Depends(get_db),
):
    scenario = db.scalars(
        select(ScmScenario).where(ScmScenario.id == scenario_id, ScmScenario.organization_id == ctx.organization_id)
    ).first()
    if scenario is None:
        raise NotFoundError("SCENARIO_NOT_FOUND", "Scenario not found")
    base = db.get(SupplyPlan, scenario.base_plan_id) if scenario.base_plan_id else None
    new_plan = SupplyPlan(
        organization_id=ctx.organization_id,
        name=f"{scenario.name} (applied)",
        status="REVIEW",
        version=(base.version + 1) if base else 1,
        parent_id=base.id if base else None,
    )
    if base:
        base.status = "SUPERSEDED"
    db.add(new_plan)
    db.flush()
    log_audit(
        db,
        organization_id=ctx.organization_id,
        user_id=ctx.user_id,
        entity_type="SCENARIO",
        entity_id=scenario.id,
        action="SCENARIO_APPLIED",
        before={"plan_id": str(base.id) if base else None, "plan_version": base.version if base else None},
        after={"plan_id": str(new_plan.id), "plan_version": new_plan.version, "status": new_plan.status},
    )
    db.commit()
    return {"plan_id": str(new_plan.id), "version": new_plan.version, "status": new_plan.status}
