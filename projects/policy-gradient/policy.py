"""state 를 받아 action 의 Categorical 분포를 내는 policy network 와, state 의 value 를 내는 baseline network."""

from __future__ import annotations

import torch
import torch.nn as nn


class CategoricalPolicy(nn.Module):
    def __init__(self, obs_dim: int, n_actions: int, hidden: int = 64):
        raise NotImplementedError

    def dist(self, obs: torch.Tensor) -> torch.distributions.Categorical:
        raise NotImplementedError


class ValueNet(nn.Module):
    def __init__(self, obs_dim: int, hidden: int = 64):
        raise NotImplementedError

    def forward(self, obs: torch.Tensor) -> torch.Tensor:   # (B,)
        raise NotImplementedError
