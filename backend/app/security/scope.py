"""Object-level scope for multi-tenant + portal (supplier/carrier) access.

Shipments are owned by the CUSTOMER organization (`shipment.organization_id`).
Portal partners are linked via Supplier.linked_org_id / Carrier.linked_org_id.
Scope is enforced on the backend — never trust frontend filters.
"""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.core.enums import OrganizationType
from app.core.errors import NotFoundError
from app.models.master_data import Carrier, Supplier
from app.models.shipment import Shipment
from app.security.context import AuthContext


def resolve_linked_partner_ids(
    db: Session,
    *,
    organization_id: UUID,
    organization_type: str | None,
) -> tuple[UUID | None, UUID | None]:
    """Return (linked_supplier_id, linked_carrier_id) for the authenticated org."""
    if organization_type == OrganizationType.SUPPLIER.value:
        supplier = db.scalars(
            select(Supplier).where(Supplier.linked_org_id == organization_id)
        ).first()
        return (supplier.id if supplier else None, None)

    if organization_type == OrganizationType.CARRIER.value:
        carrier = db.scalars(
            select(Carrier).where(Carrier.linked_org_id == organization_id)
        ).first()
        return (None, carrier.id if carrier else None)

    return (None, None)


def apply_shipment_scope(stmt: Select, ctx: AuthContext) -> Select:
    """Restrict shipment queries to records visible to the auth context."""
    if ctx.linked_supplier_id is not None:
        return stmt.where(Shipment.supplier_id == ctx.linked_supplier_id)
    if ctx.linked_carrier_id is not None:
        return stmt.where(Shipment.carrier_id == ctx.linked_carrier_id)
    return stmt.where(Shipment.organization_id == ctx.organization_id)


def shipment_in_scope(shipment: Shipment, ctx: AuthContext) -> bool:
    if ctx.linked_supplier_id is not None:
        return shipment.supplier_id == ctx.linked_supplier_id
    if ctx.linked_carrier_id is not None:
        return shipment.carrier_id == ctx.linked_carrier_id
    return shipment.organization_id == ctx.organization_id


def assert_shipment_scope(shipment: Shipment | None, ctx: AuthContext) -> Shipment:
    """404 for missing or out-of-scope (no existence leak across partners)."""
    if shipment is None or not shipment_in_scope(shipment, ctx):
        raise NotFoundError("SHIPMENT_NOT_FOUND", "Shipment not found")
    return shipment


def apply_exception_scope(stmt: Select, ctx: AuthContext) -> Select:
    from app.models.exception_models import ScmException

    if ctx.linked_supplier_id is not None:
        return stmt.where(ScmException.supplier_id == ctx.linked_supplier_id)
    if ctx.linked_carrier_id is not None:
        return stmt.where(ScmException.carrier_id == ctx.linked_carrier_id)
    return stmt.where(ScmException.organization_id == ctx.organization_id)
