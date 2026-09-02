from __future__ import annotations

from sim.catalog.mesh_factory import build_all_meshes
from sim.physics.discrete_backend import run_discrete_simulation
from app.schemas.defaults import DEFAULT_SCENARIO_CONFIG

import pytest


@pytest.fixture(scope="module", autouse=True)
def _meshes():
    build_all_meshes()


def test_discrete_run_produces_metrics():
    config = dict(DEFAULT_SCENARIO_CONFIG)
    config["catalog"]["items_per_run"] = 20
    config["catalog"]["product_ids"] = ["box_300", "bottle", "pen", "bag"]

    output = run_discrete_simulation(config, seed=42)
    assert output.metrics["total_items"] == 20
    assert output.metrics["success_rate"] > 0
    assert len(output.events) > 20


def test_deterministic_run():
    config = dict(DEFAULT_SCENARIO_CONFIG)
    config["catalog"]["items_per_run"] = 10
    r1 = run_discrete_simulation(config, seed=99)
    r2 = run_discrete_simulation(config, seed=99)
    assert r1.metrics == r2.metrics
    assert [e.to_dict() for e in r1.events] == [e.to_dict() for e in r2.events]


def test_expect_checker():
    config = dict(DEFAULT_SCENARIO_CONFIG)
    config["catalog"]["items_per_run"] = 10
    config["expect"] = {"success_rate_min": 0.0, "by_zone": {"B": {"min": 0}}}

    output = run_discrete_simulation(config, seed=1)
    assert output.expect_passed is True
