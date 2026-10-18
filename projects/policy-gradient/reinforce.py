"""REINFORCE 의 surrogate loss 와 gradient variance 측정. 실행하면 baseline 이 없는 판과 있는 판의 REINFORCE 로 CartPole-v1 을 학습한다."""

from __future__ import annotations

import gymnasium as gym
import torch

from policy import CategoricalPolicy, ValueNet


def pg_loss(policy: CategoricalPolicy, obs: torch.Tensor, act: torch.Tensor,
            weights: torch.Tensor) -> torch.Tensor:
    """surrogate whose gradient equals the policy gradient estimate"""
    raise NotImplementedError


def grad_variance(policy: CategoricalPolicy, env: gym.Env, baseline: ValueNet | None,
                  n_batches: int = 100, episodes_per_batch: int = 10) -> float:
    """total variance of the flattened policy gradient across batches, policy params fixed"""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
