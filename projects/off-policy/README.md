---
id: off-policy
title: "DQN → SAC"
branch: rl
requires: [bandit-mdp, pytorch-mlp]
hours: 24
summary: DQN 에서 SAC 까지, 데이터를 재사용하는 off-policy RL
papers:
  - title: "Playing Atari with Deep Reinforcement Learning"
    authors: Volodymyr Mnih et al.
    year: 2013
    url: https://arxiv.org/abs/1312.5602
  - title: "Human-level control through deep reinforcement learning"
    authors: Volodymyr Mnih et al.
    year: 2015
    url: https://www.nature.com/articles/nature14236
  - title: "Continuous control with deep reinforcement learning"
    authors: Timothy P. Lillicrap et al.
    year: 2015
    url: https://arxiv.org/abs/1509.02971
  - title: "Soft Actor-Critic: Off-Policy Maximum Entropy Deep Reinforcement Learning with a Stochastic Actor"
    authors: Tuomas Haarnoja, Aurick Zhou, Pieter Abbeel, Sergey Levine
    year: 2018
    url: https://arxiv.org/abs/1801.01290
  - title: "Addressing Function Approximation Error in Actor-Critic Methods"
    authors: Scott Fujimoto, Herke van Hoof, David Meger
    year: 2018
    url: https://arxiv.org/abs/1802.09477
  - title: "Soft Actor-Critic Algorithms and Applications"
    authors: Tuomas Haarnoja et al.
    year: 2018
    url: https://arxiv.org/abs/1812.05905
  - title: "Efficient Online Reinforcement Learning with Offline Data"
    authors: Philip J. Ball, Laura Smith, Ilya Kostrikov, Sergey Levine
    year: 2023
    url: https://arxiv.org/abs/2302.02948
  - title: "SERL: A Software Suite for Sample-Efficient Robotic Reinforcement Learning"
    authors: Jianlan Luo et al.
    year: 2024
    url: https://arxiv.org/abs/2401.16013
  - title: "Precise and Dexterous Robotic Manipulation via Human-in-the-Loop Reinforcement Learning"
    authors: Jianlan Luo, Charles Xu, Jeffrey Wu, Sergey Levine
    year: 2024
    url: https://arxiv.org/abs/2410.21845
---

# DQN → SAC

## 배경

[Bandits & MDPs](../bandit-mdp/README.md) 의 Q-learning 은 Q 를 state 마다 칸이 하나씩 있는 표에 담았는데, CartPole 의
state 는 연속값 4 개라 표를 만들 수 없다. Q 를 neural network $Q_\theta(s,a)$ 로 바꿔 TD target 쪽으로 regression 하면 될 것
같지만, 실제로는 학습이 쉽게 발산한다. 연달아 들어오는 transition 끼리 correlation 이 강하고, target 도 update 마다 함께
움직이기 때문이다. DQN 은 지난 transition 을 replay buffer 에 쌓아 두고 무작위로 뽑아 학습하고(2013), target 은 천천히 따라오는
target network $Q_{\bar\theta}$ 로 계산한다(2015).

$$
\mathcal L(\theta) = \mathbb E_{(s,a,r,s',d)\sim\mathcal D}\Big[\big(r + \gamma(1-d)\max_{a'} Q_{\bar\theta}(s',a') - Q_\theta(s,a)\big)^2\Big]
$$

action 이 연속이면 $\max_{a'}$ 를 계산할 수 없어서, $Q$ 를 크게 만드는 action 을 내는 actor 를 따로 학습한다(DDPG, TD3).
SAC 는 여기에 policy 의 entropy 를 reward 에 더한 maximum entropy objective 를 써서, 탐색을 policy 자체가 맡게 했다. critic 두
개 중 작은 값을 쓰는 clipped double Q 와 tanh 로 범위를 묶은 Gaussian actor 를 쓰고, entropy 항의 weight 인 temperature $\alpha$ 도
자동으로 조정한다.

$$
y = r + \gamma(1-d)\Big(\min_{i=1,2} Q_{\bar\theta_i}(s',a') - \alpha\log\pi_\phi(a'\mid s')\Big),\qquad a'\sim\pi_\phi(\cdot\mid s')
$$

