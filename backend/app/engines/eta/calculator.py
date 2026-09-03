from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone

from app.core.enums import RiskStatus


def calculate_eta(
    *,
    planned_delivery_at: datetime | None,
    deviation_minutes: int = 0,
    remaining_distance_km: float | None = None,
    current_speed_kmh: float | None = None,
    stop_duration_minutes: float = 0,
) -> tuple[datetime | None, int]:
    """MVP ETA engine — remaining distance / speed + delay buffer."""
    if planned_delivery_at is None:
        return None, 0

    base = planned_delivery_at
    if remaining_distance_km is not None and current_speed_kmh and current_speed_kmh > 5:
        travel_hours = remaining_distance_km / current_speed_kmh
        now = datetime.now(timezone.utc)
        base = now + timedelta(hours=travel_hours)

    adjusted = base + timedelta(minutes=deviation_minutes + stop_duration_minutes)
    delta = int((adjusted - planned_delivery_at).total_seconds() / 60)
    return adjusted, delta


def calculate_risk(
    *,
    deviation_minutes: int,
    sla_risk_base: float = 0.0,
    stop_duration_minutes: float = 0,
    carrier_otif: float | None = None,
) -> dict:
    """MVP risk engine."""
    probability = sla_risk_base
    factors: list[str] = []

    if deviation_minutes > 60:
        probability += min(0.4, deviation_minutes / 500)
        factors.append("ETA deviation")
    if stop_duration_minutes > 90:
        probability += 0.25
        factors.append("Long stop")
    if carrier_otif is not None and carrier_otif < 0.85:
        probability += 0.1
        factors.append("Low carrier OTIF")

    probability = min(0.99, max(0.0, probability))
    status = _risk_status(probability)
    return {"probability": round(probability, 4), "status": status.value, "factors": factors}


def _risk_status(probability: float) -> RiskStatus:
    if probability >= 0.8:
        return RiskStatus.CRITICAL
    if probability >= 0.6:
        return RiskStatus.HIGH
    if probability >= 0.35:
        return RiskStatus.MEDIUM
    return RiskStatus.LOW


def calculate_otif(on_time_count: int, in_full_count: int, total: int) -> float:
    if total == 0:
        return 0.0
    return round(min(on_time_count, in_full_count) / total, 4)


def calculate_stockout_probability(
    current_stock: float,
    incoming: float,
    safety_stock: float,
    daily_demand: float,
) -> float:
    projected = current_stock + incoming
    if daily_demand <= 0:
        return 0.0
    days = projected / daily_demand
    if days >= 14:
        return 0.05
    if projected <= safety_stock:
        return min(0.99, 1 - projected / max(safety_stock, 1))
    return max(0.0, 0.3 - days * 0.02)


def calculate_impact(
    *,
    affected_quantity: float,
    current_stock: float,
    safety_stock: float,
    incoming: float,
    daily_demand: float,
) -> dict:
    stockout_prob = calculate_stockout_probability(
        current_stock - affected_quantity,
        incoming,
        safety_stock,
        daily_demand,
    )
    projected = max(0, current_stock - affected_quantity + incoming)
    impact_status = RiskStatus.CRITICAL if stockout_prob > 0.7 else (
        RiskStatus.HIGH if stockout_prob > 0.4 else RiskStatus.MEDIUM
    )
    return {
        "projected_stock": projected,
        "safety_stock": safety_stock,
        "stockout_probability": round(stockout_prob, 4),
        "impact_status": impact_status.value,
    }


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * r * math.asin(math.sqrt(a))
