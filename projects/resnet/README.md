---
id: resnet
title: ResNet
branch: vision
requires: [cnn]
hours: 16
summary: ResNet-18 의 residual block 과 weight 이식
papers:
  - title: "Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift"
    authors: Sergey Ioffe, Christian Szegedy
    year: 2015
    url: https://arxiv.org/abs/1502.03167
  - title: "Deep Residual Learning for Image Recognition"
    authors: Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun
    year: 2015
    url: https://arxiv.org/abs/1512.03385
---

# ResNet

## 배경

[CNN](../cnn/README.md) 의 LeNet-5 는 conv 층이 둘뿐이다. 층을 더 쌓으면 표현력이 커지니 정확도도 오를 것 같지만, He 등은
BatchNorm 을 넣은 plain network 에서도 CIFAR-10 의 **training** error 가 20층보다 56층에서 더 높다는 것을 보였다. test 가
아니라 training error 가 높으니 overfitting 이 아니고, 깊은 망의 좋은 해를 optimizer 가 찾아가지 못하는 문제(degradation)다.

residual learning 에서는 block 이 출력 전체를 배우지 않고 입력과의 차이 $\mathcal F(x)$ 만 배운다.

$$
y = \mathcal F(x, \{W_i\}) + x
$$

block 이 아무 일도 하지 않는 편이 낫다면 $\mathcal F$ 를 0 으로 만들기만 하면 되고, shortcut 을 따라 gradient 도 층을 건너
앞쪽까지 그대로 전달된다. channel 수나 해상도가 바뀌는 곳에서는 $x$ 대신 1×1 conv 로 모양을 맞춘 $W_s x$ 를 더한다. 각 conv
뒤에는 batch 통계로 정규화하는 BatchNorm 이 붙는다.

$$
\hat x = \frac{x - \mu_{\mathcal B}}{\sqrt{\sigma_{\mathcal B}^2 + \epsilon}}, \qquad y = \gamma \hat x + \beta
$$

BatchNorm 은 학습 때 mini-batch 의 평균·분산을 쓰면서 running average 를 따로 쌓아 두고, 평가 때는 그 running 통계를 쓴다.
ResNet-18 은 7×7 stem conv 뒤에 BasicBlock 두 개씩으로 된 stage 네 개(64·128·256·512 channel)를 쌓은 약 1,170만
parameter 짜리 망인데, 뒤에 나오는 [ACT](../act/README.md) 와 Diffusion Policy 도 이 망을 image backbone 으로 그대로 쓴다.

## 목표

- `BatchNorm2d`, conv 두 개와 shortcut 으로 된 `BasicBlock`, ResNet-18 을 직접 조립한다
- torchvision 의 ImageNet pretrained weight(`ResNet18_Weights.IMAGENET1K_V1`)를 내 모델에 옮겨 넣고 logits 를 비교한다
- 논문 4.2절의 CIFAR-10 용 망을 깊이 20·56 으로 만들어 plain 과 residual 의 training loss 를 비교한다
- policy 가 쓸 수 있도록 마지막 stage 의 feature map 을 꺼내는 함수를 둔다

**직접 짤 것**: BatchNorm(train·eval 동작과 running 통계), BasicBlock, downsampling shortcut, ResNet-18 조립, weight 이식.
**가져다 써도 되는 것**: `nn.Conv2d`(앞 과제의 im2col conv 도 되지만 느리다), `nn.Linear`, 이미지 전처리
(`ResNet18_Weights.IMAGENET1K_V1.transforms()`), torchvision 의 `resnet18`(비교용).

## 준비물

