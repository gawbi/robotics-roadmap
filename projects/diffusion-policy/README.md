---
id: diffusion-policy
title: Diffusion Policy
branch: imitation
requires: [rt1, ddpm]
hours: 30
summary: denoising 으로 생성하는 action sequence
papers:
  - title: "Planning with Diffusion for Flexible Behavior Synthesis"
    authors: Michael Janner, Yilun Du, Joshua B. Tenenbaum, Sergey Levine
    year: 2022
    url: https://arxiv.org/abs/2205.09991
  - title: "Diffusion Policy: Visuomotor Policy Learning via Action Diffusion"
    authors: Cheng Chi et al.
    year: 2023
    url: https://arxiv.org/abs/2303.04137
---

# Diffusion Policy

## 배경

RT-1 의 256 bin 분류는 multimodal 시연을 평균으로 뭉개지 않았지만 bin 폭보다 정밀하게 움직일 수 없다. 또 차원마다 따로
뽑아서 차원 사이의 상관을 담지 못하고, 한 번에 action 하나만 낸다. Chi 등의 Diffusion Policy(2023) 는 앞으로 $T_p$ step 동안의
action sequence $A_t = (a_t, \dots, a_{t+T_p-1})$ 전체를 하나의 연속 샘플로 보고, 최근 $T_o$ 개 관측 $O_t$ 를 조건으로 하는
DDPM 으로 생성한다.

$$
A^k_t = \sqrt{\bar\alpha_k}\,A^0_t + \sqrt{1-\bar\alpha_k}\,\epsilon, \qquad
\mathcal{L} = \mathbb{E}_{k,\,\epsilon}\Big[\big\lVert \epsilon - \epsilon_\theta\big(O_t,\ A^k_t,\ k\big)\big\rVert^2\Big]
$$

noise 예측망 $\epsilon_\theta$ 는 시간축 방향 1D convolution 으로 된 U-Net 이고, 관측 feature 와 diffusion step $k$ 의
embedding 은 FiLM 으로 모든 conv block 의 channel 마다 scale·bias 를 바꾼다. 추론 때는 Gaussian noise 에서 시작해 $K$ 번
denoising 한 sequence 중 앞 $T_a$ 개만 실행하고 다시 추론하는 receding horizon 방식으로 돈다. PushT 설정은 $T_o = 2$,
$T_p = 16$, $T_a = 8$ 이고, simulation 에서는 학습과 추론 모두 100 step 을 썼다.

image encoder 는 사전학습 없는 ResNet-18 에서 두 군데를 고친다. global average pooling 을 spatial softmax 로 바꿔 공간
정보를 keypoint 좌표로 남기고, EMA 와 함께 쓸 때 학습이 흔들리지 않도록 BatchNorm 을 GroupNorm 으로 바꾼다. 이번 과제에서는
[DDPM](../ddpm/README.md) 에서 만든 scheduler 와 [ResNet](../resnet/README.md) 의 ResNet-18 을 재사용해 이 구조를 짜고,
같은 데이터와 같은 step 으로 학습한 LeRobot 의 diffusion policy 와 PushT coverage 를 비교한다.

## 목표

- 내 DDPM scheduler 를 $(T_p, \text{action\_dim})$ 모양의 action sequence 에 맞게 쓴다
- FiLM 으로 관측을 받는 1D conv U-Net noise 예측망을 만든다
- 내 ResNet-18 을 GroupNorm·spatial softmax 로 고친 image encoder 를 만든다
- 앞 $T_a$ 개만 실행하고 다시 추론하는 receding horizon rollout 을 만든다
- LeRobot diffusion policy 를 같은 조건으로 학습해 평균 max coverage 를 비교한다

**직접 짤 것**: 1D U-Net, FiLM block, spatial softmax, 학습 루프, sampling 루프, receding horizon 실행.
**가져다 써도 되는 것**: 앞 과제에서 만든 DDPM scheduler 와 ResNet-18, `LeRobotDataset`, gym-pusht, 비교용
`lerobot-train --policy.type=diffusion`.

## 준비물

