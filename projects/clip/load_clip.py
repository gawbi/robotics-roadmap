"""OpenAI CLIP ViT-B/32 의 state_dict 를 내 CLIP 으로 옮겨 넣는다."""

from __future__ import annotations

import torch

from clip_model import CLIP


def load_openai_clip(model: CLIP, state_dict: dict[str, torch.Tensor]) -> None:
    """copy every tensor. raise if a key is left over or a shape differs."""
    raise NotImplementedError
