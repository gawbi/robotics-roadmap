---
id: vit
title: ViT
branch: vision
requires: [cnn, transformer]
hours: 14
summary: 이미지를 patch token 으로 읽는 Transformer
papers:
  - title: "An Image is Worth 16x16 Words: Transformers for Image Recognition at Scale"
    authors: Alexey Dosovitskiy et al.
    year: 2020
    url: https://arxiv.org/abs/2010.11929
---

# ViT

## 배경

[CNN](../cnn/README.md) 은 가까운 pixel 끼리 관련이 깊고 같은 패턴은 어디에 나와도 같다는 가정을 convolution 구조 자체에
담고 있다. 데이터가 적을 때는 이 inductive bias 가 큰 도움이 되지만, 멀리 떨어진 영역 사이의 관계는 층을 여러 번 거친 뒤에야 볼 수
있다. [Transformer](../transformer/README.md) 의 attention 은 sequence 안의 모든 token 쌍을 한 층에서 바로 비교하는데, 2020년
Dosovitskiy 등은 이미지를 단어처럼 token 으로 잘라 이 구조에 거의 그대로 넣었다.

ViT 는 $H\times W$ 이미지를 $P\times P$ patch $N = HW/P^2$ 개로 자르고, 각 patch 를 펴서 같은 linear projection $E$ 로 $D$차원
token 을 만든다. 맨 앞에 학습되는 [CLS] token 을 붙이고 위치 정보를 담은 position embedding $E_{\text{pos}}$ 를 더한 뒤,
pre-norm Transformer encoder 를 $L$ 번 통과시킨다.

$$
z_0 = [\,x_{\text{cls}};\ x_p^1 E;\ \dots;\ x_p^N E\,] + E_{\text{pos}}
$$

