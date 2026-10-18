"""cube 를 무작위 위치·yaw 에 놓고 50회 시도해 성공률과 모듈별 실패 원인 표를 results/ 에 남긴다."""

from __future__ import annotations


def run_trial(seed: int) -> dict:
    """one episode. returns {"success": bool, "failure": str | None, "pos_err_mm": float, ...}."""
    raise NotImplementedError


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
