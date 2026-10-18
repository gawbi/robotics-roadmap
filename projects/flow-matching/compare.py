"""step 수 1·2·5·10·20·50 에서 FM 과 DDPM 의 MMD 를 비교하고, 같은 초기 noise 에서 출발한 두 궤적과 그 곧은 정도를 results/ 에 남긴다."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "ddpm"))
from ddpm import p_sample, sample  # ddpm 과제의 코드
from denoisers import MLPDenoiser  # ddpm 과제의 코드
from mmd import mmd_rbf  # ddpm 과제의 코드
from noise_schedule import NoiseSchedule, make_betas  # ddpm 과제의 코드
from toy_data import eight_gaussians  # ddpm 과제의 코드


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
