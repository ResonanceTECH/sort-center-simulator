from __future__ import annotations

import json
import random
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Optional

from sim.catalog.registry import mesh_path_for_product
from sim.classifier.geometry import classify_product
from sim.types import ClassificationRules, Zone


@dataclass
class SimEvent:
    t: float
    phase: str
    product_id: str
    payload: dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> dict[str, Any]:
        data = {"t": self.t, "phase": self.phase, "product_id": self.product_id}
        data.update(self.payload)
        return data


@dataclass
class RunOutput:
    metrics: dict[str, Any]
    events: list[SimEvent]
    expect_passed: bool
    expect_failures: list[str]
    seed: int


def _random_pose(rng: random.Random, config: dict) -> Optional[Any]:
    pose_cfg = config.get("catalog", {}).get("pose_randomization", {})
    yaw_range = pose_cfg.get("yaw_deg", [0, 0])
    if yaw_range == [0, 0]:
        return None

    import numpy as np
    import trimesh.transformations as tf

    yaw = rng.uniform(float(yaw_range[0]), float(yaw_range[1]))
    return tf.rotation_matrix(np.radians(yaw), [0, 0, 1])


def run_discrete_simulation(config: dict, *, seed: Optional[int] = None) -> RunOutput:
    from sim.reporting.expect_checker import check_expect
    from sim.reporting.metrics import aggregate_metrics

    rng = random.Random(seed if seed is not None else config.get("simulation", {}).get("seed", 42))
    rules = ClassificationRules.from_config(config)
    catalog = config.get("catalog", {})
    product_ids = list(catalog.get("product_ids", ["box_300", "bottle"]))
    items_count = int(catalog.get("items_per_run", 50))
    dt = float(config.get("simulation", {}).get("dt_sec", 0.05))
    stress = config.get("stress", {})

    events: list[SimEvent] = []
    t = 0.0
    cycle_sec = 1.0 / float(config.get("execution", {}).get("cycle_time_hz", 20))

    for index in range(items_count):
        product_id = product_ids[index % len(product_ids)]
        pose = _random_pose(rng, config)

        t += cycle_sec * 0.2
        events.append(SimEvent(t, "spawn", product_id, {}))

        try:
            result = classify_product(
                str(mesh_path_for_product(product_id)),
                rules,
                pose_matrix=pose,
            )
        except (KeyError, FileNotFoundError):
            t += cycle_sec
            events.append(
                SimEvent(
                    t,
                    "failed",
                    product_id,
                    {"reason": "missing_mesh"},
                )
            )
            continue

        t += cycle_sec * 0.15
        events.append(
            SimEvent(
                t,
                "classify",
                product_id,
                {
                    "zone": result.zone.value,
                    "reason": result.reason,
                    "obb_mm": list(result.obb_mm),
                    "k_max": result.k_max,
                },
            )
        )

        slip = stress.get("enabled") and rng.random() < float(stress.get("slip_probability", 0))
        if slip:
            t += cycle_sec * 0.3
            events.append(SimEvent(t, "failed", product_id, {"reason": "slip"}))
            continue

        t += cycle_sec * 0.35
        events.append(SimEvent(t, "grasp", product_id, {"success": True}))

        t += cycle_sec * 0.15
        events.append(
            SimEvent(
                t,
                "place",
                product_id,
                {"zone": result.zone.value, "success": True},
            )
        )

        t += cycle_sec * 0.05
        events.append(SimEvent(t, "done", product_id, {"zone": result.zone.value}))

    metrics = aggregate_metrics(events)
    expect_passed, expect_failures = check_expect(config.get("expect", {}), metrics)

    return RunOutput(
        metrics=metrics,
        events=events,
        expect_passed=expect_passed,
        expect_failures=expect_failures,
        seed=seed if seed is not None else int(config.get("simulation", {}).get("seed", 42)),
    )


def write_run_artifacts(
    output: RunOutput,
    artifacts_dir: Path,
    config: Optional[dict] = None,
    run_id: Optional[str] = None,
) -> None:
    from sim.reporting.recorder import build_trace

    artifacts_dir.mkdir(parents=True, exist_ok=True)
    events_path = artifacts_dir / "events.jsonl"
    with events_path.open("w", encoding="utf-8") as handle:
        for event in output.events:
            handle.write(json.dumps(event.to_dict(), ensure_ascii=False) + "\n")

    trace = build_trace(output, config or {}, run_id=run_id)
    (artifacts_dir / "trace.json").write_text(
        json.dumps(trace, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    summary_path = artifacts_dir / "summary.json"
    summary_path.write_text(
        json.dumps(
            {
                "metrics": output.metrics,
                "expect_passed": output.expect_passed,
                "expect_failures": output.expect_failures,
                "seed": output.seed,
                "event_count": len(output.events),
            },
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )
