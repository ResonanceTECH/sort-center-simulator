"""Default scenario configuration template."""

DEFAULT_SCENARIO_CONFIG: dict = {
    "version": 1,
    "simulation": {
        "dt_sec": 0.05,
        "seed": 42,
        "mode": "analytical",
    },
    "layout": {
        "belt_speed_mps": 1.0,
        "accumulator": {"width_mm": 500, "depth_mm": 700, "height_mm": 700},
        "zones": {
            "B": {"enabled": True, "type": "sorter_feed"},
            "C": {"enabled": True, "type": "oversize_cage"},
            "D": {"enabled": True, "type": "repack_cage"},
        },
        "robot": {"model": "ur10e", "gripper": "vacuum"},
    },
    "catalog": {
        "product_ids": ["box_300", "bottle", "pen", "bag"],
        "spawn_mode": "accumulator",
        "items_per_run": 50,
        "pose_randomization": {
            "xy_shift_mm": [0, 10],
            "yaw_deg": [0, 360],
        },
    },
    "classification": {
        "size_min_mm": [10, 10, 10],
        "size_max_mm": [450, 320, 320],
        "circularity_k_threshold": 0.8,
    },
    "execution": {
        "policy": "scripted",
        "cycle_time_hz": 20,
        "vacuum_force_n": 200,
    },
    "stress": {
        "enabled": False,
        "slip_probability": 0.05,
        "vacuum_weak_probability": 0.1,
        "shift_mm_range": [2, 10],
    },
    "events": [],
    "expect": {
        "success_rate_min": 0.5,
        "by_zone": {
            "B": {"min": 0},
            "C": {"min": 0},
            "D": {"min": 0},
        },
    },
}
