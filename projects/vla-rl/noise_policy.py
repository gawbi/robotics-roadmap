"""DSRL 식 noise policy. VLA 는 고정하고, flow sampler 의 초기 noise w 를 고르는 작은 Gaussian policy 를 PPO 로 학습한다.

PPO 의 loss 와 GAE 는 ppo 과제의 코드를 sys.path 에 더해 가져다 쓴다.
"""

from __future__ import annotations

import sys
from pathlib import Path

import torch
import torch.nn as nn

sys.path.append(str(Path(__file__).resolve().parents[1] / "ppo"))
from gae import compute_gae  # ppo 과제의 코드
from ppo import ppo_loss  # ppo 과제의 코드


class NoisePolicy(nn.Module):
    """pi^w(w | o): chooses the initial noise for the flow sampler"""
    def __init__(self, feat_dim: int, chunk_len: int, act_dim: int):
        raise NotImplementedError

    def value(self, feat: torch.Tensor) -> torch.Tensor:
        raise NotImplementedError

    def act(self, feat: torch.Tensor, action: torch.Tensor | None = None
            ) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """same interface as the ppo project's GaussianAgent, so ppo_loss takes this policy as is.
        returns (w, log_prob, entropy): w (B, chunk_len, act_dim), log_prob and entropy summed over chunk_len and act_dim."""
        raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
