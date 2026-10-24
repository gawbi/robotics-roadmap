---
id: flow-matching
title: Flow Matching
branch: generative
requires: [ddpm]
hours: 2
summary: noise 와 데이터를 잇는 직선 위의 속도를 network 가 맞히게 학습하고, 그 속도로 Euler step 몇 번만 밟아 sample 을 만드는 생성 방법. target velocity, step 수와 품질, diffusion 과의 비교, π0·GR00T N1 의 action 생성
papers:
  - title: "Flow Matching for Generative Modeling"
    authors: Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, Matt Le
    year: 2022
    url: https://arxiv.org/abs/2210.02747
  - title: "Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow"
    authors: Xingchao Liu, Chengyue Gong, Qiang Liu
    year: 2022
    url: https://arxiv.org/abs/2209.03003
  - title: "Building Normalizing Flows with Stochastic Interpolants"
    authors: Michael S. Albergo, Eric Vanden-Eijnden
    year: 2022
    url: https://arxiv.org/abs/2209.15571
  - title: "Flow Matching Guide and Code"
    authors: Yaron Lipman et al.
    year: 2024
    url: https://arxiv.org/abs/2412.06264
  - title: "π0: A Vision-Language-Action Flow Model for General Robot Control"
    authors: Kevin Black et al.
    year: 2024
    url: https://arxiv.org/abs/2410.24164
  - title: "GR00T N1: An Open Foundation Model for Generalist Humanoid Robots"
    authors: NVIDIA et al.
    year: 2025
    url: https://arxiv.org/abs/2503.14734
---

# Flow Matching

[DDPM](../ddpm/README.md) 으로 로봇 행동을 만드는 Diffusion Policy 는 noise 를 100 단계에 걸쳐 걷어 내도록 학습하지만, 실제 로봇에서는 100
단계를 다 밟을 시간이 없어서 DDIM 이라는 계산으로 10 단계만 밟는다. 그렇게 줄여도 NVIDIA RTX 3080 GPU 에서 행동 한 덩어리를 만드는 데
0.1 초가 걸린다. 학습은 100 단계로 하고 쓸 때만 계산을 고쳐 단계를 건너뛰는 방식인데, 처음부터 몇 단계 만에 noise 에서 행동까지 가도록
학습할 수는 없을까?

2022 년에 발표된 flow matching 은 noise 와 데이터를 직선으로 잇고 그 직선을 따라 움직이는 속도를 network 가 맞히게 하는 방법이라, 경로가
곧은 만큼 큰 step 몇 번만으로도 데이터에 닿는다. Physical Intelligence 의 VLA 모델 π0 는 1 초에 명령을 50 번 보내는 로봇의 1 초 분량인
action 50 개를 flow matching 으로 network 계산 10 번 만에 만드는데, RTX 4090 에서 그 10 번에 27 ms 가 걸린다.

## 학습 목표

- noise 와 데이터를 잇는 직선 위의 점과 target velocity(데이터 − noise)를 계산하고, network 가 그 속도를 맞히게 하는 conditional flow
  matching loss 를 설명할 수 있다
- Euler 법으로 sample 을 만드는 과정과, 경로가 곧을수록 적은 step 으로도 정확한 이유를 설명할 수 있다
- 정답이 여럿인 데이터에서 step 이 너무 적으면 sample 이 평균으로 몰리는 이유와, flow matching 이 diffusion 보다 적은 step 으로 되는 이유를
  설명할 수 있다
- π0 와 GR00T N1 이 flow matching 으로 action chunk 를 만드는 방식(step 수, $\tau$ 의 방향, 정답 속도의 부호)을 설명할 수 있다

## DDPM sampling 의 step 수

DDPM 은 sample(새로 만든 데이터 하나)을 만들 때 표준 정규분포 $\mathcal N(0, 1)$ 에서 뽑은 값에서 출발해 network 가 맞힌 noise 를 한
step 씩 걷어 낸다. step 하나에 network 를 한 번 쓰므로 $T = 1000$ step 이면 network 를 1000 번 쓴다.

DDPM 의 reverse step 식은 한 step 의 변화가 작다는 가정에서 나왔기 때문에 step 을 크게 건너뛰면 맞지 않고, 식 끝에 새 noise 를 더해
값을 일부러 흔들기까지 한다. 아래 그림 왼쪽은 DDPM 강의의 $T = 5$ sampling 계산표에서 0.60 이 2.00 에 닿기까지의 경로인데, step 마다
움직인 양이 제각각이다.

![왼쪽은 DDPM 의 T = 5 sampling 경로로 step 마다 이동량이 들쭉날쭉하고, 오른쪽은 noise −1 과 데이터 2 를 잇는 직선으로 t 가 0.25 늘 때마다 0.75 씩 일정하게 움직인다](figures/ddpm-vs-line.svg)

그림 오른쪽처럼 noise $-1$ 과 데이터 2 를 처음부터 직선으로 이어 두면 일정하게 움직이므로, 출발점에서 "속도 3 으로 시간 1 동안 간다" 는
것만 알면 중간을 건너뛰고 $-1 + 3 \times 1 = 2$ 로 한 번에 도착한다. 이 아이디어는 2022 년에 Lipman 등(Flow Matching), Liu 등(rectified
flow), Albergo 와 Vanden-Eijnden(stochastic interpolant)이 거의 같은 시기에 따로 발표했다.

**확인 문제.** network 한 번에 0.02 초가 걸린다. step 1000 번, 100 번, 10 번으로 sample 하나를 만들면 각각 몇 초가 걸릴까?

<details><summary>답 보기</summary>

| step 수 | 계산 | 시간 |
| --- | --- | --- |
| 1000 | $1000 \times 0.02$ | 20 초 |
| 100 | $100 \times 0.02$ | 2 초 |
| 10 | $10 \times 0.02$ | 0.2 초 |

걸리는 시간은 network 를 쓰는 횟수에 그대로 비례한다.

</details>

## 속도와 velocity field

flow matching 의 network 가 내는 값은 속도인데, 속도는 시간 1 동안 움직이는 거리라서 속도가 일정하면 나중 위치는 처음 위치에 속도 × 지난
시간을 더한 값이다. 이 강의에서 시간 $t$ 는 초가 아니라 출발(0)부터 도착(1)까지 얼마나 왔는지를 나타내는 숫자다.

flow matching 에서는 점의 위치와 시각에 따라 속도가 달라진다. 위치 $x$ 와 시각 $t$ 를 넣으면 그 자리의 속도를 정해 주는 규칙을
**velocity field** 라고 하고 $v(x, t)$ 로 적는다. field 는 물리학에서 공간의 자리마다 값이 하나씩 정해져 있는 것을 가리키는 말이다. 시각
1 에 위치 2 에 닿게 하는 규칙을 예로 들면, 지금 낼 속도는 남은 거리 $2 - x$ 를 남은 시간 $1 - t$ 로 나눈 값이다.

$$
v(x, t) = \frac{2 - x}{1 - t}
$$

![규칙 v(x, t) = (2 − x) ÷ (1 − t) 의 velocity field. 화살표는 모두 t = 1 에서 x = 2 를 향하고, 화살표를 따라 움직인 점은 직선을 그리며 2 에 닿는다](figures/velocity-field.svg)

velocity field 는 일기예보의 바람 지도가 지역마다 바람의 방향과 세기를 화살표로 그려 두는 것과 같다. 위치가 변하는 비율이 그 자리의 속도와
같다는 조건은 아래처럼 적는다.

$$
\frac{dx}{dt} = v(x, t)
$$

