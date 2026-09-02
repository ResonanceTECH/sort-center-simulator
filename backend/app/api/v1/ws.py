from __future__ import annotations

import asyncio
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.database import SessionLocal
from app.models.run import Run
from app.services.artifacts_service import read_trace
from app.services.run_service import execute_run

router = APIRouter(tags=["websocket"])


@router.websocket("/projects/{project_id}/runs/{run_id}/live")
async def run_live_ws(websocket: WebSocket, project_id: str, run_id: str) -> None:
    await websocket.accept()

    db = SessionLocal()
    try:
        run = db.get(Run, UUID(run_id))
        if run is None or str(run.project_id) != project_id:
            await websocket.send_json({"type": "error", "message": "Прогон не найден"})
            return

        if run.status in ("queued", "running"):
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, execute_run, run.id)
            db.refresh(run)

        trace = read_trace(run)
        if trace:
            duration = max(trace.get("meta", {}).get("duration_sec", 1), 0.001)
            for frame in trace.get("frames", []):
                await websocket.send_json(
                    {
                        "type": "frame",
                        "t": frame.get("t"),
                        "progress": min(1.0, frame.get("t", 0) / duration),
                        "frame": frame,
                    }
                )
                await asyncio.sleep(0.02)

        db.refresh(run)
        await websocket.send_json(
            {
                "type": "done",
                "status": run.status,
                "metrics": (run.result or {}).get("metrics"),
            }
        )
    except WebSocketDisconnect:
        pass
    finally:
        db.close()
        try:
            await websocket.close()
        except RuntimeError:
            pass
