"""MiniRT1 은 bin 별 cross-entropy 로, RegressionPolicy 는 MSE 로 같은 step·batch·optimizer 에서 학습한다."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "resnet"))
from load_resnet import load_torchvision_weights  # resnet 과제의 코드
from resnet import resnet18  # resnet 과제의 코드


def main() -> None:
    raise NotImplementedError


if __name__ == "__main__":
    main()
