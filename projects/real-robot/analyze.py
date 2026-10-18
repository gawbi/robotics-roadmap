"""시도 기록에서 policy 별 성공률과 Wilson 95% 구간, 실패 원인 표를 만든다."""

from __future__ import annotations


def wilson_interval(successes: int, n: int, z: float = 1.96) -> tuple[float, float]:
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
