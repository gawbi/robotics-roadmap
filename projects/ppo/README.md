---
id: ppo
title: "PPO"
branch: rl
requires: [policy-gradient]
hours: 24
summary: ratio clipping 으로 안정시킨 on-policy RL
papers:
  - title: "Trust Region Policy Optimization"
    authors: John Schulman, Sergey Levine, Philipp Moritz, Michael I. Jordan, Pieter Abbeel
    year: 2015
    url: https://arxiv.org/abs/1502.05477
  - title: "High-Dimensional Continuous Control Using Generalized Advantage Estimation"
    authors: John Schulman, Philipp Moritz, Sergey Levine, Michael Jordan, Pieter Abbeel
    year: 2015
    url: https://arxiv.org/abs/1506.02438
  - title: "Proximal Policy Optimization Algorithms"
    authors: John Schulman, Filip Wolski, Prafulla Dhariwal, Alec Radford, Oleg Klimov
    year: 2017
    url: https://arxiv.org/abs/1707.06347
  - title: "Implementation Matters in Deep Policy Gradients: A Case Study on PPO and TRPO"
    authors: Logan Engstrom et al.
    year: 2020
    url: https://arxiv.org/abs/2005.12729
  - title: "The 37 Implementation Details of Proximal Policy Optimization"
    authors: Shengyi Huang, Rousslan Fernand Julien Dossa, Antonin Raffin, Anssi Kanervisto, Weixun Wang
    year: 2022
    url: https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/
---

# PPO

## 배경

[Policy Gradient](../policy-gradient/README.md) 의 actor-critic 은 rollout 한 번으로 gradient step 을 한 번만 하고 데이터를 버린다.
같은 batch 로 update 를 여러 번 하면 policy 가 데이터를 모은 policy 에서 멀어져 gradient 추정이 틀어진다. 잘못된 update 로
성능이 한 번 크게 떨어진 policy 는 나쁜 데이터만 모으게 되어 회복하기 어렵다. TRPO 는 update 전후 policy 사이의 KL divergence
에 제약을 걸어 이 문제를 풀었지만 conjugate gradient 같은 2차 최적화가 필요했다.

PPO 는 그 제약을 probability ratio $r_t(\theta)$ 를 $[1-\epsilon, 1+\epsilon]$ 로 자르는 clipped surrogate 로 바꿔서, 일반적인
Adam 으로 같은 batch 를 여러 epoch 돌 수 있게 했다. advantage 는 TD error 를 $(\gamma\lambda)$ 로 지수 가중합한 GAE 로 추정한다.

$$
L^{\text{CLIP}}(\theta)=\mathbb E_t\Big[\min\big(r_t(\theta)\hat A_t,\ \operatorname{clip}(r_t(\theta),1-\epsilon,1+\epsilon)\,\hat A_t\big)\Big],
\qquad r_t(\theta)=\frac{\pi_\theta(a_t\mid s_t)}{\pi_{\theta_\text{old}}(a_t\mid s_t)}
$$

$$
\hat A_t=\sum_{l\ge 0}(\gamma\lambda)^l\,\delta_{t+l},\qquad \delta_t=r_t+\gamma V(s_{t+1})-V(s_t)
$$

식은 짧지만 성능의 상당 부분이 observation normalization, advantage normalization, orthogonal init, learning rate annealing 같은
구현 세부에서 나온다(Engstrom et al. 2020, Huang et al. 2022). 그래서 이번 과제의 비교 기준은 논문 속 숫자가 아니라 같은 세부를
갖춘 CleanRL 구현을 같은 step 만큼 돌린 결과다. sim 에서 보행 policy 를 학습할 때도 PPO 를 많이 쓰고, legged_gym 과
MuJoCo Playground 의 기본 학습 알고리즘도 PPO 다.

## 목표

- GAE 와 clipped surrogate 를 쓰는 PPO 를 짜서 `CartPole-v1` 을 푼다
- 같은 코드에 Gaussian policy 를 붙여 연속 action 의 HalfCheetah 로 옮긴다
- CleanRL `ppo_continuous_action.py` 를 같은 환경·같은 step 으로 돌려 학습 곡선을 겹쳐 그린다
- clipping 을 끈 ablation 에서 approx KL 과 return 이 어떻게 달라지는지 기록한다

**직접 짤 것**: rollout buffer, GAE, clipped policy loss, value loss, entropy bonus, minibatch epoch 루프, 연속 action 용 Gaussian policy.
**가져다 써도 되는 것**: `gymnasium.vector.SyncVectorEnv`, `RecordEpisodeStatistics`·`NormalizeObservation`·`NormalizeReward`·`ClipAction`
같은 gymnasium wrapper, tensorboard.

