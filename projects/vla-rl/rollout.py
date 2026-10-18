"""VLA 를 action chunk 단위로 실행해 episode 하나를 모은다. noise policy 가 있으면 chunk 마다 초기 noise 를 고른다.

VLAPolicy 는 pi0 과제의 Pi0Lite 를 감싸고, 초기 noise 를 정한 chunk 는 pi0 과제의 euler_sample 로 만든다. pi0 과제 폴더를 sys.path 에
더해 import 한다.
"""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path

from typing import TYPE_CHECKING

import torch
import torch.nn as nn

if TYPE_CHECKING:
    from noise_policy import NoisePolicy


sys.path.append(str(Path(__file__).resolve().parents[1] / "pi0"))
from pi0 import Pi0Lite  # pi0 과제의 코드
from flow import euler_sample  # pi0 과제의 코드


@dataclass
class Episode:
    feats: torch.Tensor          # (n_chunks, feat_dim) frozen VLM prefix features
    noises: torch.Tensor         # (n_chunks, chunk_len, act_dim) initial noise used per chunk
    chunks: torch.Tensor         # (n_chunks, chunk_len, act_dim) executed actions
    success: bool


class VLAPolicy(nn.Module):
    """the model from the pi0 project; frozen in the default setup"""
    def __init__(self, model: Pi0Lite) -> None:
        """wraps a Pi0Lite loaded from the SFT checkpoint"""
        raise NotImplementedError

    def prefix_features(self, obs: dict, instruction: str) -> torch.Tensor:
        raise NotImplementedError

    def sample_chunk(self, obs: dict, instruction: str, steps: int,
                     noise: torch.Tensor | None = None) -> torch.Tensor:
        """integrate the flow from `noise` (drawn from N(0, I) if None) to an action chunk"""
        raise NotImplementedError


def rollout(env, vla: VLAPolicy, instruction: str, max_chunks: int, flow_steps: int,
            noise_policy: NoisePolicy | None = None) -> Episode:
    raise NotImplementedError