- Python 3.12, torch, torchvision, matplotlib
- `pip install "lerobot[pusht]"`
- dataset: `lerobot/pusht` (206 episode, 96×96 이미지, 2 차원 action)
- 8 GB GPU 로 충분하다. 다만 LeRobot 의 공개 모델처럼 batch 64 로 수십만 step 을 돌리면 하루 단위의 시간이 걸리므로, 두 쪽 모두
  같은 짧은 step 으로 맞춰 비교한다

## 진행 순서

1. `delta_timestamps` 로 관측 2 frame 과 action 16 step 을 한 샘플로 묶고, action·state 를 [-1, 1] 로 정규화한다
2. ResNet-18 의 BatchNorm 을 GroupNorm 으로, global pooling 을 spatial softmax 로 바꾼 encoder 를 만든다
3. diffusion step embedding 과 관측 feature 를 이어 붙인 조건 벡터로 FiLM 을 적용하는 `ConditionalResBlock1D` 를 짠다
4. down·up 경로와 skip connection 을 갖춘 `ConditionalUnet1D` 로 조립하고 출력 shape 이 입력과 같은지 확인한다
5. DDPM scheduler 로 noise 를 섞어 $\epsilon$ 예측 MSE 로 학습한다
6. 순수 noise 에서 $K$ step denoising 해 action sequence 를 뽑는 `sample` 을 짠다
7. 앞 8 step 만 실행하고 다시 추론하는 rollout 으로 gym-pusht 50 episode 의 평균 max coverage 와 성공률을 잰다
8. 같은 데이터·step·horizon 으로 LeRobot diffusion policy 를 학습하고 같은 50 episode 로 평가한다

## 시작점

```text
diffusion-policy/
├── data.py          # LeRobotDataset + delta_timestamps, normalization
├── vision.py        # ResNet-18 with GroupNorm + SpatialSoftmax
├── unet1d.py        # ConditionalResBlock1D, ConditionalUnet1D
├── policy.py        # DiffusionPolicy: compute_loss / sample
├── train.py
└── eval_pusht.py    # receding-horizon rollouts
```

```python
import torch
from torch import nn


class SpatialSoftmax(nn.Module):
    def __init__(self, in_channels: int, num_keypoints: int = 32) -> None: ...
    def forward(self, feat: torch.Tensor) -> torch.Tensor:
        """(B, C, H, W) -> (B, num_keypoints * 2): expected (x, y) of each keypoint's softmax map."""


class ConditionalResBlock1D(nn.Module):
    def __init__(self, in_ch: int, out_ch: int, cond_dim: int, kernel_size: int = 5, n_groups: int = 8) -> None: ...
    def forward(self, x: torch.Tensor, cond: torch.Tensor) -> torch.Tensor:
        """x: (B, C_in, T), cond: (B, cond_dim) -> (B, C_out, T). FiLM scale/bias come from cond."""


class ConditionalUnet1D(nn.Module):
    def __init__(self, action_dim: int, cond_dim: int, down_dims: tuple[int, ...] = (256, 512, 1024)) -> None: ...
    def forward(self, noisy_actions: torch.Tensor, k: torch.Tensor, obs_cond: torch.Tensor) -> torch.Tensor:
        """noisy_actions: (B, T_p, action_dim), k: (B,) -> predicted noise (B, T_p, action_dim)."""


class DiffusionPolicy(nn.Module):
    def __init__(self, encoder: nn.Module, unet: ConditionalUnet1D, scheduler,
                 n_obs_steps: int = 2, horizon: int = 16, n_action_steps: int = 8) -> None: ...
    def compute_loss(self, batch: dict[str, torch.Tensor]) -> torch.Tensor: ...
    @torch.no_grad()
    def sample(self, obs: dict[str, torch.Tensor], num_steps: int = 100) -> torch.Tensor:
        """returns (B, horizon, action_dim) in env units."""
```

## 스스로 확인

