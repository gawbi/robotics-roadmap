"""homogeneous transform 의 생성·역변환과 SE(3) 의 exp·log. twist 는 (omega, v) 순서다."""

from __future__ import annotations

import numpy as np


def make_T(R: np.ndarray, p: np.ndarray) -> np.ndarray:
    raise NotImplementedError


def inv_T(T: np.ndarray) -> np.ndarray:
    """inverse without np.linalg.inv."""
    raise NotImplementedError


def exp_se3(xi: np.ndarray) -> np.ndarray:
    raise NotImplementedError


def log_se3(T: np.ndarray) -> np.ndarray:
    raise NotImplementedError
