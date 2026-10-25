---
id: policy-gradient
title: "Policy Gradient"
branch: rl
requires: [bandit-mdp, pytorch-mlp]
hours: 2
summary: 정답 없이 reward 만으로 policy 의 weight 를 고치는 방법. stochastic policy, log-derivative trick, REINFORCE, baseline 과 advantage, actor-critic, 보행 로봇의 Gaussian policy
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
  - title: "Learning to Walk in Minutes Using Massively Parallel Deep Reinforcement Learning"
    authors: Nikita Rudin, David Hoeller, Philipp Reist, Marco Hutter
    year: 2021
    url: https://arxiv.org/abs/2109.11978
---

# Policy Gradient

사족 보행 로봇의 걸음을 simulation 에서 학습할 때는 "이 순간 무릎은 이 각도" 라고 알려 줄 정답 데이터가 없다. policy 는 0.02 초마다 관절
12 개의 목표 각도를 내고, 명령한 속도를 잘 따라갔는지와 넘어지지 않았는지에 따라 점수만 받는다. 정답이 없는데 network 의 weight 를
어느 쪽으로 고쳐야 점수가 오르는지는 어떻게 알 수 있을까?

policy gradient 는 policy 가 action 을 확률로 뽑게 만든 뒤, 평균보다 점수가 좋았던 action 의 확률이 오르는 쪽으로 weight 를 고친다. 그
방향은 받은 점수에 고른 action 의 log-probability 를 weight 로 미분한 값을 곱해 계산하므로, environment 가 어떻게 움직이는지 몰라도
된다. Rudin 등은 이 계열의 알고리즘인 PPO 로 사족 보행 로봇 ANYmal 의 평지 보행 policy 를 GPU 하나에서 4 분 안에 학습했다.

## 학습 목표

- action 을 확률로 뽑는 policy 가 필요한 이유와, softmax·Gaussian 으로 그 확률을 만드는 방법을 설명할 수 있다
- log-derivative trick 으로 reward 기댓값의 gradient 를 sample 로 추정하는 REINFORCE 를 숫자로 한 step 씩 따라갈 수 있다
- baseline 이 gradient 의 평균은 그대로 두고 variance 만 줄이는 이유와, advantage·actor-critic 이 bias 와 variance 를 바꾸는 방식을 설명할 수 있다
- 보행 policy MLP 의 출력 12 개가 학습하는 동안 Gaussian 의 평균이 되어 action 을 뽑는 과정을 설명할 수 있다

## 확률로 고르는 policy

슬롯머신 두 대 가운데 기계 A 는 레버를 당길 때마다 동전 1 개를 주고, 기계 B 는 0.5 의 확률로 동전 4 개를 주고 나머지 0.5 의
확률로는 0 개를 준다. 값 × 확률을 더한 기댓값은 A 가 1 이고 B 가 $4 \times 0.5 = 2$ 라서 오래 당길수록 B 가 낫지만, 기계를 고르는 agent 는 이
숫자를 모르고 당겨 본 결과만 안다. 받은 동전 수가 reward 이고, 고른 기계가 action 이며, action 을 고르는 규칙이 policy 다.

[Bandits & MDPs](../bandit-mdp/README.md) 에서는 기계마다 받은 reward 의 평균 $Q(a)$ 가 가장 큰 기계를 고르는 argmax policy 를 썼다. 이
policy 는 언제나 action 하나를 확률 1 로 고르므로, $Q(A) = 1$ 일 때 $Q(B)$ 가 0.99 에서 1.01 로 바뀌는 사이에 B 를 고를 확률이 0 에서 1 로
뛰고 그 밖의 구간에서는 전혀 변하지 않는다. 숫자를 조금 바꿨을 때 결과가 변하는 비율인 gradient 가 거의 모든 곳에서 0 이라서 어느 쪽으로
고칠지 알 수 없다. 관절의 목표 각도처럼 action 이 연속된 숫자이면 값이 끝없이 많아서 가장 큰 것을 찾는 계산부터 어렵다.

policy gradient 는 policy 안에 학습으로 고칠 숫자(parameter)를 두고, 그 숫자가 action 마다 고를 확률을 정하게 만든다. 두 기계에서는 A 의
점수는 0 으로 두고 B 의 점수는 $\theta$(theta)로 둔 뒤, 점수마다 $e^{\text{점수}}$ 를 구해($e \approx 2.718$) 그 값들의 합으로 나누는 softmax
로 확률을 만든다.

$$
\pi_\theta(B) = \frac{e^\theta}{1 + e^\theta}, \qquad \pi_\theta(A) = \frac{1}{1 + e^\theta}
$$

$\pi$ 는 policy 를 뜻하는 그리스 문자 pi 이고, $\pi_\theta(B)$ 는 "parameter 가 $\theta$ 일 때 B 를 고를 확률" 로 읽는다.

| $\theta$ | $-2$ | $-1$ | $0$ | $1$ | $2$ |
| --- | --- | --- | --- | --- | --- |
| $\pi_\theta(B)$ | 0.1192 | 0.2689 | 0.5 | 0.7311 | 0.8808 |
| $\pi_\theta(A)$ | 0.8808 | 0.7311 | 0.5 | 0.2689 | 0.1192 |

![가로축은 B 의 점수 θ, 세로축은 B 를 고를 확률. argmax 는 θ = 0 에서 0 에서 1 로 뛰는 계단이고, softmax 는 0.1192, 0.2689, 0.5, 0.7311, 0.8808 을 부드럽게 잇는 곡선이다](figures/argmax-vs-softmax.svg)

위 그림처럼 softmax 는 $\theta$ 를 조금 바꾸면 확률도 조금 바뀌어서, $\theta$ 를 어느 쪽으로 고칠지 gradient 로 계산할 수 있다.

action 을 고를 때는 0 과 1 사이의 난수 $u$ 를 뽑아 $u$ 가 $\pi_\theta(B)$ 보다 작으면 B 를 고르고 아니면 A 를 고른다. 이렇게 확률로 action 을 뽑는
policy 를 **stochastic policy** 라고 한다. 정보를 얻으려고 덜 확실한 action 을 해 보는 것을 exploration 이라고 하는데, stochastic policy 는
확률이 작은 action 도 가끔 고르므로 ε-greedy 처럼 무작위 선택을 따로 섞지 않아도 exploration 을 한다. 로봇에서는 관측한 state $s$ 에 따라
확률이 달라야 하므로 $\pi_\theta(a \mid s)$ 로 쓰는데, 이때 $\theta$ 는 network 의 weight 와 bias 전부다.

**확인 문제.** $\theta = 3$ 이면 $\pi_\theta(B)$ 는 얼마일까? ($e^3 \approx 20.09$)

<details><summary>답 보기</summary>

① 분자는 B 의 $e^3 \approx 20.09$ 다.

② 분모는 A 의 $e^0 = 1$ 과 B 의 20.09 를 더한 $21.09$ 다.

답: $20.09 \div 21.09 \approx 0.953$ 이고, A 는 $1 \div 21.09 \approx 0.047$ 이다.

</details>

## 기대 reward 와 gradient ascent

policy 가 좋은지는 그 policy 로 받는 reward 의 기댓값 $J(\theta)$ 로 잰다. A 를 고를 확률 × A 의 기댓값 1 과 B 를 고를 확률 × B 의 기댓값
2 를 더하는데, $\pi_\theta(A) = 1 - \pi_\theta(B)$ 라서 식이 간단해진다.

$$
J(\theta) = \pi_\theta(A) \times 1 + \pi_\theta(B) \times 2 = 1 + \pi_\theta(B)
$$

![가로축 θ, 세로축 J(θ). θ 가 작을수록 곡선이 1 에 다가가고 클수록 2 에 다가간다. θ = 0 에서 J = 1.5 이고 그 점의 기울기는 0.25 다](figures/objective-j.svg)

위 그림에서 $\theta = 0$ 일 때 0.01
늘리면 $\pi_\theta(B)$ 는 0.5025 가 되고 $J$ 는 1.5025 가 되는데, 늘어난 0.0025 를 0.01 로 나눈 0.25 가 $\theta = 0$ 의 gradient $\nabla_\theta J$ 다.
loss 는 작을수록 좋아서 gradient 를 빼지만 $J$ 는 클수록 좋아서 gradient 를 더하는데, 이 update 를 gradient ascent 라고 한다.

$$
\theta \leftarrow \theta + \eta\, \nabla_\theta J(\theta)
$$

$\eta$(eta)는 한 번에 고치는 크기인 learning rate 다. $\eta = 1$ 로 한 번 고치면 $\theta$ 는 0.25 가 되고 $\pi_\theta(B)$ 는 0.5622 로 오른다.