$\frac{dx}{dt}$ 는 "$x$ 가 $t$ 에 따라 변하는 비율" 로 읽는다. 변하는 비율의 규칙만 주고 위치를 구하게 하는 이런 식을 ODE(ordinary
differential equation, 상미분방정식)라고 한다. flow matching 은 network 로 $v$ 를 배우고, 이 ODE 를 $t = 0$ 부터 1 까지 풀어 noise 를
데이터로 옮긴다.

**확인 문제.** 위 규칙 $v(x, t) = (2 - x) \div (1 - t)$ 에서 $x = 0$, $t = 0.5$ 와 $x = 4$, $t = 0$ 의 속도는?

<details><summary>답 보기</summary>

$x = 0$, $t = 0.5$ 는 남은 거리 $2 - 0 = 2$ 를 남은 시간 $1 - 0.5 = 0.5$ 로 나눠 4 이고, $x = 4$, $t = 0$ 은 $(2 - 4) \div 1 = -2$ 다.

</details>

## 직선 경로와 target velocity

데이터를 $x_1$ 이라 하고 $\mathcal N(0, 1)$ 에서 뽑은 noise 를 $\epsilon$("엡실론")이라 할 때, 둘을 잇는 직선 위에서 시각 $t$ 의 점은
아래와 같다.

$$
x_t = (1 - t)\,\epsilon + t\,x_1
$$

두 계수의 합이 언제나 1 이라서 $t = 0$ 이면 noise 그대로이고
$t = 1$ 이면 데이터 그대로다. 그 사이의 값은 둘을 $1 - t : t$ 로 섞은 값인데, $\epsilon = -1$, $x_1 = 2$ 로 계산하면 아래 표와 같다.

| $t$ | $(1 - t) \times \epsilon$ | $t \times x_1$ | $x_t$ |
| --- | --- | --- | --- |
| 0 | $1 \times (-1) = -1$ | $0 \times 2 = 0$ | $-1$ |
| 0.25 | $0.75 \times (-1) = -0.75$ | $0.25 \times 2 = 0.5$ | $-0.25$ |
| 0.5 | $0.5 \times (-1) = -0.5$ | $0.5 \times 2 = 1$ | 0.5 |
| 1 | $0 \times (-1) = 0$ | $1 \times 2 = 2$ | 2 |

$t$ 가 0.25 늘 때마다 $x_t$ 는 0.75 씩 늘어나므로 속도는 $0.75 \div 0.25 = 3$ 이고, 이 값은 $x_1 - \epsilon = 2 - (-1)$ 과 같다. 괄호를
풀어 $t$ 가 곱해진 항끼리 묶으면 어떤 $\epsilon$, $x_1$ 에서도 그렇다.

$$
x_t = \epsilon - t\,\epsilon + t\,x_1 = \epsilon + t\,(x_1 - \epsilon)
$$

오른쪽은 "처음 위치 + 속도 × 지난 시간" 꼴이라서 처음 위치는 $\epsilon$ 이고 속도는 $x_1 - \epsilon$ 이다. 이 속도에는 $t$ 가 없어서 직선
위 어디서나 같은데, network 가 맞혀야 할 정답이 이 값이고 **target velocity** 라고 부른다.

![noise ε 와 데이터 x₁ 을 잇는 직선 경로의 예 두 개. ε = −1, x₁ = 2 인 직선은 속도가 늘 3 이고, ε = 0.5, x₁ = −2 인 직선은 속도가 늘 −2.5 다](figures/straight-path.svg)

데이터가 숫자 여러 개를 묶은 vector 이면 noise 도 같은 개수의 숫자를 따로 뽑고 자리마다 같은 계산을 한다. $\epsilon = (0.5, -1)$,
$x_1 = (2, 0)$ 이면 target velocity 는 $(2 - 0.5,\ 0 - (-1)) = (1.5,\ 1)$ 이다. 로봇의 action chunk 는 숫자가 수백 개인 vector 지만, 이처럼
자리마다 직선을 따로 그어 계산한다.

**흔한 오해.** DDPM 에서는 $x_0$ 이 원래 데이터였고 아래첨자가 클수록 noise 가 많았으니, 여기서도 $x_0$ 을 데이터로 읽기 쉽다. 이 강의는 Lipman 등의 논문과 π0 논문을 따라 noise 를 $x_0 = \epsilon$ 으로 적고 데이터를 $x_1$ 로 적어서, $t$ 가 커질수록 데이터에
가까워진다. π0 의 공개 구현처럼 $t = 1$ 을 noise 로 두는 코드도 있으므로, 다른 자료를 읽을 때는 어느 쪽이 noise 인지부터 확인한다.

<details><summary><b>심화: DDPM 의 섞는 식과의 차이</b></summary>

DDPM 도 데이터와 noise 를 섞은 값에서 출발한다. 한 번에 건너뛰는 식 $x_t = \sqrt{\bar\alpha_t}\,x_0 + \sqrt{1 - \bar\alpha_t}\,\epsilon$ 은
원래 값이 남은 몫 $\bar\alpha_t$ 로 두 계수를 정하는데, 두 계수의 제곱의 합이 1 이 되게 섞어 퍼진 정도(분산)를 1 로 지킨다. 예를 들어
$\bar\alpha_t = 0.5$ 이면 두 계수가 모두 $\sqrt{0.5} \approx 0.71$ 이다. flow matching 은 두 계수 $1 - t$ 와 $t$ 의 합이 1 이 되게 섞어서, $t$ 를
바꿔 가며 찍은 점들이 한 직선 위에 놓인다. Lipman 등은 이 경로를 optimal transport(OT) 경로라고 불렀다. 논문의 식은 끝점에 아주 작은 폭 $\sigma_{\min}$ 을 남기는
$x_t = (1 - (1 - \sigma_{\min})\,t)\,\epsilon + t\,x_1$ 인데, $\sigma_{\min} = 0$ 으로 두면 이 강의의 식이 된다.

</details>

**확인 문제.** $\epsilon = 1.5$, $x_1 = 2$ 다. target velocity 와 $t = 0.4$ 의 $x_t$ 는?

<details><summary>답 보기</summary>

① target velocity 는 $x_1 - \epsilon = 2 - 1.5 = 0.5$ 다.

② $x_{0.4} = \epsilon + t\,(x_1 - \epsilon) = 1.5 + 0.4 \times 0.5 = 1.7$ 이다.

③ 섞는 식으로 구해도 $0.6 \times 1.5 + 0.4 \times 2 = 0.9 + 0.8 = 1.7$ 로 같다.

</details>

## conditional flow matching loss

생성할 때는 noise $\epsilon$ 만 있을 뿐 그 noise 가 어느 데이터와 짝인지 모르므로, $x_1 - \epsilon$ 을 직접 계산하지 못하고 network 가
대신 낸다. network 는 지금 위치 $x_t$ 와 시각 $t$ 를 받아 그 자리의 속도 $v_\theta(x_t, t)$ 를 내는데, $\theta$("세타")는 network 의
weight 전체를 가리킨다.

같은 위치라도 시각에 따라 맞는 속도가 달라서 시각 $t$ 도 함께 넣는다. 데이터가 2 하나뿐이어도 위치 0.5 에서 맞는 속도는 $t = 0$ 이면
$1.5 \div 1 = 1.5$ 이고, $t = 0.5$ 이면 $1.5 \div 0.5 = 3$ 이다.

학습 한 step 은 아래 순서다.

