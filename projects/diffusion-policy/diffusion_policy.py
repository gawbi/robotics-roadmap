"""image encoder, 1D U-Net, DDPM scheduler 를 묶은 DiffusionPolicy. 학습 loss 와 denoising sampling 을 둔다.

scheduler 는 ddpm 과제에서 짠 것을 action sequence 모양에 맞춰 쓴다.
"""

from __future__ import annotations

import sys
from pathlib import Path

import torch
from torch import nn

sys.path.append(str(Path(__file__).resolve().parents[1] / "ddpm"))
from ddpm import p_sample, q_sample  # ddpm 과제의 코드
from noise_schedule import NoiseSchedule, make_betas  # ddpm 과제의 코드
from unet1d import ConditionalUnet1D


class DiffusionPolicy(nn.Module):
    def __init__(self, encoder: nn.Module, unet: ConditionalUnet1D, scheduler: NoiseSchedule,
                 n_obs_steps: int = 2, horizon: int = 16, n_action_steps: int = 8) -> None:
        raise NotImplementedError

    def compute_loss(self, batch: dict[str, torch.Tensor]) -> torch.Tensor:
        raise NotImplementedError

    @torch.no_grad()
    def sample(self, obs: dict[str, torch.Tensor], num_steps: int = 100) -> torch.Tensor:
        """returns (B, horizon, action_dim) in env units."""
        raise NotImplementedError
