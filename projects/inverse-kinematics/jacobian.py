"""내 FK 위에서 계산하는 geometric Jacobian 과, joint 값 배열 q 의 칸 순서를 정하는 movable_joints.

q 는 movable_joints(robot) 순서로 movable joint(fixed 제외) 의 값을 담은 (n,) 배열이다. root 에서 tree 를 따라 내려가며
만나는 순서라서 URDF 파일에 적힌 순서와 다를 수 있고, SO-101 에서는 shoulder_pan, shoulder_lift, elbow_flex, wrist_flex,
wrist_roll, gripper 로 pinocchio 의 model.names[1:]·MuJoCo 모델의 qpos 순서와 같다. FK 에 넘길 dict 는
dict(zip(movable_joints(robot), q)) 로 만든다.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

sys.path.append(str(Path(__file__).resolve().parents[1] / "forward-kinematics"))
from fk import forward_kinematics  # forward-kinematics 과제의 코드
from urdf import Robot  # forward-kinematics 과제의 코드


def movable_joints(robot: Robot) -> list[str]:
    """names of the non-fixed joints in root-to-tip tree order. entry i of q is the value of joint i."""
    raise NotImplementedError


def geometric_jacobian(robot: Robot, q: np.ndarray, ee_link: str) -> np.ndarray:
    """(6, n) Jacobian at the ee_link origin, world-aligned. rows are (linear, angular), column i is joint i of
    movable_joints(robot)."""
    raise NotImplementedError
