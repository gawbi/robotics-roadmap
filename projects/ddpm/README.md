---
id: ddpm
title: DDPM
branch: generative
requires: [vae, cnn]
hours: 18
summary: noise 를 조금씩 걷어 내는 diffusion model
papers:
  - title: "Deep Unsupervised Learning using Nonequilibrium Thermodynamics"
    authors: Jascha Sohl-Dickstein, Eric A. Weiss, Niru Maheswaranathan, Surya Ganguli
    year: 2015
    url: https://arxiv.org/abs/1503.03585
  - title: "Denoising Diffusion Probabilistic Models"
    authors: Jonathan Ho, Ajay Jain, Pieter Abbeel
    year: 2020
    url: https://arxiv.org/abs/2006.11239
  - title: "Denoising Diffusion Implicit Models"
    authors: Jiaming Song, Chenlin Meng, Stefano Ermon
    year: 2020
    url: https://arxiv.org/abs/2010.02502
  - title: "Improved Denoising Diffusion Probabilistic Models"
    authors: Alex Nichol, Prafulla Dhariwal
    year: 2021
    url: https://arxiv.org/abs/2102.09672
---

# DDPM

## 배경

[VAE](../vae/README.md) 는 latent 하나에서 decoder 한 번으로 이미지를 만들어서, pixel 끼리의 세밀한 상관관계를 담지 못하고
샘플이 흐릿해진다. DDPM 은 데이터에 Gaussian noise 를 $T$ 단계에 걸쳐 조금씩 더해 순수한 noise 로 만드는 forward process 를
고정해 두고, 그 반대로 noise 를 한 단계씩 걷어 내는 reverse process 를 학습한다. 한 단계의 변화가 작으면 reverse 한 단계도
Gaussian 으로 근사할 수 있어서, 어려운 생성 문제가 쉬운 denoising 문제 $T$ 개로 쪼개진다.

forward process 는 noise schedule $\beta_1,\dots,\beta_T$ 로 정해지고, 어느 $t$ 의 $x_t$ 든 $x_0$ 에서 한 번에 sampling 할 수 있다.

$$
q(x_t\mid x_0) = \mathcal N\big(\sqrt{\bar\alpha_t}\,x_0,\ (1-\bar\alpha_t)I\big), \qquad
\alpha_t = 1-\beta_t,\quad \bar\alpha_t = \prod_{s=1}^{t}\alpha_s
$$

network $\epsilon_\theta$ 는 $x_t$ 와 $t$ 를 받아 섞여 들어간 noise 를 맞히도록 학습한다. 아래 loss 는 ELBO 를 정리한 뒤 항별
weight 를 떼어 내면 나오므로, DDPM 은 encoder 를 고정된 noising 과정으로 바꾼 여러 층짜리 VAE 로 볼 수도 있다.

$$
\mathcal L = \mathbb E_{x_0,\,t,\,\epsilon}\Big[\big\lVert \epsilon - \epsilon_\theta\big(\sqrt{\bar\alpha_t}\,x_0 + \sqrt{1-\bar\alpha_t}\,\epsilon,\ t\big)\big\rVert^2\Big]
$$

sampling 은 $x_T\sim\mathcal N(0,I)$ 에서 시작해 아래 식으로 $T$ 번 거꾸로 내려온다.

$$
x_{t-1} = \frac{1}{\sqrt{\alpha_t}}\Big(x_t - \frac{\beta_t}{\sqrt{1-\bar\alpha_t}}\,\epsilon_\theta(x_t, t)\Big) + \sigma_t z,\qquad z\sim\mathcal N(0, I)
$$

Ho 등은 $T=1000$ 에 $\beta_t$ 를 $10^{-4}$ 에서 $0.02$ 까지 선형으로 늘리는 schedule 을 썼다. Diffusion Policy 는 같은 수식으로
이미지 대신 로봇의 action sequence 를 생성하는데, Nichol & Dhariwal 의 square cosine schedule 로 100 step 학습하고 실물에서는
DDIM 10 step 으로 sampling 한다.

## 목표

- linear·cosine noise schedule 과 forward noising 을 짜고 diffusers `DDPMScheduler` 와 값을 맞춘다
- 2D toy 분포(8 gaussians)에서 MLP denoiser 를 학습시켜 ancestral sampling 으로 샘플을 만든다
- 생성 샘플과 실제 샘플의 거리를 MMD 로 잰다
- MNIST 에서 time embedding 을 받는 작은 conv U-Net 으로 숫자를 생성한다
- reverse process 가 진행되는 모습을 $t$ 별 snapshot 으로 그린다

