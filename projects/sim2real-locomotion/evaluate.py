"""학습에 쓰지 않은 질량·마찰·latency 격자의 칸마다 policy 를 돌려 평균 return 과 넘어짐 비율을 잰다."""

from __future__ import annotations

import numpy as np


def evaluate_grid(policy_fn, mass_scales: list[float], friction_scales: list[float],
                  latencies: list[int], episodes: int = 20, seed: int = 0
                  ) -> dict[str, np.ndarray]:
    """returns {'return': ..., 'fall_rate': ...}, each indexed [latency, mass, friction]"""
    raise NotImplementedError