이 계열은 한 번 모은 transition 을 버리지 않고 학습에 여러 번 쓰므로 같은 성능에 필요한 환경 step 이 적다. 실물 로봇에서는
step 하나가 곧 실제로 흐르는 시간이라 step 을 아껴야 하고, 그래서 시연 데이터를 buffer 에 섞어 실물에서 바로 학습하는
RLPD·SERL·HIL-SERL 같은 sample-efficient robot RL 이 모두 SAC 를 바탕으로 한다.

## 목표

- replay buffer 와 target network 를 갖춘 DQN 으로 `CartPole-v1` 을 푼다
- target network 와 replay buffer 를 하나씩 빼는 ablation 으로 둘의 역할을 확인한다
- 같은 코드에 tanh-squashed Gaussian actor 와 twin critic 을 붙여 SAC 를 짜고 `Pendulum-v1` 을 푼다
- SAC 를 HalfCheetah 로 옮겨 CleanRL `sac_continuous_action.py` 와 같은 step 에서 비교한다

**직접 짤 것**: replay buffer, Q-network·actor·critic, TD target, soft target update, tanh-squashed Gaussian 의 log-prob,
temperature 자동 조정.
**가져다 써도 되는 것**: gymnasium 환경과 `RecordEpisodeStatistics` 같은 wrapper, `torch.optim`, tensorboard 같은 logging 도구.

## 준비물

- Python 3.12, `torch`, `gymnasium[classic_control,mujoco]`, `tensorboard`(선택)
- CleanRL 비교용 가상환경을 따로 둔다. CleanRL 은 Python 3.11 미만과 gymnasium 0.29.1 에 맞춰져 있어서 `uv venv -p 3.10` 으로
  만든 환경에 CleanRL README 대로 `".[mujoco]"` extra 를 설치한다. CleanRL 의 기본 env 가 v4 이므로 내 코드도 `HalfCheetah-v4` 로 맞춘다
  (gymnasium 1.x 에도 deprecated 경고와 함께 남아 있다)
- `CartPole-v1`·`Pendulum-v1` 은 CPU 로 충분하다. HalfCheetah 는 network 가 작아 8 GB GPU 로 넉넉하지만 환경 step 마다
  update 를 하므로 수십만 step 에 몇 시간이 걸린다

## 진행 순서

1. 고정 크기 ring buffer 로 replay buffer 를 짜고 `sample(batch_size)` 가 tensor 묶음을 돌려주게 한다
2. `CartPole-v1` 용 Q-network 와 ε 을 선형으로 줄여 가는 ε-greedy 행동 선택을 짠다
3. target network 로 TD target 을 계산하는 DQN 학습 루프를 짜서 CartPole 을 푼다
4. target network 를 매 step 동기화한 판과 buffer 를 batch 크기로 줄인 판을 3 seed 씩 돌려 학습 곡선을 겹쳐 그린다
5. tanh-squashed Gaussian actor 와 twin Q critic 을 짜고 log-prob 를 `torch.distributions` 로 검산한다
6. critic → actor → temperature → soft target 순서의 SAC update 를 짜서 `Pendulum-v1` 을 푼다
7. 같은 코드로 `HalfCheetah-v4` 를 300k step 학습한다
8. CleanRL `sac_continuous_action.py` 를 같은 env·같은 step·seed 3 개로 돌려 평가 return 을 비교한다

## 시작점

```text
off-policy/
├── buffer.py
├── nets.py
├── dqn.py
├── sac.py
├── evaluate.py
└── test_off_policy.py
```

