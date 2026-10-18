"""nn.Linear 없이 nn.Parameter 로 짜는 Linear layer 와 relu, overflow 하지 않는 softmax cross-entropy."""

from __future__ import annotations

from torch import Tensor, nn


class Linear(nn.Module):
    def __init__(self, n_in: int, n_out: int):
        """weight (n_out, n_in) like nn.Linear, Kaiming normal init, zero bias."""
        raise NotImplementedError

    def forward(self, x: Tensor) -> Tensor:
        raise NotImplementedError


def relu(x: Tensor) -> Tensor:
    """max(0, x), elementwise."""
    raise NotImplementedError


def cross_entropy(logits: Tensor, y: Tensor) -> Tensor:
    """logits (B, C), y (B,) int64 -> mean loss. must stay finite for logits around 1e3."""
    raise NotImplementedError
