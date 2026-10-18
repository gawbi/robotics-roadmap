"""transition 표를 아는 경우의 value iteration 과, 고정된 policy 를 linear system 으로 정확히 평가하는 함수."""

from __future__ import annotations

import numpy as np

from gridworld import Table


def value_iteration(P: Table, n_states: int, n_actions: int, gamma: float = 0.99,
                    tol: float = 1e-8) -> tuple[np.ndarray, np.ndarray]:
    """returns (V, greedy_policy)"""
    raise NotImplementedError


def evaluate_policy_exact(P: Table, policy: np.ndarray, n_states: int, gamma: float) -> np.ndarray:
    """solve V = r_pi + gamma * P_pi V as a linear system"""
    raise NotImplementedError
