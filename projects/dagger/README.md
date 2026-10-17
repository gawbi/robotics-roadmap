---
id: dagger
title: DAgger
branch: imitation
requires: [behavior-cloning]
hours: 10
summary: policy 가 간 상태에 expert 라벨을 붙이는 반복
papers:
  - title: "A Reduction of Imitation Learning and Structured Prediction to No-Regret Online Learning"
    authors: Stéphane Ross, Geoffrey J. Gordon, J. Andrew Bagnell
    year: 2011
    url: https://arxiv.org/abs/1011.0686
  - title: "HG-DAgger: Interactive Imitation Learning with Human Experts"
    authors: Michael Kelly, Chelsea Sidrane, Katherine Driggs-Campbell, Mykel J. Kochenderfer
    year: 2019
    url: https://arxiv.org/abs/1810.02890
---

# DAgger

## 배경

Behavior Cloning 과제에서 expert 시연을 늘려도 이탈이 사라지지 않는 이유는 학습 데이터가 여전히 expert 가 지나간 상태
분포 $d_{\pi^*}$ 에서만 나오기 때문이다. Ross·Gordon·Bagnell 의 DAgger(Dataset Aggregation, 2011) 는 학습 중인 policy 가
직접 운전하게 해서 policy 가 실제로 가는 상태 $d_{\pi_i}$ 를 모으고, 그 상태마다 expert 에게 정답 action 을 물어 dataset 에
계속 합친다.

$$
\pi_i = \beta_i\,\pi^* + (1-\beta_i)\,\hat\pi_i, \qquad
\mathcal{D} \leftarrow \mathcal{D} \cup \{(o,\ \pi^*(o)) : o \sim d_{\pi_i}\}, \qquad
\hat\pi_{i+1} = \arg\min_{\pi} \sum_{(o,\,a)\in\mathcal{D}} \ell\big(\pi(o), a\big)
$$

$\beta_1 = 1$ 로 시작하면 첫 iteration 은 BC 와 같고, 이후 $\beta_i$ 를 줄이면 policy 가 점점 더 많이 운전대를 잡는다.
논문은 이 과정을 no-regret online learning 으로 보고, iteration 을 충분히 돌리면 그동안 얻은 policy 들 가운데
$J(\hat\pi) \le J(\pi^*) + uT\epsilon_N + O(1)$ 인 policy 가 있음을 보였다. $u$ 는 expert 와 다른 action 을 한 번 했을 때
남은 비용이 늘어날 수 있는 상한이라서, $u$ 가 작은 문제에서는 BC 의 $T^2\epsilon$ 과 달리 오차가 $T$ 에 선형으로만 쌓인다.

DAgger 는 임의의 상태에서 언제든 정답을 내 주는 expert 가 있어야 돌아가는데, 차의 정확한 위치를 아는 pure pursuit 이
그런 expert 다. 이번 과제에서는 Behavior Cloning 의 env 를 그대로 두고 DAgger 루프만 새로 짜서 iteration 마다 이탈률이
줄어드는지 확인한다.

## 목표

- Behavior Cloning 의 env·expert·MLP 를 재사용해 DAgger 루프를 짠다
- $\beta$ schedule 로 expert 와 policy 를 섞어 몰면서 방문한 상태에 expert 라벨을 붙인다
- iteration 마다 데이터 크기·validation loss·이탈률을 기록한다
- 같은 샘플 수를 expert 시연만으로 모은 BC 와 이탈률을 비교한다

**직접 짤 것**: DAgger 루프, $\beta$ mixing, 데이터 aggregation, iteration 별 기록.
**가져다 써도 되는 것**: [Behavior Cloning](../behavior-cloning/README.md) 에서 만든 env·expert·학습 코드 전부.
`imitation` 라이브러리의 DAgger 는 결과 비교용.

## 준비물

- Python 3.12, numpy, torch, matplotlib
- Behavior Cloning 과제의 `lane_env.py`·`expert.py`·`train_bc.py`
- GPU 불필요

## 진행 순서

1. Behavior Cloning 의 BC policy 를 iteration 0 으로 두고, 같은 noise 조건에서 이탈률을 다시 잰다
2. 확률 $\beta$ 로 expert 조향을, 나머지 경우에는 policy 조향을 실행하는 `mixed_action` 을 짠다
3. mixed policy 로 rollout 하면서 방문한 상태의 센서 값과 그 상태의 expert 조향을 함께 기록한다
4. 새 데이터를 누적 dataset 에 합치고 policy 를 다시 학습한다
5. 3–4 를 10 iteration 반복하며 iteration 별 이탈률·데이터 수·validation loss 를 기록한다
6. iteration 마다 누적 샘플 수와 같은 양의 expert-only 데이터로 BC 를 학습해 이탈률을 비교한다
7. iteration 별 학습 데이터의 lateral offset 분포를 히스토그램으로 겹쳐 그린다

## 시작점

```text
dagger/
├── lane_env.py     # copied from behavior-cloning
├── expert.py       # copied from behavior-cloning
├── train_bc.py     # copied from behavior-cloning
├── dagger.py       # DAgger loop
├── compare.py      # DAgger vs expert-only BC at equal sample counts
└── plots.py        # departure rate per iteration, offset histograms
```

