"""quaternion 과 rotation matrix 의 변환, quaternion 곱, slerp. quaternion 은 (w, x, y, z) 순서다."""

from __future__ import annotations

import numpy as np


def quat_from_matrix(R: np.ndarray) -> np.ndarray:
    raise NotImplementedError


def matrix_from_quat(q: np.ndarray) -> np.ndarray:
    raise NotImplementedError


def quat_mul(q1: np.ndarray, q2: np.ndarray) -> np.ndarray:
    raise NotImplementedError


def slerp(q0: np.ndarray, q1: np.ndarray, t: float) -> np.ndarray:
    raise NotImplementedError
