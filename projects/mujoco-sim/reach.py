"""IK 로 구한 목표 joint angle 까지 minimum-jerk trajectory 로 따라가는 demo. IK 는 inverse-kinematics 과제,
minimum-jerk 는 pid-control 과제의 코드를 sys.path 로 불러 쓴다."""

from __future__ import annotations

import sys
from pathlib import Path

import mujoco
import numpy as np

from mj_control import load, pd_gravity

sys.path.append(str(Path(__file__).resolve().parents[1] / "inverse-kinematics"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "forward-kinematics"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "pid-control"))
from ik import solve_with_restarts  # inverse-kinematics 과제의 코드
from min_jerk import min_jerk  # pid-control 과제의 코드
from urdf import parse_urdf  # forward-kinematics 과제의 코드


def track(model: mujoco.MjModel, data: mujoco.MjData, q_traj: np.ndarray,
          control_dt: float) -> np.ndarray:
    """follows q_traj (T, nu) every control_dt, stepping physics in between. returns logged qpos."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
