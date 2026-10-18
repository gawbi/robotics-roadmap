"""벽·목표·함정이 있는 GridWorld 의 transition 표와 reset()/step() 환경. 표 형식은 gymnasium FrozenLake 의 env.unwrapped.P 와 같다."""

from __future__ import annotations

Transition = tuple[float, int, float, bool]          # (prob, next_state, reward, done)
Table = dict[int, dict[int, list[Transition]]]


def make_gridworld(layout: list[str], slip: float = 0.0) -> tuple[Table, int]:
    """layout like ["S..#", ".#.G", "...H"]; returns (P, start_state).
    with probability `slip` the agent moves to a perpendicular direction."""
    raise NotImplementedError


class GridEnv:
    def __init__(self, P: Table, start: int, seed: int = 0):
        raise NotImplementedError

    def reset(self) -> int:
        raise NotImplementedError

    def step(self, a: int) -> tuple[int, float, bool]:
        raise NotImplementedError
