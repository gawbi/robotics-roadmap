---
id: flow-matching
title: Flow Matching
branch: generative
requires: [ddpm]
hours: 12
summary: 직선 경로의 velocity 를 배우는 적은 step 생성
papers:
  - title: "Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow"
    authors: Xingchao Liu, Chengyue Gong, Qiang Liu
    year: 2022
    url: https://arxiv.org/abs/2209.03003
  - title: "Building Normalizing Flows with Stochastic Interpolants"
    authors: Michael S. Albergo, Eric Vanden-Eijnden
    year: 2022
    url: https://arxiv.org/abs/2209.15571
  - title: "Flow Matching for Generative Modeling"
    authors: Yaron Lipman, Ricky T. Q. Chen, Heli Ben-Hamu, Maximilian Nickel, Matt Le
    year: 2022
    url: https://arxiv.org/abs/2210.02747
  - title: "Flow Matching Guide and Code"
    authors: Yaron Lipman et al.
    year: 2024
    url: https://arxiv.org/abs/2412.06264
---

# Flow Matching

## 배경

[DDPM](../ddpm/README.md) 의 reverse process 는 작은 Gaussian 단계를 수백~천 번 거쳐야 하고, noise 에서 데이터로 가는 경로도
구불구불하다. Diffusion Policy 는 DDIM 으로 inference step 을 10 번까지 줄이지만, 학습한 수식은 그대로 둔 채 sampling 단계만
건너뛸 뿐이다. flow matching 은 처음부터 noise 와 데이터를 잇는 경로를 직선으로 정의하고, 그 경로를 따라 움직이는 velocity
field 를 regression 으로 배운다.

noise $x_0\sim\mathcal N(0, I)$ 와 데이터 $x_1$ 을 하나씩 뽑아 직선으로 잇고, 그 위의 점 $x_t$ 에서 network 가 직선의 방향
$x_1 - x_0$ 를 맞히게 한다.

$$
x_t = (1-t)\,x_0 + t\,x_1,\quad t\sim\mathcal U[0, 1],\qquad
\mathcal L = \mathbb E_{t,\,x_0,\,x_1}\Big[\big\lVert v_\theta(x_t, t) - (x_1 - x_0)\big\rVert^2\Big]
$$

정답 $x_1 - x_0$ 는 쌍마다 다른데, Lipman 등은 이 loss 를 최소화한 $v_\theta$ 가 같은 $x_t$ 를 지나는 모든 쌍의 평균 방향
(marginal velocity field)이 되고, 그 ODE 를 따라가면 noise 분포가 정확히 데이터 분포로 옮겨진다는 것을 보였다. sampling 은
noise 에서 출발해 이 ODE 를 Euler 법으로 적분한다.

$$
\frac{dx}{dt} = v_\theta(x, t),\qquad x_{t+\Delta t} = x_t + \Delta t\; v_\theta(x_t, t)
$$

경로가 거의 직선이라 Euler step 몇 번으로도 오차가 작다. π0 의 action expert 는 이 loss 로 action 50개짜리 chunk 를
생성하고, 공개 구현(openpi)은 기본 10 step 으로 적분한다.

## 목표

- 직선 경로와 target velocity, flow matching loss, Euler·Heun sampler 를 짠다
- DDPM 과제와 같은 network·같은 8 gaussians 로 학습시켜 sampling step 수별 MMD 를 DDPM 과 비교한다
- 같은 초기 noise 에서 출발한 FM 과 DDPM 의 궤적을 한 그림에 그린다
- DDPM 과제의 U-Net 이 velocity 를 내도록 다시 학습시켜 MNIST 를 20 step 이하로 생성한다
- (선택) reflow 를 한 번 해서 1~2 step sampling 이 나아지는지 본다

**직접 짤 것**: 경로 보간, loss, Euler·Heun sampler, step 수 sweep, reflow.
**가져다 써도 되는 것**: DDPM 과제의 network·데이터·MMD 코드, (선택) adaptive ODE solver 비교용 `torchdiffeq`, 결과 비교용
facebookresearch `flow_matching` 라이브러리.

## 준비물

- Python 3.12, `torch`, `torchvision`, `matplotlib`, (선택) `torchdiffeq`
- DDPM 과제의 코드와 학습된 모델, 8 gaussians, MNIST
- 2D toy 는 CPU 로 충분하고, MNIST 는 8 GB GPU 나 Colab T4 로 돌릴 수 있다

## 진행 순서

1. `interpolate` 로 $x_t$ 와 target velocity 를 만들고 몇 쌍의 직선 경로를 그린다
2. DDPM 과제와 같은 MLP 를 flow matching loss 로 8 gaussians 에 학습시킨다
3. step 수를 인자로 받는 `euler_sample` 을 짠다
4. step 수 1·2·5·10·20·50 에서 FM 과 DDPM 의 MMD 를 한 그래프에 그린다
5. 같은 초기 noise 200개에서 출발한 FM·DDPM 궤적을 나란히 그린다
6. DDPM 과제의 U-Net 을 velocity 출력용으로 다시 학습시켜 MNIST 를 생성한다
7. (선택) 같은 network 호출 횟수에서 Heun 과 Euler 를 비교한다
8. (선택) 학습된 FM 으로 (noise, 생성 샘플) 쌍을 만들어 reflow 학습을 한 번 한다

## 시작점

```text
flow-matching/
├── flow.py         # interpolate, fm_loss, euler_sample, heun_sample, trajectory
├── train_toy.py
├── train_mnist.py
├── compare.py      # step 수 대비 MMD, FM vs DDPM
└── test_flow.py
# ddpm/nets.py, ddpm/toy_data.py, ddpm/metrics.py 를 그대로 import 한다
```

