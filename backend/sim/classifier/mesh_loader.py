from __future__ import annotations

from pathlib import Path

import trimesh


def load_mesh(mesh_path: str | Path) -> trimesh.Trimesh:
    path = Path(mesh_path)
    if not path.exists():
        raise FileNotFoundError(f"Mesh not found: {path}")
    loaded = trimesh.load(path, force="mesh")
    if isinstance(loaded, trimesh.Scene):
        loaded = trimesh.util.concatenate(tuple(loaded.geometry.values()))
    if not isinstance(loaded, trimesh.Trimesh):
        raise TypeError(f"Unsupported mesh type: {type(loaded)}")
    return loaded