1. 데이터에서 $x_1$ 을 하나 꺼내고, $\mathcal N(0, 1)$ 에서 noise $\epsilon$ 을 뽑는다
2. 0 과 1 사이의 어느 값이든 같은 가능성으로 나오게 시각 $t$ 를 뽑는다. 이 분포를 uniform 분포라 하고 $t \sim \mathcal U[0, 1]$ 로 적는다
3. $x_t = (1 - t)\,\epsilon + t\,x_1$ 을 만들어 network 에 $x_t$ 와 $t$ 를 넣는다
4. network 의 출력과 target velocity $x_1 - \epsilon$ 의 차이를 제곱해 loss 를 구하고, gradient descent 로 loss 가 줄어드는 쪽으로 $\theta$
   를 조금 고친다

아래 그림은 $x_1 = 2$, $\epsilon = -1$, $t = 0.5$ 가 뽑히고 학습 도중의 network 가 2.5 를 낸 예다.

![학습 한 step 의 예. x_t = 0.5 와 t = 0.5 를 받은 network 가 2.5 를 내면, 정답 속도 x₁ − ε = 3 과의 차이로 loss (3 − 2.5)² = 0.25 를 구한다](figures/train-step.svg)

$t = 0$ 부터 차례로 걸어갈 필요 없이 섞는 식으로 $x_t$ 를 바로 만들고, 학습하는 동안 $t$ 를 고르게 뽑으므로 network 는 모든 시각의 속도를 배운다.
정답 $x_1 - \epsilon$ 은 쌍 $(\epsilon, x_1)$ 하나를 정해 두어야 계산되는데, Lipman 등은 이렇게 쌍 하나를 조건(condition)으로 둔다는
뜻에서 이 loss 를 **conditional flow matching loss** 라고 불렀다.

DDPM 과 나란히 놓으면 학습하는 순서는 같고 network 가 맞히는 값만 다르다.

| | DDPM | flow matching |
| --- | --- | --- |
| network 가 맞히는 값 | 섞인 noise $\epsilon$ | 직선의 속도 $x_1 - \epsilon$ |
| 시각 입력 | step 번호 (1 ~ 1000 의 정수) | $t$ (0 ~ 1 의 실수) |
| $x_t$ 를 만드는 식 | $\sqrt{\bar\alpha_t}\,x_0 + \sqrt{1 - \bar\alpha_t}\,\epsilon$ | $(1 - t)\,\epsilon + t\,x_1$ |
| $x_1 = 2$, $\epsilon = -1$ 일 때 정답 | $-1$ | 3 |

<details><summary><b>심화: 여러 예의 평균과 loss 의 식</b></summary>

여러 예를 한꺼번에 학습할 때는 각 예의 loss 를 평균한다. 아래 표의 network 출력은 학습 도중이라고 보고 정한 값이다.

| 예 | $x_1$ | $\epsilon$ | $t$ | $x_t$ | target $x_1 - \epsilon$ | 출력 | loss |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | 2 | $-1$ | 0.5 | $-0.5 + 1 = 0.5$ | 3 | 2.5 | $(3 - 2.5)^2 = 0.25$ |
| 2 | $-2$ | 0.5 | 0.4 | $0.3 - 0.8 = -0.5$ | $-2.5$ | $-1.5$ | $(-2.5 + 1.5)^2 = 1$ |
| 3 | 2 | 1 | 0.25 | $0.75 + 0.5 = 1.25$ | 1 | 1.2 | $(1 - 1.2)^2 = 0.04$ |

세 loss 의 평균은 $(0.25 + 1 + 0.04) \div 3 = 0.43$ 이다. 기호로는 아래처럼 쓴다.

$$
L = \frac{1}{N}\sum_{i=1}^{N} \Big\lVert (x_{1,i} - \epsilon_i) - v_\theta(x_{t_i}, t_i) \Big\rVert^2,
\qquad x_{t_i} = (1 - t_i)\,\epsilon_i + t_i\,x_{1,i}
$$

$N$ 은 예의 개수이고, $\sum$ 은 1 번째부터 $N$ 번째까지 모두 더하라는 기호이며, $\lVert \cdot \rVert^2$ 은 자리마다 제곱해 더한 값이다.
위 표라면 $N = 3$ 이고 $L = 0.43$ 이다. 숫자 2 개짜리 데이터에서 target 이 $(1.5, 1)$ 이고 network 가 $(1.2, 1.4)$ 를 냈다면 loss 는
$(1.5 - 1.2)^2 + (1 - 1.4)^2 = 0.09 + 0.16 = 0.25$ 다.

</details>

**확인 문제.** $x_1 = -2$, $\epsilon = 1$, $t = 0.5$ 이고 network 가 $-2$ 를 냈다. 이 예의 loss 는?

<details><summary>답 보기</summary>

① target velocity 는 $x_1 - \epsilon = -2 - 1 = -3$ 이다.

② loss 는 $(-3 - (-2))^2 = (-1)^2 = 1$ 이다.

$x_t = 0.5 \times 1 + 0.5 \times (-2) = -0.5$ 는 network 의 입력이고, loss 계산에는 직접 쓰이지 않는다.

</details>

## Euler 법

network 가 속도를 내 줘도 속도가 자리마다 바뀌기 때문에 위치를 바로 구할 수는 없다. 그래서 0 부터 1 까지를 $n$ 토막으로 잘라, 한 토막
동안은 속도가 바뀌지 않는다고 보고 직진하기를 되풀이한다. 이 방법을 **Euler 법**이라고 하는데, 18 세기 스위스 수학자 Leonhard Euler 의
이름을 땄다.

$$
x_{\text{새}} = x + \Delta t \times v(x, t), \qquad \Delta t = \frac{1}{n}
$$

$\Delta t$("델타 t")는 한 토막의 길이이고, 한 번 직진하는 것을 step 이라 부른다. flow matching 에서는 $v$ 를 network 가 내므로 step 하나에
network 를 한 번 쓴다.

경로가 직선이면 Euler 법은 오차가 없다. 앞의 규칙 $v(x, t) = (2 - x) \div (1 - t)$ 를 따라 $x = -1$ 에서 출발한 점은 속도가 줄곧 3 이라서
$n = 1$ 이어도 $-1 + 1 \times 3 = 2$ 로 정확하다.

속도가 step 도중에 바뀌면 오차가 생긴다. 속도가 시각에 따라 $v = 2t$ 로 커지는 점은 실제로 $x = t^2$ 을 따라 $t = 1$ 에 위치 1 에 닿는다.
Euler 법은 step 을 시작할 때의 속도로 끝까지 직진하므로, 이 점처럼 step 도중에 빨라지면 매번 실제보다 덜 간다.

![속도가 v = 2t 로 커질 때의 Euler 법. 실제 위치는 초록 점선 x = t² 를 따라 1 에 닿고, Euler 법이 닿는 위치는 step 수 1·2·4·10 에서 각각 0·0.5·0.75·0.9 다](figures/euler-curve.svg)

위 그림에서 Euler 법이 닿는 위치는 $1 - \frac{1}{n}$ 이라서 오차가 정확히 $\frac{1}{n}$ 이다. step 을 잘게 나눌수록 한 step 안에서 속도가 덜 바뀌어 오차가 줄지만, step 마다 network 를 한 번
쓰므로 시간은 그만큼 늘어난다. flow matching 이 경로를 직선으로 정하는 것은 step 을 늘리지 않고도 오차를 줄이기 위해서다.

**흔한 오해.** step 은 많을수록 좋다고 생각하기 쉽지만, 직선 경로에서는 step 1 번과 1000 번의 결과가 같아서 나머지 999 번은 시간만 쓴다.

<details><summary><b>심화: v = 2t 의 Euler 계산표와 Heun 법</b></summary>