여기까지는 기계의 기댓값을 알고 계산했지만, agent 가 아는 것은 "B 를 당겨 4 개를 받았다" 처럼 직접 해 본 결과뿐이다. 이런 결과를 sample
이라고 하는데, sample 을 여러 번 모아 평균하면 기댓값에 다가간다. 그래서 $\nabla_\theta J$ 를 sample 하나로 계산할 수
있는 값의 기댓값 꼴로 바꿔 써야 하고, 그 방법이 다음 절의 log-derivative trick 이다.

<details><summary><b>심화: J 의 gradient 공식</b></summary>

$\pi_\theta(B) = e^\theta / (1 + e^\theta)$ 는 분자와 분모를 $e^\theta$ 로 나누면 $1 / (1 + e^{-\theta})$ 로, sigmoid 와 같다. sigmoid 의
기울기는 (값) × (1 − 값) 이라서 $\nabla_\theta \pi_\theta(B) = \pi_\theta(B)(1 - \pi_\theta(B)) = \pi_\theta(A)\pi_\theta(B)$ 이고, A 의 확률은 B 가
오른 만큼 내려가므로 $\nabla_\theta \pi_\theta(A) = -\pi_\theta(A)\pi_\theta(B)$ 다. 기계의 기댓값을 $q_*(A)$, $q_*(B)$ 로 남겨 두고
$J = \pi_\theta(A)\,q_*(A) + \pi_\theta(B)\,q_*(B)$ 를 미분하면, $q_*$ 는 $\theta$ 와 상관없는 수라서 각 확률의 gradient 에 그대로 곱해진다.

$$
\nabla_\theta J = -\pi_\theta(A)\pi_\theta(B)\, q_*(A) + \pi_\theta(A)\pi_\theta(B)\, q_*(B) = \pi_\theta(A)\pi_\theta(B)\,\big(q_*(B) - q_*(A)\big)
$$

$\theta = 0$ 이면 $0.5 \times 0.5 \times (2 - 1) = 0.25$ 로 0.01 늘려 잰 값과 같고, $\theta = 2$ 이면 $0.1192 \times 0.8808 \times 1 \approx 0.105$
다. 기계 A 의 기댓값이 3 이었다면 $\theta = 0$ 에서 $0.25 \times (2 - 3) = -0.25$ 라서 $\theta$ 를 줄여 A 를 더 자주 고르게 된다.

</details>

## log-derivative trick

확률에 자연로그 $\ln$ 을 씌운 값을 log-probability 라고 한다. $\ln x$ 는 $e$ 를 몇 번 곱해야 $x$ 가 되는지를 나타내서 $\ln 1 = 0$,
$\ln 0.5 = -0.6931$ 이고, 확률은 1 이하라 log-probability 는 0 이하다. policy gradient 에서 쓰는 값은 고른 action 의 log-probability 를 $\theta$
로 미분한 $\nabla_\theta \ln \pi_\theta(a)$ 인데, 두 기계 policy 에서는 아래와 같다(유도는 심화).

$$
\nabla_\theta \ln \pi_\theta(B) = 1 - \pi_\theta(B), \qquad \nabla_\theta \ln \pi_\theta(A) = -\pi_\theta(B)
$$

![왼쪽은 θ = 0 에서 두 확률이 0.5 씩이고 B 의 log-probability gradient 가 +0.5, A 의 것이 −0.5 인 모습. 오른쪽은 θ = 2 에서 B 가 0.8808, A 가 0.1192 이고 gradient 가 +0.1192 와 −0.8808 이라 드문 action 인 A 쪽 화살표가 더 길다](figures/log-prob-grad.svg)

위 그림처럼 이 값의 부호는 action $a$ 를 더 자주 고르게 하려면 $\theta$ 를 어느 쪽으로 움직여야 하는지를 나타낸다. $\theta = 0$ 에서는 B 가
$+0.5$ 이고 A 가 $-0.5$ 라서, B 의 확률은 $\theta$ 를 늘려야 오르고 A 의 확률은 줄여야 오른다. 크기는 확률이 작은 action 일수록 커서, $\theta = 2$ 에서
0.8808 로 자주 고르는 B 는 $+0.1192$ 이고 0.1192 로 드물게 고르는 A 는 $-0.8808$ 이다. 이미 자주 고르는 action 은 확률을 더 올릴 여지가 적어서,
$\theta$ 는 드물게 고르는 action 을 골랐을 때 크게 움직인다.

$\ln$ 의 기울기는 $1/x$ 라서 $\nabla_\theta \ln \pi_\theta(a) = \nabla_\theta \pi_\theta(a) \div \pi_\theta(a)$ 이고, 양쪽에 $\pi_\theta(a)$ 를 곱하면
$\nabla_\theta \pi_\theta(a) = \pi_\theta(a)\,\nabla_\theta \ln \pi_\theta(a)$ 가 된다. 이 바꿔 쓰기를 **log-derivative trick** 이라고 한다.
gradient 식 안의 확률 하나를 밖으로 꺼내면 확률 × (무언가) 꼴이 되는데, 확률을 곱해 모두 더한 값은 기댓값이므로 $J$ 의 gradient 도 아래처럼
기댓값으로 쓸 수 있다.

$$
\nabla_\theta J = \mathbb E_{a \sim \pi_\theta}\big[\, q_*(a)\, \nabla_\theta \ln \pi_\theta(a) \,\big]
$$

$\mathbb E_{a \sim \pi_\theta}[\cdot]$ 는 policy $\pi_\theta$ 의 확률로 action $a$ 를 뽑을 때 괄호 안 값의 기댓값을 뜻하고, $q_*(a)$ 는 기계 $a$
의 기댓값이다. 기댓값 꼴이 되었으니 action 을 하나 뽑아 레버를 당기고, 모르는 $q_*(a)$ 자리에 실제로 받은 reward $r$ 을 넣어 추정한다.

$$
\hat g = r\, \nabla_\theta \ln \pi_\theta(a)
$$

$\hat g$ 는 gradient 의 추정값이고, $\theta = 0$ 에서 일어날 수 있는 경우는 아래 세 가지다.

| 경우 | 확률 | $r$ | $\nabla_\theta \ln \pi_\theta(a)$ | $\hat g$ |
| --- | --- | --- | --- | --- |
| A 를 고름 | 0.5 | 1 | $-0.5$ | $-0.5$ |
| B 를 골라 4 개 | $0.5 \times 0.5 = 0.25$ | 4 | $+0.5$ | $+2$ |
| B 를 골라 0 개 | $0.5 \times 0.5 = 0.25$ | 0 | $+0.5$ | $0$ |

$\hat g$ 의 기댓값은 $0.5 \times (-0.5) + 0.25 \times 2 + 0.25 \times 0 = 0.25$ 로 진짜 gradient 와 같다. 이렇게 기댓값이 참값과 같은 추정을
unbiased 추정이라고 한다.

**확인 문제.** $\theta = 2$ 에서 A 를 골라 동전 1 개를 받았다. $\hat g$ 는 얼마이고, $\theta$ 를 어느 쪽으로 움직이라는 뜻일까?

<details><summary>답 보기</summary>

① $\theta = 2$ 에서 $\pi_\theta(B) = 0.8808$ 이므로 $\nabla_\theta \ln \pi_\theta(A) = -0.8808$ 이다.

② $\hat g = 1 \times (-0.8808) = -0.8808$ 이다.

답: $-0.8808$ 이고, 음수라서 $\theta$ 를 줄여 A 의 확률을 올리라는 뜻이다.

</details>

<details><summary><b>심화: ln 의 기울기와 log-probability gradient 의 유도</b></summary>

$\ln x$ 가 $x$ 를 0.01 늘릴 때 변하는 비율은 $x = 2$ 에서 0.4988, $x = 0.5$ 에서 1.9803, $x = 0.25$ 에서 3.9221 로 $1 \div x$ 에 가깝고, 늘리는
양을 줄일수록 정확히 $1 \div x$ 에 다가간다. 그래서 $\ln x$ 의 derivative 는 $\frac{1}{x}$ 다.

![ln p 의 그래프에서 p = 1, 0.5, 0.25 인 세 점의 접선. 기울기가 각각 1, 2, 4 로 p 가 작을수록 가파르다](figures/log-curve.svg)

위 그림처럼 확률 $p$ 가 작을수록 $\ln p$ 곡선이 가파르다. $\theta$ 가 $\ln \pi_\theta(B)$ 를 바꾸는 길은 $\theta \to \pi_\theta(B) \to \ln \pi_\theta(B)$
두 칸이라, chain rule 로 첫 칸의 비율 $\pi_\theta(B)(1 - \pi_\theta(B))$ 와 둘째 칸의 비율 $\frac{1}{\pi_\theta(B)}$ 를 곱한다.

$$
\nabla_\theta \ln \pi_\theta(B) = \frac{1}{\pi_\theta(B)} \times \pi_\theta(B)\,\big(1 - \pi_\theta(B)\big) = 1 - \pi_\theta(B)
$$

