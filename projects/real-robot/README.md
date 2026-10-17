---
id: real-robot
title: Real Robot
branch: imitation
requires: [teleop-dataset, act]
hours: 60
summary: 저가 실물 팔의 시연 수집·학습·배포·평가
papers:
  - title: "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware"
    authors: Tony Z. Zhao, Vikash Kumar, Sergey Levine, Chelsea Finn
    year: 2023
    url: https://arxiv.org/abs/2304.13705
  - title: "SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotics"
    authors: Mustafa Shukor et al.
    year: 2025
    url: https://arxiv.org/abs/2506.01844
  - title: "Robot Learning: A Tutorial"
    authors: Francesco Capuano, Caroline Pascal, Adil Zouitine, Thomas Wolf, Michel Aractingi
    year: 2025
    url: https://arxiv.org/abs/2510.12403
---

# Real Robot

## 배경

지금까지의 과제는 모두 simulation 안에서 끝났다. simulation 은 상태를 정확히 알려 주고 같은 장면을 똑같이 렌더하며 성공
여부까지 판정해 주지만, 실물에서는 조명에 따라 카메라 노출이 바뀌고 servo 에는 backlash 와 지연이 있다. calibration 도
조금씩 어긋나며 성공 판정은 사람이 해야 한다. ACT 는 처음부터 이런 저가 하드웨어를 겨냥해 나온 방법이라, 논문에서도
과제당 10 분 분량의 시연으로 실물 정밀 조작 과제 6 개를 배웠고 배터리 끼우기 같은 과제에서 80–90% 성공률을 냈다.

LeRobot 은 SO-101 같은 저가 팔로 teleoperate → record → train → deploy 를 명령 몇 개로 묶어 둔다. SO-101
follower 는 Feetech STS3215 servo 6 개로 움직이고, 사람이 손으로 움직이는 leader 팔의 관절 값을 follower 가 그대로 따라가며
그동안의 카메라 영상과 관절 값이 `LeRobotDataset` 으로 기록된다. 이번 과제에서는 이 흐름으로 한 가지 과제의 시연 50 개를
모으고, [ACT](../act/README.md) 에서 짠 내 ACT 를 실물에 배포해 같은 데이터로 학습한 LeRobot ACT 와 20 회씩 시도해
비교한다.

실물 평가는 시도 횟수가 적어서 성공률의 불확실성이 크다. $n$ 번 중 $k$ 번 성공했을 때의 95% Wilson 구간으로 보면 20 회 중
15 회 성공도 대략 53–89% 에 걸치므로, 두 policy 를 같은 초기 배치에서 번갈아 시도해 배치 운의 차이가 결과에 섞이지 않게
한다.

$$
\hat p = \frac{k}{n}, \qquad
\frac{\hat p + \frac{z^2}{2n} \pm z\sqrt{\frac{\hat p(1-\hat p)}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}}, \qquad z = 1.96
$$

## 목표

- SO-101 follower·leader 를 calibration 하고, teleop 으로 해 볼 과제 하나(예: 큐브를 집어 상자에 넣기)를 정한다
- 물체 위치 5 곳 × 10 회로 시연 50 개를 기록한다
- 내 ACT 를 이 dataset 에 학습하고 실물 제어 루프에 붙인다
- 같은 데이터·step 으로 학습한 LeRobot ACT 와 같은 20 개 초기 배치에서 성공률을 비교한다
- 실패 사례를 영상으로 남기고 원인별로 분류한다

**직접 짤 것**: 내 policy 를 로봇 관측·action 형식에 맞추는 adapter, 고정 주기 제어 루프, 20 회 시도 protocol 과 기록,
실패 분석. ACT 대신 [Diffusion Policy](../diffusion-policy/README.md) 나 [π0](../pi0/README.md) 과제의 모델을 올려도 된다.
**가져다 써도 되는 것**: LeRobot 의 motor driver·calibration·teleop·기록(`lerobot-record`)·dataset 형식, 비교용
`lerobot-train --policy.type=act` 와 `lerobot-rollout`.

