---
id: behavior-cloning
title: Behavior Cloning
branch: imitation
requires: [pytorch-mlp]
hours: 14
summary: 시연 주행을 따라 하는 MLP 와 compounding error
papers:
  - title: "ALVINN: An Autonomous Land Vehicle in a Neural Network"
    authors: Dean A. Pomerleau
    year: 1989
    url: https://proceedings.neurips.cc/paper/1988/hash/812b4ba287f5ee0bc9d43bbf5bbe87fb-Abstract.html
  - title: "Efficient Reductions for Imitation Learning"
    authors: Stéphane Ross, J. Andrew Bagnell
    year: 2010
    url: https://proceedings.mlr.press/v9/ross10a.html
  - title: "End to End Learning for Self-Driving Cars"
    authors: Mariusz Bojarski et al.
    year: 2016
    url: https://arxiv.org/abs/1604.07316
---

# Behavior Cloning

## 배경

1989년 Pomerleau 의 ALVINN 은 30×32 카메라 영상과 8×32 거리 센서 값을 hidden unit 29 개짜리 neural network 에 넣고,
45 개 출력 unit 중에서 "7 m 앞 도로 중앙으로 차를 데려가는 회전 곡률" 을 고르게 했다. 차선을 찾는 규칙도 조향
제어기도 사람이 짜지 않고 (관측, 정답 조향) 쌍만 모아 supervised learning 으로 학습했는데, 이렇게 expert 의 행동을
그대로 regression 하는 방식을 behavior cloning 이라 부른다.

$$
\min_\theta\ \mathbb{E}_{(o,\,a)\sim d_{\pi^*}}\big[\,\lVert \pi_\theta(o) - a \rVert^2\,\big]
$$

그런데 학습 데이터는 expert 가 실제로 지나간 상태 분포 $d_{\pi^*}$ 에서만 나온다. 학습한 policy 가 조금만 틀려도
차는 expert 라면 가지 않았을 위치로 밀려나고, 그 상태는 학습 데이터에 없어서 오차가 더 커진다. 이 distribution shift 가 step 마다 쌓이는 현상을 compounding error 라 하는데, Ross 와 Bagnell 은 expert 분포에서 step 당
오차가 $\epsilon$ 인 policy 라도 길이 $T$ 인 episode 의 비용이 최악의 경우 $T^2\epsilon$ 까지 늘어난다는 것을 보였다.

$$
J(\hat\pi) \le J(\pi^*) + T^2 \epsilon
$$

이번 과제에서는 2D 차선 env 와 pure pursuit expert 를 직접 만들고, validation loss 는 낮은데 rollout 에서는 차선을
벗어나는 현상을 재현한다. pure pursuit 은 중앙선 위 $\ell_d$ 앞의 점을 지나는 원호를 따라가도록 조향각을 정하는
규칙이라 ALVINN 의 학습 라벨과 같은 발상이다. $L$ 은 wheelbase, $\alpha$ 는 차의 진행 방향과 목표점 방향 사이의 각이다.

$$
\delta = \arctan\!\left(\frac{2L\sin\alpha}{\ell_d}\right)
$$

## 목표

- 곡률이 바뀌는 차선과 kinematic bicycle model 로 2D 주행 env 를 만든다
- 차 기준 ray 거리 센서와 pure pursuit expert 를 만든다
- expert 시연으로 "센서 → 조향" MLP 를 behavior cloning 으로 학습한다
- validation loss 와 rollout 이탈률을 함께 내는 eval 로 둘이 어긋나는 것을 확인한다

**직접 짤 것**: env dynamics, 센서, pure pursuit, 데이터 수집과 eval 루프. expert 는 차의 정확한 위치를 보고 policy 는
센서 값만 본다는 구분을 코드에서 지킨다.
**가져다 써도 되는 것**: [PyTorch Training Loop](../pytorch-mlp/README.md) 에서 만든 학습 루프나 `torch.nn`·`torch.optim`,
그림용 matplotlib.

## 준비물

- Python 3.12, numpy, torch, matplotlib
- (선택) gymnasium — env 를 `gymnasium.Env` 형식으로 감싸고 싶을 때
- GPU 불필요

