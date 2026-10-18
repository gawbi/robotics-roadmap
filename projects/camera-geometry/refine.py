"""K, (k1, k2), 사진별 pose 를 한 벡터로 묶어 reprojection error 를 scipy.optimize.least_squares 로 최소화한다.
least_squares 에 넘길 residual 함수도 이 파일에 둔다."""

from __future__ import annotations

import numpy as np

from camera import Pose


def refine(K0: np.ndarray, poses0: list[Pose], board: np.ndarray, corners: list[np.ndarray],
           use_distortion: bool = True) -> tuple[np.ndarray, tuple[float, float], list[Pose], float]:
    """returns (K, (k1, k2), poses, rms_px). use_distortion=False fixes k1 = k2 = 0 and leaves them out of the optimization."""
    raise NotImplementedError
