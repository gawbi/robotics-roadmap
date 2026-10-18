"""gym-aloha AlohaTransferCube-v0 에서 chunk 를 실행하는 rollout 으로 성공률을 재고, 매 step 추론한 chunk 들을 가중 평균하는
temporal ensembling 을 둔다."""

from __future__ import annotations

import numpy as np


class TemporalEnsembler:
    def __init__(self, chunk_size: int, action_dim: int, m: float = 0.01) -> None:
        raise NotImplementedError

    def reset(self) -> None:
        raise NotImplementedError

    def update(self, chunk: np.ndarray) -> np.ndarray:
        """add the chunk predicted at this step and return the ensembled action to execute now."""
        raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
