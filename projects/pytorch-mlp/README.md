---
id: pytorch-mlp
title: PyTorch Training Loop
branch: core
requires: [autograd]
hours: 10
summary: 직접 짠 cross-entropy·Adam 으로 MNIST 학습
papers:
  - title: "A Stochastic Approximation Method"
    authors: Herbert Robbins, Sutton Monro
    year: 1951
    url: https://doi.org/10.1214/aoms/1177729586
  - title: "Adam: A Method for Stochastic Optimization"
    authors: Diederik P. Kingma, Jimmy Ba
    year: 2014
    url: https://arxiv.org/abs/1412.6980
  - title: "Delving Deep into Rectifiers: Surpassing Human-Level Performance on ImageNet Classification"
    authors: Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun
    year: 2015
    url: https://arxiv.org/abs/1502.01852
---

# PyTorch Training Loop

## 배경

Backpropagation 과제의 `Value` 는 숫자 하나마다 Python 객체를 만들어서, 784×256 weight 행렬 하나만 거쳐도 샘플 하나에
곱셈 20만 번이 각각 graph node 가 된다. PyTorch 는 같은 reverse-mode autodiff 를 tensor 단위로 한다. 행렬 곱 하나가
graph 의 node 하나가 되고 실제 계산은 C++·CUDA kernel 이 맡기 때문에, `loss.backward()` 한 줄이 이전 과제의 `backward()`
와 같은 일을 훨씬 빠르게 한다.

autodiff 는 PyTorch 에 맡기고 그 바깥의 loss 와 optimizer 를 직접 짠다. 숫자 10개 중 하나를 고르는 MNIST 분류는 logits
$z$ 에 softmax 를 씌운 뒤 정답 class 의 log 확률의 부호를 바꿔 loss 로 쓰는데, 이 cross-entropy 를 logits 로 미분하면
softmax 확률에서 one-hot 정답을 뺀 값이 된다.

$$
L = -\log \frac{e^{z_y}}{\sum_j e^{z_j}} = -z_y + \log \sum_j e^{z_j}, \qquad
\frac{\partial L}{\partial z} = \mathrm{softmax}(z) - \mathrm{onehot}(y)
$$

optimizer 는 1951년 Robbins·Monro 의 stochastic approximation 에서 시작하는 SGD 가 기본이다. 2014년의 Adam 은 gradient 의
moving average $m$ 과 gradient 제곱의 moving average $v$ 를 따로 두고, parameter 마다 step 크기를 $\sqrt{\hat v}$ 로 나눠 맞춘다.

$$
m_t = \beta_1 m_{t-1} + (1-\beta_1)\, g_t, \qquad v_t = \beta_2 v_{t-1} + (1-\beta_2)\, g_t^2, \qquad
\theta_t = \theta_{t-1} - \eta\,\frac{m_t / (1-\beta_1^t)}{\sqrt{v_t / (1-\beta_2^t)} + \epsilon}
$$

## 목표

- `nn.Linear` 없이 `nn.Parameter` 로 Linear layer 를 만들고 초기화한다
- overflow 하지 않는 softmax cross-entropy 를 짜서 `F.cross_entropy` 와 비교한다
- momentum SGD 와 Adam 을 짜서 `torch.optim` 결과와 parameter 값을 비교한다
- 784 → 256 → 10 MLP 를 MNIST 에 학습시키고 test 정확도를 잰다

**직접 짤 것**: Linear(초기화 포함), ReLU, cross-entropy, SGD·Adam, 학습·평가 loop.
**가져다 써도 되는 것**: torch tensor 연산과 `loss.backward()`, `torchvision.datasets.MNIST`, `DataLoader`, 비교용
`F.cross_entropy`·`torch.optim`.

## 준비물

- Python 3.12, torch, torchvision, matplotlib, pytest
- MNIST — `torchvision.datasets.MNIST(download=True)` 가 28×28 흑백 숫자 이미지 train 60,000장·test 10,000장을 받아 온다
- GPU 불필요 — 이 크기의 MLP 는 CPU 에서도 epoch 하나가 수십 초 안에 끝난다

## 진행 순서

1. MNIST 를 받아 이미지 몇 장과 label 을 matplotlib 로 찍어 본다
2. `Linear` 를 `nn.Module` 로 짜고 weight 를 Kaiming 방식 $\mathcal N(0,\, 2/n_{\text{in}})$ 으로 초기화한다
3. log-sum-exp 로 `cross_entropy(logits, y)` 를 짜고 `F.cross_entropy` 와 값·gradient 를 비교한다
4. momentum SGD 를 짜서 `torch.optim.SGD(momentum=0.9)` 와 같은 초기값·같은 batch 로 100 step 돌려 비교한다
5. Adam 을 짜서 `torch.optim.Adam` 과 같은 방식으로 비교한다
6. 이미지를 784 차원 벡터로 펴서 넣는 train loop 와 test 정확도를 재는 eval 함수를 짠다
7. 784 → 256 → 10 MLP 를 내 SGD 와 내 Adam 으로 각각 5 epoch 학습시킨다
8. 두 optimizer 의 train loss curve 를 한 그림에 겹쳐 그린다

