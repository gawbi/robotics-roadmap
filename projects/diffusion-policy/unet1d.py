"""시간축 방향 1D convolution U-Net. 관측과 diffusion step 의 조건 벡터를 FiLM 으로 모든 block 에 넣는다."""

from __future__ import annotations

import torch
from torch import nn


class ConditionalResBlock1D(nn.Module):
    def __init__(self, in_ch: int, out_ch: int, cond_dim: int, kernel_size: int = 5, n_groups: int = 8) -> None:
        raise NotImplementedError

    def forward(self, x: torch.Tensor, cond: torch.Tensor) -> torch.Tensor:
        """x: (B, C_in, T), cond: (B, cond_dim) -> (B, C_out, T). FiLM scale/bias come from cond."""
        raise NotImplementedError


class ConditionalUnet1D(nn.Module):
    def __init__(self, action_dim: int, cond_dim: int, down_dims: tuple[int, ...] = (256, 512, 1024)) -> None:
        raise NotImplementedError

    def forward(self, noisy_actions: torch.Tensor, k: torch.Tensor, obs_cond: torch.Tensor) -> torch.Tensor:
        """noisy_actions: (B, T_p, action_dim), k: (B,) -> predicted noise (B, T_p, action_dim)."""
        raise NotImplementedError
