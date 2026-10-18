"""byte-level BPE 의 학습(train_bpe)과 그 결과로 text 와 token id 를 오가는 Tokenizer."""

from __future__ import annotations

import regex as re

GPT2_PAT = r"""'(?:[sdmt]|ll|ve|re)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+"""


def get_pair_counts(ids: list[int], counts: dict[tuple[int, int], int] | None = None
                    ) -> dict[tuple[int, int], int]:
    raise NotImplementedError


def merge(ids: list[int], pair: tuple[int, int], new_id: int) -> list[int]:
    raise NotImplementedError


def train_bpe(text: str, vocab_size: int, special_tokens: list[str] | None = None
              ) -> tuple[dict[int, bytes], list[tuple[bytes, bytes]]]:
    """returns (vocab: id -> bytes, merges in creation order). same shape as CS336 run_train_bpe."""
    raise NotImplementedError


class Tokenizer:
    def __init__(self, vocab: dict[int, bytes], merges: list[tuple[bytes, bytes]],
                 special_tokens: list[str] | None = None):
        raise NotImplementedError

    def encode(self, text: str) -> list[int]:
        raise NotImplementedError

    def decode(self, ids: list[int]) -> str:
        raise NotImplementedError