A 는 $\nabla_\theta \pi_\theta(A) = -\pi_\theta(A)\pi_\theta(B)$ 에 $\frac{1}{\pi_\theta(A)}$ 를 곱해 $-\pi_\theta(B)$ 다. action 이 셋 이상이고 action
마다 점수 $z_b$ 가 있으면, 고른 action $a$ 의 log-probability 를 $z_b$ 로 미분한 값은 $b = a$ 일 때 $1 - \pi(b)$ 이고 $b \ne a$ 일 때 $-\pi(b)$ 다.
점수 $[1, 0, 0]$ 의 확률 $[0.5761, 0.2119, 0.2119]$ 에서 첫째 action 을 골랐다면 $(0.4239, -0.2119, -0.2119)$ 라서, 고른 action 의 점수는 올리고
나머지 점수는 그 확률만큼 내린다.

기댓값 꼴은 아래 네 줄로 나온다. 첫 줄은 $q_*$ 가 고정된 수라는 뜻이고, 둘째 줄에서 log-derivative trick 을 썼으며, 넷째 줄은 "확률 × 값" 의
합이 기댓값이라는 정의다.

$$
\begin{aligned}
\nabla_\theta J &= \sum_a q_*(a)\, \nabla_\theta \pi_\theta(a) \\
&= \sum_a q_*(a)\, \pi_\theta(a)\, \nabla_\theta \ln \pi_\theta(a) \\
&= \sum_a \pi_\theta(a)\, \big[\, q_*(a)\, \nabla_\theta \ln \pi_\theta(a) \,\big] \\
&= \mathbb E_{a \sim \pi_\theta}\big[\, q_*(a)\, \nabla_\theta \ln \pi_\theta(a) \,\big]
\end{aligned}
$$

![θ = 0 에서 A 와 B 각각 확률 0.5, 기댓값 1 과 2, log-probability gradient −0.5 와 +0.5 를 곱해 −0.25 와 +0.5 가 되고, 더하면 0.25 로 J 의 gradient 와 같다](figures/log-derivative.svg)

위 그림은 $\theta = 0$ 에서 이 합을 숫자로 계산한 것이다. A 는 $0.5 \times 1 \times (-0.5) = -0.25$ 이고 B 는 $0.5 \times 2 \times 0.5 = 0.5$ 인데, 더한
0.25 는 공식 $\pi_\theta(A)\pi_\theta(B)(q_*(B) - q_*(A)) = 0.25$ 와 같다.

</details>

## REINFORCE

$\hat g$ 를 gradient ascent 에 넣으면 sample 하나마다 아래처럼 고친다.

$$
\theta \leftarrow \theta + \eta\, r\, \nabla_\theta \ln \pi_\theta(a)
$$

reward 가 클수록 고른 action 의 확률을 크게 올리고, reward 가 0 이면 그대로 둔다. 1992 년 Ronald Williams 가 이 방법을 REINFORCE 라는 이름으로
정리했다. 이름은 "REward Increment = Nonnegative Factor × Offset Reinforcement × Characteristic Eligibility" 의 머리글자로, parameter 를 고치는
양이 learning rate, 기준값을 뺀 reward, log-probability gradient 의 곱이라는 뜻이다. 위 식은 기준값을 0 으로 둔 경우다.

$\theta = 0$, $\eta = 0.1$ 에서 레버를 여덟 번 당기며 매번 $\theta$ 를 고친다고 하자(step 별 표는 심화). step 1 에서 B 를 골라 4 개를
받았다면 B 의 log-probability gradient 가 $1 - 0.5 = 0.5$ 라서 $0.1 \times 4 \times 0.5 = 0.2$ 를 더해 $\theta = 0.2$ 가 되고, $\pi_\theta(B)$ 는
0.5498 로 오른다.

![여덟 step 동안 B 를 고를 확률이 0.5, 0.5498, 0.5362, 0.5362, 0.5819, 0.5677, 0.6095, 0.6095, 0.6460 으로 바뀌는 막대. B 에서 4 개를 받은 step 에 오르고, A 를 고른 step 에 조금 내리며, B 에서 0 개를 받은 step 에는 그대로다](figures/reinforce-steps.svg)

위 그림처럼 B 에서 4 개를 받은 step 1, 4, 6, 8 에는 B 의 확률이 크게 오르고, B 에서 0 개를 받은 step 3 과 7 에는 그대로다.

> **오해** REINFORCE 는 좋은 action 의 확률만 올린다.
>
> **사실** step 2 와 5 에서는 더 나쁜 기계 A 를 골랐는데도 A 의 확률이 오르고 B 의 확률이 내려갔다. reward 가 양수이면 고른 action 은 언제나 확률이 오르고, 좋은 action 이 더 많이 오를 뿐이다.

neural network 학습 도구의 optimizer 는 loss 를 줄이는 gradient descent 만 하므로, 실제 구현에서는 부호를 뒤집은 $L = -\,r \ln \pi_\theta(a)$ 를
loss 로 둔다. 이 loss 는 분류에서 쓰는 cross-entropy $-\ln p_y$ 에 $r$ 을 곱한 꼴이라, 고른 action 을 정답 label 로 놓고 reward 가 클수록 세게
배우는 것과 같다.

$\nabla_\theta J$ 는 지금의 $\pi_\theta$ 로 뽑은 action 에 대한 기댓값이라서 sample 도 지금 고치려는 policy 로 모은 것이어야 한다. 이런 방법을
on-policy 라고 하는데, on-policy 방법은 한 번 고친 뒤 모은 sample 을 버리고 새로 모은다.

**확인 문제.** 위 예의 step 8 이 끝나 $\theta = 0.6015$, $\pi_\theta(B) = 0.6460$ 이 되었다. 다음 step 에서 A 를 골라 1 개를 받으면 새 $\theta$
는?

<details><summary>답 보기</summary>

① A 를 골랐으므로 $\nabla_\theta \ln \pi_\theta(A) = -\pi_\theta(B) = -0.6460$ 이다.

② 바뀌는 양은 $0.1 \times 1 \times (-0.6460) = -0.0646$ 이다.

답: $0.6015 - 0.0646 = 0.5369$ 다. $\theta$ 가 줄어 A 의 확률이 올랐다.

</details>

<details><summary><b>심화: REINFORCE 여덟 step 의 표</b></summary>

위 그림의 여덟 step 을 표로 적으면 아래와 같다. 계산은 반올림하지 않은 값으로 하고 표에는 반올림해 적었다.

| step | $\theta$ | $\pi_\theta(B)$ | action | $r$ | $\nabla_\theta \ln \pi_\theta(a)$ | $\eta\, r\, \nabla$ | 새 $\theta$ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 0.5 | B | 4 | $+0.5$ | $+0.2$ | 0.2 |
| 2 | 0.2 | 0.5498 | A | 1 | $-0.5498$ | $-0.0550$ | 0.1450 |
| 3 | 0.1450 | 0.5362 | B | 0 | $+0.4638$ | $0$ | 0.1450 |
| 4 | 0.1450 | 0.5362 | B | 4 | $+0.4638$ | $+0.1855$ | 0.3305 |
| 5 | 0.3305 | 0.5819 | A | 1 | $-0.5819$ | $-0.0582$ | 0.2724 |
| 6 | 0.2724 | 0.5677 | B | 4 | $+0.4323$ | $+0.1729$ | 0.4453 |
| 7 | 0.4453 | 0.6095 | B | 0 | $+0.3905$ | $0$ | 0.4453 |
| 8 | 0.4453 | 0.6095 | B | 4 | $+0.3905$ | $+0.1562$ | 0.6015 |

</details>

<details><summary><b>심화: 옛 데이터로 계산한 gradient</b></summary>

$\theta = 0$ 에서 모은 sample 은 A 와 B 가 반씩 섞여 있다. $\theta$ 를 2 까지 고친 뒤에도 이 sample 로 gradient 를 계산하면, A 를 고른 경우가
0.5 의 비율로 $1 \times (-0.8808)$, B 에서 4 개를 받은 경우가 0.25 의 비율로 $4 \times 0.1192 = 0.4768$ 이라 평균은
$0.5 \times (-0.8808) + 0.25 \times 0.4768 = -0.3212$ 다. 진짜 gradient $+0.105$ 와 부호가 반대인데, $\theta = 2$ 의 policy 는 A 를 0.1192 의
확률로만 고르는데 옛 데이터에는 A 가 절반이나 들어 있기 때문이다. 새로 모았다면 $0.1192 \times (-0.8808) + 0.8808 \times 0.5 \times 0.4768 \approx 0.105$
로 맞는다. 옛 데이터의 비율을 지금 policy 의 비율로 고쳐 다시 쓰는 방법은 [PPO](../ppo/README.md) 에서 다룬다.

