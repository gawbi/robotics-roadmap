"""cube 의 위치·yaw 에서 top-down grasp pose 와 pre-grasp 부터 retreat 까지의 waypoint 를 정한다."""

from __future__ import annotations

import numpy as np

from perception import CubeEstimate


def grasp_pose(cube: CubeEstimate, current_wrist_roll: float) -> np.ndarray:
    """(4, 4) top-down gripper pose in the base frame."""
    raise NotImplementedError


def plan_waypoints(cube: CubeEstimate, place_xy: np.ndarray, current_wrist_roll: float
                   ) -> list[tuple[str, np.ndarray, float]]:
    """[(name, T_base_gripper (4, 4), gripper_command), ...] from pre-grasp to retreat. the grasp yaw comes from
    grasp_pose(cube, current_wrist_roll)."""
    raise NotImplementedError
