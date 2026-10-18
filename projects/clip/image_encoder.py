"""CLIP image encoder(ViT-B/32). ViT 과제의 encoder 에 ln_pre, QuickGELU, 출력 projection(proj)을 더해 만든다."""

from __future__ import annotations

import sys
from pathlib import Path

import torch
from torch import nn

sys.path.append(str(Path(__file__).resolve().parents[1] / "vit"))
from vit import EncoderBlock, PatchEmbed  # vit 과제의 코드


class QuickGELU(nn.Module):
    """x * sigmoid(1.702 * x), the activation the OpenAI weights were trained with"""

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        raise NotImplementedError


class ImageEncoder(nn.Module):
    def __init__(self, img_size: int = 224, patch: int = 32, width: int = 768,
                 layers: int = 12, heads: int = 12, embed_dim: int = 512):
        raise NotImplementedError

    def forward(self, images: torch.Tensor) -> torch.Tensor:
        """(N, 3, 224, 224) -> (N, embed_dim), taken at the [CLS] position"""
        raise NotImplementedError
