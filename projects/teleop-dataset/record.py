"""teleop loop 를 고정 주기로 돌리며 frame 마다 observation·action·task 를 LeRobotDataset 에 기록한다."""

from __future__ import annotations

from sim_so101 import SimSO101, Teleop


def make_features(height: int = 480, width: int = 640) -> dict:
    raise NotImplementedError


def record(env: SimSO101, teleop: Teleop, repo_id: str, root: str,
           num_episodes: int, task: str) -> None:
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
