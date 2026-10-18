"""lerobot/libero 의 frame 을 (pixel_values, input_ids, labels) 학습 샘플로 만든다. labels 는 action token 7 개에만 건다."""

from __future__ import annotations

import torch
from PIL import Image


def build_sample(processor, images: list[Image.Image], instruction: str,
                 action_ids: list[int]) -> dict[str, torch.Tensor]:
    """input_ids / attention_mask / pixel_values / labels. labels are -100 everywhere except the 7 action tokens."""
    raise NotImplementedError
