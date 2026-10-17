---
id: clip
title: CLIP
branch: vision
requires: [vit, gpt]
hours: 18
summary: 이미지와 문장을 한 공간에 놓는 contrastive learning
papers:
  - title: "Learning Transferable Visual Models From Natural Language Supervision"
    authors: Alec Radford et al.
    year: 2021
    url: https://arxiv.org/abs/2103.00020
  - title: "Sigmoid Loss for Language Image Pre-Training"
    authors: Xiaohua Zhai, Basil Mustafa, Alexander Kolesnikov, Lucas Beyer
    year: 2023
    url: https://arxiv.org/abs/2303.15343
---

# CLIP

## 배경

[ViT](../vit/README.md) 는 ImageNet 의 1000개 class 처럼 미리 정한 label 로만 학습되어서, "빨간 컵" 같은 새 개념을 알아보게
하려면 그 label 을 단 데이터를 다시 모아야 한다. 2021년 Radford 등은 인터넷에서 모은 이미지–문장 쌍 4억 개로 image encoder 와
text encoder 를 함께 학습시켜, 짝이 맞는 이미지와 문장의 embedding 이 같은 방향을 가리키게 만들었다.

batch 안의 $B$ 쌍에서 image embedding $u_i$ 와 text embedding $v_j$ 를 L2 정규화하고, cosine similarity 에 학습되는 scale $s$ 를
곱해 $B\times B$ logits 를 만든다. 대각선이 정답인 cross-entropy 를 행 방향과 열 방향으로 한 번씩 계산해 평균하면 loss 가 된다.

$$
\ell_{ij} = s\,\langle u_i, v_j\rangle,\qquad
\mathcal L = \frac{1}{2B}\sum_{i=1}^{B}\Big[-\log\frac{e^{\ell_{ii}}}{\sum_j e^{\ell_{ij}}} - \log\frac{e^{\ell_{ii}}}{\sum_j e^{\ell_{ji}}}\Big]
$$

학습이 끝나면 class 이름을 "a photo of a {class}." 같은 문장으로 바꿔 text embedding 을 만들고, 이미지 embedding 과 가장 가까운
문장을 고르는 것만으로 처음 보는 dataset 을 분류할 수 있다(zero-shot). 2023년 SigLIP 은 batch 전체에 걸친 softmax 대신 쌍마다
독립적인 sigmoid 를 쓴다.

$$
\mathcal L_{\text{sig}} = -\frac{1}{B}\sum_{i=1}^{B}\sum_{j=1}^{B}\log\sigma\big(z_{ij}\,(t\,\langle u_i, v_j\rangle + b)\big),\qquad
z_{ij} = \begin{cases}\ \ 1 & i=j\\ -1 & i\neq j\end{cases}
$$

π0 가 쓰는 VLM 인 PaliGemma 의 vision encoder 가 이 loss 로 학습된 SigLIP 이라서, 여기서 만드는 encoder 는 뒤의 VLA 과제에서
이미지를 언어와 같은 공간으로 읽어 들이는 역할을 한다.

## 목표

- [ViT](../vit/README.md) 과제의 encoder 를 CLIP 의 image encoder(ViT-B/32)로 고친다
- [GPT-2](../gpt/README.md) 과제의 decoder 로 text encoder 를 만든다
- OpenAI CLIP ViT-B/32 weight 를 옮겨 넣고 image·text embedding 을 공식 구현과 비교한다
- contrastive loss 와 zero-shot classifier 를 짜서 CIFAR-10 test set 의 zero-shot 정확도를 잰다
- (보너스) SigLIP sigmoid loss 를 짜서 softmax loss 와 batch 크기별로 비교한다

**직접 짤 것**: image encoder, text encoder(causal mask, EOT 위치 pooling), projection, logit scale, contrastive loss, sigmoid
loss, zero-shot classifier, weight 이식.
**가져다 써도 되는 것**: CLIP 의 BPE tokenizer(`clip.tokenize`)와 이미지 전처리, 공식 `clip` 패키지와 HF `CLIPModel`(비교용).
[BPE Tokenizer](../tokenizer/README.md) 과제의 코드로 CLIP vocab 을 읽어 써도 된다.

