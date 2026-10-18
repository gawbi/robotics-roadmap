"""Hugging Face GPT2LMHeadModel 의 state_dict 를 이름 mapping 으로 내 GPT 에 옮겨 넣는다."""

from __future__ import annotations

from gpt import GPT


def load_hf_gpt2(model: GPT, name: str = "gpt2") -> None:
    """copy GPT2LMHeadModel weights into model, in place."""
    raise NotImplementedError