$v = 2t$ 인 점을 0 에서 출발시켜 $n = 4$($\Delta t = 0.25$)로 걸으면 아래와 같다.

| step 시작 시각 $t$ | 그때 속도 $2t$ | 이동 $0.25 \times 2t$ | 새 위치 |
| --- | --- | --- | --- |
| 0 | 0 | 0 | 0 |
| 0.25 | 0.5 | 0.125 | 0.125 |
| 0.5 | 1 | 0.25 | 0.375 |
| 0.75 | 1.5 | 0.375 | 0.75 |

$n = 10$ 이면 이동량의 합이 $0.1 \times 2 \times (0 + 0.1 + \cdots + 0.9) = 0.2 \times 4.5 = 0.9$ 다. 일반적으로 $n$ step 의 결과는
$\frac{2}{n^2}(0 + 1 + \cdots + (n - 1)) = \frac{n - 1}{n} = 1 - \frac{1}{n}$ 이다.

Heun 법은 step 하나에서 속도를 두 번 구해 평균을 낸다. 먼저 Euler 법처럼 한 번 직진해 도착할 자리 $\tilde x$("$x$ 틸데")를 어림하고, 그
자리의 속도를 한 번 더 구한 뒤 두 속도의 평균으로 다시 직진한다. 이름은 독일 수학자 Karl Heun 에서 왔다.

$$
\tilde x = x + \Delta t \times v(x, t), \qquad
x_{\text{새}} = x + \Delta t \times \frac{v(x, t) + v(\tilde x, t + \Delta t)}{2}
$$

$v = 2t$ 를 Heun 법 1 step($\Delta t = 1$)으로 계산하면 출발 속도 0 과 $t = 1$ 의 속도 2 를 평균한 1 로 직진해 $0 + 1 \times 1 = 1$ 에
정확히 닿는다. Heun 법은 step 하나에 network 를 두 번 쓰므로 Euler 법과는 network 를 쓰는 횟수를 맞춰 비교한다. network 를 똑같이 2 번
쓸 때 Euler 2 step 은 0.5 에 닿고 Heun 1 step 은 1 에 닿는다. 속도가 바뀌지 않는 직선 경로에서는 두 속도가 같아서 Heun 법이 얻는 것 없이
network 만 한 번 더 쓴다.

![v = 2t 인 점의 Euler 법과 Heun 법. 둘 다 network 를 두 번 쓰는데, Euler 2 step 은 0.5 에 닿고 Heun 1 step 은 시작 속도 0 과 끝 속도 2 의 평균 1 로 직진해 실제 값 1 에 닿는다](figures/heun.svg)

</details>

**확인 문제.** $v = 2t$ 인 점을 0 에서 출발시켜 $n = 5$ 로 걸으면 $t = 1$ 의 위치는? 오차는 얼마일까?

<details><summary>답 보기</summary>

$\Delta t = 1 \div 5 = 0.2$ 이고, step 시작 시각과 속도는 아래와 같다.

| step 시작 시각 $t$ | 0 | 0.2 | 0.4 | 0.6 | 0.8 |
| --- | --- | --- | --- | --- | --- |
| 속도 $2t$ | 0 | 0.4 | 0.8 | 1.2 | 1.6 |

이동량의 합은 $0.2 \times (0 + 0.4 + 0.8 + 1.2 + 1.6) = 0.2 \times 4 = 0.8$ 이다. 답: 위치 0.8, 오차 $1 - 0.8 = 0.2 = \frac{1}{5}$ 이다.

</details>

## 엇갈리는 경로와 marginal velocity field

데이터가 $+2$ 와 $-2$ 반반인 경우를 보자. 데이터의 값이 몰린 곳을 봉우리라고 하는데, 이 데이터는 봉우리가 둘이다. 학습할 때는 noise 와
데이터를 무작위로 짝짓기 때문에 $+2$ 로 가는 직선과 $-2$ 로 가는 직선이 서로 엇갈린다.

쌍 A 가 $\epsilon = -2$ 에서 $x_1 = +2$ 로 가고 쌍 B 가 $\epsilon = 2$ 에서 $x_1 = -2$ 로 가면, 두 직선은 $t = 0.5$ 에서 같은 자리 0 을
지난다. 그런데 target velocity 는 쌍 A 가 $2 - (-2) = 4$ 이고 쌍 B 는 $-2 - 2 = -4$ 다.

![왼쪽은 데이터 +2, −2 와 무작위 noise 를 짝지어 그은 직선 18 개의 예로, 서로 여러 번 엇갈린다. 오른쪽은 속도 +4 인 직선과 속도 −4 인 직선이 t = 0.5, x = 0 에서 만나는 모습이다](figures/crossing.svg)

network 는 $x_t = 0$, $t = 0.5$ 만 보므로 두 경우에 같은 값 $c$ 를 낸다. 두 쌍이 같은 가능성으로 나온다면 평균 loss 는 아래와 같다.

| 출력 $c$ | 쌍 A 의 loss $(4 - c)^2$ | 쌍 B 의 loss $(-4 - c)^2$ | 평균 |
| --- | --- | --- | --- |
| 4 | 0 | 64 | 32 |
| 2 | 4 | 36 | 20 |
| 0 | 16 | 16 | 16 |
| $-2$ | 36 | 4 | 20 |

평균 loss 를 가장 작게 하는 출력은 두 정답의 평균 0 이고, 그때도 loss 는 16 이라 0 이 되지 않는다. 차이의 제곱으로 학습한 network 는 같은
입력에 정답이 여럿이면 그 평균을 낸다. 일반적으로 network 가 배우는 속도는 그 자리를 지나는 쌍들의 target velocity 를 가능성으로 무게를
두어 평균한 값이고, 식으로 쓰면 아래와 같다.

$$
v(x_t, t) = \frac{\hat x_1 - x_t}{1 - t}
$$

$\hat x_1$("$x_1$ 햇")은 지금 자리를 지나는 쌍들의 데이터 $x_1$ 을 가능성으로 무게를 두어 평균한 값인데, 모자 기호는 추정한 값이라는
표시다. $t = 0$ 에서는 짝이 $+2$ 이든 $-2$ 이든 $x_0 = \epsilon$ 을 똑같이 $\mathcal N(0, 1)$ 에서 뽑으므로 가능성이 반반이고,
$\hat x_1 = 0.5 \times 2 + 0.5 \times (-2) = 0$ 이라 $v(x, 0) = -x$ 다. 처음에는 모든 점이 두 데이터의 평균 0 을 향하고, $t$ 가 커져
어느 데이터로 갈지 드러나면 $\hat x_1$ 이 $+2$ 나 $-2$ 쪽으로 기운다.

![데이터가 +2 와 −2 반반일 때 network 가 배우는 속도와 그 속도를 따라간 파란 경로. 경로는 처음에 0 쪽으로 조금 모였다가 갈라져, 서로 엇갈리지 않고 +2 나 −2 에 닿는다](figures/marginal-field.svg)

위 그림의 파란 선은 network 가 배운 속도를 따라 아주 잘게 걸은 경로다. 한 자리에서 network 가 내는 속도는 하나뿐이라서, 두 경로가 같은
자리에 오면 그 뒤로는 같은 길을 간다. 그래서 학습된 경로끼리는 엇갈리지 않는다.

쌍 하나의 조건을 이렇게 평균해 없앤 field 를 **marginal velocity field** 라고 한다. marginal 은 표의 가장자리(margin)에 행이나 열의
합을 적던 데서 온 확률 용어다. Lipman 등은 conditional flow matching loss 로 학습한 network 가 이 field 를 배우고, 이 field 를 따라가면
$\mathcal N(0, 1)$ 의 분포가 데이터의 분포로 정확히 옮겨진다는 것을 보였다. 그래서 network 가 쌍을 몰라도 데이터를 만들 수 있고, 위
그림에서 양수 noise 는 $+2$ 로 가고 음수 noise 는 $-2$ 로 가서 sample 이 반반으로 나뉜다.

