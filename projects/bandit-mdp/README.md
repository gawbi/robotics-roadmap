---
id: bandit-mdp
title: "Bandits & MDPs"
branch: rl
requires: [warmup]
hours: 10
summary: bandit·GridWorld 로 짜는 tabular RL 의 기초
papers:
  - title: "Dynamic Programming"
    authors: Richard Bellman
    year: 1957
  - title: "Q-learning"
    authors: Christopher J. C. H. Watkins, Peter Dayan
    year: 1992
    url: https://doi.org/10.1007/BF00992698
  - title: "Finite-time Analysis of the Multiarmed Bandit Problem"
    authors: Peter Auer, Nicolò Cesa-Bianchi, Paul Fischer
    year: 2002
    url: https://doi.org/10.1023/A:1013689704352
  - title: "Reinforcement Learning: An Introduction (2nd edition)"
    authors: Richard S. Sutton, Andrew G. Barto
    year: 2018
    url: http://incompleteideas.net/book/the-book-2nd.html
---

# Bandits & MDPs

## 배경

[NumPy Warm-up](../warmup/README.md) 의 linear regression 에는 입력마다 정답 $y$ 가 있었지만, 로봇이 마주하는 문제에는
정답 행동이 없고 행동한 뒤에 받는 reward 만 있다. reinforcement learning 은 이 reward 의 합이 가장 커지는 행동 규칙(policy)을
시행착오로 찾는 문제다. 가장 단순한 형태인 multi-armed bandit 에서는 state 없이 arm $k$ 개 가운데 하나를 고르는 일을 반복한다.
지금까지 가장 좋았던 arm 만 고르면(exploitation) 더 좋은 arm 을 끝내 못 찾고, 무작위로만 고르면(exploration) reward 를 낭비한다.
ε-greedy 는 확률 ε 로만 무작위 arm 을 고르고, UCB 는 적게 뽑아 본 arm 일수록 큰 bonus 를 더해 불확실한 arm 부터 확인한다.

$$
A_t = \arg\max_a \Big[\, Q_t(a) + c\sqrt{\frac{\ln t}{N_t(a)}} \,\Big]
$$

행동이 다음 state 를 바꾸면 문제는 MDP $(\mathcal S, \mathcal A, P, r, \gamma)$ 가 된다. transition 확률 $P$ 를 알면
Bellman optimality 식을 fixed point 에 닿을 때까지 반복 적용하는 value iteration 으로 최적 value $V^*$ 를 구하고, $P$ 를
모르면 실제로 겪은 transition 하나하나를 sample 삼아 같은 식을 근사하는 Q-learning 을 쓴다.

$$
V_{k+1}(s) = \max_a \sum_{s'} P(s' \mid s, a)\,\big[r(s,a,s') + \gamma V_k(s')\big]
$$

