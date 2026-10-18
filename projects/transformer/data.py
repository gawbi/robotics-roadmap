"""숫자열 뒤집기 task 의 batch. 0–9 숫자 1–10 개로 된 sequence 와 그 역순을 special token 과 padding 을 붙여 만든다."""

from __future__ import annotations

from torch import Tensor

PAD, BOS, EOS = 10, 11, 12   # digits 0-9 use ids 0-9
VOCAB = 13


def make_batch(batch_size: int, max_len: int = 10) -> tuple[Tensor, Tensor]:
    """src (B, max_len) padded digits; tgt (B, max_len + 2) = <bos> reversed digits <eos>, then padding."""
    raise NotImplementedError
