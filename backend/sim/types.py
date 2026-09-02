from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Literal


class Zone(str, Enum):
    B = "B"
    C = "C"
    D = "D"


@dataclass(frozen=True)
class ClassificationRules:
    size_min_mm: tuple[float, float, float]
    size_max_mm: tuple[float, float, float]
    circularity_k_threshold: float = 0.8

    @classmethod
    def from_config(cls, config: dict[str, Any]) -> ClassificationRules:
        raw = config.get("classification", config)
        return cls(
            size_min_mm=tuple(raw["size_min_mm"]),
            size_max_mm=tuple(raw["size_max_mm"]),
            circularity_k_threshold=float(raw.get("circularity_k_threshold", 0.8)),
        )

    def fits_bbox(self, extents_mm: tuple[float, float, float]) -> bool:
        sorted_extents = sorted(extents_mm)
        sorted_min = sorted(self.size_min_mm)
        sorted_max = sorted(self.size_max_mm)
        for value, lo, hi in zip(sorted_extents, sorted_min, sorted_max):
            if value < lo or value > hi:
                return False
        return True


@dataclass(frozen=True)
class ClassificationResult:
    zone: Zone
    reason: Literal["ok", "oversize", "undersize", "circular_cross_section"]
    obb_mm: tuple[float, float, float]
    k_max: float
    debug: dict[str, Any] = field(default_factory=dict)
