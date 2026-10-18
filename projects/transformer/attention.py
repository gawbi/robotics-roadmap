"""scaled dot-product attention, multi-head attention, decoder 가 뒤쪽 token 을 보지 못하게 하는 causal mask."""

from __future__ import annotations

from torch import Tensor, nn


def scaled_dot_product_attention(q: Tensor, k: Tensor, v: Tensor, mask: Tensor | None = None
                                 ) -> tuple[Tensor, Tensor]:
    """q (..., Tq, d), k and v (..., Tk, d). mask True = blocked. returns (output, attention weights)."""
    raise NotImplementedError


class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int, n_heads: int):
        raise NotImplementedError

    def forward(self, x_q: Tensor, x_kv: Tensor, mask: Tensor | None = None) -> Tensor:
        raise NotImplementedError


def causal_mask(t: int) -> Tensor:
    """(t, t) bool, True above the diagonal."""
    raise NotImplementedError
