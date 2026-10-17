---
id: sim2real-locomotion
title: "Sim-to-Real Locomotion"
branch: rl
requires: [ppo, mujoco-sim]
hours: 40
summary: dynamics 가 바뀌어도 걷는 보행 policy 학습
papers:
  - title: "Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World"
    authors: Josh Tobin et al.
    year: 2017
    url: https://arxiv.org/abs/1703.06907
  - title: "Sim-to-Real Transfer of Robotic Control with Dynamics Randomization"
    authors: Xue Bin Peng, Marcin Andrychowicz, Wojciech Zaremba, Pieter Abbeel
    year: 2018
    url: https://arxiv.org/abs/1710.06537
  - title: "Sim-to-Real: Learning Agile Locomotion For Quadruped Robots"
    authors: Jie Tan et al.
    year: 2018
    url: https://arxiv.org/abs/1804.10332
  - title: "Learning agile and dynamic motor skills for legged robots"
    authors: Jemin Hwangbo et al.
    year: 2019
    url: https://arxiv.org/abs/1901.08652
  - title: "RMA: Rapid Motor Adaptation for Legged Robots"
    authors: Ashish Kumar, Zipeng Fu, Deepak Pathak, Jitendra Malik
    year: 2021
    url: https://arxiv.org/abs/2107.04034
  - title: "Learning to Walk in Minutes Using Massively Parallel Deep Reinforcement Learning"
    authors: Nikita Rudin, David Hoeller, Philipp Reist, Marco Hutter
    year: 2021
    url: https://arxiv.org/abs/2109.11978
  - title: "MuJoCo Playground"
    authors: Kevin Zakka et al.
    year: 2025
    url: https://arxiv.org/abs/2502.08844
---

# Sim-to-Real Locomotion

## 배경

[PPO](../ppo/README.md) 로 학습한 HalfCheetah policy 가 잘 달린다는 보장은 학습에 쓴 바로 그 simulator parameter 에서만 성립한다.
실물 로봇은 링크 질량, 바닥 마찰, 모터가 내는 힘, 센서 값을 읽어 명령을 내기까지의 지연(latency)이 simulator 와 조금씩 다르고,
sim 의 한 점에 과하게 맞춘 policy 는 이 차이(reality gap) 앞에서 쉽게 넘어진다. domain randomization 은 학습 중 episode 마다 이
parameter $\xi$ 를 범위 안에서 무작위로 뽑아서, policy 가 특정 값 하나가 아니라 분포 전체에서 return 을 높이도록 만든다.

$$
\max_\pi\ \mathbb E_{\xi\sim p(\xi)}\Big[\ \mathbb E_{\tau\sim\pi,\ \xi}\Big[\sum_t\gamma^t r_t\Big]\Big],
\qquad \xi=(\text{mass},\ \text{friction},\ \text{motor strength},\ \text{latency},\ \dots)
$$

Tobin et al. 2017 은 렌더링을 무작위화해 sim 에서만 학습한 object detector 를 실물 grasping 에 썼고, Peng et al. 2018 은
dynamics 를 무작위화해 sim 에서만 학습한 policy 를 실물 로봇 팔로 옮겼다. Tan et al. 2018 은 4족 보행에 latency 와 actuator model 까지 sim 에 넣었고, Rudin et al. 2021 은 GPU 한 장에서 수천 개
환경을 병렬로 돌려 평지 보행 학습을 4 분 안쪽으로 줄였다. 지금은 이런 GPU 병렬 sim 과 PPO, randomization 의 조합이 보행 학습의
표준 구성이다.

이 과제는 실물 로봇 없이 sim-to-sim 으로 평가한다. 학습 때 쓰지 않은 dynamics 범위를 실물 대역으로 정해 두고, randomization 을 넣은
policy 와 넣지 않은 policy 가 그 범위에서 얼마나 버티는지 비교한다.

## 목표

- reset 마다 질량·마찰·actuator gear 를 다시 뽑는 domain randomization wrapper 를 짠다
- action 을 정해진 step 만큼 늦게 적용하는 latency wrapper 와 observation noise wrapper 를 짠다
- 내 PPO 로 4족 `Ant-v5` 를 nominal dynamics 와 randomized dynamics 에서 각각 학습한다
- 학습에 쓰지 않은 질량·마찰·latency 격자에서 두 policy 의 return 과 넘어짐 비율을 heatmap 으로 비교한다

