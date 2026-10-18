"""(선택) action expert 의 Euler step 마다 Gaussian noise 를 넣어 denoising 경로의 log-likelihood 를 만들고, 그 값으로 PPO 를 직접 건다."""

from __future__ import annotations

import sys
from pathlib import Path

import torch

from rollout import VLAPolicy

sys.path.append(str(Path(__file__).resolve().parents[1] / "ppo"))
from gae import compute_gae  # ppo 과제의 코드
from ppo import ppo_loss  # ppo 과제의 코드


def denoising_log_prob(vla: VLAPolicy, prefix: torch.Tensor, prefix_pad_mask: torch.Tensor, state: torch.Tensor,
                       path: torch.Tensor, sigmas: torch.Tensor) -> torch.Tensor:
    """(optional) sum of per-step Gaussian log-densities along a noise-injected denoising path.
    prefix (B, L, d_vlm), prefix_pad_mask (B, L), state (B, state_dim): the inputs the chunk was sampled with;
    path (B, K + 1, H, action_dim): a^0 ... a^K; sigmas (K,) -> (B,)."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
