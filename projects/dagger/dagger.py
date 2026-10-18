"""DAgger 루프. β 로 expert 와 policy 를 섞어 몰고, 방문한 상태에 expert 라벨을 붙여 dataset 에 합친 뒤 다시 학습한다.

env·expert·BC 학습·이탈률 측정 코드는 behavior-cloning 과제의 것을 import 해서 쓴다.
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import Callable

import numpy as np

sys.path.append(str(Path(__file__).resolve().parents[1] / "behavior-cloning"))
from lane_env import CarState, LaneEnv, Track  # behavior-cloning 과제의 코드
from lane_eval import departure_rate  # behavior-cloning 과제의 코드
from pure_pursuit import pure_pursuit  # behavior-cloning 과제의 코드
from train_bc import BCPolicy, train_bc  # behavior-cloning 과제의 코드


def mixed_action(sensor: np.ndarray, state: CarState, track: Track, policy: BCPolicy,
                 beta: float, rng: np.random.Generator) -> tuple[float, float]:
    """returns (executed_steer, expert_label). the executed steer is the expert's with probability beta."""
    raise NotImplementedError


def collect_on_policy(policy: BCPolicy, beta: float, track_seeds: list[int], steps: int,
                      steer_noise: float, rng: np.random.Generator) -> dict[str, np.ndarray]:
    """mixed-policy rollouts -> {'obs': visited sensors, 'act': expert labels, 'offset': lateral offsets}."""
    raise NotImplementedError


def run_dagger(n_iters: int, episodes_per_iter: int, beta_schedule: Callable[[int], float],
               seed: int) -> list[dict[str, float | np.ndarray]]:
    """per-iteration logs: {'iter', 'n_samples', 'val_loss', 'departure_rate', 'offset'}.
    'offset' holds the lateral offsets of the data collected in that iteration."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
