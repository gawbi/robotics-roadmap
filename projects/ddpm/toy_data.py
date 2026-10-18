"""8 gaussians toy 데이터. 반지름 2 인 원 위에 45° 간격으로 놓인 중심 8개에 표준편차 0.1 인 Gaussian 을 둔다."""

from __future__ import annotations

import torch


def eight_gaussians(n: int, generator: torch.Generator | None = None) -> torch.Tensor:
    """(n, 2) points, each from one of the 8 modes chosen uniformly"""
    raise NotImplementedError
