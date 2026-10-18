"""ArUco marker 의 corner 4개와 크기, K 에서 marker 의 pose 를 구한다."""

from __future__ import annotations

import numpy as np

from camera import Pose


def marker_pose(corners_px: np.ndarray, side: float, K: np.ndarray) -> Pose:
    """corners in OpenCV order (top-left, top-right, bottom-right, bottom-left)."""
    raise NotImplementedError
