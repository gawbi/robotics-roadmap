"""policy 와 value 를 함께 담은 agent. 이산 action 은 DiscreteAgent, 연속 action 은 GaussianAgent 를 쓴다."""

from __future__ import annotations

import torch
import torch.nn as nn


class DiscreteAgent(nn.Module):
    def __init__(self, obs_dim: int, n_actions: int):
        raise NotImplementedError

    def value(self, obs: torch.Tensor) -> torch.Tensor:
        raise NotImplementedError

    def act(self, obs: torch.Tensor, action: torch.Tensor | None = None
            ) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """returns (action, log_prob, entropy); scores `action` instead of sampling if given"""
        raise NotImplementedError


class GaussianAgent(nn.Module):
    """same value/act interface; log_std is a free nn.Parameter of shape (act_dim,)"""

    def __init__(self, obs_dim: int, act_dim: int):
        raise NotImplementedError

    def value(self, obs: torch.Tensor) -> torch.Tensor:
        raise NotImplementedError

    def act(self, obs: torch.Tensor, action: torch.Tensor | None = None
            ) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        raise NotImplementedError
