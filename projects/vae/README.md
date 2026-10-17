---
id: vae
title: VAE
branch: generative
requires: [pytorch-mlp]
hours: 12
summary: reparameterization 으로 학습하는 latent 생성 모델
papers:
  - title: "Auto-Encoding Variational Bayes"
    authors: Diederik P. Kingma, Max Welling
    year: 2013
    url: https://arxiv.org/abs/1312.6114
  - title: "Learning Structured Output Representation using Deep Conditional Generative Models"
    authors: Kihyuk Sohn, Honglak Lee, Xinchen Yan
    year: 2015
    url: https://proceedings.neurips.cc/paper/2015/hash/8d55a249e6baa5c06772297520da2051-Abstract.html
  - title: "An Introduction to Variational Autoencoders"
    authors: Diederik P. Kingma, Max Welling
    year: 2019
    url: https://arxiv.org/abs/1906.02691
---

# VAE

## 배경

[PyTorch Training Loop](../pytorch-mlp/README.md) 의 MLP 는 입력 하나에 출력 하나를 내는 deterministic 함수다. 같은 입력에 정답이
여럿이면 MSE regression 은 그 평균을 내는데, 정답들의 평균은 어느 정답과도 닮지 않을 수 있다. 새 샘플을 만들어 내려면 답
하나가 아니라 데이터의 분포 $p(x)$ 를 배워야 한다.

VAE 는 보이지 않는 latent $z \sim \mathcal N(0, I)$ 에서 decoder $p_\theta(x\mid z)$ 가 데이터를 만든다고 가정한다.
$\log p_\theta(x)$ 는 직접 계산할 수 없어서, encoder $q_\phi(z\mid x)$ 가 이미지마다 $z$ 의 Gaussian 분포(평균 $\mu$, 분산
$\sigma^2$)를 내게 하고 $\log p_\theta(x)$ 의 하한(ELBO)을 최대화한다.

$$
\log p_\theta(x) \ \ge\ \mathbb E_{q_\phi(z\mid x)}\big[\log p_\theta(x\mid z)\big] - D_{\mathrm{KL}}\big(q_\phi(z\mid x)\,\Vert\,\mathcal N(0, I)\big)
$$

첫 항은 reconstruction 이고 둘째 항은 latent 가 prior 에서 멀어지지 않게 잡는 regularizer 인데, 두 분포가 모두 Gaussian 이라
KL 은 closed form 으로 계산된다. 그런데 $z$ 를 sampling 하는 단계를 지나면 encoder 까지 gradient 가 흐르지 않아서,
reparameterization trick 으로 무작위성을 바깥의 $\epsilon$ 으로 옮기고 $z$ 를 $\mu$ 와 $\sigma$ 의 미분 가능한 함수로 만든다.

$$
z = \mu + \sigma \odot \epsilon,\quad \epsilon\sim\mathcal N(0, I), \qquad
D_{\mathrm{KL}} = \frac12\sum_{j}\big(\mu_j^2 + \sigma_j^2 - \log\sigma_j^2 - 1\big)
$$

## 목표

- encoder 가 $\mu$ 와 $\log\sigma^2$ 를 내고 decoder 가 pixel 별 Bernoulli logits 를 내는 MLP VAE 를 만든다
- reconstruction(BCE)과 closed form KL 로 negative ELBO loss 를 짠다
- latent 2차원 VAE 로 test set 의 latent 분포를 그리고 latent 격자를 decode 해 본다
- latent 20차원 VAE 로 두 숫자 사이의 latent 보간 이미지를 만든다
- (선택) label 을 조건으로 받는 CVAE 로 원하는 숫자를 생성한다

**직접 짤 것**: encoder·decoder, reparameterization, Gaussian KL, negative ELBO, 보간, CVAE 의 조건 입력.
**가져다 써도 되는 것**: `nn.Linear`, `torch.optim`, `F.binary_cross_entropy_with_logits`, torchvision 의 MNIST loader,
`torch.distributions`(KL 비교용).

## 준비물

- Python 3.12, `torch`, `torchvision`, `matplotlib`
- MNIST
- GPU 불필요. MLP VAE 는 CPU 로도 학습된다

## 진행 순서

1. MNIST 를 $[0, 1]$ 범위의 784차원 vector 로 불러온다
2. `reparameterize` 와 `kl_normal` 을 짜고 `torch.distributions` 와 비교한다
3. encoder, decoder, `neg_elbo` 로 `VAE` 를 조립한다
4. `z_dim=2` 와 `z_dim=20` 두 모델을 학습시키며 test set negative ELBO 를 기록한다
5. `z_dim=2` 모델로 test set 의 $\mu$ 를 label 별 색으로 찍고, $[-3, 3]^2$ 격자를 decode 한 그림을 만든다
6. `z_dim=20` 모델로 test 숫자 두 장의 $\mu$ 사이를 10단계로 보간해 decode 한다
7. (선택) one-hot label 을 encoder·decoder 양쪽 입력에 붙인 CVAE 를 학습시켜 같은 $z$ 에서 label 만 바꿔 본다

## 시작점

```text
vae/
├── vae.py        # reparameterize, kl_normal, VAE, neg_elbo, interpolate
├── train.py
├── plots.py      # latent 분포, 격자 decode, 보간
└── test_vae.py
```

