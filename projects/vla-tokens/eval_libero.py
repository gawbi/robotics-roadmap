"""LeRobot 의 LIBERO env 로 suite 의 task 마다 episode 를 돌려 성공률을 잰다. LIBERO 는 Linux 에서만 돈다."""

from __future__ import annotations

from collections.abc import Callable

import numpy as np


def evaluate_suite(policy_fn: Callable[[dict, str], np.ndarray], suite: str = "libero_object",
                   episodes_per_task: int = 10, reset_fn: Callable[[], None] | None = None) -> dict[int, float]:
    """success rate per task id, using lerobot.envs.factory.make_env.
    policy_fn(observation, instruction) returns the next (7,) action; reset_fn, if given, runs before every episode."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
