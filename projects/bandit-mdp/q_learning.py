"""transition 표 없이 GridEnv 와 주고받은 경험만으로 Q 표를 배우는 tabular Q-learning."""

from __future__ import annotations

import numpy as np

from gridworld import GridEnv


def q_learning(env: GridEnv, n_states: int, n_actions: int, episodes: int, alpha: float = 0.1,
               gamma: float = 0.99, eps: float = 0.1, seed: int = 0) -> np.ndarray:
    """returns the Q table, shape (n_states, n_actions)"""
    raise NotImplementedError
