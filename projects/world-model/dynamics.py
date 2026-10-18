"""latent 공간의 dynamics·reward model 과, 여러 step 을 open-loop 로 펼친 예측 loss."""

from __future__ import annotations

import torch
import torch.nn as nn


class LatentDynamics(nn.Module):
    def __init__(self, z_dim: int, act_dim: int, hidden: int = 256):
        raise NotImplementedError

    def step(self, z: torch.Tensor, a: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """returns (next z, predicted reward)"""
        raise NotImplementedError

    def rollout(self, z0: torch.Tensor, actions: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """z0 (B, z_dim), actions (B, H, act_dim) -> z (B, H, z_dim), rewards (B, H)"""
        raise NotImplementedError


def multistep_loss(model: LatentDynamics, z: torch.Tensor, a: torch.Tensor, r: torch.Tensor,
                   horizon: int) -> torch.Tensor:
    """open-loop prediction loss over `horizon` steps, starting from encoded z"""
    raise NotImplementedError