## 진행 순서

1. arc-length $s$ 에 대한 곡률 $\kappa(s)$ 를 적분해 차선 중앙선을 만드는 `Track` 을 짠다
2. kinematic bicycle model 로 조향각을 받아 차 상태를 갱신하는 `LaneEnv.step` 을 짠다
3. 차 좌표계에서 부채꼴로 ray 를 쏴 차선 경계까지의 거리를 재는 센서를 짠다
4. pure pursuit expert 를 짜고, 새 track 100 개에서 한 번도 이탈하지 않는 $\ell_d$ 를 찾는다
5. expert 로 몰면서 (센서, 조향) 쌍을 모아 train·validation 으로 나눈다
6. MLP 를 MSE 로 학습하고 validation loss 를 기록한다
7. 학습에 안 쓴 track 에서 expert 와 policy 에 같은 크기의 조향 noise 를 넣고 rollout 해 이탈률을 잰다
8. 같은 track 에서 expert 와 policy 의 lateral offset 을 시간축에 겹쳐 그린다

## 시작점

```text
behavior-cloning/
├── lane_env.py     # Track, bicycle model, ray sensor
├── expert.py       # pure pursuit
├── collect.py      # expert rollouts -> npz
├── train_bc.py     # MLP + training loop
└── evaluate.py     # validation loss + rollout departure rate
```

```python
from dataclasses import dataclass

import numpy as np
import torch
from torch import nn


@dataclass
class CarState:
    x: float
    y: float
    yaw: float
    v: float


class Track:
    def __init__(self, seed: int, length_m: float = 400.0, lane_half_width: float = 1.75) -> None: ...
    def project(self, x: float, y: float) -> tuple[float, float, float]:
        """closest centerline point -> (s, lateral_offset, centerline_heading)."""
    def point_at(self, s: float) -> np.ndarray: ...


class LaneEnv:
    def __init__(self, track: Track, dt: float = 0.05, wheelbase: float = 2.5,
                 max_steer: float = 0.5, n_rays: int = 15, steer_noise: float = 0.0) -> None: ...
    def reset(self, lateral_offset: float = 0.0, yaw_offset: float = 0.0) -> np.ndarray: ...
    def step(self, steer: float) -> tuple[np.ndarray, bool]:
        """returns (sensor, departed). departed = |lateral_offset| > lane_half_width."""
    def sensor(self) -> np.ndarray:
        """(n_rays,) distances from the car to the lane boundaries, measured in the car frame."""
    @property
    def state(self) -> CarState: ...


def pure_pursuit(state: CarState, track: Track, lookahead: float, wheelbase: float) -> float: ...


def collect(track_seeds: list[int], steps: int, lookahead: float) -> dict[str, np.ndarray]:
    """expert rollouts -> {'obs': (N, n_rays), 'act': (N, 1), 'offset': (N,)}."""


class BCPolicy(nn.Module):
    def __init__(self, obs_dim: int, hidden: int = 64) -> None: ...
    def forward(self, obs: torch.Tensor) -> torch.Tensor: ...


def train_bc(data: dict[str, np.ndarray], epochs: int = 50, lr: float = 1e-3, seed: int = 0
             ) -> tuple[BCPolicy, dict[str, float]]:
    """returns (policy, {'train_loss': ..., 'val_loss': ...})."""


def rollout(env: LaneEnv, policy: BCPolicy, steps: int) -> dict[str, np.ndarray | int]:
    """returns {'offset': (T,), 'steer': (T,), 'departed_at': step index or -1}."""


def departure_rate(policy: BCPolicy, track_seeds: list[int], steps: int, steer_noise: float) -> float: ...
```

## 평가 기준