**직접 짤 것**: schedule, `q_sample`, loss, reverse step 과 sampling loop, sinusoidal time embedding, U-Net, MMD.
**가져다 써도 되는 것**: `nn.Conv2d`·`nn.GroupNorm`·`nn.ConvTranspose2d`, torchvision 의 MNIST loader, diffusers
`DDPMScheduler`(비교용으로만).

## 준비물

- Python 3.12, `torch`, `torchvision`, `matplotlib`, `diffusers`(schedule 비교용)
- 직접 만드는 8 gaussians 데이터, MNIST
- 2D toy 는 CPU 로 충분하고, MNIST U-Net 은 8 GB GPU 나 Colab T4 면 된다

## 진행 순서

1. `make_betas` 로 linear·cosine schedule 을 만들고 `alphas_cumprod` 를 diffusers 와 비교한다
2. 반지름 2 인 원 위의 중심 8개에 표준편차 0.1 인 Gaussian 을 둔 8 gaussians 데이터를 만들고 `q_sample` 로 $t$ 별 $x_t$ 를 그린다
3. sinusoidal time embedding 을 받는 MLP $\epsilon_\theta(x_t, t)$ 를 2D 데이터에 학습시킨다
4. `p_sample` 과 `sample` loop 로 10,000개를 생성하고 실제 분포와 겹쳐 그린다
5. RBF kernel MMD 를 짜서 생성 샘플과 실제 샘플을 비교한다
6. down 2단·up 2단, skip connection, time embedding 을 갖춘 `UNet` 을 짠다
7. MNIST 를 $[-1, 1]$ 로 바꿔 학습시키고 64장을 생성한다
8. 같은 입력·같은 seed 에서 `p_sample` 한 step 을 `DDPMScheduler.step` 과 비교한다

## 시작점

```text
ddpm/
├── schedule.py     # make_betas, NoiseSchedule
├── diffusion.py    # q_sample, ddpm_loss, p_sample, sample
├── nets.py         # timestep_embedding, MLPDenoiser, UNet
├── toy_data.py     # eight_gaussians
├── metrics.py      # mmd_rbf
├── train_toy.py
├── train_mnist.py
└── test_schedule.py
```

```python
import torch
from torch import nn

def make_betas(T: int, kind: str = "linear", beta_start: float = 1e-4, beta_end: float = 0.02) -> torch.Tensor:
    """kind: "linear" or "cosine" (Nichol & Dhariwal 2021, betas capped at 0.999)"""

class NoiseSchedule:
    """holds betas, alphas, alphas_cumprod, posterior_variance, each of shape (T,)"""
    def __init__(self, betas: torch.Tensor): ...

def q_sample(s: NoiseSchedule, x0: torch.Tensor, t: torch.Tensor, noise: torch.Tensor) -> torch.Tensor:
    """t: (N,) int in [0, T), broadcast over the remaining dims of x0"""

def ddpm_loss(model: nn.Module, s: NoiseSchedule, x0: torch.Tensor) -> torch.Tensor: ...

@torch.no_grad()
def p_sample(model: nn.Module, s: NoiseSchedule, x_t: torch.Tensor, t: int,
             generator: torch.Generator | None = None) -> torch.Tensor: ...

@torch.no_grad()
def sample(model: nn.Module, s: NoiseSchedule, shape: tuple[int, ...],
           generator: torch.Generator | None = None) -> torch.Tensor: ...

def timestep_embedding(t: torch.Tensor, dim: int) -> torch.Tensor:
    """(N,) -> (N, dim) sinusoidal features"""

class UNet(nn.Module):
    def __init__(self, in_ch: int = 1, base: int = 64, time_dim: int = 256): ...
    def forward(self, x: torch.Tensor, t: torch.Tensor) -> torch.Tensor:
        """predicts the noise, same shape as x"""

def mmd_rbf(x: torch.Tensor, y: torch.Tensor, bandwidth: float | None = None) -> torch.Tensor:
    """bandwidth None -> median heuristic"""
```

## 평가 기준

