"""rollout 끝에서부터 거꾸로 훑으며 GAE advantage 와 value target 인 return 을 계산한다."""

from __future__ import annotations

import torch


def compute_gae(rewards: torch.Tensor, values: torch.Tensor, dones: torch.Tensor,
                next_value: torch.Tensor, next_done: torch.Tensor, gamma: float, lam: float
                ) -> tuple[torch.Tensor, torch.Tensor]:
    """inputs are (T, N) except next_*: (N,); returns (advantages, returns), both (T, N)"""
    raise NotImplementedError
