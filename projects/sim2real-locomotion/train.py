"""ppo 과제의 PPO 로 Ant-v5 를 nominal dynamics 와, 세 wrapper 를 씌운 randomized dynamics 에서 각각 학습한다."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "ppo"))
from ppo_config import PPOConfig  # ppo 과제의 코드
from ppo import train as train_ppo  # ppo 과제의 코드


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