</details>

## episode 와 reward-to-go

로봇이 여러 step 에 걸쳐 움직이는 예로, 칸 세 개짜리 복도의 칸 1 에서 출발해 칸 3 의 충전기에 닿으면 reward +1 을 받고 끝나는 문제를
본다. 바닥이 미끄러워 고른 방향으로는 0.8 의 확률로만 가고, policy 가 오른쪽을 고를 확률은 칸 1 에서 0.6 이고 칸 2 에서 0.7 이라고 하자.
episode 하나에서 나온 state·action·reward 를 순서대로 늘어놓은 것을 trajectory $\tau$(tau)라고 한다.

![칸 1 → 칸 2 → 칸 3 의 trajectory. policy 가 정하는 확률 0.6 과 0.7, environment 가 정하는 이동 확률 0.8 과 0.8 을 곱해 0.2688 이 되고, ln 을 씌우면 −0.5108, −0.2231, −0.3567, −0.2231 의 합이 된다](figures/trajectory-prob.svg)

위 그림은 오른쪽으로 두 번 가서 충전기에 닿는 trajectory 의 확률 $0.6 \times 0.8 \times 0.7 \times 0.8 = 0.2688$ 을 나눠 보여 준다. 0.6 과 0.7 은 policy 가
정하고(파랑) 0.8 은 environment 인 바닥이 정한다(주황). $\ln$ 을 씌우면 곱이 합이 되는데, $\theta$ 를 바꿔도 0.8 은 그대로라서 $\theta$ 로
미분하면 environment 의 항은 0 이 되어 사라진다.

$$
\nabla_\theta \ln P_\theta(\tau) = \sum_t \nabla_\theta \ln \pi_\theta(a_t \mid s_t)
$$

$P_\theta(\tau)$ 는 trajectory $\tau$ 가 나올 확률이고, $\sum_t$ 는 episode 의 모든 step $t$ 의 값을 더한다는 뜻이다. 그래서 바닥이 얼마나
미끄러운지 몰라도, step 마다 고른 action 의 log-probability gradient 에 그 episode 의 return 을 곱해 더하면 gradient 를 추정할 수 있다(유도는
심화). 이렇게 log-probability gradient 에 곱해 얼마나, 어느 부호로 움직일지 정하는 값도 weight 라고 부르는데, network 의 weight 와는 다른
뜻이다.

step $t$ 의 action 은 그 전에 이미 받은 reward 를 바꿀 수 없으므로, step $t$ 의 weight 로는 그 뒤에 받는 reward 만 더한 **reward-to-go** 를
쓴다.

$$
G_t = r_{t+1} + \gamma\, r_{t+2} + \gamma^2 r_{t+3} + \cdots
$$

$r_{t+1}$ 은 step $t$ 의 action 직후에 받는 reward 이고, $\gamma$(gamma)는 늦게 받는 reward 일수록 더 깎는 discount factor 다. 상관없는 지난
reward 가 빠진 만큼 흔들림이 줄고 gradient 의 기댓값은 그대로다.

Gymnasium 의 CartPole 은 막대를 세운 수레를 좌우로 미는 문제로, 막대가 서
있는 동안 step 마다 reward +1 을 주고 막대가 12° 넘게 기울거나 수레가 가운데에서 2.4 넘게 벗어나면 끝난다. reward 1, 1, 1 로 끝난 episode
를 $\gamma = 0.99$ 로 계산하면 $G_0 = 1 + 0.99 + 0.99^2 = 2.9701$, $G_1 = 1 + 0.99 = 1.99$, $G_2 = 1$ 이다.

![reward 1, 1, 1 이 들어오는 episode. step 0 의 weight 는 세 reward 를 모두 더해 2.9701 이고, step 1 의 weight 는 뒤의 두 reward 로 1.99 이며, step 2 의 weight 는 마지막 reward 하나로 1 이다](figures/reward-to-go.svg)

위 그림처럼 step 마다 자기 뒤의 reward 만 더하므로, 막대를 오래 세운 episode 일수록 앞쪽 action 의 $G_t$ 가 커서 그 action 들의 확률이
많이 오른다.

**확인 문제.** reward 가 0, 0, 1 로 들어온 episode 의 $G_0$, $G_1$, $G_2$ 는? ($\gamma = 0.9$)

<details><summary>답 보기</summary>

뒤에서부터 $G_t = r_{t+1} + \gamma\, G_{t+1}$ 로 계산한다.

① $G_2 = 1$ 이다.

② $G_1 = 0 + 0.9 \times 1 = 0.9$ 다.

③ $G_0 = 0 + 0.9 \times 0.9 = 0.81$ 이다.

답: $G_0 = 0.81$, $G_1 = 0.9$, $G_2 = 1$ 이다.

</details>

<details><summary><b>심화: trajectory 의 policy gradient</b></summary>

출발부터의 return 을 $G_0$ 라고 하면 키우려는 값과 그 gradient 는 아래와 같다.

$$
\begin{aligned}
J(\theta) &= \sum_\tau P_\theta(\tau)\, G_0(\tau) \\
\nabla_\theta J &= \sum_\tau P_\theta(\tau)\, \nabla_\theta \ln P_\theta(\tau)\, G_0(\tau) \\
&= \mathbb E_{\tau \sim \pi_\theta}\Big[\, G_0 \sum_t \nabla_\theta \ln \pi_\theta(a_t \mid s_t) \,\Big]
\end{aligned}
$$

둘째 줄은 log-derivative trick $\nabla P = P\,\nabla \ln P$ 를 쓴 것이고, 셋째 줄은 $\nabla_\theta \ln P_\theta(\tau)$ 자리에 step 별 항의 합을 넣은
것이다. 두 기계 문제는 step 이 하나이고 $G_0 = r$ 인 경우다. step $t$ 의 항에 곱한 $G_0$ 를 $G_t$ 로 바꿔도 되는 것은, step $t$ 이전의 reward 가
step $t$ 의 action 과 상관없는 수라서 다음 절의 baseline 과 같은 이유로 기댓값에서 0 이 되기 때문이다. Sutton 등(1999)은 여러 step 의 MDP 에서
이 gradient 가 $\mathbb E[\nabla_\theta \ln \pi_\theta(a \mid s)\, Q(s, a)]$ 꼴이 된다는 policy gradient theorem 을 증명했다.

숫자로는 $\ln 0.2688 = -0.5108 - 0.2231 - 0.3567 - 0.2231 = -1.3137$ 이다. 칸 1 에서 오른쪽을 고를 확률이 0.6 에서 0.65 로 바뀌면 첫째 항은
$\ln 0.65 - \ln 0.6 = 0.0800$ 바뀌지만 0.8 의 항은 바뀌지 않는다.

</details>

## variance 와 baseline

$\hat g$ 는 평균은 맞지만 한 번 한 번의 값은 크게 흩어진다. 흩어진 정도는 평균에서 떨어진 거리를 제곱해 평균한 **variance**(분산)로 잰다.

![θ = 0 에서 REINFORCE 추정이 가질 수 있는 세 값을 수직선에 놓은 그림. −0.5 (확률 0.5), 0 (0.25), 2 (0.25) 이고 기댓값 0.25 가 점선이다. 0 보다 작아 틀린 방향인 값이 나올 확률은 0.5 다](figures/estimate-spread.svg)

위 그림처럼 $\theta = 0$ 에서 $\hat g$ 의 기댓값은 0.25 인데 variance 는 1.0625 로 그보다 훨씬 크고, 절반의 확률(A 를 고른 경우)로는 부호까지 틀려 $\theta$ 를 줄이는 쪽을 가리킨다. 같은 $\theta$ 에서 sample $N$ 개를 모아
평균한 뒤 한 번 고치면 variance 가 $\frac{1}{N}$ 배가 되지만, 경우를 모두 세어 계산하면 $N = 8$ 이어도 부호가 틀릴 확률이 0.2524 다. 로봇은
sample 하나를 얻으려면 직접 움직여 봐야 해서, legged_gym 은 GPU 에서 로봇 4096 대를 동시에 simulation 하고 로봇마다 24 step 씩 모아
policy 를 고칠 때마다 $4096 \times 24 = 98{,}304$ 개의 sample 을 쓴다.

variance 를 줄이는 다른 방법은 받은 reward 에서 기준값 $b$ 를 빼는 것이다.

$$
\theta \leftarrow \theta + \eta\, (r - b)\, \nabla_\theta \ln \pi_\theta(a)
$$

$b$ 를 **baseline** 이라고 하고, REINFORCE 이름의 offset reinforcement(기준값을 뺀 reward)가 $r - b$ 다. $\theta = 0$ 에서 policy 가 받는
reward 의 기댓값 $J = 1.5$ 를 baseline 으로 쓰면 아래와 같다.