```python
from dataclasses import dataclass
import numpy as np
import torch
import torch.nn as nn

# buffer.py
@dataclass
class Batch:
    obs: torch.Tensor        # (B, obs_dim)
    act: torch.Tensor        # (B,) long for DQN, (B, act_dim) float for SAC
    rew: torch.Tensor        # (B,)
    next_obs: torch.Tensor   # (B, obs_dim)
    done: torch.Tensor       # (B,) 1.0 only when the episode terminated

class ReplayBuffer:
    def __init__(self, capacity: int, obs_dim: int, act_shape: tuple[int, ...], device: str): ...
    def add(self, obs: np.ndarray, act: np.ndarray | int, rew: float, next_obs: np.ndarray,
            terminated: bool) -> None: ...
    def sample(self, batch_size: int) -> Batch: ...

# nets.py
class QNetwork(nn.Module):
    """DQN: obs -> one Q value per discrete action"""
    def __init__(self, obs_dim: int, n_actions: int, hidden: int = 128): ...
    def forward(self, obs: torch.Tensor) -> torch.Tensor: ...

class TwinCritic(nn.Module):
    """SAC: (obs, act) -> (q1, q2)"""
    def __init__(self, obs_dim: int, act_dim: int, hidden: int = 256): ...
    def forward(self, obs: torch.Tensor, act: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]: ...

class SquashedGaussianActor(nn.Module):
    def __init__(self, obs_dim: int, act_dim: int, act_low: np.ndarray, act_high: np.ndarray): ...
    def forward(self, obs: torch.Tensor, deterministic: bool = False
                ) -> tuple[torch.Tensor, torch.Tensor]:
        """returns (action scaled to env bounds, log_prob) via the reparameterization trick"""

# dqn.py
def dqn_loss(q: QNetwork, q_target: QNetwork, batch: Batch, gamma: float) -> torch.Tensor: ...
def train_dqn(env_id: str = "CartPole-v1", total_steps: int = 500_000, seed: int = 0) -> QNetwork: ...

# sac.py
def soft_update(target: nn.Module, source: nn.Module, tau: float) -> None: ...
def train_sac(env_id: str = "Pendulum-v1", total_steps: int = 50_000, seed: int = 0
              ) -> SquashedGaussianActor: ...

# evaluate.py
def evaluate(policy_fn, env_id: str, episodes: int = 10, seed: int = 100) -> tuple[float, float]:
    """deterministic rollouts; returns (mean return, std)"""
```

## 스스로 확인

- [ ] DQN 의 greedy policy 가 500k step 안에 `CartPole-v1` 에서 10 episode 평균 return 475(환경의 `reward_threshold`) 이상을 낸다
- [ ] ablation 곡선을 원래 DQN 과 겹친 그림에서 seed 간 편차와 학습 후반의 성능 붕괴가 어느 판에서 커지는지 설명할 수 있다
- [ ] `SquashedGaussianActor` 의 log-prob 가 `TransformedDistribution(Normal(μ, σ), TanhTransform())` 로 계산한 값과
  env 범위로 scale 하기 전 기준 $10^{-4}$ 안에서 일치한다
- [ ] SAC 가 50k step 안에 `Pendulum-v1` 에서 10 episode 평균 return -200 이상에 도달한다
- [ ] `HalfCheetah-v4` 300k step 에서 내 SAC 의 평가 return 이 같은 step 의 CleanRL `sac_continuous_action.py`
  (`--env-id HalfCheetah-v4`) 대비 3 seed 평균 80% 이상이다
- [ ] (선택) temperature $\alpha$ 와 policy entropy 를 기록해 entropy 가 target 값 $-\dim\mathcal A$ 근처로 모이는 것을 확인한다

## 생각해 볼 질문