## 준비물

- Python 3.12, `torch`, `gymnasium[classic_control,mujoco]`, `tensorboard`
- CleanRL 비교용 가상환경을 따로 둔다. CleanRL 은 Python 3.11 미만과 gymnasium 0.29.1 에 맞춰져 있어서 `uv venv -p 3.10` 으로
  만든 환경에 CleanRL README 대로 `".[mujoco]"` extra 를 설치한다. `ppo_continuous_action.py` 의 기본값이 `HalfCheetah-v4`·1M step
  이므로 내 코드도 v4 로 맞춘다(gymnasium 1.x 에도 deprecated 경고와 함께 남아 있다)
- CPU 로 충분하다. HalfCheetah 1M step 은 CPU 에서 수십 분에서 한두 시간 걸리고, network 가 작아서 GPU 가 있어도 크게 빨라지지 않는다

## 진행 순서

1. `SyncVectorEnv` 로 CartPole 4 개를 띄워 `(num_steps, num_envs)` 모양의 rollout buffer 를 채운다
2. rollout 끝에서부터 거꾸로 훑으며 GAE 와 return 을 계산하는 함수를 짠다
3. buffer 를 minibatch 로 섞어 clipped policy loss·value loss·entropy 를 여러 epoch 동안 최적화한다
4. approx KL·clip fraction·explained variance 를 update 마다 기록하면서 `CartPole-v1` 을 학습한다
5. state 와 무관한 log std parameter 를 쓰는 Gaussian policy 를 붙인다
6. observation·reward normalization wrapper 를 씌워 `HalfCheetah-v4` 를 1M step 학습한다
7. CleanRL `ppo_continuous_action.py` 를 같은 env·같은 step·seed 3 개로 돌린다
8. 두 구현의 episode return 곡선을 step 축에 겹쳐 그린다

## 시작점

```text
ppo/
├── config.py
├── buffer.py
├── agent.py
├── ppo.py
├── compare_cleanrl.py
└── test_ppo.py
```

```python
from dataclasses import dataclass
import torch
import torch.nn as nn

# config.py
@dataclass
class PPOConfig:
    env_id: str = "CartPole-v1"
    num_envs: int = 4
    num_steps: int = 128            # rollout length per env
    total_steps: int = 500_000
    gamma: float = 0.99
    gae_lambda: float = 0.95
    clip_eps: float = 0.2
    update_epochs: int = 4
    num_minibatches: int = 4
    lr: float = 2.5e-4
    ent_coef: float = 0.01
    vf_coef: float = 0.5
    max_grad_norm: float = 0.5
    seed: int = 0

# buffer.py
def compute_gae(rewards: torch.Tensor, values: torch.Tensor, dones: torch.Tensor,
                next_value: torch.Tensor, next_done: torch.Tensor, gamma: float, lam: float
                ) -> tuple[torch.Tensor, torch.Tensor]:
    """inputs are (T, N) except next_*: (N,); returns (advantages, returns), both (T, N)"""

# agent.py
class DiscreteAgent(nn.Module):
    def __init__(self, obs_dim: int, n_actions: int): ...
    def value(self, obs: torch.Tensor) -> torch.Tensor: ...
    def act(self, obs: torch.Tensor, action: torch.Tensor | None = None
            ) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """returns (action, log_prob, entropy); scores `action` instead of sampling if given"""

class GaussianAgent(nn.Module):
    """same value/act interface; log_std is a free nn.Parameter of shape (act_dim,)"""
    def __init__(self, obs_dim: int, act_dim: int): ...

# ppo.py
def ppo_loss(agent: nn.Module, mb: dict[str, torch.Tensor], cfg: PPOConfig
             ) -> tuple[torch.Tensor, dict[str, float]]:
    """returns (total loss, stats such as approx_kl, clipfrac, entropy, value_loss)"""

def train(cfg: PPOConfig) -> nn.Module: ...
```

## 평가 기준

- [ ] 500k step 안에 `CartPole-v1` 의 최근 episode 평균 return 이 475 이상에 도달한다
- [ ] `compute_gae` 에 $\lambda=0$ 을 넣으면 one-step TD error 가, $\lambda=1$ 을 넣으면 Monte Carlo return 에서 value 를 뺀 값이 나온다
  (pytest 로 확인)
