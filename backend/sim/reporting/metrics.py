from __future__ import annotations

from typing import Any

from sim.physics.discrete_backend import SimEvent


def aggregate_metrics(events: list[SimEvent]) -> dict[str, Any]:
    classified = [e for e in events if e.phase == "classify"]
    done = [e for e in events if e.phase == "done"]
    failed = [e for e in events if e.phase == "failed"]

    by_zone = {"B": 0, "C": 0, "D": 0, "failed": len(failed)}
    failures: dict[str, int] = {}

    for event in done:
        zone = event.payload.get("zone", "B")
        if zone in by_zone:
            by_zone[zone] += 1

    for event in failed:
        reason = event.payload.get("reason", "unknown")
        failures[reason] = failures.get(reason, 0) + 1

    total = len(classified)
    success = len(done)
    success_rate = success / total if total else 0.0

    return {
        "total_items": total,
        "processed": total,
        "success_count": success,
        "success_rate": round(success_rate, 4),
        "by_zone": by_zone,
        "avg_cycle_sec": 8.0,
        "failures": failures,
    }
