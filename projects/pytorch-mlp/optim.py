"""torch.optim 없이 짜는 momentum SGD 와 Adam. torch.optim 과 같은 update 식을 따른다."""

from __future__ import annotations

from collections.abc import Iterable

import torch
from torch import nn


class SGD:
    def __init__(self, params: Iterable[nn.Parameter], lr: float, momentum: float = 0.0):
        raise NotImplementedError

    def zero_grad(self) -> None:
        raise NotImplementedError

    @torch.no_grad()
    def step(self) -> None:
        raise NotImplementedError


class Adam:
    def __init__(self, params: Iterable[nn.Parameter], lr: float = 1e-3,
                 betas: tuple[float, float] = (0.9, 0.999), eps: float = 1e-8):
        raise NotImplementedError

    def zero_grad(self) -> None:
        raise NotImplementedError

    @torch.no_grad()
    def step(self) -> None:
        raise NotImplementedError
