from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Optional

from app.models.run import Run


def _artifacts_dir(run: Run) -> Optional[Path]:
    if not run.artifacts_path:
        return None
    path = Path(run.artifacts_path)
    return path if path.exists() else None


def read_events(run: Run) -> list[dict[str, Any]]:
    directory = _artifacts_dir(run)
    if directory is None:
        return []
    events_file = directory / "events.jsonl"
    if not events_file.exists():
        return []
    events: list[dict[str, Any]] = []
    for line in events_file.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if line:
            events.append(json.loads(line))
    return events


def read_trace(run: Run) -> Optional[dict[str, Any]]:
    directory = _artifacts_dir(run)
    if directory is None:
        return None
    trace_file = directory / "trace.json"
    if not trace_file.exists():
        return None
    return json.loads(trace_file.read_text(encoding="utf-8"))


def read_metrics(run: Run) -> Optional[dict[str, Any]]:
    if run.result and "metrics" in run.result:
        return run.result["metrics"]
    directory = _artifacts_dir(run)
    if directory is None:
        return None
    summary_file = directory / "summary.json"
    if not summary_file.exists():
        return None
    summary = json.loads(summary_file.read_text(encoding="utf-8"))
    return summary.get("metrics")