**흔한 오해.** 학습의 정답이 직선이니 생성 경로도 직선이라고 생각하기 쉽다. 데이터가 하나뿐이면 그렇지만, 데이터가 여럿이면 직선들이
엇갈리는 자리에서 network 가 평균을 내므로 생성 경로는 휜다. flow matching 의 경로가 DDPM 보다 곧은 것은 맞지만 완전한 직선은 아니다.

<details><summary><b>심화: 남은 거리 ÷ 남은 시간과 가능성의 계산</b></summary>

섞는 식을 $\epsilon$ 에 대해 풀면 $\epsilon = (x_t - t\,x_1) \div (1 - t)$ 이고, 이것을 target velocity 에 넣으면 아래와 같다.

$$
x_1 - \epsilon = x_1 - \frac{x_t - t\,x_1}{1 - t} = \frac{(1 - t)\,x_1 - x_t + t\,x_1}{1 - t} = \frac{x_1 - x_t}{1 - t}
$$

target velocity 는 데이터까지 남은 거리 $x_1 - x_t$ 를 남은 시간 $1 - t$ 로 나눈 값이다. 남은 시간은 그 자리를 지나는 모든 쌍에 같으므로,
$x_1$ 을 먼저 평균해 $\hat x_1$ 로 바꾼 뒤 나눠도 결과가 같다. 앞의 velocity field 예 $(2 - x) \div (1 - t)$ 는 데이터가 2 하나뿐일 때의 답이었다.

$t = 0.5$, $x_t = 0.25$ 에서 $+2$ 쪽 가능성은 아래처럼 구한다. $x_1 = +2$ 인 쌍의 $x_{0.5} = 0.5\,\epsilon + 1$ 은 1 을 가운데로 표준편차
0.5 만큼 퍼져 있고, $x_1 = -2$ 인 쌍은 $-1$ 을 가운데로 표준편차 0.5 만큼 퍼져 있다. 0.25 는 1 에서 표준편차 1.5 개만큼 떨어져 있고 $-1$
에서는 2.5 개만큼 떨어져 있어서, 두 종 모양 곡선의 높이는 각각 0.26 과 0.035 다. 데이터가 반반이므로 가능성은 높이의 비와 같고, 합이 1 이
되게 나누면 $0.26 \div 0.295 \approx 0.88$ 과 $0.035 \div 0.295 \approx 0.12$ 다.

| $t$ | $x_t$ | $+2$ 쪽 가능성 | $\hat x_1$ | $v = (\hat x_1 - x_t) \div (1 - t)$ |
| --- | --- | --- | --- | --- |
| 0 | 0.5 | 0.50 | 0 | $(0 - 0.5) \div 1 = -0.5$ |
| 0 | $-1.2$ | 0.50 | 0 | $(0 + 1.2) \div 1 = 1.2$ |
| 0.5 | 0 | 0.50 | 0 | $0 \div 0.5 = 0$ |
| 0.5 | 0.25 | 0.88 | $0.88 \times 2 + 0.12 \times (-2) = 1.52$ | $1.27 \div 0.5 = 2.54$ |
| 0.5 | 1 | 1.00 | 2.00 | $1 \div 0.5 = 2$ |

</details>

**확인 문제.** 같은 자리를 지나는 쌍이 셋이고 target velocity 가 각각 4, 4, $-4$ 다. 세 쌍이 같은 가능성으로 나온다면 network 는 어떤
값을 배울까?

<details><summary>답 보기</summary>

loss 를 가장 작게 하는 출력은 세 정답의 평균이다.

$$
(4 + 4 - 4) \div 3 = 4 \div 3 \approx 1.33
$$

$+2$ 로 가는 쌍이 더 많아서 평균이 양수 쪽으로 기운다.

</details>

## step 수와 sample 품질

학습을 마친 network 로 sample 을 만들 때는 $\mathcal N(0, 1)$ 에서 뽑은 $\epsilon$ 을 $x$ 로 두고, $t = 0$ 부터
$x \leftarrow x + \Delta t \times v_\theta(x, t)$ 를 $n$ 번 되풀이한다. 화살표 $\leftarrow$ 는 오른쪽 값으로 바꾼다는 뜻이다. 아래 계산에서는
데이터가 $+2$, $-2$ 반반이고 network 가 앞 절의 평균 속도를 정확히 낸다고 둔다. $\epsilon = 0.5$ 에서 출발한 실제 경로는 $+2$ 에 닿지만,
Euler 법으로 만든 sample 은 아래 그림처럼 step 수에 따라 달라진다.

![데이터가 +2 와 −2 반반일 때 noise ε = 0.5 에서 출발한 Euler sampling. 실제 경로는 +2 에 닿고, Euler 법이 닿는 값은 step 수 1·2·4·10 에서 각각 0·1.52·2.00·2.00 이다](figures/euler-steps.svg)

마지막 step 은 남은 시간 $1 - t$ 를 한 번에 가므로 $x + (1 - t) \times \frac{\hat x_1 - x}{1 - t} = \hat x_1$ 이 되어, 결과가 언제나 그 step
이 시작하는 자리의 $\hat x_1$ 과 같다. $n = 2$ 의 마지막 step 은 $t = 0.5$ 에서 시작하므로, 아직 $+2$ 쪽으로 다 기울지 않은
$\hat x_1 = 1.52$ 가 그대로 sample 이 된다. $n = 1$ 이면 마지막 step 이 $t = 0$ 에서 시작하고 $t = 0$ 의 $\hat x_1$ 은 두 데이터의 평균
0 이라서, 출발점과 상관없이 sample 이 모두 0 이다. Liu 등도 rectified flow 를 Euler step 한 번으로 풀면 데이터 분포의 평균이 나온다고 적었다.

0 은 데이터 어디에도 없는 값이라서, 상자를 왼쪽으로 비켜 간 시연과 오른쪽으로 비켜 간 시연이 반반 섞인 로봇 데이터라면 1 step 으로 만든
action 은 두 길의 평균인 상자 정면으로 향한다. 정답 분포에 봉우리가 여럿인 이런 데이터를 multimodal 이라고 한다.

![noise 20000 개를 Euler 법으로 옮겨 계산한 결과의 histogram. 1 step 이면 모두 0 에 모인다. 봉우리 ±2 에서 0.3 넘게 벗어난 sample 의 비율은 step 수 2·4·10 에서 각각 47%·1%·0% 다](figures/step-hist.svg)

위 그림은 noise 20000 개로 같은 계산을 해서, 봉우리 $\pm 2$ 에서 0.3 넘게 벗어난 sample 의 비율을 step 수마다 센 결과다. 2 step 에서
벗어난 sample 은 0 근처의 noise 에서 나오는데, 이런 noise 는 $t = 0.5$ 에서도 두 봉우리의 가능성이 비슷해서 $\hat x_1$ 이 $\pm 2$ 에
못 미친다.

경로가 휘는 곳은 어느 데이터로 갈지 정하는 짧은 구간뿐이다. $n = 10$ 으로 걸으면 $t = 0.6$ 부터 $\hat x_1 = 2$ 로 정해지고, 그 뒤로는
2 를 향한 직선이라 속도가 2.61 로 바뀌지 않는다. 곧은 구간에서는 step 을 크게 잡아도 오차가 없어서, 휘는 구간만 몇 step 으로 따라가면 된다.

