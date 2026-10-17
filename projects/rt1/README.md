---
id: rt1
title: RT-1
branch: imitation
requires: [behavior-cloning, transformer, resnet]
hours: 20
summary: action 을 256 bin 분류로 바꾼 mini RT-1
papers:
  - title: "Behavior Transformers: Cloning k modes with one stone"
    authors: Nur Muhammad Mahi Shafiullah, Zichen Jeff Cui, Ariuntuya Altanzaya, Lerrel Pinto
    year: 2022
    url: https://arxiv.org/abs/2206.11251
  - title: "RT-1: Robotics Transformer for Real-World Control at Scale"
    authors: Anthony Brohan et al.
    year: 2022
    url: https://arxiv.org/abs/2212.06817
---

# RT-1

## 배경

Behavior Cloning 의 MLP 는 MSE 로 학습했는데, MSE 를 최소로 만드는 출력은 그 관측에서 나온 정답들의 평균
$\mathbb{E}[a \mid o]$ 다. 같은 장면에서 시연자가 어떤 때는 물체 왼쪽으로, 어떤 때는 오른쪽으로 돌아갔다면 policy 는 그
가운데로 곧장 들어가는데, 그 가운데 경로는 어느 시연에도 없던 잘못된 행동이다. 한 관측에 정답이 여럿인 이런 시연을
multimodal 하다고 부른다.

Google 의 RT-1(2022) 은 action 을 regression 하지 않고 분류 문제로 바꿨다. action 의 각 차원을 범위 안에서 균등한 256 개
bin 으로 나누고, 차원마다 256-way softmax 를 cross-entropy 로 학습한다. softmax 는 떨어진 두 bin 에 확률을 동시에 줄 수
있어서 두 갈래 시연을 평균으로 뭉개지 않는다.

$$
b^{(d)} = \min\!\Big(255,\ \Big\lfloor 256\cdot\frac{a^{(d)} - a^{(d)}_{\min}}{a^{(d)}_{\max} - a^{(d)}_{\min}} \Big\rfloor\Big),
\qquad
\mathcal{L} = -\sum_{d} \log p_\theta\big(b^{(d)} \mid o\big)
$$

RT-1 은 이미지 6 장의 history 를 ImageNet 사전학습 EfficientNet-B3 에 넣어 장마다 9×9 feature map, 곧 81 개 token 을
얻고, 언어 지시는 FiLM 으로 이 encoder 에 섞는다. TokenLearner 가 81 개를 8 개로 줄여 총 48 개 token 이 8 층 decoder-only
Transformer 로 들어가고, 출력은 11 개 action 차원의 bin 이다. 로봇 13 대로 17 개월 동안 모은 episode 13 만 개 이상으로
학습했다. 이번 과제에서는 같은 구조를 줄여 gym-pusht 의 PushT 에 학습하고, 같은 encoder 에 regression head 를 단
모델과 비교한다. PushT 는 원형 end-effector 로 T 자 블록을 목표 위치로 밀어 넣는 2D 과제이고, 블록을 어느 쪽으로
돌아가 밀지가 시연마다 달라서 multimodal 하다.

## 목표

- 내 ResNet-18 의 feature map 을 그대로 image token 으로 쓰는 encoder 를 만든다
- 내 Transformer 위에 action 차원마다 256-way head 를 단 mini RT-1 을 만든다
- 같은 encoder 에 MSE head 를 단 regression baseline 을 만든다
- 두 policy 의 PushT 성공률과 평균 max coverage 를 비교한다
- multimodal 구간에서 두 policy 의 action 분포와 궤적을 비교한다

**직접 짤 것**: feature map → token 변환과 positional embedding, action binning 과 역변환, policy 모델, rollout·eval 루프.
**가져다 써도 되는 것**: [ResNet](../resnet/README.md) 과 [Transformer](../transformer/README.md) 에서 만든 모듈,
torchvision 의 ImageNet weight(내 ResNet-18 에 옮겨 넣기), gym-pusht, `LeRobotDataset`.

