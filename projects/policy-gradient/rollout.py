"""policy 로 episode 를 모으고 reward-to-go 를 계산한다."""

from __future__ import annotations

import gymnasium as gym
import torch

from policy import CategoricalPolicy


def collect_episodes(env: gym.Env, policy: CategoricalPolicy, n_episodes: int
                     ) -> list[dict[str, torch.Tensor]]:
    """each dict holds obs (T, obs_dim), act (T,), rew (T,), next_obs (T, obs_dim), terminated (T,)"""
    raise NotImplementedError


def reward_to_go(rew: torch.Tensor, gamma: float) -> torch.Tensor:
    raise NotImplementedError
