---
id: world-model
title: "World Model"
branch: frontier
requires: [vae, policy-gradient]
hours: 40
summary: pixel 기반 latent dynamics 와 CEM planning
papers:
  - title: "World Models"
    authors: David Ha, Jürgen Schmidhuber
    year: 2018
    url: https://arxiv.org/abs/1803.10122
  - title: "Learning Latent Dynamics for Planning from Pixels"
    authors: Danijar Hafner et al.
    year: 2019
    url: https://arxiv.org/abs/1811.04551
  - title: "Dream to Control: Learning Behaviors by Latent Imagination"
    authors: Danijar Hafner, Timothy Lillicrap, Jimmy Ba, Mohammad Norouzi
    year: 2020
    url: https://arxiv.org/abs/1912.01603
  - title: "Mastering Diverse Domains through World Models"
    authors: Danijar Hafner, Jurgis Pasukonis, Jimmy Ba, Timothy Lillicrap
    year: 2023
    url: https://arxiv.org/abs/2301.04104
  - title: "TD-MPC2: Scalable, Robust World Models for Continuous Control"
    authors: Nicklas Hansen, Hao Su, Xiaolong Wang
    year: 2024
    url: https://arxiv.org/abs/2310.16828
  - title: "Cosmos World Foundation Model Platform for Physical AI"
    authors: NVIDIA
    year: 2025
    url: https://arxiv.org/abs/2501.03575
  - title: "V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning"
    authors: Mido Assran et al.
    year: 2025
    url: https://arxiv.org/abs/2506.09985
---

# World Model

## 배경

[Policy Gradient](../policy-gradient/README.md) 의 방법들은 환경이 어떻게 움직이는지 모른 채 시행착오만으로 배워서, CartPole 같은
작은 문제에도 많은 episode 가 필요하다. 환경의 다음 상태와 reward 를 예측하는 model(world model)을 데이터로 배워 두면, 실제
환경에서 움직이기 전에 model 안에서 행동의 결과를 미리 예측해 보고 고를 수 있다. 카메라 영상처럼 차원이 큰 입력은 [VAE](../vae/README.md)
같은 encoder 로 작은 latent $z_t$ 로 줄이고, dynamics 와 reward 는 그 latent 공간에서 배운다.

$$
z_t\sim q_\phi(z_t\mid o_{\le t}),\qquad \hat z_{t+1}= f_\psi(z_t,a_t),\qquad \hat r_t = g_\psi(z_t,a_t)
$$

행동은 model predictive control(MPC)로 고른다. 매 step 길이 $H$ 의 action sequence 후보를 여러 개 뽑아 latent 안에서 rollout 하고, 예측
reward 합이 큰 상위 후보로 sampling 분포를 다시 맞추는 cross-entropy method(CEM)를 몇 번 반복한 뒤 첫 action 만 실행한다.
다음 step 에서는 새 관측으로 다시 계획한다.

$$
a^*_{t:t+H}=\arg\max_{a_{t:t+H}}\ \sum_{k=t}^{t+H-1} g_\psi(\hat z_k, a_k),\qquad \hat z_t = z_t,\ \ \hat z_{k+1}=f_\psi(\hat z_k,a_k)
$$

Ha & Schmidhuber 2018 은 VAE 와 MDN-RNN 으로 world model 을 만들고 그 안에서 작은 controller 를 evolution strategy 로 학습했고, PlaNet 은
deterministic·stochastic 상태를 함께 쓰는 latent dynamics(RSSM)와 CEM 으로 64×64 image 만 보고 DeepMind Control 과제를 풀었다.
이 분야에는 아직 정해진 표준 구현이 없어서, decoder 로 image 를 복원할지, latent 를 확률적으로 둘지, 몇 step 을 펼쳐 학습할지에 따라
결과가 크게 달라진다. 최근에는 pixel 을 복원하지 않고 representation 공간에서만 예측하는 V-JEPA 2, 대규모 영상으로 학습한 Cosmos
같은 video world model 까지 나왔다. 이 과제에서는 논문 하나를 그대로 재현하기보다 작은 환경에서 이 선택들을 직접
비교한다.

## 목표

- `Pendulum-v1` 을 64×64 image 로만 관측하는 wrapper 와 무작위 행동 dataset 을 만든다
- VAE encoder 와 latent dynamics·reward model 을 학습한다
- latent 안에서 CEM 으로 계획하는 MPC agent 를 짜서 실제 환경에서 돌린다
- planner 가 모은 데이터를 다시 학습에 넣는 반복으로 model 을 개선한다
- 같은 CEM 을 실제 pendulum dynamics 로 돌린 oracle 과 비교해 model 오차가 성능을 얼마나 떨어뜨리는지 잰다

