"""one-step TD advantage 로 policy 와 value network 를 함께 학습하는 actor-critic."""

from __future__ import annotations

from policy import CategoricalPolicy, ValueNet


def train_actor_critic(env_id: str = "CartPole-v1", episodes: int = 1000, seed: int = 0
                       ) -> tuple[CategoricalPolicy, ValueNet]:
    raise NotImplementedError


if __name__ == "__main__":
    train_actor_critic()
