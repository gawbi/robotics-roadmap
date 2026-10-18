"""arm 3 개짜리 bandit 에서 softmax policy 의 해석적 gradient 와 REINFORCE 추정을 비교하는 검산."""

from __future__ import annotations

import torch


def analytic_grad(theta: torch.Tensor, q: torch.Tensor) -> torch.Tensor:
    """d/dtheta of sum_a softmax(theta)_a * q_a"""
    raise NotImplementedError


def reinforce_grad(theta: torch.Tensor, q: torch.Tensor, n_samples: int, noise_std: float = 1.0
                   ) -> torch.Tensor:
    """Monte Carlo estimate from sampled arms and noisy rewards"""
    raise NotImplementedError
