"""하드웨어가 없을 때 쓰는 sim follower. teleop-dataset 과제의 SimSO101 을 감싸 SO101Follower 와 같은
get_observation·send_action 을 내주고, 카메라 noise·조명 변화·제어 지연을 일부러 넣는다.

SimSO101 은 teleop-dataset 과제 폴더를 sys.path 에 더해 import 한다.
"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np

sys.path.append(str(Path(__file__).resolve().parents[2] / "teleop-dataset"))
from sim_so101 import SimSO101  # teleop-dataset 과제의 코드


class SimFollower:
    def __init__(self, camera_noise_std: float = 0.0, light_jitter: float = 0.0, latency_steps: int = 0,
                 seed: int = 0) -> None:
        """camera_noise_std 는 pixel 값에 더할 gaussian noise 의 표준편차, light_jitter 는 시도마다 바꿀 밝기 비율,
        latency_steps 는 send_action 이 몇 step 늦게 반영될지다."""
        raise NotImplementedError

    def connect(self) -> None:
        raise NotImplementedError

    def get_observation(self) -> dict[str, np.ndarray]:
        """SO101Follower.get_observation() 과 같은 key 의 dict."""
        raise NotImplementedError

    def send_action(self, action: dict[str, float]) -> dict[str, float]:
        raise NotImplementedError

    def disconnect(self) -> None:
        raise NotImplementedError