- [ ] 내 linear·cosine schedule 의 `alphas_cumprod` 가 `DDPMScheduler(beta_schedule="linear")`·`DDPMScheduler(beta_schedule="squaredcos_cap_v2")` 와 1e-6 이내로 같다($T$ = 1000, 100 둘 다)
- [ ] 같은 $x_t$·model 출력·seed 의 `torch.Generator` 를 넣은 내 `p_sample` 이 `DDPMScheduler(clip_sample=False).step(...).prev_sample` 과 1e-5 이내로 같다
- [ ] 8 gaussians 에서 생성한 10,000개가 mode 8개에 각각 12.5% ± 3%p 씩 나뉘고, 가장 가까운 중심에서 0.3(3σ) 넘게 벗어난 샘플이 5% 미만이다
- [ ] 생성 2,000개와 실제 2,000개의 MMD 를, 실제 2,000개 두 묶음 사이의 MMD 와 나란히 기록했다
- [ ] MNIST 생성 64장의 대부분이 어떤 숫자인지 알아볼 수 있다
- [ ] (선택) [CNN](../cnn/README.md) 과제의 LeNet-5 로 생성 샘플 1,000장을 분류해 10개 class 가 고르게 나오는지 본다

## 생각해 볼 질문

1. 학습할 때는 $t$ 를 하나 골라 한 단계만 보는데 sampling 은 $T$ 단계를 모두 거친다. 학습이 한 단계만으로 가능한 이유는?
2. $T$ 를 10 으로 줄이고 $\beta_t$ 를 그만큼 키우면 같은 방식으로는 왜 잘 안 되는가? reverse 한 단계를 Gaussian 으로 놓는 가정과 연결해 설명할 수 있는가?
3. 같은 관측에서 시연자가 장애물을 왼쪽으로도 오른쪽으로도 돌아갔다면, MSE regression policy 와 diffusion policy 는 각각 무엇을 출력하는가?

## 힌트

<details>
<summary>diffusers 와 값이 맞지 않을 때</summary>

`DDPMScheduler` 는 `clip_sample=True` 가 기본값이라 예측한 $x_0$ 를 $[-1, 1]$ 로 잘라 낸다. 8 gaussians 처럼 범위가 넓은
데이터와 비교할 때는 꺼야 한다. diffusers 의 timestep index 는 0 부터 $T-1$ 까지고 논문의 $t$ 는 1 부터 $T$ 까지라서, 배열을
어느 쪽 기준으로 쓸지 한 곳에서 정해 둔다.

</details>

<details>
<summary>time embedding 과 U-Net 크기</summary>

$t$ 는 Transformer 의 positional encoding 과 같은 sin·cos feature 로 바꾼 뒤 작은 MLP 를 거쳐, 각 residual block 의 feature map
에 channel 별로 더한다. MNIST 는 28×28 이라 32×32 로 padding 하면 down 두 번(32→16→8)이 깔끔하게 떨어지고, channel 64 에서
시작하는 작은 망으로 충분하다.

</details>

<details>
<summary>MMD 의 bandwidth</summary>

RBF kernel 의 bandwidth 는 두 샘플을 합친 집합의 pairwise 거리 중앙값으로 잡는 median heuristic 이 무난하다. 서로 비교할 모든
실험에서 같은 bandwidth 를 써야 숫자끼리 비교할 수 있다.

</details>

## 참고 자료

- MIT 6.S184, [Flow Matching and Diffusion Models](https://diffusion.csail.mit.edu/) — 강의 노트([arXiv](https://arxiv.org/abs/2506.02070))와 [lab](https://github.com/eje24/iap-diffusion-labs) 이 diffusion 을 ODE·SDE 부터 차례로 설명한다
- Lilian Weng, [What are Diffusion Models?](https://lilianweng.github.io/posts/2021-07-11-diffusion-models/) — forward·reverse 식 유도
- Hugging Face, [The Annotated Diffusion Model](https://huggingface.co/blog/annotated-diffusion) — U-Net 까지 포함한 PyTorch 구현 해설. 막혔을 때만 열기
- diffusers, [`DDPMScheduler` 문서](https://huggingface.co/docs/diffusers/api/schedulers/ddpm)와 [소스](https://github.com/huggingface/diffusers/blob/main/src/diffusers/schedulers/scheduling_ddpm.py) — schedule·step 비교 대상
- Ho 등의 [공식 구현](https://github.com/hojonathanho/diffusion)(TensorFlow)

## 남은 한계

DDPM 은 샘플 하나를 얻는 데 network 를 $T$ 번(여기서는 1000번) 돌려야 해서, 초당 수십 번 action 을 내야 하는 로봇 제어에는
느리다. 다음 과제는 같은 문제를 거의 직선인 경로로 바꿔 적은 step 으로 sampling 하는 [Flow Matching](../flow-matching/README.md) 과,
이 수식으로 action sequence 를 생성하는 [Diffusion Policy](../diffusion-policy/README.md) 다.