```python
from typing import Callable

import numpy as np

from lane_env import CarState, LaneEnv, Track
from expert import pure_pursuit
from train_bc import BCPolicy, train_bc


def mixed_action(sensor: np.ndarray, state: CarState, track: Track, policy: BCPolicy,
                 beta: float, rng: np.random.Generator) -> tuple[float, float]:
    """returns (executed_steer, expert_label). the executed steer is the expert's with probability beta."""


def collect_on_policy(policy: BCPolicy, beta: float, track_seeds: list[int], steps: int,
                      steer_noise: float, rng: np.random.Generator) -> dict[str, np.ndarray]:
    """mixed-policy rollouts -> {'obs': visited sensors, 'act': expert labels, 'offset': lateral offsets}."""


def run_dagger(n_iters: int, episodes_per_iter: int, beta_schedule: Callable[[int], float],
               seed: int) -> list[dict[str, float]]:
    """per-iteration logs: {'iter', 'n_samples', 'val_loss', 'departure_rate'}."""


def expert_only_bc(n_samples: int, seed: int) -> float:
    """train BC on n_samples expert-only samples and return its departure rate."""
```

## 평가 기준

- [ ] iteration 이 늘수록 이탈률이 대체로 줄고, 10 iteration 뒤 이탈률이 iteration 0 (BC) 의 절반 이하다
- [ ] 같은 샘플 수에서 DAgger policy 의 이탈률이 expert-only BC 보다 낮다
- [ ] 후반 iteration 데이터의 offset 히스토그램이 BC 데이터보다 넓게 퍼져 있다
- [ ] expert 라벨 대신 실행한 조향을 저장하도록 일부러 바꾸면 iteration 이 늘어도 이탈률이 거의 줄지 않는다
- [ ] (선택) `imitation` 라이브러리의 DAgger 를 같은 env 에 붙여 iteration 별 이탈률 곡선이 비슷한 모양인지 본다

## 생각해 볼 질문

1. expert 가 직접 몬 데이터를 아무리 늘려도 채울 수 없는 상태는 어떤 상태이고, DAgger 는 그 상태를 어떻게 데이터에 넣는가?
2. 사람이 expert 일 때 DAgger 식 라벨링이 어려운 이유는? 운전대를 잡지 않은 채 "지금 얼마나 꺾었어야 했는지" 를 답해야
   하는 상황을 떠올려 본다
3. DAgger 의 이론은 마지막 policy 가 좋다고 보장하지 않고, iteration 마다 얻은 policy 들 가운데 좋은 policy 가 하나
   있다고만 보장한다. 실제로는 어떤 policy 를 골라 써야 하는가?

## 힌트

<details>
<summary>라벨과 실행 action 의 구분</summary>

rollout 에서 실제로 실행한 조향이 무엇이든, 저장할 라벨은 그 상태에서 expert 가 냈을 조향이다. 실행한 조향을 그대로
저장하면 policy 가 자기 출력을 다시 배우게 되어 새 정보가 들어오지 않는다.

</details>

<details>
<summary>이탈한 뒤의 상태</summary>

차가 차선 밖으로 크게 벗어난 뒤에는 expert 도 복구하지 못하는 경우가 있고, 그 구간의 라벨은 학습에 방해가 된다. 이탈하는
순간 episode 를 끊되, BC 데이터에 가장 부족했던 이탈 직전 구간은 남긴다.

</details>

<details>
<summary>$\beta$ schedule</summary>

논문은 $\beta_1 = 1$ 로 시작해 $\beta_i = p^{i-1}$ 처럼 지수로 줄이는 방식과, 첫 iteration 만 1 이고 이후 0 인
$\beta_i = \mathbb{1}[i = 1]$ 을 함께 다루고 후자가 실제로 가장 잘 될 때가 많다고 적었다. 둘 다 돌려 iteration 별 이탈률
곡선을 비교한다.

</details>

## 참고 자료

- Ross·Gordon·Bagnell 2011 원문의 Algorithm 3.1 과 Section 3 의 bound 정리
- UC Berkeley [CS 285 Deep Reinforcement Learning](https://rail.eecs.berkeley.edu/deeprlcourse/) — Behavioral Cloning 강의에서 DAgger 를 다룬다
- `imitation` 라이브러리 [DAgger 문서](https://imitation.readthedocs.io/en/latest/algorithms/dagger.html)와 [소스](https://github.com/HumanCompatibleAI/imitation) — 막혔을 때만 열기
- LeRobot [Human-In-the-Loop Data Collection](https://huggingface.co/docs/lerobot/hil_data_collection) — 실물 팔에서 사람이 개입해 데이터를 모으는 방식

## 남은 한계

DAgger 는 아무 상태에서나 바로 라벨을 내는 expert 를 전제하는데, 실물 로봇에서 사람은 그런 expert 가 되기 어렵다. 대안으로는
사람이 위험할 때만 조종을 넘겨받는 HG-DAgger 와 LeRobot 의 human-in-the-loop 수집(`lerobot-rollout --strategy.type=dagger`)이
있고, [Real Robot](../real-robot/README.md) 에서 학습한 policy 에 이 방식을 붙여 볼 수 있다.
