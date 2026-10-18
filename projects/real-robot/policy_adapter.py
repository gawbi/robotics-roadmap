"""act 과제의 ACT 를 LeRobot 로봇의 observation·action dict 형식에 맞추는 adapter.

ACT 모델 코드는 act 과제 폴더를 sys.path 에 더해 import 한다.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

sys.path.append(str(Path(__file__).resolve().parents[1] / "act"))
from act import ACTPolicy  # act 과제의 코드


class MyPolicyAdapter:
    """wraps the ACT from the act project so it consumes LeRobot robot observations."""
    def __init__(self, checkpoint: str, dataset_repo_id: str, device: str = "cuda") -> None:
        """loads weights and the dataset's normalization stats and feature names."""
        raise NotImplementedError

    def reset(self) -> None:
        """clear the action-chunk queue (and temporal-ensembling buffer) between trials."""
        raise NotImplementedError

    def select_action(self, observation: dict[str, np.ndarray]) -> dict[str, float]:
        """robot.get_observation() output -> joint targets for robot.send_action()."""
        raise NotImplementedError
