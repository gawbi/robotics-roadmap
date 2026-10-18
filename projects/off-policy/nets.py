"""DQN 의 Q-network, SAC 의 twin critic 과 tanh-squashed Gaussian actor."""

from __future__ import annotations

import numpy as np
import torch
import torch.nn as nn


class QNetwork(nn.Module):
    """DQN: obs -> one Q value per discrete action"""

    def __init__(self, obs_dim: int, n_actions: int, hidden: int = 128):
        raise NotImplementedError

    def forward(self, obs: torch.Tensor) -> torch.Tensor:
        raise NotImplementedError


class TwinCritic(nn.Module):
    """SAC: (obs, act) -> (q1, q2)"""

    def __init__(self, obs_dim: int, act_dim: int, hidden: int = 256):
        raise NotImplementedError

    def forward(self, obs: torch.Tensor, act: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        raise NotImplementedError


class SquashedGaussianActor(nn.Module):
    def __init__(self, obs_dim: int, act_dim: int, act_low: np.ndarray, act_high: np.ndarray):
        raise NotImplementedError

    def forward(self, obs: torch.Tensor, deterministic: bool = False
                ) -> tuple[torch.Tensor, torch.Tensor]:
        """returns (action scaled to env bounds, log_prob) via the reparameterization trick"""
        raise NotImplementedError
