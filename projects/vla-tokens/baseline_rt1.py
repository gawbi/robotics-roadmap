"""비교용 baseline. rt1 과제의 mini RT-1 에 clip 과제의 text encoder 로 만든 지시문 embedding 을 FiLM 으로 넣는다.

mini RT-1 과 text encoder 는 rt1·clip 과제 폴더를 sys.path 에 더해 import 한다.
"""

from __future__ import annotations

import sys
from pathlib import Path

import torch
from torch import nn

sys.path.append(str(Path(__file__).resolve().parents[1] / "rt1"))
sys.path.append(str(Path(__file__).resolve().parents[1] / "clip"))
from rt1 import MiniRT1  # rt1 과제의 코드
from text_encoder import TextEncoder  # clip 과제의 코드


class FiLM(nn.Module):
    def __init__(self, d_text: int, n_channels: int) -> None:
        """text embedding (B, d_text) 에서 channel 마다 scale γ 와 shift β 를 만드는 linear layer 를 둔다."""
        raise NotImplementedError

    def forward(self, x: torch.Tensor, text_emb: torch.Tensor) -> torch.Tensor:
        """x (B, C, H, W) -> γ ⊙ x + β, same shape."""
        raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
