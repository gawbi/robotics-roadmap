"""센서 값에서 조향을 내는 MLP 와 MSE 로 학습하는 behavior cloning 학습 루프."""

from __future__ import annotations

import numpy as np
import torch
from torch import nn


class BCPolicy(nn.Module):
    def __init__(self, obs_dim: int, hidden: int = 64) -> None:
        raise NotImplementedError

    def forward(self, obs: torch.Tensor) -> torch.Tensor:
        raise NotImplementedError


def train_bc(data: dict[str, np.ndarray], epochs: int = 50, lr: float = 1e-3, seed: int = 0
             ) -> tuple[BCPolicy, dict[str, float]]:
    """returns (policy, {'train_loss': ..., 'val_loss': ...})."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
