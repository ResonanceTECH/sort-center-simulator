from __future__ import annotations

from typing import Any, Optional

from sim.physics.discrete_backend import RunOutput, run_discrete_simulation


class MujocoBackendNotReadyError(NotImplementedError):
    pass


def run_simulation(
    config: dict[str, Any],
    *,
    seed: Optional[int] = None,
    mode: str = "analytical",
) -> RunOutput:
    if mode == "simulation":
        raise MujocoBackendNotReadyError(
            "MuJoCo backend is not implemented yet. Use type='analytical'."
        )
    return run_discrete_simulation(config, seed=seed)
