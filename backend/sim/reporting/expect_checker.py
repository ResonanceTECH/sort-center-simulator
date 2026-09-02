from __future__ import annotations

from typing import Any


def check_expect(expect: dict[str, Any], metrics: dict[str, Any]) -> tuple[bool, list[str]]:
    if not expect:
        return True, []

    failures: list[str] = []

    success_rate = metrics.get("success_rate", 0.0)
    if "success_rate_min" in expect and success_rate < float(expect["success_rate_min"]):
        failures.append(
            f"success_rate {success_rate} < min {expect['success_rate_min']}"
        )
    if "success_rate_max" in expect and success_rate > float(expect["success_rate_max"]):
        failures.append(
            f"success_rate {success_rate} > max {expect['success_rate_max']}"
        )

    by_zone = metrics.get("by_zone", {})
    for zone, bounds in expect.get("by_zone", {}).items():
        count = by_zone.get(zone, 0)
        if "min" in bounds and count < int(bounds["min"]):
            failures.append(f"zone {zone}: {count} < min {bounds['min']}")
        if "max" in bounds and count > int(bounds["max"]):
            failures.append(f"zone {zone}: {count} > max {bounds['max']}")

    metric_failures = metrics.get("failures", {})
    for reason, max_allowed in expect.get("max_failures", {}).items():
        count = metric_failures.get(reason, 0)
        if count > int(max_allowed):
            failures.append(f"failures.{reason}: {count} > max {max_allowed}")

    return len(failures) == 0, failures
