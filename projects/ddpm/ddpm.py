"""forward noising(q_sample), noise 예측 loss(ddpm_loss), reverse 한 step(p_sample)과 x_T 에서 x_0 까지의 sampling loop."""

from __future__ import annotations

import torch
from torch import nn

from noise_schedule import NoiseSchedule


def q_sample(s: NoiseSchedule, x0: torch.Tensor, t: torch.Tensor, noise: torch.Tensor) -> torch.Tensor:
    """t: (N,) int in [0, T), broadcast over the remaining dims of x0"""
    raise NotImplementedError


def ddpm_loss(model: nn.Module, s: NoiseSchedule, x0: torch.Tensor) -> torch.Tensor:
    raise NotImplementedError


@torch.no_grad()
def p_sample(model: nn.Module, s: NoiseSchedule, x_t: torch.Tensor, t: int,
             generator: torch.Generator | None = None) -> torch.Tensor:
    raise NotImplementedError


@torch.no_grad()
def sample(model: nn.Module, s: NoiseSchedule, shape: tuple[int, ...],
           generator: torch.Generator | None = None) -> torch.Tensor:
    raise NotImplementedError
