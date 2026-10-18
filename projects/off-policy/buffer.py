"""transition 을 고정 크기 ring buffer 에 쌓아 두고 무작위 batch 로 꺼내는 replay buffer."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import torch


@dataclass
class Batch:
    obs: torch.Tensor        # (B, obs_dim)
    act: torch.Tensor        # (B,) long for DQN, (B, act_dim) float for SAC
    rew: torch.Tensor        # (B,)
    next_obs: torch.Tensor   # (B, obs_dim)
    done: torch.Tensor       # (B,) 1.0 only when the episode terminated


class ReplayBuffer:
    def __init__(self, capacity: int, obs_dim: int, act_shape: tuple[int, ...], device: str):
        raise NotImplementedError

    def add(self, obs: np.ndarray, act: np.ndarray | int, rew: float, next_obs: np.ndarray,
            terminated: bool) -> None:
        raise NotImplementedError

    def sample(self, batch_size: int) -> Batch:
        raise NotImplementedError
