from __future__ import annotations

from typing import Any, Optional

from sim.physics.discrete_backend import RunOutput, SimEvent


def build_trace(output: RunOutput, config: dict, *, run_id: Optional[str] = None) -> dict[str, Any]:
    dt = float(config.get("simulation", {}).get("dt_sec", 0.05))
    duration = output.events[-1].t if output.events else 0.0

    markers: list[dict[str, Any]] = []
    for event in output.events:
        if event.phase in ("classify", "grasp", "place", "failed", "done"):
            marker = {
                "t": event.t,
                "type": event.phase,
                "product_id": event.product_id,
                **event.payload,
            }
            markers.append(marker)

    frames: list[dict[str, Any]] = []
    active_parcels: dict[str, dict[str, Any]] = {}
    robot_phase = "idle"
    held_product: Optional[str] = None

    for event in output.events:
        if event.phase == "spawn":
            active_parcels[event.product_id] = {
                "id": event.product_id,
                "product_id": event.product_id,
                "x_mm": 200,
                "y_mm": 0,
                "zone": None,
            }
        elif event.phase == "classify":
            zone = event.payload.get("zone")
            if event.product_id in active_parcels:
                active_parcels[event.product_id]["zone"] = zone
            robot_phase = "classify"
        elif event.phase == "grasp":
            robot_phase = "grasp"
            held_product = event.product_id
        elif event.phase == "place":
            robot_phase = "place"
        elif event.phase == "done":
            robot_phase = "idle"
            active_parcels.pop(event.product_id, None)
            held_product = None
        elif event.phase == "failed":
            robot_phase = "failed"
            active_parcels.pop(event.product_id, None)
            held_product = None

        frames.append(
            {
                "t": event.t,
                "belt_running": True,
                "parcels": list(active_parcels.values()),
                "robot": {
                    "phase": robot_phase,
                    "ee_mm": [500, 0, 900],
                    "vacuum_on": robot_phase in ("grasp", "place"),
                    "held_product_id": held_product,
                },
                "alarms": [],
            }
        )

    return {
        "meta": {
            "run_id": run_id,
            "seed": output.seed,
            "dt_sec": dt,
            "duration_sec": duration,
            "event_count": len(output.events),
        },
        "frames": frames,
        "markers": markers,
    }