## 준비물

- SO-101 follower 와 leader 한 쌍(kit 구매 또는 3D 프린트 + servo 조립), USB 카메라 1–2 개(정면·손목), 고정된 작업대와 물체
- Python 3.12, `pip install "lerobot[feetech]"`
- 학습은 8 GB GPU 로 충분하다 (LeRobot hardware guide 기준 ACT batch 8 에서 2–6 GB). 추론은 학습한 GPU 머신에 팔을 USB 로
  연결해 돌리는 것이 가장 단순하다
- 하드웨어가 없으면: [mujoco_menagerie 의 SO-101 모델](https://github.com/google-deepmind/mujoco_menagerie/tree/main/robotstudio_so101) 을
  [Teleop Dataset](../teleop-dataset/README.md) 과제의 sim teleop 흐름에 올려 같은 protocol(시연 50 개, 20 회 시도)로 진행한다.
  이때 카메라 noise·조명 변화·제어 지연을 일부러 넣어 실물에서 생길 문제를 흉내 낸다

## 진행 순서

1. follower·leader 의 motor id 설정과 calibration 을 끝내고, teleop 이 기록할 fps 그대로 끊김 없이 도는지 확인한다
2. 카메라 위치를 고정하고, 사람이 카메라 영상만 보고도 과제를 할 수 있는지 확인한다
3. 물체 위치 5 곳 × 10 회로 시연 50 개를 `lerobot-record` 로 기록한다
4. 기록한 episode 하나를 `lerobot-replay` 로 재생해 같은 동작이 재현되는지 확인한다
5. 내 ACT 를 이 dataset 의 feature 이름·정규화 통계에 맞춰 학습하고, 같은 데이터·step 으로 LeRobot ACT 도 학습한다
6. 학습에 쓴 위치 5 곳과 새 위치를 섞은 초기 배치 20 개를 정해 사진으로 남긴다
7. 두 policy 를 배치마다 번갈아 시도하며 성공 여부·실패 단계·영상을 기록한다
8. 성공률과 Wilson 구간을 내고, 실패 원인 하나를 골라 고친 뒤 다시 20 회를 잰다

## 시작점

```text
real-robot/
├── configs/
│   └── task.yaml          # robot port & id, cameras, fps, task string, 20 trial layouts
├── policy_adapter.py      # my ACT <-> LeRobot observation / action dicts
├── run_trials.py          # alternating 20-trial protocol, logging, video
├── analyze.py             # success rate, Wilson interval, failure table
└── sim_fallback/          # MuJoCo SO-101 scene when there is no hardware
```

```python
from dataclasses import dataclass

import numpy as np
from lerobot.robots.so_follower import SO101Follower, SO101FollowerConfig


class MyPolicyAdapter:
    """wraps the ACT from the act project so it consumes LeRobot robot observations."""
    def __init__(self, checkpoint: str, dataset_repo_id: str, device: str = "cuda") -> None:
        """loads weights and the dataset's normalization stats and feature names."""
    def reset(self) -> None:
        """clear the action-chunk queue (and temporal-ensembling buffer) between trials."""
    def select_action(self, observation: dict[str, np.ndarray]) -> dict[str, float]:
        """robot.get_observation() output -> joint targets for robot.send_action()."""


@dataclass
class Trial:
    layout_id: int
    policy: str
    success: bool
    failure_stage: str | None    # e.g. "approach", "grasp", "transport", "release"
    duration_s: float
    video_path: str


def run_trial(robot: SO101Follower, policy: MyPolicyAdapter, fps: int, max_steps: int,
              layout_id: int, policy_name: str) -> Trial: ...


def wilson_interval(successes: int, n: int, z: float = 1.96) -> tuple[float, float]: ...
```

## 평가 기준

- [ ] [LeRobot Dataset Visualizer](https://huggingface.co/spaces/lerobot/visualize_dataset) 로 50 episode 를 열어 모든 episode 에서 카메라 영상과 관절 궤적의 시간이 맞는다
- [ ] 물체를 기록 때와 같은 자리에 두고 `lerobot-replay` 로 episode 를 재생하면 기록 때와 같은 결과가 나온다
- [ ] 같은 20 개 배치에서 내 ACT 의 성공률이 LeRobot ACT 의 80% 이상이다
- [ ] 결과 표에 성공률과 함께 Wilson 95% 구간을 적는다
- [ ] 실패를 3 개 이상의 원인으로 분류하고 원인마다 영상을 하나씩 남긴다
- [ ] (선택) 학습에 없던 위치의 성공률을 따로 계산해 학습 위치와 비교한다

## 생각해 볼 질문

1. sim 에서 잘 되던 policy 가 실물에서 떨리거나 멈추는 원인을 세 가지 이상 들 수 있는가? 각각은 어떻게 확인하는가?
2. 20 회 시도로 성공률 75% 와 60% 인 두 policy 를 구별할 수 있는가? 구별하려면 무엇을 바꿔야 하는가?
3. 시연 50 개를 한 위치에서 모두 모은 경우와 위치 5 곳에 나눠 모은 경우, policy 는 각각 무엇을 배우는가?

## 힌트

<details>
<summary>fps 와 제어 주기</summary>

ACT 의 chunk 는 기록 fps 를 기준으로 한 시간 간격의 action 열이다. 추론 루프가 기록 fps 보다 느리게 돌면 같은 chunk 가
느리게 재생되고 빠르면 빨리 감기처럼 재생되므로, 루프의 실제 주기를 재서 기록 fps 와 맞춘다. `lerobot-record` 도 실제로
도달한 주기를 보고한다.

</details>

<details>
<summary>calibration id 와 feature 이름</summary>

LeRobot 은 robot `id` 로 calibration 파일을 찾기 때문에 teleop·기록·추론에서 같은 `id` 를 써야 한다. 카메라 이름도
dataset 의 `observation.images.<name>` 과 정확히 같아야 정규화 통계와 입력이 맞물린다.

</details>

<details>
<summary>떨림 원인 구분</summary>

떨림이 chunk 경계마다 생기는지(추론 지연), 일정한 주파수로 계속되는지(servo gain), 특정 조명에서만 생기는지(카메라)를
먼저 나눈다. 같은 관측을 고정 입력으로 넣어 policy 출력만 기록해 보면 policy 쪽 문제인지 로봇 쪽 문제인지 갈린다.

</details>

## 참고 자료

- LeRobot [SO-101 문서](https://huggingface.co/docs/lerobot/so101) — 조립, motor 설정, calibration
- LeRobot [Imitation Learning on Real-World Robots](https://huggingface.co/docs/lerobot/il_robots) — teleop·기록·학습·`lerobot-rollout` 명령과 시연 수집 요령
- LeRobot [Compute HW Guide](https://huggingface.co/docs/lerobot/hardware_guide) — policy 별 VRAM 과 학습 시간
- Hugging Face blog, [LeRobot Community Datasets](https://huggingface.co/blog/lerobot-datasets) — 좋은 dataset 의 조건
- [SO-ARM100 저장소](https://github.com/TheRobotStudio/SO-ARM100) — SO-101 부품 목록과 3D 프린트 파일

## 남은 한계

시연 50 개로 한 가지 과제만 배우는 policy 라서 언어 지시를 받지 못하고, 시연에 없던 상황에서 스스로 나아지지도 않는다. 같은
데이터에 언어 지시를 붙여 SmolVLA 를 fine-tune 하거나 [π0](../pi0/README.md) 의 모델을 올려 볼 수 있고, 실제 시도에서 얻은
reward 로 policy 를 더 다듬는 방법은 [VLA + RL](../vla-rl/README.md) 에서 다룬다.
