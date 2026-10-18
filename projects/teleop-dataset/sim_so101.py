"""cube 와 고정 카메라를 더한 SO-101 MuJoCo scene 을 감싼 SimSO101 과, teleop 입력 장치가 따르는 Teleop protocol."""

from __future__ import annotations

from typing import Protocol

import numpy as np

JOINTS = ["shoulder_pan", "shoulder_lift", "elbow_flex", "wrist_flex", "wrist_roll", "gripper"]


class Teleop(Protocol):
    def get_action(self, obs: dict[str, np.ndarray]) -> np.ndarray:
        """(6,) joint position targets in the dataset's units."""
        ...


class SimSO101:
    def __init__(self, xml_path: str, fps: int = 30, cameras: dict[str, str] | None = None):
        """cameras maps dataset names to MJCF camera names, e.g. {"front": "front_cam", "wrist": "wrist_cam"}."""
        raise NotImplementedError

    def reset(self, seed: int) -> dict[str, np.ndarray]:
        raise NotImplementedError

    def step(self, action: np.ndarray) -> dict[str, np.ndarray]:
        """applies one action and advances physics by exactly 1 / fps seconds."""
        raise NotImplementedError

    def observe(self) -> dict[str, np.ndarray]:
        """{"observation.state": (6,), "observation.images.front": (H, W, 3) uint8, ...}"""
        raise NotImplementedError

    def success(self) -> bool:
        raise NotImplementedError
