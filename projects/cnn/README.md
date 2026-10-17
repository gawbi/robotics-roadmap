---
id: cnn
title: CNN
branch: vision
requires: [pytorch-mlp]
hours: 16
summary: im2col 로 직접 짜는 convolution 과 LeNet-5
papers:
  - title: "Gradient-Based Learning Applied to Document Recognition"
    authors: Yann LeCun, Léon Bottou, Yoshua Bengio, Patrick Haffner
    year: 1998
    url: http://yann.lecun.com/exdb/publis/pdf/lecun-01a.pdf
  - title: "High Performance Convolutional Neural Networks for Document Processing"
    authors: Kumar Chellapilla et al.
    year: 2006
---

# CNN

## 배경

[PyTorch Training Loop](../pytorch-mlp/README.md) 에서 MNIST 를 푼 MLP 는 28×28 이미지를 784차원 vector 로 펴서 받는다.
펴는 순간 어느 pixel 이 어느 pixel 옆에 있었는지 정보가 사라지고, 숫자가 두세 pixel 만 옆으로 밀려도 입력 vector 가 크게 달라진다.
입력이 224×224 컬러 이미지라면 첫 층의 hidden unit 하나마다 weight 가 15만 개씩 필요해서 parameter 수도 감당하기 어렵다.

convolution 은 작은 kernel 하나를 이미지 위에서 옮겨 가며 같은 weight 를 재사용한다(weight sharing). 각 출력은 주변
$k\times k$ 영역만 보고(local receptive field), 입력을 옮기면 출력도 같은 만큼 옮겨 간다(translation equivariance).

$$
y[o, i, j] = b[o] + \sum_{c}\sum_{u=0}^{k-1}\sum_{v=0}^{k-1} W[o, c, u, v]\; x[c,\; s i + u,\; s j + v],
\qquad H_{\text{out}} = \left\lfloor \frac{H + 2p - k}{s} \right\rfloor + 1
$$

이 식을 for 문으로 그대로 짜면 너무 느리기 때문에 im2col 을 쓴다. 각 출력 위치가 보는 $C k^2$ 개 입력을 한 열로 펼쳐
$(C k^2) \times (H_{\text{out}} W_{\text{out}})$ 행렬을 만들고, kernel 도 $C_{\text{out}} \times (C k^2)$ 행렬로 바꿔 convolution
전체를 행렬곱 한 번으로 계산하는 방법이다. 2006년 Chellapilla 등이 CNN 을 BLAS 와 GPU 로 빠르게 계산하려고 쓴 방법이고, Caffe 같은
framework 도 오랫동안 이 방식을 썼다. 1998년 LeCun 등은 convolution 과 pooling 을 번갈아 쌓은 LeNet-5 로 손글씨 숫자 인식을
풀었는데, 이번 과제에서는 직접 짠 im2col convolution 으로 그 구조를 다시 만든다.

## 목표

- im2col 로 `conv2d` 를 짜고 `F.conv2d` 와 같은 결과를 내는지 확인한다
- 같은 patch 펼치기로 max pooling 을 짠다
- 내 `Conv2d` layer 로 LeNet-5 를 조립해 MNIST 를 학습시킨다
- 앞 과제의 MLP 와 parameter 수·test 정확도를 나란히 비교한다
- 첫 conv 층의 filter 와 feature map 을 그림으로 본다

**직접 짤 것**: im2col, convolution, max pooling, LeNet-5 조립.
**가져다 써도 되는 것**: `F.pad`, `nn.Linear`·`torch.optim`·`F.cross_entropy`(앞 과제에서 직접 짜 봤으니), torchvision 의 MNIST
loader. `F.conv2d`·`F.unfold` 는 정답 비교에만 쓴다.

## 준비물

- Python 3.12, `torch`, `torchvision`, `matplotlib`, `pytest`
- MNIST(torchvision 이 자동으로 내려받는다)
- GPU 불필요. LeNet-5 는 CPU 로도 학습된다

## 진행 순서

1. 정의를 for 문으로 그대로 옮긴 `conv2d_naive` 를 작은 입력으로 결과를 확인할 기준 구현으로 짠다
2. 입력 `(N, C, H, W)` 를 `(N, C·k², H_out·W_out)` 로 펼치는 `im2col` 을 짠다
3. kernel 을 행렬로 바꿔 곱하는 `conv2d` 를 짜고 stride·padding 조합마다 `F.conv2d` 와 비교한다
4. `im2col` 을 재사용해 `max_pool2d` 를 짠다
5. `Conv2d` module 로 LeNet-5 를 조립하고 parameter 수를 센다
6. MNIST 에서 10 epoch 안팎 학습해 test 정확도를 앞 과제의 MLP 와 비교한다
7. 첫 conv 층의 filter 6개와 숫자 한 장의 feature map 을 그린다

## 시작점

```text
cnn/
├── conv.py        # conv2d_naive, im2col, conv2d, max_pool2d
├── lenet.py       # Conv2d, LeNet5
├── train.py       # MNIST 학습·평가
└── test_conv.py   # F.conv2d 와 비교
```

