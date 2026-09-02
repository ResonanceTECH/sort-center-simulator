from __future__ import annotations

import numpy as np
import trimesh


def compute_obb_extents_mm(mesh: trimesh.Trimesh) -> tuple[float, float, float]:
    obb = mesh.bounding_box_oriented
    extents_m = tuple(float(v) for v in obb.primitive.extents)
    extents_mm = tuple(sorted(e * 1000.0 for e in extents_m))
    return extents_mm[0], extents_mm[1], extents_mm[2]
