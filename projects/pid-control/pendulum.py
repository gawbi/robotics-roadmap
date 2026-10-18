"""1-DOF pendulum 의 parameter, equation of motion, energy. θ 는 아래로 늘어진 상태에서 잰 각도다."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass
class PendulumParams:
    m: float = 1.0     # kg
    l: float = 0.5     # m
    b: float = 0.1     # N*m*s/rad
    g: float = 9.81


def dynamics(x: np.ndarray, tau: float, p: PendulumParams) -> np.ndarray:
    """x = (theta, theta_dot) -> x_dot."""
    raise NotImplementedError


def energy(x: np.ndarray, p: PendulumParams) -> float:
    raise NotImplementedError
