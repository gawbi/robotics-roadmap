"""torque 한계와 anti-windup 이 들어간 PID, model 로 계산하는 feedforward torque."""

from __future__ import annotations

from dataclasses import dataclass

from pendulum import PendulumParams


@dataclass
class PID:
    kp: float
    ki: float
    kd: float
    tau_max: float = float("inf")
    anti_windup: bool = True
    integral: float = 0.0

    def __call__(self, e: float, e_dot: float, dt: float, tau_ff: float = 0.0) -> float:
        """returns the PID torque plus tau_ff, clipped to [-tau_max, tau_max]. with anti_windup, the integral does not grow
        while that sum is saturated."""
        raise NotImplementedError


def feedforward(q_d: float, qd_d: float, qdd_d: float, p: PendulumParams,
                gravity_only: bool = False) -> float:
    raise NotImplementedError
