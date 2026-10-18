"""CLIP text encoder. GPT-2 과제의 decoder 에 causal mask 를 두고, EOT 위치의 출력을 text_projection 으로 옮긴다."""

from __future__ import annotations

import sys
from pathlib import Path

import torch
from torch import nn

sys.path.append(str(Path(__file__).resolve().parents[1] / "gpt"))
from gpt import Block, GPTConfig  # gpt 과제의 코드


class TextEncoder(nn.Module):
    def __init__(self, vocab: int = 49408, context: int = 77, width: int = 512,
                 layers: int = 12, heads: int = 8, embed_dim: int = 512):
        raise NotImplementedError

    def forward(self, tokens: torch.Tensor) -> torch.Tensor:
        """tokens (N, 77) int64 -> (N, embed_dim), taken at the EOT position"""
        raise NotImplementedError