```python
import torch
from torch import nn

def conv_out_size(size: int, kernel: int, stride: int = 1, padding: int = 0) -> int: ...

def conv2d_naive(x: torch.Tensor, weight: torch.Tensor, bias: torch.Tensor | None = None,
                 stride: int = 1, padding: int = 0) -> torch.Tensor:
    """reference only: nested loops over the definition. use tiny inputs."""

def im2col(x: torch.Tensor, kernel: int, stride: int = 1, padding: int = 0) -> torch.Tensor:
    """(N, C, H, W) -> (N, C*kernel*kernel, H_out*W_out).
    row order must match weight.reshape(C_out, C*kernel*kernel)."""

def conv2d(x: torch.Tensor, weight: torch.Tensor, bias: torch.Tensor | None = None,
           stride: int = 1, padding: int = 0) -> torch.Tensor:
    """weight: (C_out, C_in, k, k) -> (N, C_out, H_out, W_out). same semantics as F.conv2d."""

def max_pool2d(x: torch.Tensor, kernel: int = 2, stride: int = 2) -> torch.Tensor: ...

class Conv2d(nn.Module):
    def __init__(self, in_ch: int, out_ch: int, kernel: int, stride: int = 1, padding: int = 0): ...
    def forward(self, x: torch.Tensor) -> torch.Tensor: ...

class LeNet5(nn.Module):
    """conv 6@5x5 (pad 2) -> pool -> conv 16@5x5 -> pool -> fc 120 -> fc 84 -> fc 10"""
    def __init__(self, num_classes: int = 10): ...
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """(N, 1, 28, 28) -> logits (N, num_classes)"""
```

## 스스로 확인

- [ ] kernel 1·3·5, stride 1·2, padding 0·1·2 의 모든 조합에서 내 `conv2d` 와 `F.conv2d` 의 출력 차이가 1e-5 미만이다
- [ ] float64 작은 입력에서 내 `conv2d` 가 `torch.autograd.gradcheck` 를 통과한다
- [ ] LeNet-5 의 parameter 수가 61,706 개이고, MNIST test 정확도가 98.5% 이상이다
- [ ] 같은 epoch 수에서 LeNet-5 가 앞 과제의 MLP 보다 parameter 는 적고 test 정확도는 같거나 높다
- [ ] (선택) test 이미지를 2 pixel 옮겼을 때 MLP 와 LeNet-5 의 정확도 하락 폭을 비교한다
- [ ] (선택) 같은 입력에서 `conv2d_naive`·`conv2d`·`F.conv2d` 의 실행 시간을 잰다

## 생각해 볼 질문

1. LeNet-5 는 MLP 보다 parameter 가 훨씬 적은데도 MNIST 를 더 잘 푼다. weight sharing 과 locality 는 각각 이미지의 어떤 성질을 가정하는가?
2. im2col 은 같은 입력 pixel 을 여러 열에 복사한다. 3×3 kernel, stride 1 이면 메모리가 대략 몇 배가 되고, 그 대가로 무엇을 얻는가?
3. convolution 은 translation equivariant 인데, LeNet-5 전체는 왜 완전히 translation invariant 하지 않은가?

## 힌트

<details>
<summary>for 문 없는 im2col</summary>

`Tensor.unfold(dim, size, step)` 을 H 축과 W 축에 한 번씩 쓰면 복사 없이 모든 patch 를 담은 view 가 나오고, 그 축 순서를
weight 의 `(C, k, k)` 순서에 맞춰 바꾼 뒤 reshape 하면 된다. 이름이 비슷한 `F.unfold` 와는 다른 함수다.

</details>

<details>
<summary>원 논문의 LeNet-5 와 다른 점</summary>

원 논문은 tanh 계열 activation, 학습되는 계수가 붙은 subsampling, C3 층에서 일부 channel 끼리만 잇는 연결 표, RBF 출력층을
쓴다. ReLU·max pooling·전체 연결·linear 출력층으로 바꿔도 MNIST 정확도는 비슷하게 나오고, 61,706 이라는 parameter 수도 이
전체 연결 구성을 기준으로 센 값이다.

</details>

## 참고 자료

- Stanford CS231n, [Convolutional Neural Networks 강의 노트](https://cs231n.github.io/convolutional-networks/) — 출력 크기 계산과 im2col 로 convolution 을 행렬곱으로 바꾸는 설명
- Dumoulin & Visin, [A guide to convolution arithmetic for deep learning](https://arxiv.org/abs/1603.07285) — padding·stride 조합별 그림
- Dive into Deep Learning, [LeNet](https://d2l.ai/chapter_convolutional-neural-networks/lenet.html)
- PyTorch, [`F.unfold`](https://docs.pytorch.org/docs/stable/generated/torch.nn.functional.unfold.html) — PyTorch 가 제공하는 im2col. 내 구현과 결과를 비교할 때만 쓴다

## 남은 한계

LeNet-5 는 conv 층이 둘뿐이라 MNIST 같은 작은 흑백 이미지 정도만 다룰 수 있고, 그렇다고 층을 수십 개로 쌓으면 오히려 학습이 잘
되지 않는다. 다음 과제는 그 문제를 푼 [ResNet](../resnet/README.md), convolution 대신 patch 를 token 으로 다루는 [ViT](../vit/README.md), noise 에서
이미지를 생성하는 [DDPM](../ddpm/README.md) 이다.