$$
Q(s,a) \leftarrow Q(s,a) + \alpha\big[r + \gamma \max_{a'} Q(s',a') - Q(s,a)\big]
$$

Q-learning 은 ε-greedy 로 탐색하며 움직이면서도 target 에 $\max_{a'}$ 를 써서 greedy policy 의 value 를 배운다. 데이터를
모으는 policy 와 학습 대상 policy 가 다른 이 방식을 off-policy 라고 하며, 뒤의 DQN·SAC 가 이 성질을 그대로 이어받는다.
이번 과제에서는 bandit testbed 과 GridWorld 를 numpy 로 짜고, $P$ 를 아는 value iteration 과 모르는 Q-learning 이 같은
policy 에 도달하는지 확인한다.

## 목표

- 10-armed testbed 에서 greedy·ε-greedy·UCB 의 평균 reward 와 optimal action 비율을 비교한다
- transition 표를 아는 GridWorld 에서 value iteration 으로 $V^*$ 와 greedy policy 를 구한다
- 같은 GridWorld 를 transition 표 없이 tabular Q-learning 으로 풀어 value iteration 결과와 비교한다
- value 와 policy 를 격자 위에 heatmap 과 화살표로 그린다

**직접 짤 것**: bandit testbed, GridWorld 의 transition·reward 표, value iteration, Q-learning 전부. numpy 로 짠다.
**가져다 써도 되는 것**: 그림용 matplotlib, 검산용 gymnasium 의 `FrozenLake-v1`·`CliffWalking-v1`.

## 준비물

- Python 3.12, numpy, matplotlib
- (선택) `gymnasium` — `FrozenLake-v1` 은 transition 표를 `env.unwrapped.P` 로 그대로 내주므로 value iteration 검산에 쓴다
- GPU 불필요

## 진행 순서

1. arm 마다 평균 $q_*(a)\sim\mathcal N(0,1)$ 을 뽑고 reward 를 $\mathcal N(q_*(a),1)$ 로 주는 10-armed testbed 를 짠다
2. incremental sample average 로 $Q_t(a)$ 를 갱신하는 ε-greedy agent 와 UCB agent 를 짠다
3. 문제 2000 개 × 1000 step 을 돌려 평균 reward 곡선과 optimal action 비율 곡선을 그린다
4. 벽·목표·함정이 있는 GridWorld 를 `P[s][a] -> [(prob, next_state, reward, done)]` 꼴의 표로 만든다
5. Bellman residual 이 $10^{-8}$ 아래로 떨어질 때까지 value iteration 을 돌려 greedy policy 를 뽑는다
6. 같은 GridWorld 를 `reset()`/`step()` 인터페이스로 감싸 Q-learning 을 돌린다
7. Q-learning 의 greedy policy 를 value iteration 의 policy 와 칸별로 비교한다
8. $V^*$ heatmap 위에 두 policy 의 화살표를 겹쳐 그린다

## 시작점

```text
bandit-mdp/
├── bandit.py
├── gridworld.py
├── planning.py
├── q_learning.py
└── test_bandit_mdp.py
```

```python
import numpy as np

# bandit.py
class Testbed:
    def __init__(self, k: int = 10, rng: np.random.Generator | None = None): ...
    def pull(self, a: int) -> float: ...
    @property
    def optimal_action(self) -> int: ...

class EpsilonGreedy:
    def __init__(self, k: int, eps: float): ...
    def act(self) -> int: ...
    def update(self, a: int, r: float) -> None:
        """incremental sample average: Q[a] += (r - Q[a]) / N[a]"""

class UCB:
    def __init__(self, k: int, c: float = 2.0): ...
    def act(self) -> int: ...
    def update(self, a: int, r: float) -> None: ...

# gridworld.py — same table format as gymnasium FrozenLake's env.unwrapped.P
Transition = tuple[float, int, float, bool]          # (prob, next_state, reward, done)
Table = dict[int, dict[int, list[Transition]]]

def make_gridworld(layout: list[str], slip: float = 0.0) -> tuple[Table, int]:
    """layout like ["S..#", ".#.G", "...H"]; returns (P, start_state).
    with probability `slip` the agent moves to a perpendicular direction."""

class GridEnv:
    def __init__(self, P: Table, start: int, seed: int = 0): ...
    def reset(self) -> int: ...
    def step(self, a: int) -> tuple[int, float, bool]: ...

# planning.py
def value_iteration(P: Table, n_states: int, n_actions: int, gamma: float = 0.99,
                    tol: float = 1e-8) -> tuple[np.ndarray, np.ndarray]:
    """returns (V, greedy_policy)"""

def evaluate_policy_exact(P: Table, policy: np.ndarray, n_states: int, gamma: float) -> np.ndarray:
    """solve V = r_pi + gamma * P_pi V as a linear system"""

# q_learning.py
def q_learning(env: GridEnv, n_states: int, n_actions: int, episodes: int, alpha: float = 0.1,
               gamma: float = 0.99, eps: float = 0.1, seed: int = 0) -> np.ndarray:
    """returns the Q table, shape (n_states, n_actions)"""
```

## 평가 기준

- [ ] 문제 2000 개 평균에서 1000 step 째의 평균 reward 와 optimal action 비율 모두 ε=0.1 이 greedy(ε=0) 보다 높고,
  UCB(c=2) 는 초반 몇십 step 이 지나면 ε=0.1 을 앞선다(Sutton & Barto 2.3절·2.7절 그림과 같은 모양)
- [ ] value iteration 의 $V$ 가 그 greedy policy 를 linear system 으로 정확히 평가한 값과 모든 state 에서 $10^{-6}$ 안으로 일치한다
- [ ] slip 이 0 인 GridWorld 에서 Q-learning 의 greedy policy 가 value iteration 의 policy 와 모든 비종료 칸에서 같다(value 가 같은
  행동끼리는 어느 쪽을 골라도 같은 것으로 본다)
- [ ] `FrozenLake-v1` 의 `env.unwrapped.P` 를 그대로 value iteration 에 넣고, 얻은 policy 로 10,000 episode 를 돌린 평균
  discounted return 이 같은 $\gamma$ 의 $V^*(s_0)$ 와 표준오차 2배 안에서 맞는다
- [ ] (선택) `CliffWalking-v1` 에서 Q-learning 과 Sarsa 의 학습 중 episode return 과 최종 경로를 비교한다

## 생각해 볼 질문

1. arm 이 10 개일 때 ε 을 0.1 로 고정한 ε-greedy 는 step 을 아무리 늘려도 optimal action 비율이 어디에서 멈추는가?
   UCB 에는 왜 그런 상한이 없는가?
2. 절벽 옆 지름길과 멀리 돌아가는 길이 있을 때, 학습 중 ε-greedy 로 움직이는 Q-learning 과 Sarsa 는 각각 어느 길을 배우는가?
   그 차이는 update 식의 어느 항에서 오는가?
3. $\gamma$ 를 0.5 와 0.99 로 바꾸면 목표에서 먼 칸의 value 와 policy 는 어떻게 달라지는가? 함정을 피해 돌아가는 경로는
   $\gamma$ 가 얼마쯤일 때 사라지는가?

## 힌트

<details>
<summary>UCB 에서 아직 안 뽑은 arm</summary>

$N_t(a)=0$ 인 arm 은 bonus 를 무한대로 보고 먼저 한 번씩 뽑는다. 그래서 처음 $k$ step 동안 모든 arm 을 한 바퀴 돌고,
그 직후 곡선이 잠깐 튀어 오르는데, 구현 실수가 아니라 원래 생기는 모양이다.

</details>

<details>
<summary>Q-learning 이 value iteration 과 안 맞을 때</summary>

종료 state 다음에는 미래가 없으므로 그 transition 의 target 에서 $\gamma\max_{a'}Q(s',a')$ 를 빼야 한다. 그래도 맞지 않으면
탐색 부족을 의심한다. 칸별 방문 횟수를 세어 heatmap 으로 그려 보면 Q 가 초기값에 머문 칸이 거의 가 보지 못한 칸인지 바로 보인다.

</details>

<details>
<summary>반복문 없는 value iteration</summary>

transition 표를 `(S, A, S)` 확률 배열과 `(S, A)` 기대 reward 배열로 한 번 바꿔 두면 sweep 한 번이 행렬곱 하나와
`max(axis=1)` 하나로 줄어든다.

</details>

## 참고 자료

- Richard S. Sutton, Andrew G. Barto, [Reinforcement Learning: An Introduction (2nd edition)](http://incompleteideas.net/book/the-book-2nd.html)
  — 저자가 PDF 를 무료로 공개한다. 2장(bandit), 3–4장(MDP·dynamic programming), 6장(Q-learning·Sarsa·Cliff Walking)이 이 과제 범위다
- David Silver, [UCL Course on RL](https://www.davidsilver.uk/teaching/) — 2–5강(MDP·dynamic programming·model-free control)과
  9강(exploration·exploitation)
- Lilian Weng, [The Multi-Armed Bandit Problem and Its Solutions](https://lilianweng.github.io/posts/2018-01-23-multi-armed-bandit/)
- Gymnasium [FrozenLake](https://gymnasium.farama.org/environments/toy_text/frozen_lake/)·[Cliff Walking](https://gymnasium.farama.org/environments/toy_text/cliff_walking/) 문서
- [ShangtongZhang/reinforcement-learning-an-introduction](https://github.com/ShangtongZhang/reinforcement-learning-an-introduction)
  — Sutton & Barto 의 그림을 Python 으로 재현한 코드. 막혔을 때만 열기

## 남은 한계

표 하나로 Q 를 담으려면 state 가 셀 수 있을 만큼 적어야 하는데, CartPole 처럼 state 가 연속값이면 표를 만들 수 없다.
Q 를 neural network 로 근사하는 방법은 [DQN → SAC](../off-policy/README.md) 에서, policy 자체를 neural network 로 두고
gradient ascent 로 개선하는 방법은 [Policy Gradient](../policy-gradient/README.md) 에서 다룬다.
