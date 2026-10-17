---
id: act
title: ACT
branch: imitation
requires: [behavior-cloning, vae, transformer, resnet]
hours: 30
summary: action chunk 를 예측하는 CVAE Transformer
papers:
  - title: "End-to-End Object Detection with Transformers"
    authors: Nicolas Carion et al.
    year: 2020
    url: https://arxiv.org/abs/2005.12872
  - title: "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware"
    authors: Tony Z. Zhao, Vikash Kumar, Sergey Levine, Chelsea Finn
    year: 2023
    url: https://arxiv.org/abs/2304.13705
---

# ACT

## 배경

Behavior Cloning 에서 본 compounding error 는 episode 가 길수록 커진다. 50 Hz 로 제어하는 양팔 조작은 사람 시연 한 번이
400–700 step 이라 한 step 씩 action 을 내는 policy 에게 특히 불리하고, 사람 시연에는 같은 장면에서 잠깐 멈추거나 속도가
달라지는 흔들림까지 섞여 있다. Zhao 등은 ALOHA(2023) 에서 policy 가 한 번에 앞으로 $k$ step 의 action chunk 를 내게 했는데,
이렇게 하면 policy 가 결정을 내리는 횟수가 $T$ 에서 $T/k$ 로 줄어 오차가 쌓일 기회도 그만큼 줄어든다.

이 policy 가 ACT(Action Chunking with Transformers) 이고, 시연의 흔들림을 다루기 위해 CVAE 로 학습한다. encoder
$q_\phi(z \mid a_{t:t+k}, \bar o_t)$ 는 [CLS] token·관절 위치·action sequence 를 Transformer 에 넣어 [CLS] 출력에서 style
변수 $z$ 의 평균과 분산을 낸다. decoder 이자 policy 인 $\pi_\theta(\hat a_{t:t+k} \mid o_t, z)$ 는 카메라마다 ResNet-18
feature map 을 token 으로 펴고 관절 위치·$z$ 와 함께 Transformer encoder 에 넣은 뒤, 고정 query $k$ 개를 쓰는 Transformer
decoder 로 $k \times 14$ 개의 관절 목표값을 낸다. 고정 query 로 출력 집합을 한 번에 내는 구조는 DETR 에서 왔다.

$$
\mathcal{L} = \big\lVert \hat a_{t:t+k} - a_{t:t+k} \big\rVert_1
+ \beta\, D_{\mathrm{KL}}\!\big(q_\phi(z \mid a_{t:t+k}, \bar o_t)\ \big\Vert\ \mathcal{N}(0, I)\big)
$$

추론 때는 encoder 를 버리고 $z = 0$ 으로 고정한다. 매 step 추론해 겹치는 chunk 들을 $w_i = \exp(-m\,i)$ ($w_0$ 이 가장 오래된
예측) 로 가중 평균하는 temporal ensembling 을 쓰면 움직임이 더 매끄러워진다. 논문 모델은 약 80M parameter 이고, 대부분의
과제를 시연 50 개만으로 처음부터 학습했다. 이번 과제에서는 ACT 를 직접 짜서 gym-aloha 의
transfer-cube 과제로 학습하고, 같은 데이터로 학습한 LeRobot ACT 와 성공률을 비교한다. transfer-cube 는 오른팔이 빨간 큐브를
집어 왼팔 gripper 로 건네는 과제다.

## 목표

- action sequence 를 $z$ 로 압축하는 CVAE encoder 를 만든다
- ResNet-18 feature map·관절·$z$ 를 받는 Transformer encoder-decoder policy 를 $k = 100$ 으로 만든다
- L1 + $\beta$·KL 로 `lerobot/aloha_sim_transfer_cube_human` 에 학습한다
- gym-aloha 50 episode 성공률을 재고 chunk 크기 $k = 1, 10, 100$ 을 비교한다
- (보너스) temporal ensembling 을 붙인다

**직접 짤 것**: CVAE encoder, feature map 의 2D positional embedding, encoder-decoder policy, loss, chunk 실행 루프,
temporal ensembling.
**가져다 써도 되는 것**: [VAE](../vae/README.md) 의 reparameterization, [Transformer](../transformer/README.md) 의 layer,
[ResNet](../resnet/README.md) 의 ResNet-18 과 torchvision ImageNet weight, `LeRobotDataset`, gym-aloha, 비교용
`lerobot-train --policy.type=act`.

