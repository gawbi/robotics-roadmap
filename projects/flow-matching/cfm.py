"""noise 와 데이터를 잇는 직선 경로, flow matching loss, Euler·Heun sampler, 그림용 궤적."""

from __future__ import annotations

import torch
from torch import nn


def interpolate(x0: torch.Tensor, x1: torch.Tensor, t: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
    """x0: noise, x1: data, t: (N,) in [0, 1]. returns (x_t, target velocity).
    convention: t = 0 is noise, t = 1 is data."""
    raise NotImplementedError


def fm_loss(model: nn.Module, x1: torch.Tensor) -> torch.Tensor:
    raise NotImplementedError


@torch.no_grad()
def euler_sample(model: nn.Module, x0: torch.Tensor, steps: int) -> torch.Tensor:
    raise NotImplementedError


@torch.no_grad()
def heun_sample(model: nn.Module, x0: torch.Tensor, steps: int) -> torch.Tensor:
    raise NotImplementedError


@torch.no_grad()
def trajectory(model: nn.Module, x0: torch.Tensor, steps: int) -> torch.Tensor:
    """(steps + 1, N, D), for plotting"""
    raise NotImplementedError