- [ ] 조향 noise 를 넣은 상태로도 pure pursuit expert 가 학습에 안 쓴 track 100 개에서 이탈 0 회다
- [ ] BC policy 의 validation MSE 가 expert 조향 분산의 5% 이하다 ($R^2 \ge 0.95$)
- [ ] 같은 noise 조건의 새 track 100 개에서 같은 policy 의 이탈률이 0 보다 크다
- [ ] 이탈한 rollout 의 offset 궤적을 학습 데이터 offset 히스토그램과 함께 그리면, 이탈하기 전에 학습 데이터 범위를 먼저 벗어나는 구간이 보인다
- [ ] episode 길이를 늘려 가며 잰 평균 |lateral offset| 이 expert 는 거의 일정하고 policy 는 점점 커진다
- [ ] (선택) 시연을 모을 때 실행 조향에만 noise 를 섞고 라벨은 noise 없는 expert 조향으로 저장한 데이터로 학습하면 이탈률이 줄어든다

## 생각해 볼 질문

1. validation loss 는 어떤 상태 분포에서 잰 값인가? rollout 은 실패하는데도 이 값이 낮게 나오는 이유는?
2. ALVINN 은 조향 값 하나를 regression 하지 않고 45 개 출력 unit 위에 언덕 모양의 target 을 두었다. 같은 장면에서
   왼쪽으로 피하는 것과 오른쪽으로 피하는 것이 모두 정답이라면 두 표현은 각각 어떤 출력을 내는가?
3. expert 시연을 10 배로 늘리면 이탈률이 얼마나 줄 것이라 예상하는가? 아무리 늘려도 채워지지 않는 상태는 어떤 상태인가?

## 힌트

<details>
<summary>매끄러운 track 을 만드는 법</summary>

중앙선을 점 목록으로 직접 찍기보다 곡률 $\kappa(s)$ 를 정하고 heading 과 위치를 적분하는 편이 매끄럽다. $\kappa(s)$ 를
진폭과 주기가 다른 sin 몇 개의 합으로 두면 seed 하나로 track 이 정해지고, 최대 곡률을 차의 최소 회전 반경이 허용하는
값보다 작게 묶어 두면 expert 가 못 도는 코너가 생기지 않는다.

</details>

<details>
<summary>이탈이 안 생길 때</summary>

noise 없는 expert 데이터로 학습한 policy 는 noise 없는 rollout 에서 멀쩡히 달리는 경우가 많다. rollout 에 조향 noise 나
한 step 의 지연을 넣으면 학습 데이터에 없던 offset 이 생기고, 그 상태에서 policy 가 무엇을 하는지 드러난다. 같은 noise 를
넣어도 expert 는 복구한다는 것을 함께 보여야 비교가 공정하다.

</details>

<details>
<summary>pure pursuit 의 lookahead</summary>

`Track.project` 로 현재 $s$ 를 구하고 $s + \ell_d$ 위치를 목표점으로 잡은 뒤, 목표점을 차 좌표계로 옮겨 $\alpha$ 를
구한다. $\ell_d$ 가 짧으면 좌우로 흔들리고 길면 코너 안쪽을 가로질러서, 속도에 비례하게 두는 방식도 흔하다.

</details>

## 참고 자료

- Pomerleau 1989 원문은 9 쪽으로 짧다. Figure 1 의 구조와 학습 라벨을 정의하는 부분만 읽어도 충분하다
- R. Craig Coulter, [Implementation of the Pure Pursuit Path Tracking Algorithm](https://www.ri.cmu.edu/publications/implementation-of-the-pure-pursuit-path-tracking-algorithm/) (CMU-RI-TR-92-01)
- UC Berkeley [CS 285 Deep Reinforcement Learning](https://rail.eecs.berkeley.edu/deeprlcourse/) — Behavioral Cloning 강의와 Homework 1 (Imitation Learning)
- Hugging Face, [Robot Learning: A Tutorial](https://huggingface.co/spaces/lerobot/robot-learning-tutorial) — behavior cloning 장

## 남은 한계

expert 시연을 아무리 늘려도 policy 가 스스로 벗어난 상태는 데이터에 들어오지 않는다. policy 가 간 상태에 expert 라벨을
받아 오는 방법이 [DAgger](../dagger/README.md) 다. 한 장면에 정답이 여럿일 때 MSE 가 평균을 내는 문제는
[RT-1](../rt1/README.md) 이 다루고, step 마다 쌓이는 오차는 [ACT](../act/README.md) 가 action chunking 으로 줄인다.
