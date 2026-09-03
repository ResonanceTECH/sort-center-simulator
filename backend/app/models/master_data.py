from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class NetworkNode(Base):
    __tablename__ = "network_nodes"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    latitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    longitude: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class NetworkConnection(Base):
    __tablename__ = "network_connections"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    source_node_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("network_nodes.id"))
    target_node_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("network_nodes.id"))
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    planned_lead_time_minutes: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    linked_org_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE")
    region: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    product_group: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    otif: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    average_lead_time_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    incident_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    supply_share: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)


class Carrier(Base):
    __tablename__ = "carriers"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    linked_org_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("organizations.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE")
    otif: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    eta_accuracy: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    average_delay_minutes: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    transit_time_hours: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    incident_rate: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    shipment_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    risk_score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    risk_status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)


class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    node_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("network_nodes.id"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="ACTIVE")
    capacity: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    sku: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    product_group: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)


class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    organization_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id"), index=True)
    sku_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"), index=True)
    warehouse_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("warehouses.id"), index=True)
    current_stock: Mapped[float] = mapped_column(Float, default=0)
    incoming: Mapped[float] = mapped_column(Float, default=0)
    safety_stock: Mapped[float] = mapped_column(Float, default=0)
    days_of_supply: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    stockout_probability: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
