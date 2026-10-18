"""decoder-only GPT. causal self-attention, MLP, pre-LN Block 을 쌓고 출력 층을 token embedding 과 묶는다."""

from __future__ import annotations

from dataclasses import dataclass

import torch
from torch import Tensor, nn


@dataclass
class GPTConfig:
    vocab_size: int = 50257
    block_size: int = 1024
    n_layer: int = 12
    n_head: int = 12
    n_embd: int = 768
    dropout: float = 0.0


class CausalSelfAttention(nn.Module):
    def __init__(self, cfg: GPTConfig):
        raise NotImplementedError

    def forward(self, x: Tensor) -> Tensor:
        raise NotImplementedError


class MLP(nn.Module):
    """Linear(n_embd -> 4 n_embd), GELU, Linear(4 n_embd -> n_embd), dropout."""
    def __init__(self, cfg: GPTConfig):
        raise NotImplementedError

    def forward(self, x: Tensor) -> Tensor:
        raise NotImplementedError


class Block(nn.Module):
    """x = x + attn(ln_1(x)); x = x + mlp(ln_2(x))"""
    def __init__(self, cfg: GPTConfig):
        raise NotImplementedError

    def forward(self, x: Tensor) -> Tensor:
        raise NotImplementedError


class GPT(nn.Module):
    def __init__(self, cfg: GPTConfig):
        raise NotImplementedError

    def forward(self, idx: Tensor, targets: Tensor | None = None
                ) -> tuple[Tensor, Tensor | None]:
        """returns (logits (B, T, vocab), mean cross-entropy or None)."""
        raise NotImplementedError

    @torch.no_grad()
    def generate(self, idx: Tensor, max_new_tokens: int, temperature: float = 1.0,
                 top_k: int | None = None) -> Tensor:
        raise NotImplementedError
