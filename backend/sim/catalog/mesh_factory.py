"""Generate canonical test meshes for classifier golden tests."""

from __future__ import annotations

from pathlib import Path

import numpy as np
import trimesh

CATALOG_DIR = Path(__file__).resolve().parent
MESHES_DIR = CATALOG_DIR / "meshes"


def _save(mesh: trimesh.Trimesh, name: str) -> Path:
    MESHES_DIR.mkdir(parents=True, exist_ok=True)
    path = MESHES_DIR / name
    mesh.export(path)
    return path


def build_all_meshes() -> dict[str, Path]:
    meshes: dict[str, Path] = {}

    meshes["box_300"] = _save(trimesh.creation.box([0.301, 0.201, 0.200]), "box_300.stl")
    meshes["detergent"] = _save(trimesh.creation.box([0.278, 0.260, 0.180]), "detergent.stl")
    meshes["lunchbox"] = _save(trimesh.creation.box([0.201, 0.152, 0.062]), "lunchbox.stl")
    meshes["box_400"] = _save(trimesh.creation.box([0.401, 0.400, 0.301]), "box_400.stl")
    meshes["pen"] = _save(trimesh.creation.box([0.149, 0.013, 0.009]), "pen.stl")
    meshes["pouf"] = _save(trimesh.creation.box([0.489, 0.489, 0.264]), "pouf.stl")

    bag = trimesh.creation.cylinder(radius=0.10, height=0.17, sections=32)
    meshes["bag"] = _save(bag, "bag.stl")

    bottle = trimesh.creation.cylinder(radius=0.045, height=0.305, sections=32)
    meshes["bottle"] = _save(bottle, "bottle.stl")

    cylinder = trimesh.creation.cylinder(radius=0.025, height=0.435, sections=32)
    meshes["cylinder"] = _save(cylinder, "cylinder.stl")

    helmet = trimesh.creation.icosphere(radius=0.15, subdivisions=3)
    helmet.apply_scale([1.0, 1.0, 0.9])
    meshes["helmet"] = _save(helmet, "helmet.stl")

    plate = trimesh.creation.cylinder(radius=0.105, height=0.027, sections=48)
    meshes["plate"] = _save(plate, "plate.stl")

    return meshes


if __name__ == "__main__":
    built = build_all_meshes()
    print(f"Built {len(built)} meshes in {MESHES_DIR}")
