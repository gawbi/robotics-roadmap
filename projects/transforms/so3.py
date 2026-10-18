"""SO(3) 함수: skew-symmetric 행렬, axis-angle ↔ rotation matrix 의 exp·log, URDF 의 roll-pitch-yaw."""

from __future__ import annotations

import numpy as np


def hat(w: np.ndarray) -> np.ndarray:
    """(3,) -> (3, 3) skew-symmetric matrix with hat(w) @ v == np.cross(w, v)."""
    raise NotImplementedError


def vee(W: np.ndarray) -> np.ndarray:
    raise NotImplementedError


def exp_so3(rotvec: np.ndarray) -> np.ndarray:
    """axis-angle vector (unit axis * angle) -> (3, 3) rotation matrix."""
    raise NotImplementedError


def log_so3(R: np.ndarray) -> np.ndarray:
    """(3, 3) rotation matrix -> axis-angle vector with angle in [0, pi]."""
    raise NotImplementedError


def rpy_to_matrix(roll: float, pitch: float, yaw: float) -> np.ndarray:
    """URDF convention: fixed axes x, then y, then z."""
    raise NotImplementedError
