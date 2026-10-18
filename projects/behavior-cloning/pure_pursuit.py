"""차의 정확한 위치와 track 을 보고 조향각을 정하는 pure pursuit expert."""

from __future__ import annotations

from lane_env import CarState, Track


def pure_pursuit(state: CarState, track: Track, lookahead: float, wheelbase: float) -> float:
    raise NotImplementedError
