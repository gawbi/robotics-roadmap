---
id: policy-gradient
title: "Policy Gradient"
branch: rl
requires: [bandit-mdp, pytorch-mlp]
hours: 14
summary: REINFORCE 에서 actor-critic 까지의 policy 학습
papers:
  - title: "Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning"
    authors: Ronald J. Williams
    year: 1992
    url: https://doi.org/10.1007/BF00992696
  - title: "Policy Gradient Methods for Reinforcement Learning with Function Approximation"
    authors: Richard S. Sutton, David McAllester, Satinder Singh, Yishay Mansour
    year: 1999
    url: https://papers.nips.cc/paper/1999/hash/464d828b85b0bed98e80ade0a5c43b0f-Abstract.html
  - title: "Asynchronous Methods for Deep Reinforcement Learning"
    authors: Volodymyr Mnih et al.
    year: 2016
    url: https://arxiv.org/abs/1602.01783
---

# Policy Gradient

## 배경

[Bandits & MDPs](../bandit-mdp/README.md) 의 방법은 value 를 먼저 배우고 policy 는 $\arg\max$ 로 뽑았는데, action 이 연속이거나
확률적으로 행동해야 하는 문제에서는 이 $\arg\max$ 가 문제가 된다. policy gradient 는 policy 를 parameter 가 $\theta$ 인
확률분포 $\pi_\theta(a\mid s)$ 로 두고, 기대 return $J(\theta)$ 를 gradient ascent 로 직접 키운다. 환경 dynamics 는 미분할 수
없지만 log-derivative trick 을 쓰면 dynamics 항이 사라져서, gradient 를 rollout sample 의 평균으로 추정할 수 있다.

$$
\nabla_\theta J(\theta) = \mathbb E_{\tau\sim\pi_\theta}\Big[\sum_t \nabla_\theta \log\pi_\theta(a_t\mid s_t)\,\big(G_t - b(s_t)\big)\Big],
\qquad G_t=\sum_{k\ge t}\gamma^{k-t} r_k
$$

Williams 의 REINFORCE 는 episode 를 끝까지 돌려 얻은 return $G_t$ 를 그대로 쓴다. 이 추정은 unbiased 지만 variance 가 커서
학습이 느리고 흔들리는데, action 에 의존하지 않는 baseline $b(s_t)$ 를 빼면 기댓값은 그대로 두고 variance 만 줄일 수 있다.
baseline 으로 학습한 value function $V_\phi(s)$ 를 쓰고 return 까지 $r_t + \gamma V_\phi(s_{t+1})$ 로 bootstrap 하면 actor-critic 이
된다. 그러면 variance 는 더 줄지만 $V_\phi$ 가 틀린 만큼 bias 가 생긴다.

$$
\hat A_t = r_t + \gamma V_\phi(s_{t+1}) - V_\phi(s_t)
$$

이번 과제에서는 세 estimator 를 같은 CartPole 에서 차례로 짜고, gradient 추정의 variance 를 직접 재서 그 차이를 숫자로 확인한다.

## 목표

- 작은 bandit 에서 REINFORCE gradient 추정이 해석적 gradient 와 맞는지 검산한다
- REINFORCE 로 `CartPole-v1` 을 푼다
- 학습한 value baseline 을 빼서 같은 $\theta$ 에서 gradient variance 가 줄어드는 것을 잰다
- one-step TD advantage 를 쓰는 actor-critic 을 짜고 세 방법의 학습 속도를 비교한다

**직접 짤 것**: categorical policy network, reward-to-go 계산, policy gradient loss, value baseline, actor-critic update,
gradient variance 측정.
**가져다 써도 되는 것**: gymnasium 환경, `torch.distributions.Categorical`, `torch.optim`.

## 준비물

- Python 3.12, `torch`, `gymnasium[classic_control]`, matplotlib
- GPU 불필요(CPU 로 실험 하나에 몇 분)

## 진행 순서

1. arm 3 개짜리 bandit 에서 softmax policy 의 $\nabla_\theta J$ 를 손으로 유도해 함수로 짠다
2. 같은 bandit 에서 sample 수를 늘려 가며 REINFORCE 추정을 해석적 gradient 와 비교한다
3. `CartPole-v1` 에서 episode 를 모으고 reward-to-go $G_t$ 를 계산하는 rollout 함수를 짠다
4. $-\sum_t \log\pi_\theta(a_t\mid s_t)\,G_t$ 를 loss 로 두는 REINFORCE 로 CartPole 을 학습한다
5. value network 를 baseline 으로 붙여 $G_t - V_\phi(s_t)$ 를 weight 로 쓴다
6. $\theta$ 를 고정한 채 batch 100 개로 gradient 를 다시 뽑아 baseline 이 있을 때와 없을 때의 variance 를 잰다
7. weight 를 $\hat A_t = r_t + \gamma V_\phi(s_{t+1}) - V_\phi(s_t)$ 로 바꾼 actor-critic 을 짠다
8. 세 방법을 5 seed 씩 돌려 episode 수 대비 return 곡선을 겹쳐 그린다

## 시작점

```text
policy-gradient/
├── bandit_check.py
├── policy.py
├── rollout.py
├── reinforce.py
├── actor_critic.py
└── test_policy_gradient.py
```

