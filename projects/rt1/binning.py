"""연속 action 을 차원마다 균등한 n_bins 개 bin 의 번호로 바꾸고, bin 번호를 bin 중심값으로 되돌리는 ActionBinner."""

from __future__ import annotations

import numpy as np
import torch


class ActionBinner:
    def __init__(self, low: np.ndarray, high: np.ndarray, n_bins: int = 256) -> None:
        raise NotImplementedError

    def encode(self, action: torch.Tensor) -> torch.Tensor:
        """(B, D) float -> (B, D) long in [0, n_bins)."""
        raise NotImplementedError

    def decode(self, bins: torch.Tensor) -> torch.Tensor:
        """(B, D) long -> (B, D) bin centers."""
        raise NotImplementedError
