"""waypoint 마다 IK 로 joint angle 을 구하고, minimum-jerk trajectory 로 이어 따라가며 gripper 를 여닫는다.

IK 는 inverse-kinematics 과제의 ik.py, minimum-jerk 는 pid-control 과제의 min_jerk.py, joint 추종은 mujoco-sim 과제의
reach.py 를 쓴다. 각 과제 폴더를 sys.path 에 더해 import 한다.
"""

from __future__ import annotations

import sys
from pathlib import Path

import mujoco
import numpy as np

sys.path.append(str(Path(__file__).resolve().parents[1] / "inverse-kinematics"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "forward-kinematics"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "pid-control"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "mujoco-sim"))
from ik import solve_with_restarts  # inverse-kinematics 과제의 코드
from min_jerk import min_jerk  # pid-control 과제의 코드
from reach import track  # mujoco-sim 과제의 코드
from urdf import parse_urdf  # forward-kinematics 과제의 코드


def execute_waypoints(model: mujoco.MjModel, data: mujoco.MjData,
                      waypoints: list[tuple[str, np.ndarray, float]]) -> None:
    """plan_waypoints 의 결과를 순서대로 실행한다. 실패하면 어느 waypoint 에서 무엇이 틀렸는지 담은 예외를 낸다."""
    raise NotImplementedError
