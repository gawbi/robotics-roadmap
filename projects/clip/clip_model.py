"""image encoder 와 text encoder, 학습되는 logit scale 을 묶은 CLIP."""

from __future__ import annotations

import torch
from torch import nn

from image_encoder import ImageEncoder
from text_encoder import TextEncoder


class CLIP(nn.Module):
    def __init__(self, embed_dim: int = 512) -> None:
        """ImageEncoder and TextEncoder with their ViT-B/32 defaults projecting to embed_dim, and a learned logit_scale."""
        raise NotImplementedError

    def encode_image(self, images: torch.Tensor) -> torch.Tensor:
        """(N, 3, 224, 224) -> (N, 512), not normalized"""
        raise NotImplementedError

    def encode_text(self, tokens: torch.Tensor) -> torch.Tensor:
        """(N, 77) -> (N, 512), not normalized"""
        raise NotImplementedError

    def forward(self, images: torch.Tensor, tokens: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """returns (logits_per_image, logits_per_text), both (N, N)"""
        raise NotImplementedError
