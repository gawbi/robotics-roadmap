"""DDPM 과제의 UNet 이 velocity 를 내도록 MNIST 에 다시 학습시키고, Euler 20 step 으로 64장을 생성해 results/ 에 저장한다."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "ddpm"))
from denoisers import UNet  # ddpm 과제의 코드


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
