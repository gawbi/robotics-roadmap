"""BatchNorm 을 GroupNorm 으로, global average pooling 을 SpatialSoftmax 로 바꾼 ResNet-18 image encoder.

ResNet-18 은 resnet 과제에서 짠 것을 고쳐 쓴다.
"""

from __future__ import annotations

import sys
from pathlib import Path

import torch
from torch import nn

sys.path.append(str(Path(__file__).resolve().parents[1] / "resnet"))
from resnet import resnet18  # resnet 과제의 코드


class SpatialSoftmax(nn.Module):
    def __init__(self, in_channels: int, num_keypoints: int = 32) -> None:
        raise NotImplementedError

    def forward(self, feat: torch.Tensor) -> torch.Tensor:
        """(B, C, H, W) -> (B, num_keypoints * 2): expected (x, y) of each keypoint's softmax map."""
        raise NotImplementedError


def make_encoder(num_keypoints: int = 32) -> nn.Module:
    """ResNet-18 with every BatchNorm replaced by GroupNorm and global pooling by SpatialSoftmax.
    (B, 3, H, W) -> (B, num_keypoints * 2)."""
    raise NotImplementedError
