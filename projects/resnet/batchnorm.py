"""train·eval 에서 nn.BatchNorm2d 와 같은 값을 내고 running 통계를 쌓는 BatchNorm2d."""

from __future__ import annotations

import torch
from torch import nn


class BatchNorm2d(nn.Module):
    def __init__(self, num_features: int, eps: float = 1e-5, momentum: float = 0.1):
        raise NotImplementedError

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """train: normalize with batch stats and update running_mean / running_var. eval: use running stats."""
        raise NotImplementedError