$$
z'_\ell = \mathrm{MSA}(\mathrm{LN}(z_{\ell-1})) + z_{\ell-1}, \qquad
z_\ell = \mathrm{MLP}(\mathrm{LN}(z'_\ell)) + z'_\ell, \qquad
y = \mathrm{LN}(z_L^0)
$$

분류는 마지막 층 [CLS] 위치의 출력 $y$ 에 linear head 를 붙여서 한다. ViT-B/16 은 224×224 입력에서 token 197개(patch 196 +
CLS), 폭 768, 12층, head 12개로 이루어진다. 논문에 따르면 ImageNet-21k 나 JFT-300M 같은 큰 데이터로 pre-train 해야 비슷한 크기의
ResNet 을 앞선다.

## 목표

- 이미지를 patch token 으로 바꾸는 patch embedding 을 reshape 방식과 conv 방식으로 짜서 같은 결과가 나오는지 확인한다
- [Transformer](../transformer/README.md) 과제의 multi-head attention 으로 pre-norm encoder block 을 만든다
- torchvision `vit_b_16` 의 `IMAGENET1K_V1` weight 를 옮겨 넣고 logits 를 비교한다
- 작은 ViT 를 CIFAR-10 에서 처음부터 학습해 [ResNet](../resnet/README.md) 과제의 CIFAR 망과 정확도를 비교한다
- (선택) [CLS] token 의 attention map 을 이미지 위에 겹쳐 그린다

**직접 짤 것**: patchify, patch embedding, [CLS] token, position embedding, encoder block(attention 은 앞 과제 것을 재사용),
weight 이식.
**가져다 써도 되는 것**: `nn.Linear`, `nn.LayerNorm`, `nn.GELU`, `nn.Conv2d`(patch embedding 비교용), 이미지 전처리
(`ViT_B_16_Weights.IMAGENET1K_V1.transforms()`), torchvision `vit_b_16`(비교용).

## 준비물

- Python 3.12, `torch`, `torchvision`, `matplotlib`
- [Imagenette](https://github.com/fastai/imagenette) val 이미지, CIFAR-10
- weight 이식과 비교는 CPU 로 충분하고(ViT-B/16 은 parameter 약 8,660만 개), CIFAR-10 학습은 8 GB GPU 나 Colab T4 면 된다

## 진행 순서

1. `(N, C, H, W)` 를 `(N, num_patches, C·P²)` 로 바꾸는 `patchify` 를 짠다
2. `patchify` + `nn.Linear` 와 `kernel_size = stride = P` 인 `nn.Conv2d` 에 같은 weight 를 넣어 출력을 비교한다
3. [CLS] token, position embedding, pre-norm encoder block 으로 `ViT` 를 조립한다
4. torchvision `vit_b_16` 의 `state_dict` 를 내 모델로 옮기는 대응표를 만든다
5. 같은 이미지에서 내 모델과 torchvision 모델의 eval logits 를 비교한다
6. patch 4, 폭 192, 6층 정도의 작은 ViT 를 CIFAR-10 에서 처음부터 학습한다
7. 같은 epoch 수로 학습한 ResNet 과제의 CIFAR 망과 test 정확도를 표로 비교한다

## 시작점

```text
vit/
├── vit.py            # patchify, PatchEmbed, EncoderBlock, ViT
├── load_weights.py   # torchvision vit_b_16 → 내 ViT
├── train_cifar.py    # 작은 ViT 를 처음부터
└── test_vit.py
```

```python
import torch
from torch import nn

def patchify(x: torch.Tensor, patch: int) -> torch.Tensor:
    """(N, C, H, W) -> (N, (H // patch) * (W // patch), C * patch * patch)"""

class PatchEmbed(nn.Module):
    def __init__(self, img_size: int, patch: int, in_ch: int, dim: int): ...
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """(N, C, H, W) -> (N, num_patches, dim)"""

class EncoderBlock(nn.Module):
    """pre-norm: x = x + MSA(LN(x)), then x = x + MLP(LN(x))"""
    def __init__(self, dim: int, heads: int, mlp_dim: int, eps: float = 1e-6): ...
    def forward(self, x: torch.Tensor) -> torch.Tensor: ...

class ViT(nn.Module):
    def __init__(self, img_size: int = 224, patch: int = 16, dim: int = 768, depth: int = 12,
                 heads: int = 12, mlp_dim: int = 3072, num_classes: int = 1000): ...
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """(N, 3, img_size, img_size) -> logits (N, num_classes)"""

def load_torchvision_vit(model: ViT, state_dict: dict[str, torch.Tensor]) -> None:
    """raise if a key is left over or a shape differs."""
```

## 평가 기준

- [ ] 같은 weight 를 넣은 `patchify` + `nn.Linear` 와 `nn.Conv2d` patch embedding 의 출력 차이가 1e-5 미만이다
- [ ] 내 ViT-B/16 의 parameter 수가 torchvision 과 같은 86,567,656 개다
- [ ] weight 를 옮겨 넣은 뒤 eval logits 가 torchvision `vit_b_16` 과 최대 1e-3 이내로 같다(CPU, float32)
- [ ] Imagenette val 이미지 전체에서 1000-class top-1 예측이 torchvision 과 100% 같다
- [ ] CIFAR-10 에서 처음부터 학습한 작은 ViT 와 ResNet 과제 CIFAR 망의 test 정확도를 같은 epoch 기준으로 기록했다
- [ ] (선택) position embedding 을 0 으로 두고 patch 순서를 섞어도 [CLS] 출력이 바뀌지 않는지 확인한다

## 생각해 볼 질문

1. position embedding 이 없으면 ViT 는 patch 순서를 구별할 수 있는가? CNN 은 위치 정보를 어디서 얻는가?
2. 같은 CIFAR-10 으로 처음부터 학습하면 작은 ViT 의 정확도가 대체로 ResNet 보다 낮게 나온다. 그런데 데이터가 수억 장으로 늘면 순서가 뒤집히는 이유는?
3. 입력 해상도를 224 에서 384 로 올리면 token 수와 attention 계산량은 어떻게 변하고, 학습된 position embedding 은 어떻게 처리해야 하는가?

## 힌트

<details>
<summary>attention weight 를 옮길 때</summary>

torchvision encoder 는 `nn.MultiheadAttention` 을 쓰는데, Q·K·V projection 이 `in_proj_weight` 하나에 세로로 이어 붙어 있다.
내 attention 이 Q·K·V projection 을 따로 두었다면 이 tensor 를 세 조각으로 나눠야 하고, 순서는 이름 그대로 Q, K, V 다.

</details>

<details>
<summary>logits 가 조금씩 어긋날 때</summary>

torchvision ViT 의 LayerNorm 은 `eps=1e-6` 이라 `nn.LayerNorm` 기본값(1e-5)과 다르다. MLP 의 `nn.GELU` 도 tanh 근사가 아닌
erf 버전이다. position embedding 은 [CLS] 를 붙인 뒤의 197개 token 전체에 더한다.

</details>

## 참고 자료

- Google Research, [vision_transformer](https://github.com/google-research/vision_transformer) — 논문의 공식 JAX 구현과 weight
- torchvision, [`vit_b_16` weight 문서](https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.vit_b_16.html)
- torchvision, [`vision_transformer.py`](https://github.com/pytorch/vision/blob/main/torchvision/models/vision_transformer.py) — key 구조 확인용. 구현은 막혔을 때만 열기
- lucidrains, [vit-pytorch](https://github.com/lucidrains/vit-pytorch) — 짧은 PyTorch ViT 구현 모음. 막혔을 때만 열기

## 남은 한계

ViT 도 정해진 class 목록 안에서만 분류해서, 새 개념을 알아보게 하려면 그 개념에 label 을 단 데이터가 다시 필요하다. image
encoder 를 text encoder 와 함께 학습해 문장으로 개념을 지정할 수 있게 만든 모델이 [CLIP](../clip/README.md) 이다.
