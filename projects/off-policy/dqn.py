"""replay buffer 와 target network 를 갖춘 DQN 의 loss 와 학습 루프. CartPole-v1 을 푼다."""

from __future__ import annotations

import torch

from buffer import Batch
from nets import QNetwork


def dqn_loss(q: QNetwork, q_target: QNetwork, batch: Batch, gamma: float) -> torch.Tensor:
    raise NotImplementedError


def train_dqn(env_id: str = "CartPole-v1", total_steps: int = 500_000, seed: int = 0) -> QNetwork:
    raise NotImplementedError


if __name__ == "__main__":
    train_dqn()