## 준비물

- Python 3.12, torch, torchvision, matplotlib
- `pip install "lerobot[pusht]"` — gym-pusht 와 dataset loader 가 함께 설치된다
- dataset: Hugging Face Hub 의 `lerobot/pusht` (206 episode, 25,650 frame, 10 fps, 96×96 이미지, 2 차원 state·action)
- 8 GB GPU 로 충분

## 진행 순서

1. `LeRobotDataset("lerobot/pusht")` 로 데이터를 읽고 action 범위와 episode 길이를 확인한다
2. action 을 차원별 256 bin 으로 바꾸는 `ActionBinner` 와 bin 중심값으로 되돌리는 역변환을 짠다
3. 최근 2 frame 의 이미지를 ResNet-18 feature map token 으로 바꾸고 agent_pos token 과 시간·위치 embedding 을 붙인다
4. 학습 가능한 action query token 2 개를 덧붙여 Transformer 에 넣고, 각 query 출력에서 256 logits 를 내는 head 를 단다
5. 같은 encoder 위에 MSE head 를 단 regression baseline 을 만든다
6. 두 모델을 같은 step·batch·optimizer 로 학습한다
7. gym-pusht 에서 모델마다 50 episode 를 돌려 성공률과 평균 max coverage 를 잰다
8. 시연이 갈라지는 초기 상태 하나를 골라 두 모델의 action 분포와 반복 rollout 궤적을 그린다

## 시작점

```text
rt1/
├── data.py          # LeRobotDataset + 2-frame history
├── binning.py       # ActionBinner
├── model.py         # ImageTokenizer, MiniRT1, RegressionPolicy
├── train.py
└── eval_pusht.py    # success, max coverage, multimodal plots
```

```python
import numpy as np
import torch
from torch import nn


class ActionBinner:
    def __init__(self, low: np.ndarray, high: np.ndarray, n_bins: int = 256) -> None: ...
    def encode(self, action: torch.Tensor) -> torch.Tensor:
        """(B, D) float -> (B, D) long in [0, n_bins)."""
    def decode(self, bins: torch.Tensor) -> torch.Tensor:
        """(B, D) long -> (B, D) bin centers."""


class ImageTokenizer(nn.Module):
    def __init__(self, backbone: nn.Module, feat_channels: int, d_model: int) -> None: ...
    def forward(self, images: torch.Tensor) -> torch.Tensor:
        """(B, T_obs, 3, H, W) -> (B, T_obs * h * w, d_model), one token per feature-map cell."""


class MiniRT1(nn.Module):
    def __init__(self, tokenizer: ImageTokenizer, d_model: int = 256, n_layers: int = 6,
                 action_dim: int = 2, n_bins: int = 256) -> None: ...
    def forward(self, images: torch.Tensor, agent_pos: torch.Tensor) -> torch.Tensor:
        """returns logits (B, action_dim, n_bins)."""
    @torch.no_grad()
    def act(self, images: torch.Tensor, agent_pos: torch.Tensor, sample: bool = False) -> torch.Tensor:
        """argmax (or sampled) bins -> continuous action (B, action_dim)."""


class RegressionPolicy(nn.Module):
    def __init__(self, tokenizer: ImageTokenizer, d_model: int = 256, n_layers: int = 6, action_dim: int = 2) -> None: ...
    def forward(self, images: torch.Tensor, agent_pos: torch.Tensor) -> torch.Tensor:
        """returns action (B, action_dim)."""


def evaluate(policy: nn.Module, n_episodes: int = 50, seed: int = 0) -> dict[str, float]:
    """gym_pusht/PushT-v0 rollouts -> {'success_rate': ..., 'avg_max_coverage': ...}."""
```

## 스스로 확인

