"""noise 를 예측하는 network. sinusoidal time embedding, 2D toy 용 MLPDenoiser, MNIST 용 작은 conv UNet."""

from __future__ import annotations

import torch
from torch import nn


def timestep_embedding(t: torch.Tensor, dim: int) -> torch.Tensor:
    """(N,) -> (N, dim) sinusoidal features"""
    raise NotImplementedError


class MLPDenoiser(nn.Module):
    def __init__(self, dim: int = 2, hidden: int = 256, time_dim: int = 128):
        raise NotImplementedError

    def forward(self, x: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
        """x (N, dim), t (N,) -> predicted noise (N, dim)"""
        raise NotImplementedError


class UNet(nn.Module):
    def __init__(self, in_ch: int = 1, base: int = 64, time_dim: int = 256):
        raise NotImplementedError

    def forward(self, x: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
        """predicts the noise, same shape as x"""
        raise NotImplementedError