## 시작점

```text
pytorch-mlp/
├── layers.py               # Linear, relu, cross_entropy
├── optim.py                # SGD, Adam
├── train.py
└── test_against_torch.py
```

```python
from collections.abc import Iterable
import torch
from torch import nn, Tensor

class Linear(nn.Module):
    def __init__(self, n_in: int, n_out: int):
        """weight (n_out, n_in) like nn.Linear, Kaiming normal init, zero bias."""
        ...
    def forward(self, x: Tensor) -> Tensor: ...

def cross_entropy(logits: Tensor, y: Tensor) -> Tensor:
    """logits (B, C), y (B,) int64 -> mean loss. must stay finite for logits around 1e3."""
    ...

class SGD:
    def __init__(self, params: Iterable[nn.Parameter], lr: float, momentum: float = 0.0): ...
    def zero_grad(self) -> None: ...
    @torch.no_grad()
    def step(self) -> None: ...

class Adam:
    def __init__(self, params: Iterable[nn.Parameter], lr: float = 1e-3,
                 betas: tuple[float, float] = (0.9, 0.999), eps: float = 1e-8): ...
    def zero_grad(self) -> None: ...
    @torch.no_grad()
    def step(self) -> None: ...
```

## 평가 기준

- [ ] 내 `cross_entropy` 가 `F.cross_entropy` 와 값·logits gradient 모두 1e-6 이내로 같고, logits 에 1000 을 더해도 `nan` 이 나오지 않는다
- [ ] 같은 초기값·같은 batch 로 100 step 돌린 뒤 내 SGD(momentum)·Adam 의 parameter 가 `torch.optim` 결과와 float32 에서 1e-6 이내로 같다
- [ ] 내 Adam 으로 5 epoch 학습한 MLP 의 MNIST test 정확도가 97% 이상이다
- [ ] (선택) Linear 의 backward 를 `torch.autograd.Function` 으로 직접 짜고 `torch.autograd.gradcheck` 를 통과시킨다
- [ ] (선택) decoupled weight decay 를 넣은 AdamW 를 짜서 `torch.optim.AdamW` 와 비교한다

## 생각해 볼 질문

1. weight 를 $\mathcal N(0, 1)$ 로 초기화하면 784 개 입력을 더한 첫 층 출력의 크기가 어떻게 되고, 그것이 학습에 어떤 문제를 일으키는가?
2. Adam 에서 bias correction $1/(1-\beta^t)$ 을 빼면 학습 초기 몇 step 의 update 크기가 어떻게 되는가?
3. softmax 를 먼저 구한 뒤 log 를 씌우는 방식이 log-sum-exp 방식보다 위험한 이유는?

## 힌트

<details>
<summary>log-sum-exp 가 overflow 하지 않게</summary>

$\log \sum_j e^{z_j} = c + \log \sum_j e^{z_j - c}$ 는 어떤 $c$ 에서도 성립한다. $c$ 를 row 별 최댓값으로 고르면 지수에
들어가는 값이 모두 0 이하가 된다.

</details>

<details>
<summary>torch.optim 과 값이 조금씩 어긋날 때</summary>

PyTorch 의 momentum SGD 는 learning rate 를 buffer 밖에서 곱한다($b \leftarrow \mu b + g,\ \theta \leftarrow \theta - \eta b$).
교과서에 흔한 $v \leftarrow \mu v - \eta g$ 꼴과는 lr 이 고정이면 같지만, 학습 중에 lr 을 바꾸면 결과가 달라진다. Adam 은 $\epsilon$ 을 bias
correction 한 $\sqrt{\hat v}$ 에 더하는지, correction 전의 $\sqrt{v}$ 에 더하는지에 따라 값이 달라진다.

</details>

## 참고 자료

- PyTorch 문서, [torch.optim.Adam](https://docs.pytorch.org/docs/stable/generated/torch.optim.Adam.html) — 문서의 algorithm 박스가 비교 기준이다
- Stanford CS231n, [Neural Networks Part 3: Learning and Evaluation](https://cs231n.github.io/neural-networks-3/) — SGD·momentum·Adam
- Andrej Karpathy, [Building makemore Part 3: Activations & Gradients, BatchNorm](https://www.youtube.com/watch?v=P6sfmUTpUmc) — 초기화와 activation 분포
- Andrej Karpathy, [A Recipe for Training Neural Networks](https://karpathy.github.io/2019/04/25/recipe/)
- PyTorch 소스, [torch/optim/adam.py](https://github.com/pytorch/pytorch/blob/main/torch/optim/adam.py) — 막혔을 때만 열기

## 남은 한계

이미지를 784 차원 벡터로 펴서 넣기 때문에 pixel 사이의 위치 관계를 쓰지 못하고, 입력 길이가 정해져 있어 sequence 를
다룰 수 없다. [CNN](../cnn/README.md)·[Transformer](../transformer/README.md)·[VAE](../vae/README.md)·
[Behavior Cloning](../behavior-cloning/README.md)·[Policy Gradient](../policy-gradient/README.md)·[DQN → SAC](../off-policy/README.md)
는 모두 이 training loop 를 바탕으로 한다.
