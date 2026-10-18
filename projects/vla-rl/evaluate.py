"""고정한 초기 상태와 seed 로 task 별 성공률을 잰다. SFT·filtered BC·noise policy 를 같은 protocol 로 비교한다."""

from __future__ import annotations

from typing import TYPE_CHECKING

from rl_config import RLConfig
from rollout import VLAPolicy

if TYPE_CHECKING:
    from noise_policy import NoisePolicy


def success_rate(make_env, vla: VLAPolicy, task_ids: list[int], cfg: RLConfig,
                 noise_policy: NoisePolicy | None = None) -> dict[int, float]:
    """runs cfg.episodes_per_task episodes per task from cfg.seed, building envs with make_env(cfg.suite, task_id, seed) and
    rolling out with cfg.max_chunks and cfg.flow_steps -> {task_id: success rate}."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
