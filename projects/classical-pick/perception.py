"""고정 카메라 영상에서 cube 윗면을 찾아 robot base frame 의 위치와 yaw 로 바꾼다."""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

import numpy as np

sys.path.append(str(Path(__file__).resolve().parents[1] / "camera-geometry"))
from camera import project  # camera-geometry 과제의 코드


@dataclass
class CubeEstimate:
    position: np.ndarray       # (3,) cube center in the robot base frame, meters
    yaw: float                 # radians, defined modulo pi / 2
    pixel: tuple[float, float]


def detect_cube(rgb: np.ndarray, K: np.ndarray, T_bc: np.ndarray, top_z: float) -> CubeEstimate | None:
    """rgb (H, W, 3) uint8 from the fixed camera. T_bc uses the OpenCV camera convention."""
    raise NotImplementedError


def pixel_to_table(pixel: tuple[float, float], K: np.ndarray, T_bc: np.ndarray, top_z: float) -> np.ndarray:
    """pixel (u, v) 를 지나는 카메라 ray 가 base frame 의 평면 z = top_z 와 만나는 점. returns (3,)."""
    raise NotImplementedError
