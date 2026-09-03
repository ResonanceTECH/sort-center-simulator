from __future__ import annotations

import asyncio
import json
from collections import defaultdict
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["realtime"])

_connections: dict[str, list[WebSocket]] = defaultdict(list)


@router.websocket("/ws/events")
async def websocket_events(websocket: WebSocket, organization_id: str = "default"):
    await websocket.accept()
    _connections[organization_id].append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        _connections[organization_id].remove(websocket)


async def broadcast_event(organization_id: str, event: dict[str, Any]) -> None:
    dead: list[WebSocket] = []
    for ws in _connections.get(organization_id, []):
        try:
            await ws.send_text(json.dumps(event))
        except Exception:
            dead.append(ws)
    for ws in dead:
        _connections[organization_id].remove(ws)