**직접 짤 것**: randomization·latency·noise wrapper, 평가 격자와 heatmap, (선택) Go1 용 velocity command 추종 reward.
**가져다 써도 되는 것**: [PPO](../ppo/README.md) 에서 짠 내 PPO, gymnasium `Ant-v5`, MuJoCo Menagerie 의 Unitree Go1 모델.

## 준비물

- Python 3.12, `torch`, `gymnasium[mujoco]`, matplotlib
- 기본 구성은 CPU MuJoCo 의 `Ant-v5` 를 `gymnasium.vector.AsyncVectorEnv` 로 8–16 개 띄우는 것이다. 수백만 step 이 필요해서
  CPU 코어 수에 따라 학습 한 번에 몇 시간이 걸리고, GPU 는 policy update 에만 쓰므로 8 GB 로 충분하다
- (선택) [MuJoCo Playground](https://github.com/google-deepmind/mujoco_playground) 의 `Go1JoystickFlatTerrain` 은 MJX(JAX) 로
  GPU 에서 수천 개 env 를 돌리는 구성이다. CUDA 용 JAX 를 따로 설치해야 하고 8 GB GPU 에서는 env 수를 줄여야 할 수 있어서,
  공식 [locomotion Colab notebook](https://github.com/google-deepmind/mujoco_playground/blob/main/learning/notebooks/locomotion.ipynb)
  으로 먼저 돌려 보는 편이 쉽다
- Isaac Sim·Isaac Gym 은 필요 없다

## 진행 순서

1. contact force 를 뺀 `Ant-v5`(`include_cfrc_ext_in_observation=False`)를 내 PPO 로 학습해 nominal policy 를 얻는다
2. `reset()` 때마다 body 질량·geom 마찰·actuator gear 를 범위 안에서 다시 뽑는 wrapper 를 짠다
3. action 을 $k$ step 늦게 적용하는 latency wrapper 와 observation 에 Gaussian noise 를 더하는 wrapper 를 짠다
4. 세 wrapper 를 씌운 환경에서 nominal policy 와 같은 step 수만큼 DR policy 를 학습한다
5. 학습 범위 밖까지 걸치는 (질량 배율 × 마찰 배율) 격자와 latency 0–3 step 을 평가 세트로 정한다
6. 평가 세트의 칸마다 두 policy 를 20 episode 씩 돌려 평균 return 과 넘어짐 비율을 잰다
7. 두 policy 의 결과를 칸별 heatmap 과 latency 곡선으로 나란히 그린다
8. (선택) MuJoCo Menagerie 의 Go1 을 velocity command 추종 reward 로 감싼 환경에서 같은 실험을 반복한다

## 시작점

```text
sim2real-locomotion/
├── wrappers.py
├── train.py          # imports the PPO from the ppo project
├── evaluate.py
├── plots.py
└── test_wrappers.py
```

```python
from dataclasses import dataclass
import gymnasium as gym
import numpy as np

@dataclass
class DRRange:
    mass_scale: tuple[float, float] = (0.8, 1.2)
    friction_scale: tuple[float, float] = (0.5, 1.25)
    gear_scale: tuple[float, float] = (0.9, 1.1)

class DynamicsRandomization(gym.Wrapper):
    """resample physical parameters on every reset, always scaling from a saved nominal copy"""
    def __init__(self, env: gym.Env, ranges: DRRange | None, seed: int = 0): ...
    def reset(self, *, seed: int | None = None, options: dict | None = None): ...
    def set_params(self, mass_scale: float, friction_scale: float, gear_scale: float) -> None:
        """fix the parameters (used for evaluation); ranges=None disables resampling"""

class ActionLatency(gym.Wrapper):
    """apply the action chosen k steps ago; k may be resampled per episode from a range"""
    def __init__(self, env: gym.Env, k: int | tuple[int, int]): ...

class ObservationNoise(gym.ObservationWrapper):
    def __init__(self, env: gym.Env, std: float): ...

# evaluate.py
def evaluate_grid(policy_fn, mass_scales: list[float], friction_scales: list[float],
                  latencies: list[int], episodes: int = 20, seed: int = 0
                  ) -> dict[str, np.ndarray]:
    """returns {'return': ..., 'fall_rate': ...}, each indexed [latency, mass, friction]"""
```

## 평가 기준

- [ ] nominal policy 가 nominal `Ant-v5` 에서 10 episode 모두 넘어지지 않고(terminated 없이) 1000 step 을 채우며 앞으로 나아간다
- [ ] `set_params(1, 1, 1)`·latency 0·noise 0 으로 둔 wrapper 환경이 같은 seed·같은 action 열에서 원래 `Ant-v5` 와 똑같은
  observation 을 낸다(wrapper 가 nominal dynamics 를 건드리지 않는다는 pytest)
- [ ] 평가 격자 중 학습 범위 밖 칸에서 DR policy 의 평균 return 이 nominal policy 보다 높은 칸이 더 많다
- [ ] 학습 때 latency 를 0–2 step 으로 섞었다면, latency 2 step 에서 DR policy 의 넘어짐 비율이 nominal policy 보다 낮다
- [ ] nominal 조건에서 DR policy 가 nominal policy 대비 return 을 몇 % 잃는지 기록해 robustness 의 비용을 숫자로 남긴다
- [ ] (선택) Go1 환경이나 MuJoCo Playground 의 `Go1JoystickFlatTerrain` 에서 같은 비교를 반복한다

## 생각해 볼 질문

1. randomization 범위를 아주 넓히면 nominal 조건의 성능은 어떻게 되고, 그 이유는 무엇인가? 범위는 무엇을 근거로 정해야 하는가?
2. latency 가 있는 환경에서 policy 가 현재 observation 만 보면 왜 부족한가? 직전 action 몇 개를 observation 에 넣으면 무엇이 달라지는가?
3. domain randomization 으로 학습한 policy 는 지금 바닥 마찰이 얼마인지 모른 채 모든 마찰에 무난한 행동을 고른다. RMA 처럼 최근
   state·action 이력으로 그 값을 추정해 policy 에 넣으면 무엇을 더 얻는가?

## 힌트

<details>
<summary>MuJoCo model 값을 바꾸는 자리</summary>

`env.unwrapped.model` 의 `body_mass`·`geom_friction`·`actuator_gear` 는 numpy view 라서 값을 바로 바꿀 수 있다. reset 마다 nominal
값에 배율을 곱해야 하므로, 처음에 원본을 복사해 두지 않으면 배율이 episode 마다 누적된다. 질량을 바꿀 때는 `body_inertia` 도
같은 배율로 바꾸는 편이 물리적으로 맞다.

</details>

<details>
<summary>AsyncVectorEnv 안의 wrapper</summary>

`AsyncVectorEnv` 는 env 마다 별도 process 를 띄우므로 randomization wrapper 는 env 생성 함수 안에서 씌우고 seed 도 env 마다 다르게
준다. 평가처럼 parameter 를 밖에서 고정해야 할 때는 단일 env 에서 `set_params` 를 부르는 편이 단순하다.

</details>

<details>
<summary>DR policy 가 아예 걷지 못할 때</summary>

처음부터 넓은 범위로 학습하면 PPO 가 걷는 법을 찾기 전에 막힌다. 범위를 0 에서 시작해 학습 진행에 따라 넓히는 curriculum 을 쓰거나,
nominal policy 에서 이어서 학습한다.

</details>

## 참고 자료

- Gymnasium [Ant](https://gymnasium.farama.org/environments/mujoco/ant/) 문서 — observation·reward·종료 조건과 생성자 인자
- MuJoCo Menagerie [unitree_go1](https://github.com/google-deepmind/mujoco_menagerie/tree/main/unitree_go1) — (선택) 실제 4족 로봇 모델
- [MuJoCo Playground](https://playground.mujoco.org/) — GPU 병렬 학습과 sim-to-real 사례
- [legged_gym](https://github.com/leggedrobotics/legged_gym)·[rsl_rl](https://github.com/leggedrobotics/rsl_rl) — Rudin et al. 의 보행 환경과
  PPO 구현. Isaac Gym 기반이라 실행보다 reward 항과 randomization 설정을 읽는 용도. 막혔을 때만 열기
- [RMA 프로젝트 페이지](https://ashish-kmr.github.io/rma-legged-robots/) — base policy 와 adaptation module 의 실물 영상

## 남은 한계

sim-to-sim 평가는 reality gap 의 일부만 흉내 낸다. 실제 모터의 비선형 응답, 고르지 않은 지면, 센서 noise 까지 다루려면
actuator network(Hwangbo et al. 2019)나 RMA 같은 adaptation 을 붙이고, Unitree Go1·Go2 같은 실물 보행 로봇이나 MuJoCo Playground 의
sim-to-real 예제로 넘어가야 한다.
