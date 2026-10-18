"""Zhang 의 closed-form 으로 여러 장의 homography 에서 intrinsic K 를, homography 하나에서 그 사진의 pose 를 꺼낸다."""

from __future__ import annotations

import numpy as np

from camera import Pose


def intrinsics_from_homographies(Hs: list[np.ndarray]) -> np.ndarray:
    """Zhang closed form, needs >= 3 views. returns K (3, 3)."""
    raise NotImplementedError


def extrinsics_from_homography(H: np.ndarray, K: np.ndarray) -> Pose:
    raise NotImplementedError