```python
import torch
from torch import nn

def reparameterize(mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
    """z = mu + sigma * eps, eps ~ N(0, I). gradients must reach mu and logvar."""

def kl_normal(mu: torch.Tensor, logvar: torch.Tensor) -> torch.Tensor:
    """KL(N(mu, diag(exp(logvar))) || N(0, I)) per sample, shape (N,)"""

class VAE(nn.Module):
    def __init__(self, x_dim: int = 784, h_dim: int = 400, z_dim: int = 20, cond_dim: int = 0): ...
    def encode(self, x: torch.Tensor, c: torch.Tensor | None = None) -> tuple[torch.Tensor, torch.Tensor]:
        """returns (mu, logvar), each (N, z_dim)"""
    def decode(self, z: torch.Tensor, c: torch.Tensor | None = None) -> torch.Tensor:
        """returns Bernoulli logits (N, x_dim)"""
    def forward(self, x: torch.Tensor, c: torch.Tensor | None = None
                ) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        """returns (recon_logits, mu, logvar)"""

def neg_elbo(x: torch.Tensor, recon_logits: torch.Tensor, mu: torch.Tensor, logvar: torch.Tensor,
             beta: float = 1.0) -> torch.Tensor:
    """sum over pixels and latent dims, mean over the batch"""

@torch.no_grad()
def interpolate(model: VAE, x_a: torch.Tensor, x_b: torch.Tensor, steps: int = 10) -> torch.Tensor: ...
```

## 스스로 확인

- [ ] `kl_normal` 이 `torch.distributions.kl_divergence(Normal(mu, std), Normal(0, 1)).sum(-1)` 과 1e-5 이내로 같다
- [ ] `reparameterize` 로 만든 $z$ 로 loss 를 계산하면 encoder parameter 에 gradient 가 생기고, `Normal(mu, std).sample()` 로 바꾸고 reconstruction loss 만 backward 하면 encoder 의 `.grad` 가 `None` 으로 남는다
- [ ] test set negative ELBO 가 학습 내내 줄고, `z_dim=20` 이 `z_dim=2` 보다 낮다
- [ ] `z_dim=2` 의 latent 그림에서 숫자별 군집이 보이고, 격자 decode 그림에서 이웃한 칸끼리 숫자가 부드럽게 바뀐다
- [ ] 보간 이미지의 중간 단계도 흐릿하나마 숫자 모양을 유지한다
- [ ] (선택) CVAE 에서 $z$ 를 고정하고 label 만 바꾸면 굵기·기울기 같은 필체는 유지된 채 숫자만 바뀐다

## 생각해 볼 질문

1. reparameterization 없이 $z$ 를 sampling 하면 encoder 로 gradient 가 가지 않는 이유는? 그래도 gradient 를 추정하려면 어떤 방법이 있고, 그 방법의 약점은?
2. KL 항의 weight $\beta$ 를 0 으로 두면 latent 공간이 어떻게 되고, 아주 크게 두면 어떻게 되는가?
3. VAE 의 샘플이 실제 MNIST 보다 흐릿하게 나오는 것은 decoder 의 어떤 가정 때문인가?

## 힌트

<details>
<summary>loss 의 크기를 맞추는 법</summary>

reconstruction 항은 pixel 784개를 모두 더하고 KL 은 latent 차원을 모두 더한 뒤, 둘을 합한 값의 batch 평균을 낸다.
reconstruction 을 pixel 평균으로 내면 KL 이 상대적으로 784배 무거워져서 latent 가 prior 로 붕괴하고(posterior collapse), 모든 샘플이 비슷한 흐릿한
숫자가 된다.

</details>

<details>
<summary>보간과 그림에 쓸 z</summary>

학습 때는 sampling 한 $z$ 를 쓰지만, 보간의 양 끝점과 latent 그림에는 encoder 가 낸 $\mu$ 를 쓴다. encoder 가 $\sigma$ 대신
$\log\sigma^2$ 를 내게 하면 양수 제약 없이 학습되고 `exp` 로 언제든 되돌릴 수 있다.

</details>

## 참고 자료

- Kingma & Welling, [An Introduction to Variational Autoencoders](https://arxiv.org/abs/1906.02691) — ELBO 와 reparameterization 을 원 논문보다 천천히 유도한다
- Lilian Weng, [From Autoencoder to Beta-VAE](https://lilianweng.github.io/posts/2018-08-12-vae/)
- MIT 6.S184, [Flow Matching and Diffusion Models](https://diffusion.csail.mit.edu/) — 4강이 VAE 와 latent 공간을 다룬다
- PyTorch examples, [`vae/main.py`](https://github.com/pytorch/examples/blob/main/vae/main.py) — MNIST MLP VAE 한 파일. 막혔을 때만 열기
- LeRobot, [`modeling_act.py`](https://github.com/huggingface/lerobot/blob/main/src/lerobot/policies/act/modeling_act.py) — ACT 가 CVAE latent 를 학습 때는 sampling 하고 추론 때는 0 으로 두는 부분

## 남은 한계

VAE 는 decoder 한 번으로 샘플을 내서 빠르지만, latent 하나에 이미지 전체를 담아야 해서 세밀한 구조를 잃고 샘플이 흐릿하다.
다음 과제는 생성을 수백 번의 작은 denoising 단계로 나눈 [DDPM](../ddpm/README.md), 이 구조를 CVAE 로 바꿔 시연 action chunk 를
latent 로 압축하는 [ACT](../act/README.md), latent 공간 안에서 미래를 예측하는 [World Model](../world-model/README.md) 이다.
