from __future__ import annotations

from dataclasses import dataclass, field
from uuid import UUID


@dataclass
class AuthContext:
    user_id: UUID
    organization_id: UUID
    roles: list[str]
    permissions: set[str]
    organization_type: str | None = None
    linked_supplier_id: UUID | None = None
    linked_carrier_id: UUID | None = None
    available_workspaces: list[str] = field(default_factory=list)
