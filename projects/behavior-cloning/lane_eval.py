"""validation loss 와 학습에 안 쓴 track 에서의 rollout 이탈률을 함께 재고, lateral offset 그림을 results/ 에 저장한다.

rollout·departure_rate 는 조향을 내는 controller 를 받는다. controller 는 (sensor, env) 를 받아 조향각을 돌려주는 함수라서,
sensor 만 보는 BC policy 와 env.state·env.track 을 보는 pure pursuit expert 를 같은 함수로 잰다.
"""

from __future__ import annotations

from typing import Callable

import numpy as np

from lane_env import LaneEnv

Controller = Callable[[np.ndarray, LaneEnv], float]
"""(sensor, env) -> steer."""


def rollout(env: LaneEnv, controller: Controller, steps: int) -> dict[str, np.ndarray | int]:
    """returns {'offset': (T,), 'steer': (T,), 'departed_at': step index or -1}."""
    raise NotImplementedError


def departure_rate(controller: Controller, track_seeds: list[int], steps: int, steer_noise: float) -> float:
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
