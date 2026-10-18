"""MJCF 를 불러오는 load 와, actuator 를 motor 로 바꾼 모델 위의 PD + gravity compensation."""

from __future__ import annotations

import mujoco
import numpy as np


def load(xml_path: str) -> tuple[mujoco.MjModel, mujoco.MjData]:
    raise NotImplementedError


def pd_gravity(model: mujoco.MjModel, data: mujoco.MjData, q_d: np.ndarray,
               kp: np.ndarray, kd: np.ndarray) -> np.ndarray:
    """(nu,) joint torques, clipped to the actuator ctrlrange."""
    raise NotImplementedError
