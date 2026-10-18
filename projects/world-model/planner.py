"""action sequence 를 cross-entropy method 로 최적화하는 cem_plan 과, 매 step 첫 action 만 실행하고 다시 계획하는 MPC 루프."""

from __future__ import annotations

import numpy as np


def cem_plan(score_fn, act_dim: int, horizon: int = 12, candidates: int = 1000, top_k: int = 100,
             iters: int = 10, act_low: float = -2.0, act_high: float = 2.0) -> np.ndarray:
    """score_fn maps (candidates, horizon, act_dim) -> (candidates,) predicted return.
    returns the mean of the final sampling distribution, shape (horizon, act_dim)"""
    raise NotImplementedError
