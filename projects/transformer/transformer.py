"""sinusoidal positional encoding, encoder·decoder layer, 이 둘을 N 층씩 쌓은 encoder-decoder Transformer."""

from __future__ import annotations

import torch
from torch import Tensor, nn

from attention import MultiHeadAttention


class PositionalEncoding(nn.Module):
    def __init__(self, d_model: int, max_len: int = 512):
        raise NotImplementedError

    def forward(self, x: Tensor) -> Tensor:
        """x (B, T, d_model) -> x + PE[:T], same shape."""
        raise NotImplementedError


class EncoderLayer(nn.Module):
    def __init__(self, d_model: int, n_heads: int, d_ff: int):
        raise NotImplementedError

    def forward(self, x: Tensor, src_mask: Tensor | None = None) -> Tensor:
        """x (B, T_src, d_model) -> same shape. self-attention then FFN, each with residual and LayerNorm."""
        raise NotImplementedError


class DecoderLayer(nn.Module):
    def __init__(self, d_model: int, n_heads: int, d_ff: int):
        raise NotImplementedError

    def forward(self, y: Tensor, memory: Tensor, tgt_mask: Tensor | None = None,
                src_mask: Tensor | None = None) -> Tensor:
        """y (B, T_tgt, d_model), memory (B, T_src, d_model) -> (B, T_tgt, d_model).
        masked self-attention, cross-attention to memory, then FFN."""
        raise NotImplementedError


class Seq2SeqTransformer(nn.Module):
    def __init__(self, vocab: int, pad_id: int, bos_id: int, eos_id: int, d_model: int = 64,
                 n_heads: int = 4, n_layers: int = 2, d_ff: int = 256):
        raise NotImplementedError

    def forward(self, src: Tensor, tgt_in: Tensor) -> Tensor:
        """returns logits (B, T_tgt, vocab)."""
        raise NotImplementedError

    @torch.no_grad()
    def greedy_decode(self, src: Tensor, max_len: int) -> Tensor:
        raise NotImplementedError
