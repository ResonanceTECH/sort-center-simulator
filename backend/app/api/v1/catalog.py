from __future__ import annotations

from typing import Any, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.project_service import get_project_or_none
from sim.catalog.registry import get_product, load_catalog, mesh_path_for_product
from sim.classifier.geometry import classify_product
from sim.types import ClassificationRules

router = APIRouter(tags=["catalog"])


class ClassifyPreviewRequest(BaseModel):
    product_id: str
    pose: Optional[dict[str, Any]] = None


class ClassifyPreviewResponse(BaseModel):
    product_id: str
    zone: str
    reason: str
    obb_mm: list[float]
    k_max: float


@router.get("/catalog/products")
def list_catalog_products() -> dict:
    return {"products": load_catalog()}


@router.post(
    "/projects/{project_id}/scenarios/{scenario_id}/classify-preview",
    response_model=ClassifyPreviewResponse,
)
def classify_preview(
    project_id: UUID,
    scenario_id: UUID,
    body: ClassifyPreviewRequest,
    db: Session = Depends(get_db),
) -> ClassifyPreviewResponse:
    from app.models.scenario import Scenario

    project = get_project_or_none(db, project_id)
    if project is None:
        raise HTTPException(status_code=404, detail="Проект не найден")

    scenario = db.get(Scenario, scenario_id)
    if scenario is None or scenario.project_id != project_id:
        raise HTTPException(status_code=404, detail="Сценарий не найден")

    if get_product(body.product_id) is None:
        raise HTTPException(status_code=404, detail="Товар не найден в каталоге")

    rules = ClassificationRules.from_config(scenario.config)
    mesh_path = mesh_path_for_product(body.product_id)

    pose_matrix = None
    if body.pose and "yaw_deg" in body.pose:
        import numpy as np
        import trimesh.transformations as tf

        yaw = np.radians(float(body.pose["yaw_deg"]))
        pose_matrix = tf.rotation_matrix(yaw, [0, 0, 1])

    result = classify_product(str(mesh_path), rules, pose_matrix=pose_matrix)
    return ClassifyPreviewResponse(
        product_id=body.product_id,
        zone=result.zone.value,
        reason=result.reason,
        obb_mm=list(result.obb_mm),
        k_max=result.k_max,
    )