**흔한 오해.** 경로가 직선이니 1 step 이면 된다고 생각하기 쉽지만, 1 step 으로 되는 것은 데이터의 봉우리가 하나일 때뿐이다.

<details><summary><b>심화: ε = 0.5 의 Euler 계산표</b></summary>

표의 값은 반올림하지 않은 값으로 계산하고 소수 셋째 자리에서 반올림해 적었다. $n = 2$($\Delta t = 0.5$)는 아래와 같다.

| step | $t$ | $x$ | $+2$ 쪽 가능성 | $\hat x_1$ | $v = (\hat x_1 - x) \div (1 - t)$ | 새 $x$ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 0.50 | 0.50 | 0 | $-0.50$ | 0.25 |
| 2 | 0.5 | 0.25 | 0.88 | 1.52 | 2.54 | 1.52 |

$n = 4$($\Delta t = 0.25$)는 마지막 step 이 시작하는 $t = 0.75$ 에서 $+2$ 쪽 가능성이 1.00 이라 sample 이 2.00 이 된다.

| step | $t$ | $x$ | $+2$ 쪽 가능성 | $\hat x_1$ | $v$ | 새 $x$ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 0 | 0.50 | 0.50 | 0 | $-0.50$ | 0.38 |
| 2 | 0.25 | 0.38 | 0.66 | 0.64 | $0.27 \div 0.75 = 0.36$ | 0.46 |
| 3 | 0.5 | 0.46 | 0.98 | 1.90 | $1.44 \div 0.5 = 2.88$ | 1.18 |
| 4 | 0.75 | 1.18 | 1.00 | 2.00 | $0.82 \div 0.25 = 3.26$ | 2.00 |

$n = 10$($\Delta t = 0.1$)은 아래와 같다.

| $t$ | 0 | 0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| $x$ | 0.50 | 0.45 | 0.42 | 0.44 | 0.51 | 0.70 | 0.96 | 1.22 | 1.48 | 1.74 |
| $\hat x_1$ | 0 | 0.22 | 0.52 | 0.98 | 1.63 | 1.99 | 2.00 | 2.00 | 2.00 | 2.00 |
| $v$ | $-0.50$ | $-0.25$ | 0.12 | 0.77 | 1.86 | 2.57 | 2.61 | 2.61 | 2.61 | 2.61 |

마지막 step 뒤의 값은 $1.74 + 0.1 \times 2.61 = 2.00$ 이다. $\epsilon = -1.2$ 에서 $n = 2$ 로 걸으면 $t = 0$ 의 속도 1.2 로
$-1.2 + 0.5 \times 1.2 = -0.6$ 에 가고, $t = 0.5$ 에서 $-2$ 쪽 가능성이 0.99 라서 $\hat x_1 \approx -1.97$ 이 그대로 sample 이 된다. 0 에서
멀리 출발한 noise 라서 $t = 0.5$ 에 이미 어느 쪽으로 갈지 거의 정해졌다.

</details>

**확인 문제.** $n = 2$ 로 걸었더니 $t = 0.5$ 에서 $x = 0.5$ 였고, 그 자리의 $+2$ 쪽 가능성이 0.98 이다. 둘째 step 의 속도와 sample 은?

<details><summary>답 보기</summary>

① $\hat x_1 = 0.98 \times 2 + 0.02 \times (-2) = 1.96 - 0.04 = 1.92$ 다.

② 속도는 $(\hat x_1 - x) \div (1 - t) = (1.92 - 0.5) \div 0.5 = 2.84$ 다.

③ sample 은 $0.5 + 0.5 \times 2.84 = 1.92$ 다.

답: 속도 2.84, sample 1.92 다. 마지막 step 이라 $\hat x_1$ 과 같다.

</details>

## diffusion 과의 비교

DDPM 의 reverse step 은 끝에 새 noise 를 더해서, 같은 $x_t$ 에서 출발해도 경로가 step 마다 무작위로 흔들린다. flow matching 의 Euler step 은
속도대로 직진하는 계산이라 DDPM 처럼 작은 step 을 가정하지 않고, 새 noise 도 더하지 않아서 출발점이 정해지면 경로가 하나로 정해진다.

![같은 출발값 8 개에서 시작한 DDPM(T = 1000) 과 flow matching 의 경로. DDPM 경로는 새 noise 때문에 끝까지 잘게 흔들리고, flow matching 경로는 매끄럽다](figures/fm-vs-ddpm.svg)

$+2$, $-2$ 반반 데이터에서 두 방법 모두 network 대신 정확한 답(가능성을 무게로 둔 평균)을 쓰게 하고, DDPM 은 $T = 1000$ 의 linear
schedule 에서 step $n$ 개를 같은 간격으로 골라 건너뛰게 한다. 이 조건으로 noise 20000 개를 옮겨 계산하면 봉우리에서 0.3 넘게 벗어난 sample
의 비율은 아래와 같다.

| step 수 $n$ | 1 | 2 | 4 | 10 |
| --- | --- | --- | --- | --- |
| flow matching (Euler) | 100% | 47% | 1% | 0% |
| DDPM (step 을 건너뛴 reverse) | 100% | 97% | 29% | 약 0.2% |

1 step 은 둘 다 평균을 내서 실패하고 10 step 이면 둘 다 거의 맞지만, 4 step 에서는 차이가 크다. 이미지에서도 경향은 같다. Lipman 등이 같은
U-Net 을 CIFAR-10 으로 학습하고 오차 허용치에 맞춰 step 크기를 스스로 조절하는 ODE solver 로 sample 을 만들었을 때, network 를 쓴 평균
횟수는 DDPM loss 로 학습한 모델이 274 번이고 직선(OT) 경로의 flow matching 이 142 번이었다. step 수를 고정한 ImageNet 32×32 실험에서도
flow matching 은 같은 오차에 닿는 데 network 를 diffusion 경로 모델의 약 60% 만큼만 썼다.

**흔한 오해.** flow matching 이 적은 step 으로 되는 것은 network 가 속도를 더 잘 맞혀서라고 생각하기 쉽다. 위 1 차원 비교는 두 방법 모두
정확한 답을 쓰게 해서 network 의 차이가 없는데도 결과가 갈렸으므로, 차이는 경로의 모양과 그 경로를 따라가는 계산 방식에서 난다.

<details><summary><b>심화: reflow</b></summary>

Liu 등은 경로를 더 곧게 펴려고, 학습을 마친 모델로 noise $\epsilon$ 에서 sample $x_1'$ 을 만든 뒤 무작위 짝 대신 이 $(\epsilon, x_1')$ 쌍으로
같은 loss 를 한 번 더 학습했다. 이 과정을 **reflow** 라고 하고, rectify 는 곧게 편다는 뜻이다. 위 데이터에서 학습된 경로는 양수 noise 를
$+2$ 로 보내고 음수 noise 를 $-2$ 로 보냈으므로 이 짝으로 다시 그은 직선은 엇갈리지 않는다. $\epsilon = 0.5$ 는 $+2$ 와 짝이 되어 target
velocity 가 $2 - 0.5 = 1.5$ 다. 이 자리를 지나는 다른 직선이 없으니 network 는 1.5 를 그대로 배우고, 1 step 으로 $0.5 + 1 \times 1.5 = 2$
에 닿는다.

![왼쪽은 noise 와 데이터를 무작위로 짝지은 직선으로 서로 엇갈린다. 오른쪽은 학습한 모델이 noise 에서 실제로 만든 값과 다시 짝지은 직선으로, 양수 noise 는 +2 와 짝이 되고 음수 noise 는 −2 와 짝이 되어 엇갈리지 않는다. ε = 0.5 는 +2 와 짝이 되어 속도 1.5 의 직선이 되고 1 step 으로 2 에 닿는다](figures/reflow.svg)