| 경우 | 확률 | $r - b$ | $\nabla_\theta \ln \pi_\theta(a)$ | 추정 $(r - b)\nabla$ | 고른 action 의 확률 |
| --- | --- | --- | --- | --- | --- |
| A 를 고름 | 0.5 | $1 - 1.5 = -0.5$ | $-0.5$ | $+0.25$ | 내려간다 |
| B 를 골라 4 개 | 0.25 | $4 - 1.5 = 2.5$ | $+0.5$ | $+1.25$ | 올라간다 |
| B 를 골라 0 개 | 0.25 | $0 - 1.5 = -1.5$ | $+0.5$ | $-0.75$ | 내려간다 |

평균 1.5 보다 못한 1 을 받은 A 는 이제 확률이 내려가고, 추정의 기댓값은 $0.5 \times 0.25 + 0.25 \times 1.25 + 0.25 \times (-0.75) = 0.25$
로 그대로다. 확률을 모두 더하면 언제나 1 이라 한 action 의 확률이 오르면 다른 action 의 확률이 꼭 그만큼 내려가므로, log-probability gradient
의 기댓값은 $\mathbb E_{a \sim \pi_\theta}[\nabla_\theta \ln \pi_\theta(a)] = 0$ 이다(증명은 심화). 그래서 action 과 상관없는 $b$ 를 곱해 빼도
기댓값이 바뀌지 않는다.

![위 줄은 baseline 없이 REINFORCE 추정이 −0.5, 0, 2 로 퍼진 모습이고 아래 줄은 baseline 1.5 를 빼서 −0.75, 0.25, 1.25 로 좁아진 모습이다. 두 줄 모두 기댓값은 0.25 다](figures/baseline-spread.svg)

위 그림의 아래 줄이 baseline 을 뺀 세 값인데, 0.25 근처로 모여 variance 가 1.0625 에서 0.5 로 줄었다. 부호가 틀리는 경우도 B 에서 0 개를
받은 경우 하나뿐이라 그 확률이 0.5 에서 0.25 로 줄었다. variance 는 $b$ 가 평균 reward 1.5 일 때 가장 작은데, 실제로는 $J$ 를 모르므로
지금까지 받은 reward 의 평균을 baseline 으로 쓴다.

baseline 은 reward 가 모두 큰 양수일 때 특히 필요하다. 기계마다 동전을 10 개씩 더 주어도 두 기계의 차이는 그대로 1 이지만, baseline 이
없으면 어느 기계를 골라도 weight 가 10 을 넘어 고른 action 의 확률을 크게 올린다. 이때 $\hat g$ 의 variance 는 33.5625 다. 이 문제의 학습을
200 step 씩 4000 번 simulation 하면, baseline 이 없을 때는 35.2% 의 판이 더 나쁜 기계 A 쪽으로 기울어 끝났지만 지금까지 받은 reward 의
평균을 baseline 으로 빼면 그런 판이 없었다(심화). 로봇 문제의 reward 도 양수만 나오는 경우가 많은데, CartPole 은 step 마다 +1 을 주고
legged_gym 의 ANYmal C 설정은 `only_positive_rewards = True` 라서 step 마다 합친 reward 가 음수이면 0 으로 잘라 낸다.

**확인 문제.** $\theta = 0$ 에서 baseline 이 $b = 1$ 이면 세 경우의 추정 $(r - b)\nabla_\theta \ln \pi_\theta(a)$ 는 각각 얼마이고, 그 기댓값은?

<details><summary>답 보기</summary>

$\theta = 0$ 에서 log-probability gradient 는 A 가 $-0.5$ 이고 B 가 $+0.5$ 다.

| 경우 | 확률 | $r - b$ | 추정 |
| --- | --- | --- | --- |
| A 를 고름 | 0.5 | $1 - 1 = 0$ | $0 \times (-0.5) = 0$ |
| B 를 골라 4 개 | 0.25 | $4 - 1 = 3$ | $3 \times 0.5 = 1.5$ |
| B 를 골라 0 개 | 0.25 | $0 - 1 = -1$ | $-1 \times 0.5 = -0.5$ |

기댓값은 $0.5 \times 0 + 0.25 \times 1.5 + 0.25 \times (-0.5) = 0.25$ 다.

답: 0, 1.5, $-0.5$ 이고 기댓값은 baseline 이 없을 때와 같은 0.25 다.

</details>

<details><summary><b>심화: variance 계산, baseline 의 증명, action 마다 다른 baseline</b></summary>

$\theta = 0$ 에서 $\hat g$ 의 variance 는 경우마다 기댓값 0.25 에서 떨어진 거리를 제곱해 확률로 평균한 값이다. A 는 $0.5 \times (-0.75)^2 = 0.28125$ 이고
B 4 개는 $0.25 \times 1.75^2 = 0.765625$ 이며 B 0 개는 $0.25 \times (-0.25)^2 = 0.015625$ 라서 셋을 더하면 1.0625 다. batch 크기와 baseline 에 따라 같은
계산을 하면 아래와 같다.

| batch 크기 $N$ | 1 | 2 | 4 | 8 |
| --- | --- | --- | --- | --- |
| 평균의 variance | 1.0625 | 0.5313 | 0.2656 | 0.1328 |
| 평균이 0 보다 작을 확률 | 0.5 | 0.5 | 0.3125 | 0.2524 |

| baseline $b$ | 0 | 0.5 | 1 | 1.5 | 2 | 2.5 | 3 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 추정의 variance | 1.0625 | 0.75 | 0.5625 | 0.5 | 0.5625 | 0.75 | 1.0625 |

![가로축 baseline b, 세로축 REINFORCE 추정의 variance. b = 1.5 에서 가장 작은 0.5 이고 b = 0 과 3 에서 1.0625 인 U 자 곡선이다](figures/baseline-variance.svg)

위 그림은 둘째 표를 곡선으로 그린 것이다. 어느 $b$ 에서나 기댓값은 0.25 이고, $b = 1.5$ 와 $N = 4$ 를 함께 쓰면 variance 는 $0.5 \div 4 = 0.125$
이고 부호가 틀릴 확률은 0.1445 다.

log-probability gradient 의 기댓값이 0 인 것은 아래 네 줄로 보인다. 둘째 줄은 log-derivative trick 을 거꾸로 쓴 것이고, 셋째 줄은 gradient 를
더한 것이 더한 것의 gradient 라는 성질을 썼으며, 넷째 줄은 확률의 합이 언제나 1 이라서 나온다.

$$
\begin{aligned}
\mathbb E_{a \sim \pi_\theta}\big[\nabla_\theta \ln \pi_\theta(a)\big] &= \sum_a \pi_\theta(a)\, \nabla_\theta \ln \pi_\theta(a) \\
&= \sum_a \nabla_\theta \pi_\theta(a) \\
&= \nabla_\theta \sum_a \pi_\theta(a) \\
&= \nabla_\theta 1 = 0
\end{aligned}
$$

이 계산은 $b$ 가 모든 action 에 같아서 기댓값 밖으로 꺼낼 수 있을 때만 쓸 수 있다. 기계마다 자기 기댓값을 baseline 으로 삼아 A 에서는 1 을 빼고
B 에서는 2 를 빼면, 추정은 A 를 고를 때 $0$ 이고 B 에서 4 개를 받을 때 $2 \times 0.5 = 1$ 이며 B 에서 0 개를 받을 때 $-2 \times 0.5 = -1$ 이라서
기댓값이 $0 + 0.25 - 0.25 = 0$ 이다. B 가 더 좋은 기계라는 정보가 지워지므로 baseline 은 action 과 상관없는 값이어야 한다.

baseline 이 없으면 운이 나쁜 순서에서 학습이 거꾸로 가기도 한다. $\theta = 0$, $\eta = 0.1$ 에서 A, B(0 개), A, B(0 개), A 가 이어지면 A 를
고를 때마다 $\theta$ 가 $-0.05$, $-0.0488$, $-0.0475$ 씩 줄어 $\pi_\theta(B)$ 가 0.5 → 0.4875 → 0.4753 → 0.4635 로 내려간다. 여섯째 step 에
B 에서 처음 4 개를 받아야 $0.1 \times 4 \times 0.5365 = 0.2146$ 이 더해져 0.5171 로 돌아온다.

reward 에 10 을 더한 문제를 $\eta = 0.1$ 로 200 step 씩 4000 번 학습하는 simulation 에서 200 step 뒤 B 를 고를 확률을 비교하면 아래와 같다.

![reward 에 10 을 더한 두 기계 문제에서 B 를 고를 확률의 200 step 변화를 여러 번 겹쳐 그린 그림. baseline 이 없으면 0 근처나 1 근처로 제각각 흩어지고, 지금까지 받은 reward 의 평균을 baseline 으로 빼면 모두 1 쪽으로 고르게 오른다](figures/baseline-runs.svg)