```python
import torch
from torch import nn

def interpolate(x0: torch.Tensor, x1: torch.Tensor, t: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
    """x0: noise, x1: data, t: (N,) in [0, 1]. returns (x_t, target velocity).
    convention: t = 0 is noise, t = 1 is data."""

def fm_loss(model: nn.Module, x1: torch.Tensor) -> torch.Tensor: ...

@torch.no_grad()
def euler_sample(model: nn.Module, x0: torch.Tensor, steps: int) -> torch.Tensor: ...

@torch.no_grad()
def heun_sample(model: nn.Module, x0: torch.Tensor, steps: int) -> torch.Tensor: ...

@torch.no_grad()
def trajectory(model: nn.Module, x0: torch.Tensor, steps: int) -> torch.Tensor:
    """(steps + 1, N, D), for plotting"""
```

## 스스로 확인

- [ ] `interpolate` 가 $t=0$ 에서 $x_0$, $t=1$ 에서 $x_1$ 을 내고, $t$ 에 대한 유한 차분이 target velocity 와 1e-4 이내로 같다
- [ ] 8 gaussians 에서 FM 이 Euler 20 step 이하로 DDPM 과제의 기준(각 mode 12.5% ± 3%p, 3σ 밖 샘플 5% 미만)을 통과한다
- [ ] step 수 대비 MMD 그래프에서 FM 이 DDPM 1000 step 의 MMD 수준에 도달하는 step 수가 DDPM 보다 적다
- [ ] 궤적 그림에서 FM 의 경로가 DDPM 보다 눈에 띄게 곧고, 경로 길이 대비 시작–끝 직선거리 비율을 둘 다 기록했다
- [ ] MNIST 에서 Euler 20 step 으로 생성한 64장을 DDPM 1000 step 샘플만큼 숫자로 알아볼 수 있다
- [ ] (선택) reflow 후 1 step·2 step 샘플의 MMD 가 reflow 전보다 낮다

## 생각해 볼 질문

1. 같은 2D 분포에서 flow matching 이 DDPM 보다 적은 step 으로 sampling 되는 이유는? Euler 적분의 오차가 경로의 어떤 성질에 좌우되는지와 연결해 설명할 수 있는가?
2. 학습 target $x_1 - x_0$ 는 직선인데 학습된 ODE 의 궤적은 완전한 직선이 아니다. 왜 그런가? reflow 는 이를 어떻게 고치는가?
3. π0 는 action 을 token 으로 하나씩 내는 대신 flow matching 으로 action chunk 를 한꺼번에 생성한다. 고주파 연속 제어에서 이 선택이 주는 이점은?

## 힌트

<details>
<summary>논문마다 다른 t 의 방향</summary>

Lipman 등은 $t=0$ 을 noise, $t=1$ 을 데이터로 두지만, diffusion 쪽 관례를 따르는 openpi(π0)는 $t=1$ 을 noise 로 두고 target 도
$\epsilon - x$ 로 뒤집어 $t=1$ 에서 0 으로 적분한다. 코드를 읽거나 옮길 때는 어느 쪽 관례인지 먼저 확인하고, 한 프로젝트
안에서는 하나로 통일한다.

</details>

<details>
<summary>DDPM 을 적은 step 으로 돌려 비교하는 법</summary>

학습한 1000개 timestep 중 $n$ 개만 골라, 고른 timestep 사이의 $\bar\alpha$ 로 reverse step 하나의 평균과 분산을 다시 계산한다.
noise 를 넣지 않는 DDIM update 로도 같은 network 를 돌릴 수 있는데, FM 과 같은 deterministic sampler 끼리 비교하는 편이 더
공정하다.

</details>

<details>
<summary>time 입력의 크기</summary>

DDPM 과제의 time embedding 이 0~999 정수를 가정했다면 $t\in[0, 1]$ 을 그대로 넣을 때 sin·cos feature 가 거의 변하지 않는다.
$t$ 에 1000 을 곱해 넣거나 embedding 의 주파수를 다시 잡는다. π0 처럼 $t$ 를 uniform 대신 noise 쪽에 치우친 Beta 분포에서 뽑는
방법도 있다.

</details>

## 참고 자료

- MIT 6.S184, [Flow Matching and Diffusion Models](https://diffusion.csail.mit.edu/) — 강의 노트([arXiv](https://arxiv.org/abs/2506.02070))와 [lab](https://github.com/eje24/iap-diffusion-labs) 이 flow matching 을 먼저 설명하고 diffusion 은 SDE 로 확장해 다룬다
- Cambridge MLG, [An introduction to Flow Matching](https://mlg.eng.cam.ac.uk/blog/2024/01/20/flow-matching.html) — conditional velocity 와 marginal velocity 의 관계를 그림으로 설명한다
- facebookresearch, [`flow_matching`](https://github.com/facebookresearch/flow_matching) 라이브러리의 [2D 예제 노트북](https://github.com/facebookresearch/flow_matching/blob/main/examples/2d_flow_matching.ipynb) — 막혔을 때만 열기
- Physical Intelligence, [openpi `pi0.py`](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0.py) — π0 가 action chunk 에 flow matching loss 를 거는 부분과 10 step sampling loop

## 남은 한계

여기서 만든 flow matching 은 조건 없이 숫자나 2D 점을 생성할 뿐, 카메라 이미지나 언어 지시를 받아 그에 맞는 action 을 내지는
못한다. [π0](../pi0/README.md) 는 VLM 이 읽은 이미지·언어를 조건으로 받아 flow matching 으로 action chunk 를 생성한다.
