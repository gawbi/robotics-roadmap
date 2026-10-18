"""torchvision vit_b_16 의 state_dict 를 내 ViT 로 옮겨 넣는다."""

from __future__ import annotations

import torch

from vit import ViT


def load_torchvision_vit(model: ViT, state_dict: dict[str, torch.Tensor]) -> None:
    """raise if a key is left over or a shape differs."""
    raise NotImplementedError