| 200 step 뒤 $\pi_\theta(B)$ | 4000 번의 평균 | 하위 10% | 상위 10% | 0.5 아래로 끝난 비율 |
| --- | --- | --- | --- | --- |
| baseline 없음 | 0.644 | 0.008 | 0.994 | 35.2% |
| 지금까지 받은 reward 의 평균을 baseline 으로 | 0.934 | 0.909 | 0.956 | 0% |

위 그림의 가는 선 하나가 학습 한 판이고 흰 굵은 선은 여러 판의 평균이다. baseline 이 없으면 초반에 A 를 몇 번 연달아 고른 판에서 A 의 확률이 크게
올라 A 를 더 자주 고르게 되고, 그러면 또 A 의 확률이 올라 A 쪽으로 굳는다.

reward 에 10 을 더한 문제에서 action 과 reward 가 A(11), B(14), B(10), A(11) 순서로 나오면, baseline 이 없는 판의 $\pi_\theta(B)$ 는
0.5 → 0.3659 → 0.5836 → 0.6801 → 0.5015 로 크게 출렁이고 baseline 11.5 를 뺀 판은 0.5 → 0.5062 → 0.5371 → 0.5198 → 0.5263 으로 조금씩만
움직인다. 200 step simulation 의 baseline 판은 step 마다 그때까지 받은 reward 의 평균을 $b$ 로 쓰고, update 뒤에 새 reward 를 평균에 더했다.

</details>

## advantage

여러 state 를 거치는 문제에서는 state 마다 앞으로 받을 reward 가 크게 다르다. 예를 들어 CartPole 에서 막대가 똑바로 서 있는 state 라면 50 step
은 더 버티지만 막대가 많이 기운 state 라면 3 step 뒤에 끝날 수도 있어서, 숫자 하나짜리 baseline 으로는 두 state 를 함께 맞출 수 없다.

그래서 state $s_t$ 에서 지금 policy 를 따를 때 return 의 기댓값인 value $V(s_t)$ 를 baseline 으로 쓴다. weight $G_t - V(s_t)$ 는 이 state 에서
평균보다 얼마나 더 받았는지를 나타내서, $V(s_t) = 40$ 인 state 에서 $G_t$ 가 30 과 50 인 두 episode 의 weight 는 $-10$ 과 $+10$ 이다. $V(s_t)$ 는
state 에 따라 달라지지만 고른 action 과는 상관없어서 기댓값은 그대로다. $V$ 의 진짜 값은 모르므로 state 를 받아 숫자 하나를 내는 value network
$V_\phi(s)$ 를 두고, 실제로 받은 $G_t$ 를 정답으로 삼아 $(V_\phi(s_t) - G_t)^2$ 를 줄이는 regression 으로 학습한다. $\phi$(phi)는 value network
의 parameter 다.

state $s$ 에서 action $a$ 를 먼저 하고 그 뒤로 policy 를 따를 때 return 의 기댓값 $Q(s, a)$ 에서 $V(s)$ 를 뺀 값을 **advantage** 라고 한다.

$$
A(s, a) = Q(s, a) - V(s)
$$

advantage 는 action $a$ 가 그 state 의 평균보다 얼마나 나은지를 나타내며, 기호 $A$ 는 기계 A 와 상관없다. 두 기계 문제에서 $Q$ 는 기계의 기댓값이고
$V$ 는 $\theta = 0$ policy 의 평균 $J = 1.5$ 라서 advantage 는 기계 A 가 $1 - 1.5 = -0.5$ 이고 기계 B 가 $2 - 1.5 = +0.5$ 다. $G_t$ 를 여러 번 평균하면 $Q(s_t, a_t)$
가 되므로 $G_t - V_\phi(s_t)$ 는 advantage 를 sample 하나로 추정한 값 $\hat A_t$ 다.

**확인 문제.** 어떤 state 에서 $V(s) = 5$, $Q(s, \text{왼쪽}) = 4$, $Q(s, \text{오른쪽}) = 7$ 이다. 두 action 의 advantage 와 학습 방향은?

<details><summary>답 보기</summary>

① 왼쪽은 $4 - 5 = -1$ 이다.

② 오른쪽은 $7 - 5 = +2$ 다.

답: 오른쪽의 확률을 올리고 왼쪽의 확률을 내리는 쪽으로 학습한다.

</details>

<details><summary><b>심화: value network 의 update 숫자</b></summary>

$V_\phi(s_t) = 40$ 이고 $G_t = 30$ 이면 오차는 10 이고, 오차 제곱을 $V$ 로 미분한 값은 $2 \times 10 = 20$ 이다. network 의 출력을 learning rate
0.01 로 바로 고칠 수 있다고 보면 $40 - 0.01 \times 20 = 39.8$ 로 30 쪽으로 조금 내려간다. 다음 episode 에서 $G_t = 50$ 이면 오차는 $-10.2$ 이고
gradient 는 $-20.4$ 라서 $39.8 + 0.01 \times 20.4 = 40.004$ 로 다시 올라가고, 이렇게 두 값의 평균 40 근처를 오간다. policy 와 value network 는
같은 batch 로 함께 학습한다.

</details>

## actor-critic

$G_t$ 를 계산하려면 episode 가 끝날 때까지 기다려야 하고, $G_t$ 에는 그 뒤 모든 step 의 운이 섞여 있다. Bellman 식에서 한 state 의 value 는
reward 에 다음 state 의 value 를 $\gamma$ 로 깎아 더한 값이므로, reward 하나와 다음 state 의 value 로 $Q(s_t, a_t)$ 를 어림하고 $V(s_t)$ 를
빼서 advantage 를 추정할 수 있다.

$$
\hat A_t = r_{t+1} + \gamma\, V_\phi(s_{t+1}) - V_\phi(s_t)
$$

Q-learning 의 TD error 와 같은 모양이다. CartPole 에서 $r_{t+1} = 1$, $\gamma = 0.99$, $V_\phi(s_t) = 10$, $V_\phi(s_{t+1}) = 9.5$ 라면
$1 + 0.99 \times 9.5 - 10 = 1 + 9.405 - 10 = 0.405$ 다. action 뒤의 결과가 원래 예상 10 보다 0.405 나았으므로 이 action 의 확률을 조금 올린다.
$s_{t+1}$ 에서 episode 가 끝났다면 그 뒤에 받을 reward 가 없으므로 $V_\phi(s_{t+1})$ 을 0 으로 둔다. 추정한 값 $V_\phi(s_{t+1})$ 로 다른 추정의
정답을 만드는 이 방식을 bootstrap 이라고 한다.

이 구조에서는 policy 를 **actor** 라 부르고 value network 를 **critic** 이라 부르며, 둘을 함께 쓰는 방법이 **actor-critic** 이다. step 마다 아래 순서로
계산한다.

1. actor 가 state $s_t$ 에서 $\pi_\theta(\cdot \mid s_t)$ 의 확률로 action $a_t$ 를 뽑는다
2. environment 가 reward $r_{t+1}$ 과 다음 state $s_{t+1}$ 을 돌려준다
3. critic 이 $\hat A_t = r_{t+1} + \gamma V_\phi(s_{t+1}) - V_\phi(s_t)$ 를 계산한다
4. actor 는 $\theta \leftarrow \theta + \eta\, \hat A_t\, \nabla_\theta \ln \pi_\theta(a_t \mid s_t)$ 로 고친다
5. critic 은 $V_\phi(s_{t+1})$ 을 고정된 수로 두고 $V_\phi(s_t)$ 를 $r_{t+1} + \gamma V_\phi(s_{t+1})$ 쪽으로 고친다

![actor-critic 의 한 step. actor 가 state 에서 action 을 뽑고, environment 가 reward 와 다음 state 를 돌려주며, critic 이 두 state 의 value 로 advantage 0.405 를 계산해 actor 와 critic 을 함께 고친다](figures/actor-critic.svg)

위 그림은 좌우를 0.5 씩 고르던 actor 가 오른쪽을 골라 위의 advantage 0.405 를 얻은 한 step 을 보여 준다. learning rate 를 0.1 로 두면 actor
의 오른쪽 확률은 0.5 에서 0.5051 로 오르고 critic 의 $V(s)$ 는 10 에서 10.0405 로 오르는데(계산은 심화), episode 가 끝나기를 기다릴 필요 없이
step 마다 이렇게 고친다.