1. TD target 에 $\max_{a'} Q$ 를 쓰면 Q 추정에 noise 가 있을 때 value 가 실제보다 큰 쪽으로 치우친다. 그 이유는 무엇이고,
   SAC 의 $\min_{i} Q_{\bar\theta_i}$ 는 이 치우침을 어떻게 줄이는가?
2. Q-learning 의 update 식에는 그 transition 을 모은 policy 가 어디에도 들어가지 않는다. 이 점이 오래된 transition 을 계속
   써도 되는 이유와 어떻게 이어지는가? 그런데도 replay buffer 크기에 상한을 두는 이유는 무엇인가?
3. 실물 로봇 RL 이 simulator 에서 흔히 쓰는 on-policy 방법이 아니라 이 계열을 고르는 이유를 환경 step 하나의 비용으로 설명할 수 있는가?

## 힌트

<details>
<summary>terminated 와 truncated</summary>

gymnasium 은 episode 끝을 `terminated`(성공·실패로 진짜 끝남)와 `truncated`(시간 제한으로 끊김)로 나눠 준다. 시간 제한으로
끊긴 state 에는 미래가 남아 있으므로 TD target 에서 $\gamma Q(s', \cdot)$ 를 지우면 안 되고, `terminated` 일 때만 지운다.
`CartPole-v1` 은 500 step 에서 truncated 되므로 이 구분이 결과에 바로 드러난다.

</details>

<details>
<summary>tanh 를 거친 action 의 log-prob</summary>

$u\sim\mathcal N(\mu,\sigma^2)$ 를 $a=\tanh(u)$ 로 바꾸면 change of variables 로 $\log\pi(a) = \log\mathcal N(u) - \sum_j \log(1-\tanh^2 u_j)$
가 된다. $1-\tanh^2 u$ 가 0 에 가까워지면 log 가 발산하므로 작은 상수를 더하거나, 같은 식을 softplus 로 다시 쓴 꼴을 찾아본다.

</details>

<details>
<summary>SAC 가 Pendulum 에서 배우지 못할 때</summary>

critic loss 가 계속 커지면 target 계산이 `torch.no_grad()` 밖에 있지 않은지 본다. actor loss 에는 target network 가 아니라
현재 critic 을 쓴다. 학습 시작 전 몇천 step 동안 무작위 action 으로 buffer 를 채우는지도 확인한다.

</details>

## 참고 자료

- OpenAI Spinning Up, [Soft Actor-Critic](https://spinningup.openai.com/en/latest/algorithms/sac.html) — 의사코드와 구현상 주의점
- CleanRL [DQN 문서](https://docs.cleanrl.dev/rl-algorithms/dqn/)·[SAC 문서](https://docs.cleanrl.dev/rl-algorithms/sac/)
  — 환경별 benchmark 곡선이 있어 비교 기준으로 쓴다
- CleanRL [`dqn.py`](https://github.com/vwxyzjn/cleanrl/blob/master/cleanrl/dqn.py)·[`sac_continuous_action.py`](https://github.com/vwxyzjn/cleanrl/blob/master/cleanrl/sac_continuous_action.py)
  — 파일 하나에 알고리즘 하나. 막혔을 때만 열기
- UC Berkeley CS 285, [Deep Reinforcement Learning](https://rail.eecs.berkeley.edu/deeprlcourse/) — Q-learning·actor-critic 강의
- [SERL](https://serl-robot.github.io/)·[HIL-SERL](https://hil-serl.github.io/) 프로젝트 페이지 — 이 계열을 실물 팔에서 돌린 시스템
- LeRobot, [HIL-SERL guide](https://huggingface.co/docs/lerobot/hilserl) — SO-101 같은 저가 팔에서 SAC 기반 실물 RL 을 돌리는 절차

## 남은 한계

지금 policy 는 state 벡터를 보고 simulator 안에서만 학습했다. 카메라 영상 입력, 시연을 buffer 에 섞는 RLPD 식 학습,
사람이 중간에 개입하는 실물 학습까지 가려면 LeRobot 의 HIL-SERL 구현을 SO-101 같은 팔에 붙여 보는 것이 다음 단계다.
off-policy 학습을 VLA 의 noise 공간에 쓰는 방법은 [VLA + RL](../vla-rl/README.md) 에서 다시 다룬다.
