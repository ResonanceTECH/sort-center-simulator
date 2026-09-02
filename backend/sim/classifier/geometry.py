"""Geometry-based product classifier."""

from __future__ import annotations

from sim.classifier.mesh_loader import load_mesh
from sim.classifier.obb import compute_obb_extents_mm
from sim.classifier.sections import compute_k_max
from sim.types import ClassificationResult, ClassificationRules, Zone


def classify_mesh(
    mesh,
    rules: ClassificationRules,
    *,
    pose_matrix=None,
) -> ClassificationResult:
    if pose_matrix is not None:
        mesh = mesh.copy()
        mesh.apply_transform(pose_matrix)

    obb_mm = compute_obb_extents_mm(mesh)
    k_max, k_debug = compute_k_max(mesh)

    if not rules.fits_bbox(obb_mm):
        reason = "undersize" if min(obb_mm) < min(rules.size_min_mm) else "oversize"
        return ClassificationResult(
            zone=Zone.C,
            reason=reason,
            obb_mm=obb_mm,
            k_max=k_max,
            debug={"k_axes": k_debug},
        )

    if k_max > rules.circularity_k_threshold:
        return ClassificationResult(
            zone=Zone.D,
            reason="circular_cross_section",
            obb_mm=obb_mm,
            k_max=k_max,
            debug={"k_axes": k_debug},
        )

    return ClassificationResult(
        zone=Zone.B,
        reason="ok",
        obb_mm=obb_mm,
        k_max=k_max,
        debug={"k_axes": k_debug},
    )


def classify_product(
    mesh_path: str,
    rules: ClassificationRules,
    *,
    pose_matrix=None,
) -> ClassificationResult:
    mesh = load_mesh(mesh_path)
    return classify_mesh(mesh, rules, pose_matrix=pose_matrix)
