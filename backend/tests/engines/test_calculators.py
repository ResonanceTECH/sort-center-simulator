from __future__ import annotations

import pytest

from app.core.enums import ShipmentStatus
from app.domain.shipments.state_machine import validate_transition
from app.core.errors import AppError
from app.engines.eta.calculator import calculate_eta, calculate_risk, calculate_otif, calculate_stockout_probability


def test_shipment_valid_transition():
    validate_transition(ShipmentStatus.DRAFT, ShipmentStatus.PLANNED)


def test_shipment_invalid_transition():
    with pytest.raises(AppError) as exc:
        validate_transition(ShipmentStatus.DELIVERED, ShipmentStatus.IN_TRANSIT)
    assert exc.value.code == "SHIPMENT_INVALID_STATE"


def test_eta_calculation():
    from datetime import datetime, timezone
    planned = datetime(2026, 9, 2, 14, 0, tzinfo=timezone.utc)
    eta, delta = calculate_eta(planned_delivery_at=planned, deviation_minutes=30)
    assert eta is not None
    assert delta == 30


def test_risk_calculation():
    risk = calculate_risk(deviation_minutes=120, stop_duration_minutes=100)
    assert risk["probability"] >= 0.45
    assert "ETA deviation" in risk["factors"]


def test_otif():
    assert calculate_otif(90, 88, 100) == 0.88


def test_stockout_probability():
    prob = calculate_stockout_probability(1000, 500, 3000, 500)
    assert prob >= 0.5
