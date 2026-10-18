"""카메라 이미지를 ResNet-18 trunk 의 feature map 으로 바꾸고, cell 마다 2D sinusoidal positional embedding 을 붙여 token 으로
편다. ResNet-18 은 resnet 과제에서 짠 것을 쓴다."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1] / "resnet"))
from load_resnet import load_torchvision_weights  # resnet 과제의 코드
from resnet import resnet18  # resnet 과제의 코드
