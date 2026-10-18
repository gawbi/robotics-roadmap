"""PPO 의 hyperparameter. 기본값은 CartPole-v1 용이다."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class PPOConfig:
    env_id: str = "CartPole-v1"
    num_envs: int = 4
    num_steps: int = 128            # rollout length per env
    total_steps: int = 500_000
    gamma: float = 0.99
    gae_lambda: float = 0.95
    clip_eps: float = 0.2
    update_epochs: int = 4
    num_minibatches: int = 4
    lr: float = 2.5e-4
    ent_coef: float = 0.01
    vf_coef: float = 0.5
    max_grad_norm: float = 0.5
    seed: int = 0