## 준비물

- Python 3.12, torch, torchvision
- `pip install "lerobot[aloha]"` — gym-aloha (MuJoCo) 가 함께 설치된다. 화면 없는 서버에서는 `MUJOCO_GL=egl`
- dataset: `lerobot/aloha_sim_transfer_cube_human` (50 episode, 20,000 frame, 50 fps, top camera 480×640, 14 차원 state·action)
- 8 GB GPU 로 충분하다 (LeRobot 의 hardware guide 기준 ACT 는 batch 8 에서 2–6 GB). 논문은 RTX 2080 Ti 11 GB 에서 과제당 약
  5 시간 학습했다

## 진행 순서

1. `delta_timestamps` 로 현재 관측과 이후 100 step action 을 한 샘플로 묶고, episode 끝을 넘는 자리는 padding mask 로 표시한다
2. 관절 위치와 action sequence 를 받아 $\mu, \log\sigma^2$ 를 내는 CVAE encoder 를 짠다
3. ResNet-18 feature map 을 2D sinusoidal positional embedding 과 함께 token 으로 펴는 backbone 을 짠다
4. image token·관절 token·$z$ token 을 encoder 에, $k$ 개 query 를 decoder 에 넣는 policy 를 조립한다
5. padding 자리를 뺀 L1 과 $\beta = 10$ 의 KL 로 학습하고 두 항을 따로 기록한다
6. $k$ step 마다 한 번 추론해 chunk 를 실행하는 rollout 으로 gym-aloha `AlohaTransferCube-v0` 50 episode 성공률을 잰다
7. $k = 1, 10, 100$ 으로 각각 학습해 성공률을 비교한다
8. 같은 데이터·step 으로 LeRobot ACT 를 학습하고 같은 50 episode 로 평가한다

## 시작점

```text
act/
├── data.py           # chunk dataset with padding mask
├── backbone.py       # ResNet-18 trunk + 2D sinusoidal positional embedding
├── cvae.py           # StyleEncoder
├── policy.py         # ACTPolicy (transformer encoder-decoder)
├── train.py
└── eval_aloha.py     # chunked execution, temporal ensembling
```

```python
import numpy as np
import torch
from torch import nn


class StyleEncoder(nn.Module):
    def __init__(self, action_dim: int = 14, state_dim: int = 14, d_model: int = 512,
                 n_layers: int = 4, latent_dim: int = 32) -> None: ...
    def forward(self, state: torch.Tensor, actions: torch.Tensor, pad_mask: torch.Tensor
                ) -> tuple[torch.Tensor, torch.Tensor]:
        """state: (B, 14), actions: (B, k, 14), pad_mask: (B, k) -> (mu, logvar), each (B, latent_dim)."""


class ACTPolicy(nn.Module):
    def __init__(self, chunk_size: int = 100, d_model: int = 512, n_enc_layers: int = 4,
                 n_dec_layers: int = 1, latent_dim: int = 32, action_dim: int = 14) -> None: ...
    def forward(self, images: torch.Tensor, state: torch.Tensor, z: torch.Tensor) -> torch.Tensor:
        """images: (B, n_cam, 3, H, W), state: (B, 14), z: (B, latent_dim) -> actions (B, chunk_size, 14)."""


def act_loss(pred: torch.Tensor, target: torch.Tensor, pad_mask: torch.Tensor,
             mu: torch.Tensor, logvar: torch.Tensor, beta: float = 10.0) -> tuple[torch.Tensor, dict[str, float]]:
    """L1 over non-padded steps + beta * KL(q || N(0, I)). returns (loss, {'l1': ..., 'kl': ...})."""


class TemporalEnsembler:
    def __init__(self, chunk_size: int, action_dim: int, m: float = 0.01) -> None: ...
    def reset(self) -> None: ...
    def update(self, chunk: np.ndarray) -> np.ndarray:
        """add the chunk predicted at this step and return the ensembled action to execute now."""
```

## 평가 기준

