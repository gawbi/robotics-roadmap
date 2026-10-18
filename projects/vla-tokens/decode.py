"""action token 256 개 밖의 logit 을 모두 막고 7 개 token 을 greedy decode 해 (7,) action 으로 바꾼다."""

from __future__ import annotations

import numpy as np
import torch
from PIL import Image

from action_tokenizer import ActionTokenizer


@torch.no_grad()
def predict_action(model, processor, act_tok: ActionTokenizer,
                   images: list[Image.Image], instruction: str) -> np.ndarray:
    """greedy-decode 7 tokens while masking every logit outside act_tok's 256 ids, then decode to (7,)."""
    raise NotImplementedError
