from __future__ import annotations

import uuid
from typing import Optional
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ScmScenario(Base):
    __tablename__ = "scm_scenarios"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    base_plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("supply_plans.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="DRAFT")
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    parameters: Mapped[list["ScenarioParameter"]] = relationship(back_populates="scenario")
    runs: Mapped[list["ScenarioRun"]] = relationship(back_populates="scenario")


class ScenarioParameter(Base):
    __tablename__ = "scm_scenario_parameters"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    scenario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scm_scenarios.id"), index=True)
    category: Mapped[str] = mapped_column(String(30), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(Uuid, nullable=False)
    parameter: Mapped[str] = mapped_column(String(80), nullable=False)
    operation: Mapped[str] = mapped_column(String(30), nullable=False)
    value: Mapped[float] = mapped_column(Float, nullable=False)

    scenario: Mapped["ScmScenario"] = relationship(back_populates="parameters")


class ScenarioRun(Base):
    __tablename__ = "scm_scenario_runs"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    scenario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scm_scenarios.id"), index=True)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    status: Mapped[str] = mapped_column(String(30), default="QUEUED")
    progress: Mapped[int] = mapped_column(Integer, default=0)
    stage: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    scenario: Mapped["ScmScenario"] = relationship(back_populates="runs")
    results: Mapped[list["ScenarioResult"]] = relationship(back_populates="run")


class ScenarioResult(Base):
    __tablename__ = "scm_scenario_results"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scm_scenario_runs.id"), index=True)
    service_level: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    otif: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    logistics_cost: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    average_lead_time_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    stockout_risk: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    semantic_status: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)

    run: Mapped["ScenarioRun"] = relationship(back_populates="results")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    scenario_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scm_scenarios.id"), index=True)
    action: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    effects_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    semantic_status: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
