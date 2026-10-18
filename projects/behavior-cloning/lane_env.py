"""곡률로 정의한 차선(Track), kinematic bicycle model 로 움직이는 차(LaneEnv), 차 좌표계 ray 거리 센서."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np


@dataclass
class CarState:
    x: float
    y: float
    yaw: float
    v: float


class Track:
    def __init__(self, seed: int, length_m: float = 400.0, lane_half_width: float = 1.75) -> None:
        raise NotImplementedError

    def project(self, x: float, y: float) -> tuple[float, float, float]:
        """closest centerline point -> (s, lateral_offset, centerline_heading)."""
        raise NotImplementedError

    def point_at(self, s: float) -> np.ndarray:
        raise NotImplementedError


class LaneEnv:
    def __init__(self, track: Track, dt: float = 0.05, wheelbase: float = 2.5,
                 max_steer: float = 0.5, n_rays: int = 15, steer_noise: float = 0.0) -> None:
        raise NotImplementedError

    def reset(self, lateral_offset: float = 0.0, yaw_offset: float = 0.0) -> np.ndarray:
        raise NotImplementedError

    def step(self, steer: float) -> tuple[np.ndarray, bool]:
        """returns (sensor, departed). departed = |lateral_offset| > lane_half_width."""
        raise NotImplementedError

    def sensor(self) -> np.ndarray:
        """(n_rays,) distances from the car to the lane boundaries, measured in the car frame."""
        raise NotImplementedError

    @property
    def state(self) -> CarState:
        raise NotImplementedError

    @property
    def track(self) -> Track:
        raise NotImplementedError
