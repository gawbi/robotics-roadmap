"""state token 과 noisy action token 이 서로 self-attention 하고 prefix 를 cross-attention 으로 보는 action expert."""

from __future__ import annotations

import torch
from torch import nn


class ExpertLayer(nn.Module):
    def __init__(self, d_model: int, n_heads: int) -> None:
        """self-attention, prefix 로의 cross-attention, MLP 를 차례로 두는 층 하나."""
        raise NotImplementedError

    def forward(self, x: torch.Tensor, prefix: torch.Tensor, prefix_pad_mask: torch.Tensor) -> torch.Tensor:
        """x: (B, 1 + H, d_model) state·action token, prefix: (B, L, d_model) -> same shape as x."""
        raise NotImplementedError


class ActionExpert(nn.Module):
    def __init__(self, d_vlm: int, d_model: int = 432, n_layers: int = 8, n_heads: int = 6,
                 horizon: int = 50, action_dim: int = 7, state_dim: int = 8) -> None:
        raise NotImplementedError

    def forward(self, noisy_actions: torch.Tensor, tau: torch.Tensor, state: torch.Tensor,
                prefix: torch.Tensor, prefix_pad_mask: torch.Tensor) -> torch.Tensor:
        """noisy_actions: (B, H, action_dim), tau: (B,), prefix: (B, L, d_vlm) -> velocity (B, H, action_dim).

        prefix 는 첫 층에 들어가기 전에 linear layer 하나로 d_vlm 에서 d_model 로 한 번 투영한다.
        """
        raise NotImplementedError
