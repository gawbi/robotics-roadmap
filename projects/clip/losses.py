"""B×B 유사도 행렬 위의 softmax contrastive loss(CLIP)와 쌍마다 독립인 sigmoid loss(SigLIP)."""

from __future__ import annotations

import torch


def clip_loss(img: torch.Tensor, txt: torch.Tensor, logit_scale: torch.Tensor) -> torch.Tensor:
    raise NotImplementedError


def siglip_loss(img: torch.Tensor, txt: torch.Tensor, t: torch.Tensor, b: torch.Tensor) -> torch.Tensor:
    raise NotImplementedError
