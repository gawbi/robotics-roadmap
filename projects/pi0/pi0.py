"""FrozenPrefix 와 ActionExpert 를 묶은 policy. 생성한 chunk 를 queue 에 넣고 앞부분만 실행한 뒤 다시 추론한다.

chunk 실행 방식은 act 과제의 chunk 실행 코드를 참고한다.
"""

from __future__ import annotations

import torch
from PIL import Image
from torch import nn

from action_expert import ActionExpert
from prefix import FrozenPrefix


class Pi0Lite(nn.Module):
    def __init__(self, prefix: FrozenPrefix, expert: ActionExpert, n_action_steps: int,
                 euler_steps: int = 10) -> None:
        """n_action_steps: 생성한 chunk 의 앞에서 몇 개를 실행한 뒤 다시 추론할지. horizon 보다 작은 값이다."""
        raise NotImplementedError

    def reset(self) -> None:
        """episode 사이에 action queue 를 비운다."""
        raise NotImplementedError

    @torch.no_grad()
    def select_action(self, images: list[Image.Image], instruction: str, state: torch.Tensor) -> torch.Tensor:
        """queue 가 비었으면 chunk 를 새로 생성한다. returns the next action (action_dim,)."""
        raise NotImplementedError
