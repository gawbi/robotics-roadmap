"""linear·cosine noise schedule 과, 그 schedule 에서 미리 계산해 두는 값들(alphas, alphas_cumprod, posterior_variance)."""

from __future__ import annotations

import torch


def make_betas(T: int, kind: str = "linear", beta_start: float = 1e-4, beta_end: float = 0.02) -> torch.Tensor:
    """kind: "linear" or "cosine" (Nichol & Dhariwal 2021, betas capped at 0.999)"""
    raise NotImplementedError


class NoiseSchedule:
    """holds betas, alphas, alphas_cumprod, posterior_variance, each of shape (T,)"""
    def __init__(self, betas: torch.Tensor):
        raise NotImplementedError
