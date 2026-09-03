from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps.scm_auth import require_permission
from app.core.database import get_db
from app.core.errors import NotFoundError
from app.models.master_data import NetworkConnection, NetworkNode
from app.security.context import AuthContext

router = APIRouter(prefix="/network", tags=["network"])


class NodeIn(BaseModel):
    type: str
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    capacity: Optional[int] = None


class ConnectionIn(BaseModel):
    source_node_id: UUID
    target_node_id: UUID
    type: str = "TRANSPORT_LANE"
    planned_lead_time_minutes: Optional[int] = None
    capacity: Optional[int] = None


@router.get("")
def get_network(
    ctx: AuthContext = Depends(require_permission("network.read")),
    db: Session = Depends(get_db),
):
    nodes = db.scalars(select(NetworkNode).where(NetworkNode.organization_id == ctx.organization_id)).all()
    connections = db.scalars(
        select(NetworkConnection).where(NetworkConnection.organization_id == ctx.organization_id)
    ).all()
    return {
        "nodes": [
            {
                "id": str(n.id),
                "type": n.type,
                "name": n.name,
                "latitude": n.latitude,
                "longitude": n.longitude,
                "capacity": n.capacity,
            }
            for n in nodes
        ],
        "connections": [
            {
                "id": str(c.id),
                "source_node_id": str(c.source_node_id),
                "target_node_id": str(c.target_node_id),
                "type": c.type,
                "planned_lead_time_minutes": c.planned_lead_time_minutes,
                "capacity": c.capacity,
            }
            for c in connections
        ],
    }


@router.post("/nodes", status_code=status.HTTP_201_CREATED)
def create_node(
    body: NodeIn,
    ctx: AuthContext = Depends(require_permission("network.create")),
    db: Session = Depends(get_db),
):
    node = NetworkNode(organization_id=ctx.organization_id, **body.model_dump())
    db.add(node)
    db.commit()
    db.refresh(node)
    return {"id": str(node.id)}


@router.post("/connections", status_code=status.HTTP_201_CREATED)
def create_connection(
    body: ConnectionIn,
    ctx: AuthContext = Depends(require_permission("network.create")),
    db: Session = Depends(get_db),
):
    conn = NetworkConnection(organization_id=ctx.organization_id, **body.model_dump())
    db.add(conn)
    db.commit()
    db.refresh(conn)
    return {"id": str(conn.id)}