```python
import gymnasium as gym
import torch
import torch.nn as nn

# bandit_check.py
def analytic_grad(theta: torch.Tensor, q: torch.Tensor) -> torch.Tensor:
    """d/dtheta of sum_a softmax(theta)_a * q_a"""

def reinforce_grad(theta: torch.Tensor, q: torch.Tensor, n_samples: int, noise_std: float = 1.0
                   ) -> torch.Tensor:
    """Monte Carlo estimate from sampled arms and noisy rewards"""

# policy.py
class CategoricalPolicy(nn.Module):
    def __init__(self, obs_dim: int, n_actions: int, hidden: int = 64): ...
    def dist(self, obs: torch.Tensor) -> torch.distributions.Categorical: ...

class ValueNet(nn.Module):
    def __init__(self, obs_dim: int, hidden: int = 64): ...
    def forward(self, obs: torch.Tensor) -> torch.Tensor: ...   # (B,)

# rollout.py
def collect_episodes(env: gym.Env, policy: CategoricalPolicy, n_episodes: int
                     ) -> list[dict[str, torch.Tensor]]:
    """each dict holds obs (T, obs_dim), act (T,), rew (T,), next_obs (T, obs_dim), terminated (T,)"""

def reward_to_go(rew: torch.Tensor, gamma: float) -> torch.Tensor: ...

# reinforce.py
def pg_loss(policy: CategoricalPolicy, obs: torch.Tensor, act: torch.Tensor,
            weights: torch.Tensor) -> torch.Tensor:
    """surrogate whose gradient equals the policy gradient estimate"""

def grad_variance(policy: CategoricalPolicy, env: gym.Env, baseline: ValueNet | None,
                  n_batches: int = 100, episodes_per_batch: int = 10) -> float:
    """total variance of the flattened policy gradient across batches, policy params fixed"""

# actor_critic.py
def train_actor_critic(env_id: str = "CartPole-v1", episodes: int = 1000, seed: int = 0
                       ) -> tuple[CategoricalPolicy, ValueNet]: ...
```

## 스스로 확인

- [ ] bandit 검산에서 sample 10만 개로 낸 REINFORCE gradient 와 해석적 gradient 의 cosine similarity 가 0.99 이상이다
- [ ] REINFORCE 가 `CartPole-v1` 에서 최근 100 episode 평균 return 475 이상에 도달한다(도달하지 못한 seed 가 있으면 그 비율도 적는다)
- [ ] 같은 $\theta$ 에서 value baseline 을 뺀 gradient 의 variance 가 빼지 않은 것보다 작다
- [ ] 475 에 도달하기까지 걸린 episode 수를 세 방법별 5 seed 중앙값으로 표에 정리했고, baseline 판이 REINFORCE 보다 빠르다
- [ ] (선택) reward-to-go 를 episode 전체 return 으로 바꿔 모든 step 에 곱한 판을 만들어 같은 방법으로 variance 를 비교한다

## 생각해 볼 질문

1. $\mathbb E_{a\sim\pi_\theta}\big[\nabla_\theta\log\pi_\theta(a\mid s)\big] = 0$ 에서 출발해 baseline 을 빼도 gradient 의 기댓값이 변하지
   않는 이유를 설명할 수 있는가? baseline 이 action 에도 의존하면 무엇이 깨지는가?
2. REINFORCE 는 batch 하나로 gradient step 을 한 번만 하고 그 데이터를 버린다. 같은 batch 로 update 를 여러 번 하면 왜 안 되는가?
3. actor-critic 에서 critic 의 추정이 크게 틀리면 actor 는 어느 쪽으로 끌려가는가? REINFORCE 에는 왜 그런 위험이 없는가?

## 힌트

<details>
<summary>loss 부호와 normalize</summary>

optimizer 는 loss 를 줄이므로 기대 return 을 키우려면 $-\log\pi\cdot G$ 를 loss 로 둔다. batch 안에서 weight 를 평균 0·표준편차 1
로 normalize 하면 learning rate 를 잡기가 훨씬 쉬워지는데, 평균을 빼는 것 자체도 일종의 baseline 이다.

</details>

<details>
<summary>critic target 으로 흐르는 gradient</summary>

$r_t + \gamma V_\phi(s_{t+1})$ 는 critic 학습에서 상수로 다뤄야 한다. 여기로 gradient 가 흐르면 critic 이 target 자체를 움직여
loss 를 줄이려 한다. advantage 를 actor loss 에 곱할 때도 critic 쪽 gradient 를 끊고(`detach`), `terminated` 인 step 에서는
$V_\phi(s_{t+1})$ 을 0 으로 둔다.

</details>

## 참고 자료

- OpenAI Spinning Up, [Part 3: Intro to Policy Optimization](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html)
  — log-derivative trick, reward-to-go, baseline 유도를 짧게 정리한 글
- Lilian Weng, [Policy Gradient Algorithms](https://lilianweng.github.io/posts/2018-04-08-policy-gradient/)
- Andrej Karpathy, [Deep Reinforcement Learning: Pong from Pixels](http://karpathy.github.io/2016/05/31/rl/) — numpy 로 짠 policy gradient
- UC Berkeley CS 285, [Deep Reinforcement Learning](https://rail.eecs.berkeley.edu/deeprlcourse/) — policy gradient·actor-critic 강의
- Spinning Up [`1_simple_pg.py`](https://github.com/openai/spinningup/blob/master/spinup/examples/pytorch/pg_math/1_simple_pg.py)·[`2_rtg_pg.py`](https://github.com/openai/spinningup/blob/master/spinup/examples/pytorch/pg_math/2_rtg_pg.py)
  — 파일 하나 130 줄 안팎의 REINFORCE. 막혔을 때만 열기

## 남은 한계

batch 하나를 gradient step 한 번에 쓰고 버려서 sample efficiency 가 낮고, step size 를 조금만 키워도 policy 의 성능이 한 번에
크게 떨어진다. 같은 데이터로 여러 번 update 하면서도 policy 가 크게 바뀌지 않게 제한하는 방법이 [PPO](../ppo/README.md) 이고, 환경의 model 을 따로
배워 실제 상호작용을 아끼는 방향은 [World Model](../world-model/README.md) 로 이어진다.
