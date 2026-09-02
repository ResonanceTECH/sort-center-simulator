from __future__ import annotations

import json
from pathlib import Path
from typing import Optional

from sim.types import ClassificationRules

CATALOG_DIR = Path(__file__).resolve().parent
PRODUCTS_FILE = CATALOG_DIR / "products.json"
MESHES_DIR = CATALOG_DIR / "meshes"


def load_catalog() -> list[dict]:
    data = json.loads(PRODUCTS_FILE.read_text(encoding="utf-8"))
    return list(data.get("products", []))


def get_product(product_id: str) -> Optional[dict]:
    for product in load_catalog():
        if product["id"] == product_id:
            return product
    return None


def mesh_path_for_product(product_id: str) -> Path:
    product = get_product(product_id)
    if product is None:
        raise KeyError(f"Unknown product: {product_id}")
    return MESHES_DIR / product["mesh_file"]


def default_rules() -> ClassificationRules:
    return ClassificationRules(
        size_min_mm=(10, 10, 10),
        size_max_mm=(450, 320, 320),
        circularity_k_threshold=0.8,
    )
