"""학습한 policy 를 탐색 없이 deterministic 하게 돌려 평균 return 과 표준편차를 낸다."""

from __future__ import annotations


def evaluate(policy_fn, env_id: str, episodes: int = 10, seed: int = 100) -> tuple[float, float]:
    """deterministic rollouts; returns (mean return, std)"""
    raise NotImplementedError