- Python 3.12, `torch`, `torchvision`, `matplotlib`, `pillow`
- [Imagenette](https://github.com/fastai/imagenette)(ImageNet 의 10개 class 부분집합, 320 px 판이면 충분)의 val 이미지, CIFAR-10(torchvision 이 내려받는다)
- weight 이식과 비교는 CPU 로 충분하고, CIFAR-10 학습은 8 GB GPU 나 Colab T4 면 된다

## 진행 순서

1. train·eval 양쪽에서 `nn.BatchNorm2d` 와 같은 값을 내는 `BatchNorm2d` 를 짠다
2. stride 나 channel 이 바뀔 때 1×1 conv shortcut 을 쓰는 `BasicBlock` 을 짠다
3. stem, stage 네 개, global average pooling, fc 로 `resnet18` 을 조립한다
4. torchvision `state_dict` 의 key 를 내 모델의 key 로 옮기는 대응표를 만든다
5. 같은 이미지에서 내 모델과 torchvision 모델의 eval logits 를 비교한다
6. 논문 4.2절의 CIFAR-10 용 망(깊이 $6n+2$)을 `residual` flag 하나로 plain·residual 두 가지로 만든다
7. 20층·56층 각각의 plain·residual 망을 같은 epoch 수만큼 학습해 training loss curve 네 개를 한 그림에 그린다

## 시작점

```text
resnet/
├── layers.py        # BatchNorm2d
├── resnet.py        # BasicBlock, ResNet, resnet18, cifar_net
├── load_weights.py  # torchvision state_dict → 내 모델
├── train_cifar.py   # plain vs residual
└── test_resnet.py
```

```python
import torch
from torch import nn

class BatchNorm2d(nn.Module):
    def __init__(self, num_features: int, eps: float = 1e-5, momentum: float = 0.1): ...
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """train: normalize with batch stats and update running_mean / running_var. eval: use running stats."""

class BasicBlock(nn.Module):
    def __init__(self, in_ch: int, out_ch: int, stride: int = 1, residual: bool = True): ...
    def forward(self, x: torch.Tensor) -> torch.Tensor: ...

class ResNet(nn.Module):
    def __init__(self, blocks_per_stage: list[int], num_classes: int = 1000): ...
    def forward_features(self, x: torch.Tensor) -> torch.Tensor:
        """(N, 3, 224, 224) -> last stage feature map (N, 512, 7, 7)"""
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """(N, 3, 224, 224) -> logits (N, num_classes)"""

def resnet18(num_classes: int = 1000) -> ResNet: ...

def cifar_net(depth: int, residual: bool = True) -> nn.Module:
    """paper Sec. 4.2: depth = 6n + 2, three stages of 16 / 32 / 64 channels."""

def load_torchvision_weights(model: ResNet, state_dict: dict[str, torch.Tensor]) -> None:
    """copy every tensor. raise if a key is left over or a shape differs."""
```

## 평가 기준

- [ ] 내 `BatchNorm2d` 가 train mode 에서 출력·`running_mean`·`running_var` 모두 `nn.BatchNorm2d` 와 1e-5 이내로 같다
- [ ] 내 ResNet-18 의 parameter 수가 torchvision 과 같은 11,689,512 개다
- [ ] weight 를 옮겨 넣은 뒤 eval logits 가 torchvision `resnet18` 과 최대 1e-4 이내로 같다(CPU, float32)
- [ ] Imagenette val 이미지 전체에서 1000-class top-1 예측이 torchvision 과 100% 같다
- [ ] CIFAR-10 training loss curve 에서 plain 은 56층의 training loss 가 20층보다 높게 남고, residual 은 학습이 진행될수록 56층이 20층을 따라잡거나 앞선다
- [ ] (선택) weight 를 옮겨 넣은 ResNet-18 을 Imagenette 10 class 로 fine-tune 해서 처음부터 학습한 경우와 정확도를 비교한다

## 생각해 볼 질문

1. 56층 plain 망은 이론상 20층 망에 identity layer 36개를 붙인 것을 표현할 수 있다. 그런데도 training error 가 더 높게 나오는 것을 overfitting 으로 설명할 수 없는 이유는?
2. BatchNorm 은 train 과 eval 에서 다르게 동작한다. batch 크기가 2~8 처럼 작으면 어떤 문제가 생기는가?
3. ACT 는 backbone 의 BatchNorm 을 학습 중에도 통계가 바뀌지 않는 FrozenBatchNorm 으로 바꾸고, Diffusion Policy 원 논문은 GroupNorm 으로 바꾼다. 두 선택이 피하려는 문제는 무엇인가?

## 힌트

<details>
<summary>state_dict 를 옮길 때 자주 막히는 곳</summary>

torchvision 의 BatchNorm 에는 weight·bias 말고도 `running_mean`·`running_var`·`num_batches_tracked` buffer 가 있다. 내
`BatchNorm2d` 가 running 통계를 `register_buffer` 로 두지 않았다면 `state_dict` 에 나타나지 않아 대응표에서 빠진다. key 이름을
하나씩 맞추는 것보다 모든 tensor 가 정확히 한 번씩 쓰였는지 세는 편이 실수를 빨리 잡는다.

</details>

<details>
<summary>running_var 만 조금 다를 때</summary>

PyTorch 는 정규화에는 $N$ 으로 나눈 분산을 쓰지만, `running_var` 를 갱신할 때는 $N-1$ 로 나눈 unbiased 분산을 쓴다.

</details>

<details>
<summary>logits 가 1e-3 정도 어긋날 때</summary>

GPU 에서는 cuDNN convolution 이 기본으로 TF32 를 쓸 수 있어서 float32 끼리도 1e-3 단위 차이가 난다. 비교는 CPU 에서 하거나
GPU 에서 TF32 를 끄고 한다(`torch.backends.cudnn.conv.fp32_precision = "ieee"`, 예전 버전은
`torch.backends.cudnn.allow_tf32 = False`). 그래도 어긋나면 두 모델 모두 `eval()` 을 불렀는지 본다.

</details>

## 참고 자료

- Dive into Deep Learning, [Residual Networks (ResNet)](https://d2l.ai/chapter_convolutional-modern/resnet.html)
- torchvision, [`resnet18` weight 문서](https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.resnet18.html) — weight 별 전처리와 ImageNet 정확도
- torchvision, [`resnet.py`](https://github.com/pytorch/vision/blob/main/torchvision/models/resnet.py) — 대응표를 만들 때 key 구조를 확인하는 용도. 구현은 막혔을 때만 열기
- LeRobot, [`modeling_diffusion.py`](https://github.com/huggingface/lerobot/blob/main/src/lerobot/policies/diffusion/modeling_diffusion.py) — torchvision ResNet-18 의 pooling 과 normalization 을 바꿔 policy 의 image encoder 로 쓰는 예

## 남은 한계

ResNet-18 은 이미지 한 장을 정해진 1000개 class 중 하나로 분류할 뿐이라, 로봇 action 을 내려면 이 feature 위에 policy 가 따로
있어야 한다. CNN feature map 을 token 으로 바꿔 transformer 로 action 을 내는 [RT-1](../rt1/README.md) 과
[ACT](../act/README.md) 가 이 과제의 ResNet-18 을 그 CNN 자리에 쓴다.
