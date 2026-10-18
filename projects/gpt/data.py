"""Tiny Shakespeare 의 글자 vocabulary 와, 무작위 위치에서 잘라 만드는 (x, y) batch."""

from __future__ import annotations

from torch import Tensor


def build_vocab(text: str) -> tuple[dict[str, int], list[str]]:
    """returns (stoi: char -> id, itos: id -> char). ids follow sorted(set(text))."""
    raise NotImplementedError


def get_batch(data: Tensor, block_size: int, batch_size: int, device: str
              ) -> tuple[Tensor, Tensor]:
    """x, y both (batch_size, block_size); y is x shifted left by one."""
    raise NotImplementedError