actor-critic 의 advantage 에는 reward 하나와 critic 의 추정만 들어가고 그 뒤 수많은 step 의 운은 섞이지 않아서 variance 가 작다. 대신 critic 이
틀리면 추정이 그쪽으로 치우치는데, 추정값의 기댓값이 참값과 어긋난 정도를 bias 라고 한다. $s_{t+1}$ 의 진짜 value 가 9.5 인데 critic 이 12 로
추정하면 advantage 는 $1 + 0.99 \times 12 - 10 = 2.88$ 로 진짜 0.405 보다 훨씬 크다. 이 오차는 운이 아니라 critic 의 값에서 왔으므로 여러 번
평균해도 사라지지 않는다.

![세 방법이 step t 의 weight 로 쓰는 값. REINFORCE 는 episode 끝까지의 reward 를 모두 더한 Gₜ 를 쓰고, baseline 판은 거기서 V(sₜ) 를 빼고, actor-critic 은 reward 하나와 critic 의 추정 V(sₜ₊₁) 를 쓴다](figures/estimators.svg)

| 방법 | weight | bias | variance | 고치는 시점 |
| --- | --- | --- | --- | --- |
| REINFORCE | $G_t$ | 없음 | 크다 | episode 가 끝난 뒤 |
| value baseline | $G_t - V_\phi(s_t)$ | 없음 | 줄어든다 | episode 가 끝난 뒤 |
| actor-critic | $r_{t+1} + \gamma V_\phi(s_{t+1}) - V_\phi(s_t)$ | critic 이 틀린 만큼 | 가장 작다 | step 마다 |

reward 를 몇 개 더 모은 뒤 critic 의 추정을 붙이면 bias 와 variance 가 REINFORCE 와 actor-critic 의 중간쯤인 방법이 된다. Mnih 등(2016)의 A3C(Asynchronous Advantage Actor-Critic)는 Atari 실험에서 최대 5 step 의 reward 를 더한 뒤 $V$ 를 붙인 advantage 를 썼고, CPU 16
core 에서 학습 thread 16 개가 같은 network 를 서로 기다리지 않고 고쳤다.

legged_gym 의 ANYmal C 평지 설정도 actor-critic 이라서, 다음 절에서 볼 actor MLP 와 hidden layer 크기가 같은 critic MLP 를 따로 두고 critic 은
value 숫자 하나를 낸다. $\gamma$ 기본값은 0.99 이고, advantage 는 여러 step 의 추정을 비율 $\lambda = 0.95$
로 섞는 GAE 로 계산한다. GAE 는 [PPO](../ppo/README.md) 에서 다룬다.

> **오해** critic 이 있으면 언제나 더 좋다.
>
> **사실** 학습 초반의 critic 은 아직 틀린 값을 내서, 그 값으로 만든 advantage 가 policy 를 잘못된 쪽으로 고칠 수 있다.

**확인 문제.** $r_{t+1} = 1$, $\gamma = 0.99$, $V_\phi(s_t) = 10$ 이고 진짜 $V(s_{t+1}) = 9.5$ 다. critic 이 $V_\phi(s_{t+1}) = 7$ 로 잘못
추정하면 advantage 는 얼마이고, 진짜 값과 비교해 어느 쪽으로 치우쳤을까?

<details><summary>답 보기</summary>

① critic 의 값으로 계산하면 $1 + 0.99 \times 7 - 10 = 1 + 6.93 - 10 = -2.07$ 이다.

② 진짜 value 로 계산하면 $1 + 0.99 \times 9.5 - 10 = 0.405$ 다.

답: $-2.07$ 이다. 진짜 값 0.405 보다 작아서, 실제로는 조금 나았던 action 의 확률을 오히려 내리는 쪽으로 치우쳤다.

</details>

<details><summary><b>심화: actor-critic 한 step 의 계산</b></summary>

state $s$ 에서 오른쪽의 점수를 $\theta = 0$ 으로 두어 좌우를 0.5 씩 고르던 actor 가 오른쪽을 골랐고, advantage 는 0.405 였다. actor 의
learning rate 는 0.1 이고, critic 은 state 마다 value 를 표에 적어 두고 learning rate 0.1 로 고친다고 하자.

| 단계 | 계산 | 값 |
| --- | --- | --- |
| 오른쪽의 log-probability gradient | $1 - 0.5$ | 0.5 |
| actor 의 변화 | $0.1 \times 0.405 \times 0.5$ | $+0.02025$ |
| 새 오른쪽 확률 | $e^{0.02025} / (1 + e^{0.02025})$ | 0.5051 |
| critic 의 변화 | $0.1 \times 0.405$ | $+0.0405$ |
| 새 $V(s)$ | $10 + 0.0405$ | 10.0405 |

$V_\phi(s_{t+1}) = 8$ 이었다면 advantage 는 $1 + 0.99 \times 8 - 10 = -1.08$ 이라, actor 는 $0.1 \times (-1.08) \times 0.5 = -0.054$ 만큼 바뀌어 오른쪽
확률이 0.4865 로 내려가고 critic 은 $10 + 0.1 \times (-1.08) = 9.892$ 로 내려간다. 두 기계 문제처럼 state 가 하나이고 한 번 당기면 끝나는 경우에는
$V_\phi(s_{t+1}) = 0$ 이라 $\hat A = r - V$ 가 되어, 지금까지 받은 reward 의 평균을 baseline 으로 쓰는 REINFORCE 와 같아진다.

</details>

## 연속 action 의 Gaussian policy

[Perceptron](../perceptron/README.md) 에서 본 ANYmal C 평지 보행 MLP 는 몸 상태와 속도 명령 숫자 48 개를 받아 ELU 를 쓰는 128, 64, 32
unit 의 hidden layer 를 거쳐 관절 12 개의 값을 0.02 초마다 낸다. 이 출력은 연속된 숫자라서 action 마다 확률을 적을 수 없고, 대신 평균
$\mu$(mu)와 standard deviation(표준편차) $\sigma$ 로 정해지는 종 모양 분포인 Gaussian 에서 action 을 뽑는다. 이런 policy 를 **Gaussian
policy** 라고 한다.

legged_gym 이 쓰는 PPO 구현 rsl_rl(v1.0.2)의 `ActorCritic` 에서 MLP 의 출력 12 개는 학습하는 동안 관절마다 Gaussian 의 평균 $\mu_j$ 가 된다.
$\sigma$ 는 network 의 출력이 아니라 관절마다 하나씩 둔 parameter 12 개라서 state 와 상관없다. legged_gym 기본값 `init_noise_std = 1.0` 에
따라 모두 1 에서 시작하고, weight 와 함께 학습한다. 0.02 초에 한 번씩, 관절마다 평균 0, standard deviation 1 인 Gaussian 에서 $\epsilon_j$ 를 뽑아
$a_j = \mu_j + \sigma_j \epsilon_j$ 를 action 으로 쓴다.

legged_gym 은 action 에 `action_scale = 0.5` 를 곱해 기본 자세의 관절 각도에 더한 값을 목표 각도로 쓰고, 실제 로봇에서는 motor 의 PD
controller 가 그 목표를 torque 로 바꾼다. 그래서 $\sigma = 1$ 인 학습 초기에는 목표 각도가 평균 주위로 standard deviation $0.5 \times 1 = 0.5$
rad(약 28.6°)만큼 흩어지는데, 이 흔들림이 연속 action 의 exploration 이다. 기본 각도가 $-0.8$ rad 인 왼쪽 앞다리 무릎에서 MLP 가 예를 들어
$\mu = 0.2$ 를 냈을 때의 한 step 은 아래와 같다.

| 단계 | 계산 | 값 |
| --- | --- | --- |
| 뽑은 $\epsilon$ (예) | | 0.5 |
| action $a = \mu + \sigma\epsilon$ | $0.2 + 1 \times 0.5$ | 0.7 |
| 목표 각도 | $-0.8 + 0.5 \times 0.7$ | $-0.45$ rad |
| 평균만 썼을 때의 목표 각도 | $-0.8 + 0.5 \times 0.2$ | $-0.7$ rad |
| $\nabla_\mu \ln p(a) = (a - \mu) / \sigma^2$ | $(0.7 - 0.2) / 1^2$ | $+0.5$ |

![ANYmal C 보행 policy 의 Gaussian policy. MLP 가 48 개 입력에서 관절 12 개의 평균 μ 를 내고, 관절마다 standard deviation σ parameter(처음 1.0)를 둔다. 왼쪽 앞다리 무릎의 예에서 μ = 0.2, σ = 1 인 종 모양 곡선에서 a = 0.7 을 뽑았고, advantage 가 양수면 μ 가 a 쪽으로 움직인다. a 는 0.5 를 곱해 기본 각도 −0.8 rad 에 더해져 목표 각도 −0.45 rad 가 된다](figures/gaussian-policy.svg)

