from __future__ import annotations

import numpy as np
import trimesh
from shapely import minimum_bounding_radius
from shapely.geometry import Point
from shapely.ops import polylabel, unary_union


def _section_polygon(mesh: trimesh.Trimesh, plane_origin, plane_normal):
    section = mesh.section(plane_origin=plane_origin, plane_normal=plane_normal)
    if section is None:
        return None
    path_2d, _ = section.to_2D()
    if path_2d is None or len(path_2d.entities) == 0:
        return None
    polygons = path_2d.polygons_full
    if not polygons:
        return None
    return unary_union(polygons)


def _k_for_polygon(polygon) -> float:
    if polygon is None or polygon.is_empty:
        return 0.0

    try:
        circum_r = float(minimum_bounding_radius(polygon))
    except Exception:
        circum_r = 0.0

    if circum_r <= 1e-9:
        return 0.0

    try:
        pole = polylabel(polygon, tolerance=0.5)
        inscribed_r = float(pole.distance(polygon.boundary))
    except Exception:
        inscribed_r = 0.0

    if inscribed_r <= 1e-9:
        return 0.0

    return inscribed_r / circum_r


def compute_k_max(mesh: trimesh.Trimesh) -> tuple[float, list[float]]:
    obb = mesh.bounding_box_oriented
    transform = obb.primitive.transform
    axes = transform[:3, :3]
    center = transform[:3, 3]
    k_values: list[float] = []

    for axis_index in range(3):
        normal = axes[:, axis_index]
        origin = center
        polygon = _section_polygon(mesh, origin, normal)
        k_values.append(_k_for_polygon(polygon))

    return max(k_values) if k_values else 0.0, k_values
