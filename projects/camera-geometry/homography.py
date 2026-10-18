"""평면 위의 점과 pixel 사이의 homography 를 normalized DLT 로 추정한다."""

from __future__ import annotations

import numpy as np


def estimate_homography(src: np.ndarray, dst: np.ndarray) -> np.ndarray:
    """(N, 2) plane points -> (N, 2) pixels. returns (3, 3) with H[2, 2] == 1."""
    raise NotImplementedError
