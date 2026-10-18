"""critic → actor → temperature → soft target 순서로 update 하는 SAC 의 학습 루프. Pendulum-v1 과 HalfCheetah-v4 를 푼다."""

from __future__ import annotations

import torch.nn as nn

from nets import SquashedGaussianActor


def soft_update(target: nn.Module, source: nn.Module, tau: float) -> None:
    raise NotImplementedError


def train_sac(env_id: str = "Pendulum-v1", total_steps: int = 50_000, seed: int = 0
              ) -> SquashedGaussianActor:
    raise NotImplementedError


if __name__ == "__main__":
    train_sac()
