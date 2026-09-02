from __future__ import annotations

import pytest

from sim.catalog.mesh_factory import build_all_meshes
from sim.catalog.registry import mesh_path_for_product
from sim.classifier.geometry import classify_product
from sim.types import ClassificationRules, Zone

RULES = ClassificationRules(
    size_min_mm=(10, 10, 10),
    size_max_mm=(450, 320, 320),
    circularity_k_threshold=0.8,
)


@pytest.fixture(scope="module", autouse=True)
def _ensure_meshes():
    build_all_meshes()


GOLDEN_CASES = [
    ("box_300", Zone.B),
    ("detergent", Zone.B),
    ("lunchbox", Zone.B),
    ("box_400", Zone.C),
    ("pen", Zone.C),
    ("pouf", Zone.C),
    ("bag", Zone.D),
    ("bottle", Zone.D),
    ("cylinder", Zone.D),
    ("helmet", Zone.D),
    ("plate", Zone.D),
]


@pytest.mark.parametrize("product_id,expected_zone", GOLDEN_CASES)
def test_classifier_golden(product_id: str, expected_zone: Zone) -> None:
    result = classify_product(str(mesh_path_for_product(product_id)), RULES)
    assert result.zone == expected_zone, (
        f"{product_id}: expected {expected_zone}, got {result.zone} "
        f"(reason={result.reason}, obb={result.obb_mm}, k={result.k_max:.3f})"
    )


def test_box_400_size_priority_over_shape() -> None:
    result = classify_product(str(mesh_path_for_product("box_400")), RULES)
    assert result.zone == Zone.C
    assert result.reason == "oversize"
    assert result.k_max > 0.5


def test_pen_flat_pose_stays_c() -> None:
    import numpy as np
    import trimesh.transformations as tf

    pose = tf.rotation_matrix(np.radians(90), [1, 0, 0])
    result = classify_product(
        str(mesh_path_for_product("pen")),
        RULES,
        pose_matrix=pose,
    )
    assert result.zone == Zone.C
    assert min(result.obb_mm) < 10.0
