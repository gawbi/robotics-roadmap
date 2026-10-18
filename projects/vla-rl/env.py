"""LeRobot 의 LIBERO env 를 감싸, task 를 성공하면 reward 1, 아니면 0 을 주는 sparse reward 환경으로 만든다.

LIBERO 는 Linux 에서만 돈다.
"""

from __future__ import annotations


def make_env(suite: str, task_id: int, seed: int):
    """task 하나의 env 와 그 지시문을 돌려준다. 성공하면 reward 1 과 함께 episode 가 끝나고, 그 밖의 step 은 reward 0 이다."""
    raise NotImplementedError