- [ ] `HalfCheetah-v4` 1M step 에서 내 PPO 의 최종 episode return 이 같은 step 의 CleanRL `ppo_continuous_action.py`
  (`--env-id HalfCheetah-v4`) 대비 3 seed 평균 80% 이상이다
- [ ] 학습 중 approx KL 과 clip fraction 이 어느 범위에 머무는지 기록했고, 한 update 에서 approx KL 이 튀는 순간 return 곡선에
  무슨 일이 생기는지 설명할 수 있다
- [ ] (선택) `clip_eps` 를 아주 크게 하고 `update_epochs` 를 10 으로 늘린 ablation 에서 approx KL 이 커지고 return 이 흔들리는 것을
  원래 설정과 나란히 그린다

## 생각해 볼 질문

1. advantage 가 양수일 때와 음수일 때 clipped surrogate 가 각각 $r_t(\theta)$ 의 어느 쪽 변화만 막는지 그래프로 그릴 수 있는가?
   양쪽을 모두 막지 않는 이유는 무엇인가?
2. GAE 의 $\lambda$ 를 0 에서 1 로 올리면 advantage 추정의 bias 와 variance 는 각각 어떻게 변하는가?
3. 같은 데이터를 여러 epoch 쓰는데도 PPO 를 off-policy 가 아니라 on-policy 라고 부르는 이유는 무엇인가? 데이터를 몇 번까지
   재사용할 수 있는지는 무엇이 정하는가?

## 힌트

<details>
<summary>gymnasium 1.x vector env 의 autoreset</summary>

gymnasium 1.x 의 vector env 는 기본값이 next-step autoreset 이라서, 한 env 가 끝난 바로 다음 `step()` 호출은 그 env 를 reset 하는 데
쓰이고 그때 넣은 action 은 무시된다. 이 transition 을 그대로 buffer 에 넣으면 GAE 계산에 엉뚱한 값이 섞인다. 그 step 을 mask 하거나,
`autoreset_mode` 를 same-step 으로 바꿔 끝난 step 에서 바로 reset obs 를 받는 방식 중 하나를 고른다. 두 모드의 차이는 Farama 의
[Autoreset Modes 글](https://farama.org/Vector-Autoreset-Mode)에 정리돼 있다.

</details>

<details>
<summary>ratio 가 처음부터 1 이 아닐 때</summary>

첫 epoch 의 첫 minibatch 에서는 $\theta = \theta_\text{old}$ 이므로 ratio 가 정확히 1 이어야 한다. 1 이 아니면 rollout 때 저장한
log-prob 와 update 때 다시 계산한 log-prob 사이에서 action 이나 normalization 상태가 달라졌다. Gaussian policy 에서는 action
차원별 log-prob 를 합쳤는지도 확인한다.

</details>

<details>
<summary>HalfCheetah 에서 CleanRL 보다 한참 낮을 때</summary>

[37 Implementation Details](https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/) 의 continuous action 항목을
하나씩 대조한다. observation·reward normalization, 마지막 layer 의 작은 init, learning rate annealing, advantage normalization
가운데 빠진 것이 있는지부터 본다.

</details>

## 참고 자료

- OpenAI Spinning Up, [Proximal Policy Optimization](https://spinningup.openai.com/en/latest/algorithms/ppo.html) — 의사코드와 PPO-clip 해설
- Huang et al., [The 37 Implementation Details of Proximal Policy Optimization](https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/)
  — CleanRL 저자들이 원래 구현의 세부를 하나씩 재현한 글
- CleanRL [PPO 문서](https://docs.cleanrl.dev/rl-algorithms/ppo/) — 환경별 benchmark 곡선
- CleanRL [`ppo.py`](https://github.com/vwxyzjn/cleanrl/blob/master/cleanrl/ppo.py)·[`ppo_continuous_action.py`](https://github.com/vwxyzjn/cleanrl/blob/master/cleanrl/ppo_continuous_action.py)
  — 비교 기준이자 참고 구현. 막혔을 때만 열기
- UC Berkeley CS 285, [Deep Reinforcement Learning](https://rail.eecs.berkeley.edu/deeprlcourse/) — advanced policy gradient 강의

## 남은 한계

이 policy 는 학습한 바로 그 simulator parameter 에서만 잘 달린다고 보장되고, mass 나 friction 이 조금만 달라져도 넘어질 수 있다.
dynamics 를 바꿔 가며 학습해 robust 한 보행을 얻는 과제가 [Sim-to-Real Locomotion](../sim2real-locomotion/README.md) 이고, PPO 로
시연 기반 VLA 를 reward 로 다듬는 과제가 [VLA + RL](../vla-rl/README.md) 이다.
