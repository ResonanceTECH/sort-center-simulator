from __future__ import annotations

from typing import Any, Generic, Optional, TypeVar, Union

from pydantic import BaseModel, ConfigDict, Field

T = TypeVar("T")


class PaginationOut(BaseModel):
    page: int
    page_size: int
    total: int
    pages: int


class PaginatedOut(BaseModel, Generic[T]):
    items: list[T]
    pagination: PaginationOut


class MetricOut(BaseModel):
    label: str
    value: Union[float, str, int]
    unit: Optional[str] = None
    status: Optional[str] = None
    delta: Optional[float] = None
    delta_unit: Optional[str] = None
    reason: Optional[str] = None


class ShipmentSummaryOut(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    supplier_id: str = Field(alias="supplierId")
    supplier_name: str = Field(alias="supplierName")
    carrier_id: Optional[str] = Field(default=None, alias="carrierId")
    carrier_name: Optional[str] = Field(default=None, alias="carrierName")
    origin: str
    destination: str
    status: str
    pickup_at: Optional[str] = Field(default=None, alias="pickupAt")
    planned_eta: Optional[str] = Field(default=None, alias="plannedEta")
    forecast_eta: Optional[str] = Field(default=None, alias="forecastEta")
    deviation_minutes: int = Field(alias="deviationMinutes")
    sla_risk: MetricOut = Field(alias="slaRisk")


class ShipmentDetailOut(ShipmentSummaryOut):
    order_id: Optional[str] = Field(default=None, alias="orderId")
    skus: list[dict[str, Any]]
    exceptions: list[dict[str, Any]]
    incidents: list[dict[str, Any]]
    timeline: list[dict[str, Any]]
    available_actions: list[str] = Field(alias="availableActions")


class ControlTowerOut(BaseModel):
    otif: float
    active_shipments: int = Field(alias="activeShipments")
    at_risk: int = Field(alias="atRisk")
    delayed: int = Field(alias="delayed")
    stockout_risk: float = Field(alias="stockoutRisk")
    average_delay_minutes: float = Field(alias="averageDelayMinutes")
    requires_attention: list[dict[str, Any]] = Field(alias="requiresAttention")
    insights: list[dict[str, Any]]


class ErrorOut(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)
