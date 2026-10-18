"""연속 action 의 차원마다 256 bin 으로 나눈 값과, action bin 으로 다시 쓰는 VLM vocab id 사이를 오간다."""

from __future__ import annotations

from collections.abc import Iterable

import numpy as np


class ActionTokenizer:
    def __init__(self, token_ids: list[int], low: np.ndarray, high: np.ndarray) -> None:
        """token_ids: vocab ids reused as bins, one per bin (256). low/high: per-dim 1st/99th percentile of training actions."""
        raise NotImplementedError

    def encode(self, action: np.ndarray) -> list[int]:
        """(7,) continuous action -> 7 vocab ids (values outside [low, high] are clipped)."""
        raise NotImplementedError

    def decode(self, token_ids: list[int]) -> np.ndarray:
        """7 vocab ids -> (7,) bin centers."""
        raise NotImplementedError


def pick_action_token_ids(tokenizer, corpus: Iterable[str], n: int = 256) -> list[int]:
    """the n rarest ordinary tokens in corpus; special and added tokens are never chosen."""
    raise NotImplementedError
