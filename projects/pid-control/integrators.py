"""pendulum 상태를 dt 만큼 진행하는 explicit Euler, semi-implicit Euler, RK4 의 한 step."""

from __future__ import annotations

import numpy as np

from pendulum import PendulumParams


def euler_step(x: np.ndarray, tau: float, dt: float, p: PendulumParams) -> np.ndarray:
    raise NotImplementedError


def semi_implicit_step(x: np.ndarray, tau: float, dt: float, p: PendulumParams) -> np.ndarray:
    raise NotImplementedError


def rk4_step(x: np.ndarray, tau: float, dt: float, p: PendulumParams) -> np.ndarray:
    """tau is held constant during the step."""
    raise NotImplementedError
