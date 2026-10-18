"""생성 샘플과 실제 샘플이 같은 분포에서 나왔는지 재는 RBF kernel MMD."""

from __future__ import annotations

import torch


def mmd_rbf(x: torch.Tensor, y: torch.Tensor, bandwidth: float | None = None) -> torch.Tensor:
    """bandwidth None -> median heuristic"""
    raise NotImplementedError
