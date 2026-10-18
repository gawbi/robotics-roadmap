"""expert 로 몰면서 (센서, 조향) 쌍을 모아 npz 로 저장한다."""

from __future__ import annotations

import numpy as np


def collect(track_seeds: list[int], steps: int, lookahead: float) -> dict[str, np.ndarray]:
    """expert rollouts -> {'obs': (N, n_rays), 'act': (N, 1), 'offset': (N,)}."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
