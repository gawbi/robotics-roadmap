"""실험 설정을 한 곳에 모은다. 다른 파일의 함수는 설정값을 기본값으로 두지 않고, 호출할 때 RLConfig 의 값을 넘겨받는다."""

from __future__ import annotations

import sys
from dataclasses import dataclass, field
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "ppo"))
from ppo_config import PPOConfig  # ppo 과제의 코드


@dataclass
class RLConfig:
    vla_checkpoint: str = ""                 # pi0 과제에서 SFT 한 checkpoint 경로
    suite: str = "libero_object"             # LIBERO suite
    train_task_ids: list[int] = field(default_factory=list)     # SFT 성공률 30–70% 인 task 3–5 개
    heldout_task_ids: list[int] = field(default_factory=list)   # 학습에 쓰지 않고 성공률만 재는 task
    episodes_per_task: int = 20              # 평가할 때 task 마다 돌릴 episode 수
    max_chunks: int = 50                     # episode 하나에서 실행할 action chunk 의 최대 수
    flow_steps: int = 10                     # VLA 의 Euler 적분 step 수
    seed: int = 0
    ppo: PPOConfig = field(default_factory=PPOConfig)   # noise policy 학습에서 ppo_loss 가 읽는 clip·value·entropy 계수