- [ ] 길이 16 인 sequence 를 U-Net 에 넣으면 같은 shape 이 나오고, `k` 나 `obs_cond` 만 바꿔도 출력이 달라진다
- [ ] 같은 50 episode 초기 상태에서 내 policy 의 평균 max coverage 가 같은 데이터·step·horizon 으로 학습한 LeRobot diffusion policy 의 80% 이상이다
- [ ] RT-1 과제에서 고른 multimodal 상태에서 같은 관측으로 50 번 sampling 하면 두 갈래 궤적이 모두 나온다
- [ ] $T_a$ 를 1, 8, 16 으로 바꾼 rollout 의 coverage 와 궤적 떨림을 표로 남긴다
- [ ] (선택) DDIM 식 sampling 으로 denoising step 을 100 에서 10 으로 줄였을 때 coverage 변화와 추론 시간을 잰다

## 생각해 볼 질문

1. multimodal 시연에서 Behavior Cloning 의 MLP 는 실패했고 RT-1 의 분류는 일부만 다뤘다. diffusion 은 이런 시연을 어떻게 처리하는가?
2. $T_a$ 를 $T_p$ 와 같게 두면 반응이 늦어지고 1 로 두면 동작이 흔들린다. 각각 왜 그런가?
3. 추론에 denoising 100 step 이 필요하면 실물 로봇 제어 주기에 어떤 제약이 생기는가?

## 힌트

<details>
<summary>FiLM block 안쪽</summary>

조건 벡터를 linear 하나로 $2C$ 차원으로 펴서 scale 과 bias 로 나누고, 첫 conv·GroupNorm·Mish 다음에
`x * scale + bias` 를 적용한다. diffusion step $k$ 는 sinusoidal embedding 과 작은 MLP 를 거친 뒤 관측 feature 와 이어
붙여 하나의 조건 벡터로 만든다.

</details>

<details>
<summary>정규화와 clip</summary>

DDPM 은 데이터가 Gaussian noise 와 비슷한 scale 이라고 가정한다. action 과 agent_pos 를 학습 데이터의 min·max 로 [-1, 1]
에 맞추고, sampling 마지막에 [-1, 1] 로 clip 한 뒤 env 단위로 되돌린다.

</details>

<details>
<summary>LeRobot 과 조건을 맞추는 법</summary>

LeRobot diffusion policy 의 현재 기본값은 horizon 64·실행 32 step 이라 그대로 두면 비교가 어긋난다.
`--policy.horizon=16 --policy.n_action_steps=8` 로 맞추고, crop 크기·GroupNorm 여부·`down_dims` 같은 나머지 값은
`lerobot/diffusion_pusht` 의 `config.json` 을 보고 내 모델과 같게 둔다. `--steps`·`--batch_size` 도 두 쪽이 같아야 한다.

</details>

## 참고 자료

- [Diffusion Policy project page](https://diffusion-policy.cs.columbia.edu/) — 영상과 PushT multimodality 그림
- 공식 구현 [real-stanford/diffusion_policy](https://github.com/real-stanford/diffusion_policy) 의 [`conditional_unet1d.py`](https://github.com/real-stanford/diffusion_policy/blob/main/diffusion_policy/model/diffusion/conditional_unet1d.py) 와 [vision Colab](https://colab.research.google.com/drive/18GIHeOQ5DyjMN8iIRZL2EKZ0745NLIpg?usp=sharing) — 막혔을 때만 열기
- LeRobot [diffusion policy 구현](https://github.com/huggingface/lerobot/tree/main/src/lerobot/policies/diffusion) — 막혔을 때만 열기
- [lerobot/diffusion_pusht](https://huggingface.co/lerobot/diffusion_pusht) model card — 학습 명령과 500 episode 평가 결과(평균 max overlap 0.955, 성공률 65.4%)

## 남은 한계

action chunk 하나를 얻는 데 denoising 을 수십~수백 번 돌려야 하고, 언어 지시를 받지 못하며 과제마다 처음부터 학습한다. [π0](../pi0/README.md) 의
action expert 는 같은 action chunk 생성을 적은 step 의 flow matching 으로 바꾸고 사전학습된 VLM 에 붙였다. Diffusion Policy 를
실물 팔에서 돌려 보려면 [Real Robot](../real-robot/README.md) 에서 ACT 대신 골라 쓰면 된다.
