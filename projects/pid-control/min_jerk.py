"""출발과 도착에서 속도·가속도가 0 인 minimum-jerk trajectory."""

from __future__ import annotations


def min_jerk(t: float, q0: float, qf: float, T: float) -> tuple[float, float, float]:
    """returns (q_d, qd_d, qdd_d) at time t. holds qf for t > T."""
    raise NotImplementedError
