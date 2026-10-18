"""두 policy 를 같은 20 개 초기 배치에서 번갈아 시도하고, 시도마다 결과와 영상을 results/ 에 기록한다."""

from __future__ import annotations

from dataclasses import dataclass

from lerobot.robots.so_follower import SO101Follower, SO101FollowerConfig

from policy_adapter import MyPolicyAdapter


@dataclass
class Trial:
    layout_id: int
    policy: str
    success: bool
    failure_stage: str | None    # e.g. "approach", "grasp", "transport", "release"
    duration_s: float
    video_path: str


def run_trial(robot: SO101Follower, policy: MyPolicyAdapter, fps: int, max_steps: int,
              layout_id: int, policy_name: str) -> Trial:
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
