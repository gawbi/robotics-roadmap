"""[CLS] token·관절 위치·action sequence 를 Transformer encoder 에 넣어 style 변수 z 의 평균과 log 분산을 내는 CVAE encoder."""

from __future__ import annotations

import sys
from pathlib import Path

import torch
from torch import nn

sys.path.append(str(Path(__file__).resolve().parents[1] / "transformer"))
from transformer import EncoderLayer  # transformer 과제의 코드


class StyleEncoder(nn.Module):
    def __init__(self, action_dim: int = 14, state_dim: int = 14, d_model: int = 512,
                 n_layers: int = 4, latent_dim: int = 32) -> None:
        raise NotImplementedError

    def forward(self, state: torch.Tensor, actions: torch.Tensor, pad_mask: torch.Tensor
                ) -> tuple[torch.Tensor, torch.Tensor]:
        """state: (B, 14), actions: (B, k, 14), pad_mask: (B, k) -> (mu, logvar), each (B, latent_dim)."""
        raise NotImplementedError
