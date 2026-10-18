"""10-armed testbed 와 ε-greedy·UCB agent. arm 마다 평균 q*(a) ~ N(0, 1), reward ~ N(q*(a), 1) 이다."""

from __future__ import annotations

import numpy as np


class Testbed:
    def __init__(self, k: int = 10, rng: np.random.Generator | None = None):
        raise NotImplementedError

    def pull(self, a: int) -> float:
        raise NotImplementedError

    @property
    def optimal_action(self) -> int:
        raise NotImplementedError


class EpsilonGreedy:
    def __init__(self, k: int, eps: float):
        raise NotImplementedError

    def act(self) -> int:
        raise NotImplementedError

    def update(self, a: int, r: float) -> None:
        """incremental sample average: Q[a] += (r - Q[a]) / N[a]"""
        raise NotImplementedError


class UCB:
    def __init__(self, k: int, c: float = 2.0):
        raise NotImplementedError

    def act(self) -> int:
        raise NotImplementedError

    def update(self, a: int, r: float) -> None:
        raise NotImplementedError
