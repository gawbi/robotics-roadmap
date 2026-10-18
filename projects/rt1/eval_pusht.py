"""gym-pusht 에서 두 policy 의 성공률과 평균 max coverage 를 재고, multimodal 상태의 action 분포와 rollout 궤적을 그려
results/ 에 저장한다."""

from __future__ import annotations

from torch import nn


def evaluate(policy: nn.Module, n_episodes: int = 50, seed: int = 0, sample: bool = False) -> dict[str, float]:
    """gym_pusht/PushT-v0 rollouts -> {'success_rate': ..., 'avg_max_coverage': ...}.
    MiniRT1 picks actions with act(..., sample=sample); RegressionPolicy uses its forward output and ignores sample."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
