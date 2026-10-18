"""8 gaussians 에 DDPM 과제와 같은 MLPDenoiser 를 flow matching loss 로 학습시킨다."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "ddpm"))
from denoisers import MLPDenoiser  # ddpm 과제의 코드
from toy_data import eight_gaussians  # ddpm 과제의 코드


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
