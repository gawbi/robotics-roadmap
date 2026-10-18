"""image token·관절 token·z token 을 Transformer encoder 에, 고정 query chunk_size 개를 decoder 에 넣어 action chunk 를 내는
ACTPolicy 와 L1 + β·KL loss."""

from __future__ import annotations

import sys
from pathlib import Path

import torch
from torch import nn

sys.path.append(str(Path(__file__).resolve().parents[1] / "transformer"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "vae"))
from transformer import DecoderLayer, EncoderLayer  # transformer 과제의 코드
from vae import kl_normal  # vae 과제의 코드


class ACTPolicy(nn.Module):
    def __init__(self, chunk_size: int = 100, d_model: int = 512, n_enc_layers: int = 4,
                 n_dec_layers: int = 1, latent_dim: int = 32, action_dim: int = 14) -> None:
        raise NotImplementedError

    def forward(self, images: torch.Tensor, state: torch.Tensor, z: torch.Tensor) -> torch.Tensor:
        """images: (B, n_cam, 3, H, W), state: (B, 14), z: (B, latent_dim) -> actions (B, chunk_size, 14)."""
        raise NotImplementedError


def act_loss(pred: torch.Tensor, target: torch.Tensor, pad_mask: torch.Tensor,
             mu: torch.Tensor, logvar: torch.Tensor, beta: float = 10.0) -> tuple[torch.Tensor, dict[str, float]]:
    """L1 over non-padded steps + beta * KL(q || N(0, I)). returns (loss, {'l1': ..., 'kl': ...})."""
    raise NotImplementedError