이 1 차원 예는 reflow 한 번으로 엇갈림이 모두 사라지는 쉬운 경우다. 실제 데이터에서는 reflow 를 해도 완전한 직선이 되지 않지만, 더
곧아지는 만큼 적은 step 으로 sampling 할 수 있다. Liu 등은 한 번 reflow 한 모델이 Euler step 한 번으로도 쓸 만한 이미지를 만든다고
보고했다.

</details>

**확인 문제.** 같은 noise $\epsilon = 0.5$ 에서 flow matching 으로 10 step sampling 을 두 번 하면 두 sample 은 같을까? DDPM 이라면?

<details><summary>답 보기</summary>

flow matching 은 새 noise 를 더하지 않아 두 번 모두 같은 경로로 가서 같은 값(이 강의의 데이터라면 2.00)이 나온다. DDPM 은 reverse step
마다 새 noise 를 뽑으므로 같은 출발점에서도 경로와 sample 이 달라질 수 있다.

</details>

## π0 의 action expert

π0 는 Physical Intelligence 가 2024 년에 발표한 VLA(Vision-Language-Action) 모델로, 카메라 이미지와 글로 된 지시를 받아 로봇의 action 을
낸다. 저자들은 이미지와 지시를 읽는 VLM(vision-language model) PaliGemma(weight 30 억 개) 옆에, flow matching 으로 action 을 만드는
**action expert**(weight 3 억 개)를 붙였다. action expert 는 앞으로 $H = 50$ step 의 action 을 묶은 action chunk 를 한꺼번에 만드는데,
1 초에 명령을 50 번 보내는 로봇에서는 1 초 분량이다. 이런 로봇에서 π0 는 그중 25 개(0.5 초)를 실행한 뒤 새 chunk 를 만든다.

π0 논문은 이 강의의 $t$ 를 $\tau$("타우")로 적고, 데이터 자리에 시연의 action chunk $A_t$ 를 넣는다. 아래첨자 $t$ 는 로봇 제어에서
지금이 몇 번째 시점인지를 나타내고, flow matching 의 시각은 위첨자 $\tau$ 로 적는다.

$$
A_t^\tau = \tau\,A_t + (1 - \tau)\,\epsilon, \qquad
\text{target velocity} = A_t - \epsilon, \qquad
A_t^{\tau + \delta} = A_t^\tau + \delta\,v_\theta(A_t^\tau, o_t)
$$

이 강의의 식에서 $x_1$ 자리에 $A_t$ 를 넣고 $t$ 자리에 $\tau$ 를 넣은 것과 같고, $\tau = 0$ 이 noise 라는 방향도 같다. $\delta$ 는 $\Delta t$
에 해당하는 한 step 의 길이로, π0 는 $\delta = 0.1$ 로 Euler step 을 10 번 밟는다. $o_t$ 는 이미지·지시문·관절 각도를 합친
관측(observation)인데, network 가 $o_t$ 를 함께 받으므로 같은 noise 에서 출발해도 장면과 지시가 다르면 다른 chunk 가 나온다.

![π0 가 action 을 만드는 과정. action expert 가 VLM 의 결과와 로봇 상태, noise 가 섞인 action chunk 를 받아 속도를 내고, 속도에 0.1 을 곱해 chunk 에 더하는 일을 10 번 되풀이하면 앞으로 50 step 동안의 action 이 나온다](figures/pi0-action.svg)

10 번의 Euler step 동안 바뀌는 것은 noise 가 섞인 action 과 $\tau$ 뿐이라서, VLM 이 관측을 읽는 계산은 chunk 하나에 한 번만 하고 결과를
저장해 둔 채 step 마다 작은 action expert 만 다시 계산한다. 논문이 RTX 4090 에서 카메라 3 대로 잰 추론 시간은 아래와 같다.

| 계산 | 시간 |
| --- | --- |
| 이미지 encoder | 14 ms |
| VLM 이 관측을 읽는 계산 | 32 ms |
| action expert 10 번 (flow matching 10 step) | 27 ms |
| 합계 | 73 ms |

flow matching 한 step 은 약 $27 \div 10 = 2.7$ ms 이고, 실행하는 action 25 개가 0.5 초 분량이라서 73 ms 짜리 계산은 그 안에 넉넉히
끝난다.

학습할 때 $\tau$ 는 0 과 1 사이에서 고르게 뽑지 않고 noise 쪽을 더 자주 뽑는다. LeRobot 의 π0 구현도 논문과 같이 기본값이 chunk 50 개이고
추론 step 은 10 번이다.

<details><summary><b>심화: π0 의 τ 분포와 openpi 의 부호</b></summary>

π0 는 noise 가 많은 쪽($\tau$ 가 작은 쪽)을 더 자주 뽑는 beta 분포 $p(\tau) = \text{Beta}\big(\tfrac{s - \tau}{s};\ 1.5,\ 1\big)$,
$s = 0.999$ 에서 $\tau$ 를 뽑는다. noise 가 많은 자리에서 network 는 관측에 맞는 평균 행동을 맞혀야 하는데, 논문은 관측이 가능한 행동을
크게 좁히는 만큼 이 일이 어려워서 그 자리를 더 많이 학습한다고 설명했다.

공개 구현 openpi 의 코드에서 섞는 식은 `time * noise + (1 - time) * actions` 이고 정답 속도는 `noise - actions` 라서, 시각 변수 `time` 이
1 이면 noise 다. sampling 은 `time` 을 1 에서 시작해 step 마다 `dt = -1/num_steps`(10 step 이면 $-0.1$)만큼 줄이고, 속도에도 이 음수
step 길이를 곱해 더한다. 시각의 방향과 정답 속도의 부호가 함께 뒤집혀 있어서 논문의 식과 같은 경로를 따라가므로, 코드를 읽을 때는
방향부터 확인한다.

</details>

**확인 문제.** π0 식으로 $A = -1.0$, $\epsilon = 1.0$, $\tau = 0.5$ 다. $A^\tau$ 와 target velocity 는? network 가 정답 속도를 낸다면 Euler
10 step 뒤의 값은?

<details><summary>답 보기</summary>

① $A^{0.5} = 0.5 \times (-1.0) + 0.5 \times 1.0 = 0$ 이다.

② target velocity 는 $A - \epsilon = -1.0 - 1.0 = -2.0$ 이다.

③ step 마다 $0.1 \times (-2.0) = -0.2$ 씩 움직이므로 10 step 뒤는 $1.0 + 10 \times (-0.2) = -1.0$ 이다.

답: $A^{0.5} = 0$, target velocity $-2.0$, 10 step 뒤 $-1.0$ 으로 시연 값에 닿는다.

</details>

## GR00T N1 과 step 수의 선택

NVIDIA 가 2025 년에 발표한 humanoid 용 모델 GR00T N1 도 같은 flow matching 으로 action 을 만든다. 속도를 내는 network $V_\theta$ 는
diffusion transformer 로, VLM 출력 $\phi_t$ 와 섞은 점 $A_t^\tau$, 로봇 상태 $q_t$ 를 받는다. 섞는 식 $A_t^\tau = \tau A_t + (1 - \tau)\epsilon$
과 $\tau$ 를 뽑는 beta 분포는 π0 와 같다. chunk 길이는 $H = 16$ 이고 Euler step 은 $K = 4$ 번인데, 논문은 $K = 4$ 가 실험한 모든 로봇에서
잘 동작했다고 적었다. L40 GPU 에서 action 16 개를 만드는 데는 63.9 ms 가 걸렸다.

