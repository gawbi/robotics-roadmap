"""residual block 과 그것으로 조립하는 ResNet-18, 논문 4.2절의 CIFAR-10 용 망(plain·residual)."""

from __future__ import annotations

import torch
from torch import nn


class BasicBlock(nn.Module):
    def __init__(self, in_ch: int, out_ch: int, stride: int = 1, residual: bool = True):
        raise NotImplementedError

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        raise NotImplementedError


class ResNet(nn.Module):
    def __init__(self, blocks_per_stage: list[int], num_classes: int = 1000):
        raise NotImplementedError

    def forward_features(self, x: torch.Tensor) -> torch.Tensor:
        """(N, 3, 224, 224) -> last stage feature map (N, 512, 7, 7)"""
        raise NotImplementedError

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """(N, 3, 224, 224) -> logits (N, num_classes)"""
        raise NotImplementedError


def resnet18(num_classes: int = 1000) -> ResNet:
    raise NotImplementedError


def cifar_net(depth: int, residual: bool = True) -> nn.Module:
    """paper Sec. 4.2: depth = 6n + 2, three stages of 16 / 32 / 64 channels."""
    raise NotImplementedError
