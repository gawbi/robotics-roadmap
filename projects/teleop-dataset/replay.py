"""기록한 episode 의 초기 상태에서 저장된 action 만 다시 넣어 시연을 재생하고, 기록된 joint trajectory 와 비교한다."""

from __future__ import annotations

from sim_so101 import SimSO101


def replay(env: SimSO101, repo_id: str, root: str, episode: int) -> float:
    """returns the max joint deviation between replay and recording, in dataset units."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