Gaussian 의 log-probability 를 평균으로 미분한 값은 $(a - \mu) / \sigma^2$ 이다. 뽑힌 action 이 평균보다 크면 양수이고 작으면 음수라서
softmax 의 $1 - \pi_\theta(B)$ 와 같은 역할을 하는데, 위 그림처럼 advantage 가 양수이면 평균을 뽑힌 action 쪽으로 끌어당기고 음수이면 반대쪽으로
민다. 이 값이 MLP 의 $j$ 번째 출력에 들어가 backpropagation 으로 모든 weight 에 전해진다. 관절 12 개는 따로 뽑으므로 함께 나올 확률 밀도는
관절별 값을 곱한 것이고, 그래서 rsl_rl 은 $\ln$ 을 씌워 관절 12 개의 log-probability 를 더한 값을 한 action 의 log-probability 로 쓴다.

학습이 끝나 policy 를 실행하거나 내보낼 때는 Gaussian 에서 뽑지 않고 평균 $\mu$ 를 그대로 쓴다(rsl_rl 의 `act_inference`). $\sigma$ 는 학습 중
exploration 에만 쓰인다.

> **오해** Gaussian policy 의 $\sigma$ 는 언제나 network 가 state 마다 낸다.
>
> **사실** rsl_rl 은 $\sigma$ 를 state 와 상관없는 parameter 로 둔다. A3C 논문의 MuJoCo 실험처럼 network 가 평균과 함께 variance $\sigma^2$ 도 내는 경우에는, 이 출력이 양수가 되도록
> SoftPlus $\ln(1 + e^x)$ 를 거친다.

**확인 문제.** Gaussian policy 의 한 관절에서 $\mu = -0.1$, $\sigma = 0.5$ 이고 뽑힌 action 이 $a = 0.4$ 였다. $\nabla_\mu \ln p(a)$ 는 얼마이고,
advantage 가 음수라면 $\mu$ 는 어느 쪽으로 움직일까?

<details><summary>답 보기</summary>

① $a - \mu = 0.4 - (-0.1) = 0.5$ 다.

② $\sigma^2 = 0.5 \times 0.5 = 0.25$ 다.

③ $\nabla_\mu \ln p(a) = 0.5 \div 0.25 = 2$ 다.

답: 2 다. update 는 advantage × 2 만큼 $\mu$ 를 움직이는데 advantage 가 음수이므로 $\mu$ 가 줄어 0.4 에서 멀어진다.

</details>

<details><summary><b>심화: Gaussian 의 log-probability 와 σ 의 gradient</b></summary>

평균 $\mu$, standard deviation $\sigma$ 인 Gaussian 의 확률 밀도는 $p(a) = \frac{1}{\sigma\sqrt{2\pi}} e^{-(a - \mu)^2 / (2\sigma^2)}$ 이고, 여기의
$\pi$ 는 원주율 3.14159 다. $\ln$ 을 씌우면 곱은 합이 되고 지수는 앞으로 내려온다.

$$
\ln p(a) = -\ln \sigma - \tfrac{1}{2}\ln(2\pi) - \frac{(a - \mu)^2}{2\sigma^2}
$$

무릎 예($\mu = 0.2$, $\sigma = 1$, $a = 0.7$)에서는 $0 - 0.9189 - 0.25 \div 2 = -1.0439$ 다. $\mu$ 로 미분하면 마지막 항만 남아
$(a - \mu) / \sigma^2$ 이고, $\sigma$ 로 미분하면 아래와 같다. Williams(1992)는 이 두 값을 Gaussian unit 의 characteristic eligibility 로 유도했다.

$$
\nabla_\sigma \ln p(a) = \frac{(a - \mu)^2 - \sigma^2}{\sigma^3}
$$

무릎 예에서는 $(0.25 - 1) / 1 = -0.75$ 다. 이 값은 뽑힌 action 이 평균에서 $\sigma$ 보다 가까우면 음수이고 멀면 양수다. 그래서 평균 가까이에서
뽑힌 action 의 advantage 가 양수이면 $\sigma$ 가 줄어 exploration 이 좁아지고, 평균에서 먼 action 이 좋은 결과를 내면 $\sigma$ 가 커진다.

</details>

## 정리

- argmax policy 는 선택이 계단처럼 바뀌어 gradient 로 고칠 수 없어서, policy gradient 는 softmax 나 Gaussian 으로 action 을 확률로 뽑는 stochastic
  policy 를 쓴다. 두 기계 문제에서 $J = 1 + \pi_\theta(B)$ 이고 $\theta = 0$ 의 gradient 는 0.25 다
- log-derivative trick 으로 $\nabla_\theta J = \mathbb E[q_*(a)\,\nabla_\theta \ln \pi_\theta(a)]$ 가 되어, REINFORCE 는 받은 reward 로
  $\theta \leftarrow \theta + \eta\, r\, \nabla_\theta \ln \pi_\theta(a)$ 를 계산한다. environment 의 이동 확률은 gradient 에서 빠진다
- action 과 상관없는 baseline 은 기댓값을 바꾸지 않고 variance 만 줄인다($\theta = 0$ 에서 1.0625 → 0.5). reward 하나와 critic 의 추정으로
  advantage 를 구하는 actor-critic 은 variance 가 더 작은 대신 critic 이 틀린 만큼 bias 가 생긴다
- ANYmal C 보행 policy 는 MLP 출력 12 개를 Gaussian 의 평균으로 쓰는 actor-critic 으로 학습하고, 실행할 때는 평균만 쓴다

policy gradient 는 지금 policy 로 모은 sample 을 한 번 쓰고 버려야 해서 environment 에서 sample 을 많이 모아야 한다. 또 learning rate 를 조금만
키워도 한 번의 update 로 policy 가 크게 바뀌어 성능이 갑자기 떨어질 수 있다. 같은 데이터로 여러 번 고치면서도 policy 가 한 번에 너무 많이 바뀌지 않게 막는
방법은 [PPO](../ppo/README.md) 에서 다루고, environment 가 어떻게 움직이는지 따로 배워 실제로 움직여 보는 횟수를 줄이는 방법은
[World Model](../world-model/README.md) 에서 다룬다.

## 참고 자료

- OpenAI Spinning Up, [Part 3: Intro to Policy Optimization](https://spinningup.openai.com/en/latest/spinningup/rl_intro3.html)
  — log-derivative trick, reward-to-go, baseline 의 유도를 수식으로 짧게 정리한 글
- Richard S. Sutton, Andrew G. Barto, [Reinforcement Learning: An Introduction (2nd edition)](http://incompleteideas.net/book/the-book-2nd.html)
  — REINFORCE(13.3 절), baseline(13.4 절), actor-critic(13.5 절), 연속 action 의 Gaussian policy(13.7 절)를 차례로 본다
- rsl_rl v1.0.2, [`actor_critic.py`](https://github.com/leggedrobotics/rsl_rl/blob/v1.0.2/rsl_rl/modules/actor_critic.py) — actor·critic MLP,
  `init_noise_std` 로 만드는 $\sigma$ parameter, 관절마다의 log-probability 를 더하는 `get_actions_log_prob`, 평균만 쓰는 `act_inference`
- legged_gym, [`legged_robot_config.py`](https://github.com/leggedrobotics/legged_gym/blob/master/legged_gym/envs/base/legged_robot_config.py)
  와 [ANYmal C 설정](https://github.com/leggedrobotics/legged_gym/blob/master/legged_gym/envs/anymal_c/mixed_terrains/anymal_c_rough_config.py)
  — `init_noise_std`, $\gamma$·$\lambda$, `only_positive_rewards`, 로봇 4096 대 × 24 step, `action_scale` 과 기본 관절 각도
- Gymnasium, [CartPole](https://gymnasium.farama.org/environments/classic_control/cart_pole/) — step 마다 +1 인 reward 와 12°·2.4 의 종료 조건
- Ronald J. Williams, [Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning](https://doi.org/10.1007/BF00992696)
  (1992) — REINFORCE 원 논문. 이름의 뜻과 Gaussian unit 의 $\mu$·$\sigma$ eligibility 가 있다
- Richard S. Sutton 외, [Policy Gradient Methods for Reinforcement Learning with Function Approximation](https://papers.nips.cc/paper/1999/hash/464d828b85b0bed98e80ade0a5c43b0f-Abstract.html)
  (1999) — 여러 step 의 MDP 에서 policy gradient 식(policy gradient theorem)과 critic 을 붙여도 되는 조건
- Volodymyr Mnih 외, [Asynchronous Methods for Deep Reinforcement Learning](https://arxiv.org/abs/1602.01783) (2016) — $n$-step advantage 를
  쓰는 A3C. 부록에 MuJoCo 연속 action 의 Gaussian policy 구성이 있다
- Nikita Rudin 외, [Learning to Walk in Minutes Using Massively Parallel Deep Reinforcement Learning](https://arxiv.org/abs/2109.11978) (2021) —
  GPU 하나에서 로봇 수천 대를 simulation 해 ANYmal 평지 보행 policy 를 4 분 안에 PPO 로 학습한 논문