- [ ] 학습 중 L1 과 KL 을 따로 기록하고, $z = 0$ 일 때와 $z \sim \mathcal{N}(0, I)$ 일 때의 chunk 를 같은 그림에 그려 $z$ 가 실제로 무엇을 바꾸는지 확인한다
- [ ] 같은 50 episode 초기 상태에서 내 ACT 의 성공률이 같은 데이터·step 으로 학습한 LeRobot ACT 의 80% 이상이다 (LeRobot 이 공개한 `lerobot/act_aloha_sim_transfer_cube_human` 은 500 episode 성공률 83.0%)
- [ ] $k = 1$ 의 성공률이 $k = 100$ 보다 뚜렷하게 낮다
- [ ] 한 번의 forward 가 20 ms (50 Hz 제어 주기) 안에 끝난다
- [ ] (선택) $m = 0.01$ temporal ensembling 을 켜고 매 step 추론했을 때 성공률과 관절 궤적의 jerk 변화를 잰다

## 생각해 볼 질문

1. chunk 크기를 1 로 줄이면 성공률이 떨어지는 이유를 Behavior Cloning 의 compounding error 와 연결해 설명할 수 있는가?
2. CVAE 없이 L1 만으로 학습하면 같은 장면에서 멈췄다 가는 시연과 바로 가는 시연이 섞일 때 어떤 action 이 나오는가?
3. 추론 때 $z$ 를 prior 의 평균인 0 으로 고정하는 선택은 무엇을 얻고 무엇을 포기하는가?

## 힌트

<details>
<summary>episode 끝의 chunk</summary>

episode 마지막 100 step 안쪽의 샘플은 미래 action 이 모자라다. `LeRobotDataset` 은 `delta_timestamps` 가 episode 를
넘으면 가장 가까운 frame 으로 채우고 `action_is_pad` mask 를 함께 돌려주므로, 그 mask 로 L1 에서 padding 자리를 빼고
CVAE encoder 의 attention 에서도 가린다.

</details>

<details>
<summary>decoder 층 수와 학습 길이</summary>

원 구현은 decoder 를 7 층으로 적었지만 코드 bug 로 첫 층 출력만 쓰였고, LeRobot 은 그 동작에 맞춰 `n_decoder_layers=1`
을 기본값으로 둔다. 원 저장소 README 는 ACT 가 멈칫거리거나 떨리면 더 오래 학습하라고 하는데, loss 가 평평해진 뒤에도
성공률과 부드러움이 계속 좋아지기 때문이다.

</details>

<details>
<summary>temporal ensembling 의 버퍼</summary>

시각 $t$ 에 낸 chunk 는 $t$ 부터 $t+k-1$ 까지의 예측이다. 시각마다 그 시각을 덮는 예측을 모아 두는 버퍼를 두고, 오래된
예측일수록 $w_0$ 쪽 weight 를 받도록 정렬한 뒤 평균한다. $m$ 이 클수록 오래된 예측의 비중이 커져 새 관측이 늦게 반영되고,
$m$ 이 작을수록 빨리 반영된다.

</details>

## 참고 자료

- [ALOHA project page](https://tonyzhaozh.github.io/aloha/) — 실물 시연 영상과 하드웨어 구성
- 원 구현 [tonyzhaozh/act](https://github.com/tonyzhaozh/act) 의 [`detr_vae.py`](https://github.com/tonyzhaozh/act/blob/main/detr/models/detr_vae.py) — 막혔을 때만 열기
- LeRobot [ACT 문서](https://huggingface.co/docs/lerobot/act)와 [구현](https://github.com/huggingface/lerobot/tree/main/src/lerobot/policies/act) — 구현은 막혔을 때만 열기
- [gym-aloha](https://github.com/huggingface/gym-aloha) — action·observation 정의와 성공 기준(reward 4)
- [lerobot/act_aloha_sim_transfer_cube_human](https://huggingface.co/lerobot/act_aloha_sim_transfer_cube_human) model card — 학습·평가 명령과 원 구현 대비 결과

## 남은 한계

ACT 는 과제마다 처음부터 학습하고 언어 지시도 일반 상식도 없어서, 시연에 없던 물체나 지시를 다루지 못한다. [Real Robot](../real-robot/README.md) 에서는
직접 모은 시연으로 ACT 를 실물 팔에 올려 보고, [π0](../pi0/README.md) 는 action chunk 생성을 사전학습된 VLM 위에 붙인다.