- [ ] `ActionBinner` 로 encode 후 decode 한 action 의 오차가 bin 폭의 절반 이하다 (PushT 범위 [0, 512] 이면 1 px)
- [ ] 두 모델을 같은 50 episode 초기 상태로 평가했을 때 mini RT-1 의 평균 max coverage 가 regression baseline 보다 높다
- [ ] 시연이 갈라지는 상태에서 classification head 의 softmax 가 두 봉우리를 보이고, regression 출력은 그 사이에 찍힌다
- [ ] 같은 초기 상태에서 sampling 으로 20 번 rollout 하면 mini RT-1 의 궤적이 두 갈래 이상으로 나뉜다
- [ ] (선택) LeRobot 이 공개한 `lerobot/diffusion_pusht` 를 같은 50 episode 로 평가해 기준선으로 함께 적는다
  (model card 의 500 episode 결과는 평균 max overlap 0.955, 성공률 65.4%)

## 생각해 볼 질문

1. MSE regression 이 multimodal 시연에서 평균을 내는 이유를 loss 의 최적해로 설명할 수 있는가?
2. x 와 y 를 각각 독립된 softmax 에서 뽑으면 왼쪽 갈래의 x 와 오른쪽 갈래의 y 가 섞인 action 이 나올 수 있다. 어떤
   경우에 그런가? 차원을 순서대로 뽑는 autoregressive 방식은 이 문제를 어떻게 피하고, RT-1 은 왜 그 방식을 뺐는가?
3. bin 을 16 개로 줄이거나 4096 개로 늘리면 각각 무엇을 잃는가?

## 힌트

<details>
<summary>feature map 의 token 변환</summary>

96×96 입력이면 ResNet-18 의 layer4 출력은 3×3 이라 token 이 9 개뿐이다. layer3 (6×6, 256 channel) 에서 끊고 linear 로
`d_model` 에 맞추면 공간 정보가 더 남는다. 각 cell 에 2D positional embedding 을, frame 마다 시간 embedding 을 더해야
Transformer 가 위치와 순서를 구분한다.

</details>

<details>
<summary>bin 경계와 정규화</summary>

PushT 의 action 은 [0, 512] 범위의 절대 좌표다. bin 경계를 데이터의 min·max 대신 env 범위로 고정하면 학습과 평가가 같은
binner 를 쓰기 쉽다. 입력 쪽 agent_pos 는 따로 [-1, 1] 로 정규화한다. 균등 bin 대신 action 을 k-means 로 묶고 묶음
중심 기준 offset 까지 regression 하는 Behavior Transformers 방식도 있어서, 시간이 남으면 같은 head 자리에 바꿔 끼워 본다.

</details>

<details>
<summary>argmax 와 sampling</summary>

argmax 로 고르면 같은 초기 상태에서 궤적이 늘 한 갈래로만 나온다. 다양성을 보려면 softmax 에서 sampling 하고, 성공률은
argmax 와 sampling 두 방식으로 모두 재 본다.

</details>

## 참고 자료

- [RT-1 project page](https://robotics-transformer1.github.io/) — 구조 그림과 데이터 규모
- 공식 TensorFlow 구현 [google-research/robotics_transformer](https://github.com/google-research/robotics_transformer), PyTorch 구현 [lucidrains/robotic-transformer-pytorch](https://github.com/lucidrains/robotic-transformer-pytorch) — 막혔을 때만 열기
- [gym-pusht](https://github.com/huggingface/gym-pusht) — observation·action 정의와 성공 기준(coverage 95% 이상)
- [lerobot/pusht](https://huggingface.co/datasets/lerobot/pusht) dataset, 기준선 모델 [lerobot/diffusion_pusht](https://huggingface.co/lerobot/diffusion_pusht)

## 남은 한계

bin 해상도가 정밀도를 제한하고, 차원별로 독립된 softmax 는 차원 사이의 상관을 담지 못하며, policy 는 여전히 한 step 씩
action 을 낸다. [Diffusion Policy](../diffusion-policy/README.md) 는 연속 action sequence 의 분포를 직접 생성하고,
[RT-2 → OpenVLA](../vla-tokens/README.md) 는 이 action token 을 사전학습된 VLM 의 vocabulary 에 넣어 언어 지시와 web 지식을
함께 쓴다.
