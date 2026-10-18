"""torchvision resnet18 의 state_dict 를 내 ResNet 으로 옮겨 넣는다."""

from __future__ import annotations

import torch

from resnet import ResNet


def load_torchvision_weights(model: ResNet, state_dict: dict[str, torch.Tensor]) -> None:
    """copy every tensor. raise if a key is left over or a shape differs."""
    raise NotImplementedError