**직접 짤 것**: 데이터 수집, encoder·decoder, dynamics·reward model, multi-step 학습 loss, CEM planner, MPC 루프, oracle.
**가져다 써도 되는 것**: [VAE](../vae/README.md) 에서 짠 코드, gymnasium 렌더러, `torchvision` 의 resize, 아래 참고 구현.

## 준비물

- Python 3.12, `torch`, `torchvision`, `gymnasium[classic_control]`(Pendulum 렌더에 pygame 이 필요하다), matplotlib
- (선택) `dm_control` — PlaNet 이 쓴 cartpole swingup 같은 과제로 넓힐 때
- 8 GB GPU 로 충분하다. 64×64 image 수만 장과 작은 CNN·MLP·GRU 라 model 학습은 수십 분 단위이고, CEM 은 후보 수백–천 개를 batch
  하나로 계산하므로 GPU 에서 계획이 빨라진다

## 진행 순서

1. Pendulum 을 `render_mode="rgb_array"` 로 만들고 64×64 로 줄인 image 만 내보내는 wrapper 를 짠다(true state 는 평가용으로 `info` 에만 둔다)
2. 무작위 action 으로 episode 수십 개를 모아 `(o_t, a_t, r_t, o_{t+1})` dataset 을 저장한다
3. VAE 를 frame 에 학습해 복원 image 를 확인한다
4. 연속 2 frame 을 쌓는 방식과 GRU 로 history 를 요약하는 방식 중 하나를 골라 latent state 를 정의한다
5. latent dynamics 와 reward head 를 여러 step 을 펼친 예측 loss 로 학습한다
6. CEM 으로 action sequence 를 최적화해 매 step 첫 action 만 실행하는 MPC agent 를 짠다
7. planner 로 모은 episode 를 dataset 에 더해 model 을 다시 학습하는 반복을 몇 번 돈다
8. 같은 CEM 에 실제 pendulum 식을 model 로 넣은 oracle 을 돌려 return 을 비교한다

## 시작점

```text
world-model/
├── data.py          # pixel wrapper, dataset collection
├── vae.py           # reused from the VAE project
├── dynamics.py
├── planner.py       # CEM + MPC loop
├── oracle.py        # batched true pendulum dynamics for the same planner
├── train.py
└── test_world_model.py
```

```python
import gymnasium as gym
import numpy as np
import torch
import torch.nn as nn

# data.py
class PixelPendulum(gym.Wrapper):
    """observation = uint8 image (size, size, 3); true state only in info['state'] for evaluation"""
    def __init__(self, size: int = 64, action_repeat: int = 1): ...

def collect(env: gym.Env, policy, episodes: int) -> dict[str, np.ndarray]:
    """returns obs (N, T+1, 64, 64, 3), act (N, T, 1), rew (N, T)"""

# dynamics.py
class LatentDynamics(nn.Module):
    def __init__(self, z_dim: int, act_dim: int, hidden: int = 256): ...
    def step(self, z: torch.Tensor, a: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """returns (next z, predicted reward)"""
    def rollout(self, z0: torch.Tensor, actions: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """z0 (B, z_dim), actions (B, H, act_dim) -> z (B, H, z_dim), rewards (B, H)"""

def multistep_loss(model: LatentDynamics, z: torch.Tensor, a: torch.Tensor, r: torch.Tensor,
                   horizon: int) -> torch.Tensor:
    """open-loop prediction loss over `horizon` steps, starting from encoded z"""

# planner.py
def cem_plan(score_fn, act_dim: int, horizon: int = 12, candidates: int = 1000, top_k: int = 100,
             iters: int = 10, act_low: float = -2.0, act_high: float = 2.0) -> np.ndarray:
    """score_fn maps (candidates, horizon, act_dim) -> (candidates,) predicted return.
    returns the mean of the final sampling distribution, shape (horizon, act_dim)"""
```

## 평가 기준

- [ ] latent 에서 linear regression probe 로 읽은 $(\cos\theta, \sin\theta, \dot\theta)$ 의 $R^2$ 가 성분마다 0.9 이상이다(true state 는
  이 평가에만 쓴다)
- [ ] 실제 frame 에서 시작해 action 만 주고 10 step 을 open-loop 로 rollout 한 latent 를 probe 로 읽은 각도 오차를 step 별로 그렸고,
  decode 한 image 가 실제 frame 과 같은 쪽을 가리킨다
