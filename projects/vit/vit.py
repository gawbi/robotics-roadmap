"""이미지를 patch token 으로 바꾸는 patchify·PatchEmbed, pre-norm EncoderBlock, 그것으로 조립하는 ViT.
EncoderBlock 의 attention 은 transformer 과제의 attention.py 를 불러 쓴다."""

from __future__ import annotations

import sys
from pathlib import Path

import torch
from torch import nn

sys.path.append(str(Path(__file__).resolve().parents[1] / "transformer"))
from attention import MultiHeadAttention  # transformer 과제의 코드


def patchify(x: torch.Tensor, patch: int) -> torch.Tensor:
    """(N, C, H, W) -> (N, (H // patch) * (W // patch), C * patch * patch)"""
    raise NotImplementedError


class PatchEmbed(nn.Module):
    def __init__(self, img_size: int, patch: int, in_ch: int, dim: int):
        raise NotImplementedError

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """(N, C, H, W) -> (N, num_patches, dim)"""
        raise NotImplementedError


class EncoderBlock(nn.Module):
    """pre-norm: x = x + MSA(LN(x)), then x = x + MLP(LN(x))"""

    def __init__(self, dim: int, heads: int, mlp_dim: int, eps: float = 1e-6):
        raise NotImplementedError

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        raise NotImplementedError


class ViT(nn.Module):
    def __init__(self, img_size: int = 224, patch: int = 16, dim: int = 768, depth: int = 12,
                 heads: int = 12, mlp_dim: int = 3072, num_classes: int = 1000):
        raise NotImplementedError

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """(N, 3, img_size, img_size) -> logits (N, num_classes)"""
        raise NotImplementedError
