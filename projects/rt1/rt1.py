"""ResNet-18 feature map 의 cell 을 token 으로 바꾸는 ImageTokenizer, action 차원마다 256-way head 를 단 MiniRT1, 같은 encoder 에
MSE head 를 단 RegressionPolicy.

ResNet-18 과 Transformer 는 resnet·transformer 과제에서 짠 모듈을 쓴다.
"""

from __future__ import annotations

import sys
from pathlib import Path

import torch
from torch import nn

sys.path.append(str(Path(__file__).resolve().parents[1] / "transformer"))
from transformer import EncoderLayer  # transformer 과제의 코드


class ImageTokenizer(nn.Module):
    def __init__(self, backbone: nn.Module, feat_channels: int, d_model: int) -> None:
        raise NotImplementedError

    def forward(self, images: torch.Tensor) -> torch.Tensor:
        """(B, T_obs, 3, H, W) -> (B, T_obs * h * w, d_model), one token per feature-map cell."""
        raise NotImplementedError


class MiniRT1(nn.Module):
    def __init__(self, tokenizer: ImageTokenizer, d_model: int = 256, n_layers: int = 6,
                 action_dim: int = 2, n_bins: int = 256) -> None:
        raise NotImplementedError

    def forward(self, images: torch.Tensor, agent_pos: torch.Tensor) -> torch.Tensor:
        """returns logits (B, action_dim, n_bins)."""
        raise NotImplementedError

    @torch.no_grad()
    def act(self, images: torch.Tensor, agent_pos: torch.Tensor, sample: bool = False) -> torch.Tensor:
        """argmax (or sampled) bins -> continuous action (B, action_dim)."""
        raise NotImplementedError


class RegressionPolicy(nn.Module):
    def __init__(self, tokenizer: ImageTokenizer, d_model: int = 256, n_layers: int = 6, action_dim: int = 2) -> None:
        raise NotImplementedError

    def forward(self, images: torch.Tensor, agent_pos: torch.Tensor) -> torch.Tensor:
        """returns action (B, action_dim)."""
        raise NotImplementedError