**흔한 오해.** GR00T N1 논문의 식 (1) 에 정답 속도가 $\epsilon - A_t$ 로 적혀 있어서 그대로 따라 쓰기 쉽다. 그런데 같은 논문의 Euler 식
$A_t^{\tau + 1/K} = A_t^\tau + \frac{1}{K} V_\theta$ 는 $\tau = 0$ 의 noise 에서 출발해 속도를 더해 가므로, 시연 쪽으로 가려면 속도가
$A_t - \epsilon$ 이어야 한다. 섞는 식에서 $\tau$ 가 1 늘 때 $A_t^\tau$ 가 변하는 양도 $A_t - \epsilon$ 이고, π0 논문도
$A_t - \epsilon$ 으로 적었다.

![action chunk 하나를 만들 때 network 를 쓰는 횟수. Diffusion Policy 는 100 번을 DDIM 으로 10 번으로 줄여 RTX 3080 에서 0.1 초가 걸린다. π0 는 10 번이고(action 50 개, RTX 4090 에서 73 ms), GR00T N1 은 4 번이다(action 16 개, L40 에서 63.9 ms)](figures/robot-steps.svg)

LeRobot 의 SmolVLA 도 기본값이 chunk 50 개이고 Euler step 은 10 번이다. 이렇게 적은 step 으로 되는 것은 관측이 주어지면 정답 행동의
봉우리가 대개 몇 개로 좁혀져서 경로의 휘는 구간이 짧기 때문이다. 로봇 제어에서는 실행 중인 chunk 가 끝나기 전에 다음 chunk 가 나와야 로봇이 멈추지 않으므로, 이
계산 시간이 step 수를 정하는 실제 조건이다.

**확인 문제.** 시연 값이 $A = 0.5$, noise 가 $\epsilon = 1.5$ 다. 정답 속도를 $A - \epsilon$ 으로 학습한 network 와, 부호를 잘못 써서
$\epsilon - A$ 로 학습한 network 로 각각 Euler 4 step 을 밟으면 어디에 닿을까? network 는 학습한 정답을 그대로 낸다고 하자.

<details><summary>답 보기</summary>

| 정답 속도 | 속도 | step 마다 $0.25 \times$ 속도 | 4 step 뒤 |
| --- | --- | --- | --- |
| $A - \epsilon$ | $0.5 - 1.5 = -1$ | $-0.25$ | $1.5 + 4 \times (-0.25) = 0.5$ |
| $\epsilon - A$ | $1.5 - 0.5 = 1$ | $0.25$ | $1.5 + 4 \times 0.25 = 2.5$ |

답: $A - \epsilon$ 은 시연 값 0.5 에 닿고, $\epsilon - A$ 는 2.5 에 닿아 시연에서 멀어진다. 섞는 식이 $\tau = 0$ 을 noise 로 두고 Euler
step 이 속도를 더해 가는 한, 정답 속도는 데이터 − noise 여야 한다.

</details>

## 정리

- flow matching 은 noise $\epsilon$ 과 데이터 $x_1$ 을 직선 $x_t = (1 - t)\,\epsilon + t\,x_1$ 로 잇고, 그 위의 속도 $x_1 - \epsilon$ 을
  network 가 맞히게 학습한다. $\epsilon = -1$, $x_1 = 2$ 이면 target velocity 는 3 이다. 생성할 때는 Euler 법으로 $x + \Delta t \times v$ 를
  $n$ 번 되풀이한다
- 데이터가 여럿이면 직선들이 엇갈리는 자리에서 network 가 정답 속도의 평균을 배워 생성 경로가 휘고, 1 step 은 데이터의 평균을 낸다.
  $\pm 2$ 데이터로 계산하면 봉우리를 벗어난 sample 의 비율이 step 1·2·4·10 에서 각각 100%·47%·1%·0% 였고, 같은 조건의 DDPM 은 4 step 에서
  29% 였다
- π0 는 action 50 개를 $\delta = 0.1$ 의 Euler 10 step 으로 만들고, GR00T N1 은 action 16 개를 4 step 으로 만든다. 두 논문 모두 $\tau = 0$
  이 noise 이므로 정답 속도는 $A_t - \epsilon$ 이어야 한다. openpi 코드는 방향을 뒤집어 `time` = 1 을 noise 로 두고 정답 속도도
  noise − actions 로 둔다

이 강의의 flow matching 은 숫자 하나나 몇 개를 조건 없이 만들었을 뿐, 카메라 이미지나 지시문에 맞는 action 을 내지는 않았다. 이미지와
지시문을 VLM 으로 읽어 조건으로 넣는 attention 구조와, 그 계산을 10 번의 step 동안 다시 쓰며 실시간으로 실행하는 방법은
[π0](../pi0/README.md) 에서 다룬다.

## 참고 자료

- Yaron Lipman 등, [Flow Matching for Generative Modeling](https://arxiv.org/abs/2210.02747) (2022) — 쌍 하나를 조건으로 정한 경로의 loss 로
  marginal velocity field 를 배우는 원리(3 절, 정리 1·2)와 DDPM 과의 network 사용 횟수 비교(6 절 표 1, 그림 7)
- Xingchao Liu, Chengyue Gong, Qiang Liu, [Flow Straight and Fast](https://arxiv.org/abs/2209.03003) (2022) — 직선 경로의 rectified flow 와,
  모델이 만든 짝으로 다시 학습하는 reflow
- Michael S. Albergo, Eric Vanden-Eijnden, [Building Normalizing Flows with Stochastic Interpolants](https://arxiv.org/abs/2209.15571)
  (2022) — 같은 시기에 noise 와 데이터를 섞는 식(interpolant)의 관점에서 같은 아이디어를 정리한 논문
- Yaron Lipman 등, [Flow Matching Guide and Code](https://arxiv.org/abs/2412.06264) (2024) — 표기와 관례를 한데 정리한 긴 tutorial
- Peter Holderrieth, Ezra Erives, [An Introduction to Flow Matching and Diffusion Models](https://arxiv.org/abs/2506.02070) — MIT 강의
  [노트](https://diffusion.csail.mit.edu/). 3 장이 conditional·marginal vector field 와 flow matching loss 를 차례로 설명한다
- Cambridge MLG, [An introduction to Flow Matching](https://mlg.eng.cam.ac.uk/blog/2024/01/20/flow-matching.html) — 쌍마다 정한 속도와 그
  평균인 velocity field 의 관계를 그림으로 설명한 블로그
- Kevin Black 등, [π0: A Vision-Language-Action Flow Model for General Robot Control](https://arxiv.org/abs/2410.24164) (2024) — 4 절의
  flow matching 식과 Euler 10 step, 부록 B 의 $\tau$ 분포, 부록 D 의 추론 시간 표
- Physical Intelligence, [openpi `pi0.py`](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0.py) — π0 의 loss 와
  10 step sampling 코드. 시각의 방향이 논문과 반대라서 `time` 이 1 이면 noise 다
- NVIDIA, [GR00T N1: An Open Foundation Model for Generalist Humanoid Robots](https://arxiv.org/abs/2503.14734) (2025) — 2.1 절의 flow
  matching 식 (1), $K = 4$ step 과 $H = 16$
- Cheng Chi 등, [Diffusion Policy](https://arxiv.org/abs/2303.04137) (2023) — DDPM 100 단계로 학습하고 DDIM 10 단계로 sampling 해 RTX 3080 에서
  0.1 초가 걸린다는 설정
