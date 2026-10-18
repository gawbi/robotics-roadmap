"""joint 하나의 움직임 변환과, root 에서 tree 를 따라 내려가며 모든 link 의 pose 를 채우는 FK.
revolute joint 의 rotation 은 transforms 과제의 so3.exp_so3 로 만든다."""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

from urdf import Joint, Robot

sys.path.append(str(Path(__file__).resolve().parents[1] / "transforms"))
from so3 import exp_so3  # transforms 과제의 코드


def joint_transform(joint: Joint, q: float) -> np.ndarray:
    """(4, 4) motion of the joint itself for joint value q (identity for fixed joints)."""
    raise NotImplementedError


def forward_kinematics(robot: Robot, q: dict[str, float]) -> dict[str, np.ndarray]:
    """returns {link name: (4, 4) pose in the root frame}. missing joints default to 0."""
    raise NotImplementedError