- [ ] latent MPC agent 의 평균 return 이 정규화 점수 $(R-R_\text{random})/(R_\text{oracle}-R_\text{random})$ 로 0.7 이상이다
- [ ] 데이터 수집 반복 횟수(0 회 = 무작위 데이터만)에 따라 return 이 오르는 곡선이 있다
- [ ] (선택) decoder 없이 latent 예측과 reward 예측만으로 학습한 판, 또는 RSSM 판을 같은 지표로 비교한다
- [ ] (선택) planner 를 latent 안에서 학습한 actor-critic 으로 바꾼 Dreamer 식 agent 를 [Policy Gradient](../policy-gradient/README.md) 코드로 만든다

## 생각해 볼 질문

1. decoder 를 빼고 다음 latent 를 맞히는 loss 만 쓰면 어떤 자명한 해로 collapse 하는가? reward 예측이나 천천히 움직이는 target encoder 는
   이 collapse 를 어떻게 막는가?
2. 한 step 예측 오차가 작아도 12 step 을 rollout 하면 크게 틀어질 수 있다. planner 는 model 이 틀린 곳을 어느 쪽으로 이용하게 되는가?
   매 step 다시 계획하는 MPC 는 이 문제를 어디까지 줄이는가?
3. 무작위 행동 데이터만으로 배운 model 은 pendulum 이 똑바로 선 근처를 거의 본 적이 없다. planner 로 모은 데이터를 다시 학습에
   넣는 반복은 이 문제를 어떻게 푸는가?

## 힌트

<details>
<summary>CEM 이 엉뚱한 action 을 고를 때</summary>

oracle 로 planner 부터 검증한다. oracle 도 pendulum 을 세우지 못하면 model 이 아니라 planner 문제라서 horizon, 후보 수, action repeat
(같은 action 을 2–4 step 반복해 실질 horizon 을 늘리는 것)부터 조정한다. oracle 은 세우는데 latent 판만 못 세우면 reward head 의
예측을 실제 reward 와 나란히 그려 본다.

</details>

<details>
<summary>open-loop 예측이 몇 step 만에 흐려질 때</summary>

한 step 예측 loss 만 쓰면 학습 때는 늘 실제 $z_t$ 에서 출발하지만 planning 때는 자기 예측 위에 다시 예측한다. 학습 때도 여러
step 을 자기 예측으로 펼쳐 loss 를 더하면 이 불일치가 줄어든다. PlaNet 의 latent overshooting 이 같은 문제를 다룬다.

</details>

<details>
<summary>oracle 을 batch 로 돌리는 법</summary>

Pendulum 의 dynamics 는 gymnasium 소스의 `step()` 안 몇 줄이라 numpy 나 torch 로 옮기면 후보 1000 개를 한 번에 계산할 수 있다.
env 를 1000 개 복사할 필요가 없다.

</details>

## 참고 자료

- David Ha, Jürgen Schmidhuber, [World Models](https://worldmodels.github.io/) — 그림을 직접 조작해 볼 수 있는 interactive 판
- Danijar Hafner, [PlaNet 프로젝트 페이지](https://danijar.com/project/planet/)·[DreamerV3 프로젝트 페이지](https://danijar.com/project/dreamerv3/)
- [Kaixhin/PlaNet](https://github.com/Kaixhin/PlaNet) — PlaNet 의 PyTorch 재구현. 막혔을 때만 열기
- [ctallec/world-models](https://github.com/ctallec/world-models) — Ha & Schmidhuber 의 PyTorch 재구현. 막혔을 때만 열기
- [TD-MPC2](https://tdmpc2.com/) — decoder 없는 latent model 위에서 계획하는 연속 제어 방법
- 더 읽을거리: NVIDIA [Cosmos](https://github.com/nvidia-cosmos/cosmos-predict2) — 대규모 영상으로 학습한 world foundation model,
  Meta [V-JEPA 2](https://github.com/facebookresearch/vjepa2) — representation 공간에서 예측하는 video model 과 그 위에서 CEM 으로
  계획하는 action-conditioned model(V-JEPA 2-AC)

## 남은 한계

이 과제의 world model 은 고정된 카메라로 보는 관절 하나짜리 pendulum 을 다룬다. 접촉이 많은 조작이나 실제 로봇 영상으로 가면
예측이 금방 흐려져서, latent 안에서 policy 까지 학습하는 DreamerV3 나 대규모 영상으로 사전학습한 Cosmos·V-JEPA 2 처럼 더 큰 model 과
데이터가 필요하다. V-JEPA 2-AC 는 DROID 의 로봇 영상 62 시간 미만으로 action-conditioned model 을 학습해 실물 Franka 팔에서
image goal planning 을 했는데, 이 과제의 latent CEM 과 비슷한 구조를 실물 규모로 키운 사례라서 다음에 읽을 만하다.
