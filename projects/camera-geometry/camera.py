"""pinhole 투영과 radial distortion. Pose 는 board·marker frame 에서 camera frame 으로 가는 (R, t) 다."""

from __future__ import annotations

import numpy as np

Pose = tuple[np.ndarray, np.ndarray]  # (R (3, 3), t (3,)), board/marker frame -> camera frame


def distort(x: np.ndarray, dist: tuple[float, float]) -> np.ndarray:
    """(N, 2) normalized coordinates -> (N, 2) with radial distortion x * (1 + k1 r^2 + k2 r^4)."""
    raise NotImplementedError


def project(X: np.ndarray, K: np.ndarray, R: np.ndarray, t: np.ndarray,
            dist: tuple[float, float] = (0.0, 0.0)) -> np.ndarray:
    """(N, 3) points -> (N, 2) pixels with radial distortion (k1, k2)."""
    raise NotImplementedError
