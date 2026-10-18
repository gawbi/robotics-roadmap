"""freeze 한 SmolVLM 에 이미지·지시문을 넣어 고른 층의 hidden state 를 prefix feature 로 뽑는다. 같은 관측이면 캐시해 둔다."""

from __future__ import annotations

import torch
from PIL import Image
from torch import nn


class FrozenPrefix(nn.Module):
    def __init__(self, vlm_name: str = "HuggingFaceTB/SmolVLM-256M-Instruct", layer: int = -1) -> None:
        """loads the VLM in bf16 with requires_grad=False everywhere."""
        raise NotImplementedError

    @torch.no_grad()
    def forward(self, images: list[list[Image.Image]], instructions: list[str]) -> tuple[torch.Tensor, torch.Tensor]:
        """returns (prefix (B, L, d_vlm), prefix_pad_mask (B, L)) taken from hidden_states[layer]."""
        raise NotImplementedError
