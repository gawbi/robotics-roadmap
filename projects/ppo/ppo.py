"""clipped surrogate·value loss·entropy bonus 를 합친 PPO loss 와, rollout → GAE → minibatch epoch 를 되풀이하는 학습 루프."""

from __future__ import annotations

from collections.abc import Callable
from typing import TYPE_CHECKING

import torch
import torch.nn as nn

from ppo_config import PPOConfig

if TYPE_CHECKING:
    import gymnasium as gym


def ppo_loss(agent: nn.Module, mb: dict[str, torch.Tensor], cfg: PPOConfig
             ) -> tuple[torch.Tensor, dict[str, float]]:
    """returns (total loss, stats such as approx_kl, clipfrac, entropy, value_loss)"""
    raise NotImplementedError


def train(cfg: PPOConfig, make_env: Callable[[int], Callable[[], gym.Env]] | None = None,
          async_envs: bool = False) -> nn.Module:
    """make_env(i) returns the constructor of env i (None builds cfg.env_id envs).
    async_envs=True steps the envs with AsyncVectorEnv, one process per env; otherwise SyncVectorEnv."""
    raise NotImplementedError


if __name__ == "__main__":
    train(PPOConfig())