## 준비물

- Python 3.12, `torch`, `torchvision`, `ftfy`, `regex`, `tqdm`, OpenAI CLIP 패키지(`pip install git+https://github.com/openai/CLIP.git`)
- CIFAR-10 test set(torchvision), 보너스용 [COCO 2017](https://cocodataset.org/#download) val 이미지 5,000장과 caption annotation
- CLIP ViT-B/32 는 float32 로 올려도 1 GB 가 안 되어 8 GB GPU 나 Colab T4 면 충분하다. CPU 로도 돌아가지만 CIFAR-10 10,000장 평가는 느리다

## 진행 순서

1. ViT 과제의 encoder 에 `ln_pre`, `QuickGELU`, 출력 projection 을 더해 CLIP image encoder 를 만든다
2. GPT-2 과제의 decoder 를 고쳐 EOT token 위치의 출력을 projection 하는 text encoder 를 만든다
3. `clip.load("ViT-B/32", device="cpu")` 로 받은 모델의 `state_dict` 를 내 모델로 옮기는 대응표를 만든다
4. 같은 이미지·문장에서 내 모델과 공식 모델의 embedding 을 비교한다
5. 18개 prompt template 의 평균으로 CIFAR-10 10개 class 의 text embedding 을 만든다
6. CIFAR-10 test set 의 zero-shot 정확도를 template 1개일 때와 18개일 때로 나눠 잰다
7. `clip_loss` 와 `siglip_loss` 를 짠다
8. (보너스) COCO val2017 에서 projection 이전 feature 를 고정하고, 새로 초기화한 projection 두 개를 batch 크기 32·256·1024 에서 두 loss 로 각각 학습시킨다

## 시작점

```text
clip/
├── image_encoder.py   # ViT 과제 코드 + ln_pre, QuickGELU, proj
├── text_encoder.py    # GPT-2 과제 코드 + EOT pooling, text_projection
├── model.py           # CLIP: encode_image, encode_text, forward
├── losses.py          # clip_loss, siglip_loss
├── load_weights.py    # OpenAI state_dict → 내 CLIP
├── zeroshot.py        # CIFAR-10 zero-shot 평가
└── test_clip.py
```

```python
import torch
from torch import nn

class QuickGELU(nn.Module):
    """x * sigmoid(1.702 * x), the activation the OpenAI weights were trained with"""
    def forward(self, x: torch.Tensor) -> torch.Tensor: ...

class TextEncoder(nn.Module):
    def __init__(self, vocab: int = 49408, context: int = 77, width: int = 512,
                 layers: int = 12, heads: int = 8, embed_dim: int = 512): ...
    def forward(self, tokens: torch.Tensor) -> torch.Tensor:
        """tokens (N, 77) int64 -> (N, embed_dim), taken at the EOT position"""

class CLIP(nn.Module):
    def encode_image(self, images: torch.Tensor) -> torch.Tensor:
        """(N, 3, 224, 224) -> (N, 512), not normalized"""
    def encode_text(self, tokens: torch.Tensor) -> torch.Tensor:
        """(N, 77) -> (N, 512), not normalized"""
    def forward(self, images: torch.Tensor, tokens: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        """returns (logits_per_image, logits_per_text), both (N, N)"""

def clip_loss(img: torch.Tensor, txt: torch.Tensor, logit_scale: torch.Tensor) -> torch.Tensor: ...

def siglip_loss(img: torch.Tensor, txt: torch.Tensor, t: torch.Tensor, b: torch.Tensor) -> torch.Tensor: ...

@torch.no_grad()
def zeroshot_weights(model: CLIP, classnames: list[str], templates: list[str]) -> torch.Tensor:
    """(embed_dim, num_classes), one normalized column per class"""
```

## 스스로 확인

- [ ] 공식 모델(`clip.load("ViT-B/32", device="cpu")`)과 비교해 정규화한 image·text embedding 의 차이가 1e-4 미만이다(float32)
- [ ] CIFAR-10 test set 10,000장의 zero-shot 정확도가 같은 template·같은 전처리를 쓴 공식 모델과 0.1%p 이내다
- [ ] template 1개("a photo of a {}.")일 때와 18개 평균일 때의 정확도 차이를 기록했다
- [ ] (선택) random embedding 에서 내 `clip_loss` 가 open_clip `ClipLoss` 와 1e-6 이내로 같다
- [ ] (보너스) COCO val2017 에서 두 loss 의 image→text recall@1 을 batch 크기별 표로 정리했다

## 생각해 볼 질문

1. softmax contrastive loss 에서 batch 크기는 왜 중요한가? 같은 이미지–문장 쌍이라도 batch 에 함께 들어간 다른 쌍에 따라 loss 가 달라지는 이유는?
2. zero-shot classifier 는 weight 가 text embedding 인 linear classifier 다. prompt 문구만 바꿨는데 정확도가 달라지는 이유는?
3. SigLIP 은 bias $b$ 를 $-10$ 에서 시작한다. $B^2$ 개 쌍 가운데 positive 가 $B$ 개뿐인 것과 이 초기값은 어떤 관계인가?

## 힌트

<details>
<summary>torchvision ViT 와 CLIP image encoder 의 차이</summary>

CLIP 은 position embedding 을 더한 뒤 encoder 에 들어가기 전에 LayerNorm(`ln_pre`)을 한 번 더 거치고, MLP activation 이
GELU 가 아니라 QuickGELU 다. 마지막에는 [CLS] 출력에 `ln_post` 를 적용하고 bias 없는 행렬 `proj` 를 곱해 512차원으로 바꾼다.
LayerNorm eps 도 torchvision ViT 의 1e-6 이 아니라 1e-5 다.

</details>

<details>
<summary>text encoder 가 문장 끝을 찾는 법</summary>

CLIP tokenizer 는 문장 끝에 EOT token 을 붙이는데, 이 token 의 id 가 vocab 에서 가장 크다. 그래서 token id 의 argmax 위치가
곧 EOT 위치다. `ln_final` 을 거친 출력에서 그 위치의 vector 를 골라 `text_projection` 을 곱한다.

</details>

<details>
<summary>공식 모델과 값이 크게 다를 때</summary>

`clip.load` 는 GPU 에 올릴 때 weight 를 float16 으로 바꾸므로 CPU 로 불러 float32 끼리 비교한다. `logit_scale` 은 log 값으로
저장되어 있어서 쓸 때 `exp()` 를 해야 한다.

</details>

## 참고 자료

- OpenAI, [CLIP](https://github.com/openai/CLIP) — 공식 weight 와 tokenizer. dataset 별 class 이름과 template 은 [`data/prompts.md`](https://github.com/openai/CLIP/blob/main/data/prompts.md) 에 있고, 구현 [`model.py`](https://github.com/openai/CLIP/blob/main/clip/model.py) 는 막혔을 때만 열기
- OpenAI, [Prompt Engineering for ImageNet 노트북](https://github.com/openai/CLIP/blob/main/notebooks/Prompt_Engineering_for_ImageNet.ipynb) — template ensemble 로 zero-shot classifier 를 만드는 과정
- Hugging Face, [CLIP 문서](https://huggingface.co/docs/transformers/model_doc/clip)와 [`openai/clip-vit-base-patch32`](https://huggingface.co/openai/clip-vit-base-patch32)
- open_clip, [`loss.py`](https://github.com/mlfoundations/open_clip/blob/main/src/open_clip/loss.py) — `ClipLoss`·`SigLipLoss` 구현. 막혔을 때만 열기
- Google, [big_vision](https://github.com/google-research/big_vision) — SigLIP 공식 구현과 weight

## 남은 한계

CLIP 은 이미지와 문장이 얼마나 잘 맞는지 점수를 낼 뿐, 문장을 생성하거나 로봇 action 을 내지는 못한다. image encoder 를 language
model 에 붙이고 action 까지 token 으로 생성하게 만든 모델이 [RT-2 → OpenVLA](../vla-tokens/README.md) 다.
