"""Pendulum-v1 을 64×64 image 로만 관측하게 하는 wrapper 와, 무작위 행동 dataset 수집."""

from __future__ import annotations

import gymnasium as gym
import numpy as np


class PixelPendulum(gym.Wrapper):
    """observation = uint8 image (size, size, 3); true state only in info['state'] for evaluation"""

    def __init__(self, size: int = 64, action_repeat: int = 1):
        raise NotImplementedError


def collect(env: gym.Env, policy, episodes: int) -> dict[str, np.ndarray]:
    """returns obs (N, T+1, 64, 64, 3), act (N, T, 1), rew (N, T)"""
    raise NotImplementedError
