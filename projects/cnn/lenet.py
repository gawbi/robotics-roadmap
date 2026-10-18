"""conv.py 의 conv2d 를 쓰는 Conv2d layer 와 그것으로 조립하는 LeNet-5."""

from __future__ import annotations

import torch
from torch import nn


class Conv2d(nn.Module):
    def __init__(self, in_ch: int, out_ch: int, kernel: int, stride: int = 1, padding: int = 0):
        raise NotImplementedError

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        raise NotImplementedError


class LeNet5(nn.Module):
    """conv 6@5x5 (pad 2) -> pool -> conv 16@5x5 -> pool -> fc 120 -> fc 84 -> fc 10"""

    def __init__(self, num_classes: int = 10):
        raise NotImplementedError

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """(N, 1, 28, 28) -> logits (N, num_classes)"""
        raise NotImplementedError
