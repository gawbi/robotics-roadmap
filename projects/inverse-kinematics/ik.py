"""pose 오차와 damped least squares IK, random restart. SO(3) log 는 transforms 과제의 so3.log_so3 를 쓴다.

q 는 jacobian.movable_joints(robot) 순서의 (n,) 배열이다.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

from jacobian import geometric_jacobian, movable_joints

sys.path.append(str(Path(__file__).resolve().parents[1] / "forward-kinematics"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "transforms"))
from fk import forward_kinematics  # forward-kinematics 과제의 코드
from so3 import log_so3  # transforms 과제의 코드
from urdf import Robot  # forward-kinematics 과제의 코드


def pose_error(T: np.ndarray, T_d: np.ndarray) -> np.ndarray:
    """(6,) = (p_d - p, log(R_d R^T)), both expressed in the world frame."""
    raise NotImplementedError


def ik_dls(robot: Robot, T_d: np.ndarray, q0: np.ndarray, ee_link: str,
           lam: float = 0.05, max_iters: int = 200, position_only: bool = False,
           tol_pos: float = 1e-3, tol_rot: float = np.deg2rad(1.0)
           ) -> tuple[np.ndarray, bool, int]:
    """q0 and the returned q are (n,) in movable_joints(robot) order. returns (q, converged, iterations). q stays inside
    joint limits."""
    raise NotImplementedError


def solve_with_restarts(robot: Robot, T_d: np.ndarray, ee_link: str, n_restarts: int = 10,
                        seed: int = 0, **kw) -> tuple[np.ndarray, bool]:
    """returns (q, converged), q in movable_joints(robot) order."""
    raise NotImplementedError
