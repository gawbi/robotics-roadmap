---
id: vla-tokens
title: RT-2 → OpenVLA
branch: vla
requires: [rt1, clip, gpt]
hours: 40
summary: action token 을 내는 작은 VLM fine-tune
papers:
  - title: "LIBERO: Benchmarking Knowledge Transfer for Lifelong Robot Learning"
    authors: Bo Liu et al.
    year: 2023
    url: https://arxiv.org/abs/2306.03310
  - title: "RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control"
    authors: Anthony Brohan et al.
    year: 2023
    url: https://arxiv.org/abs/2307.15818
  - title: "OpenVLA: An Open-Source Vision-Language-Action Model"
    authors: Moo Jin Kim et al.
    year: 2024
    url: https://arxiv.org/abs/2406.09246
  - title: "SmolVLM: Redefining small and efficient multimodal models"
    authors: Andrés Marafioti et al.
    year: 2025
    url: https://arxiv.org/abs/2504.05299
---

# RT-2 → OpenVLA

## 배경

RT-1 과제의 mini RT-1 은 PushT 시연만으로 학습해서, 언어 지시를 이해하지 못하고 시연에 없던 물체를 다룰 상식도
없다. 그런데 RT-1 의 action 은 이미 차원마다 256 개 중 하나를 고르는 token 이었다. Google 의 RT-2(2023) 는 이 token 을
web 데이터로 사전학습된 VLM 의 vocabulary 에 그대로 넣었다. end-effector 6-DoF 변위와 gripper 를 각각 256 bin 으로 나누고
종료 여부를 더해 정수 8 개를 정답 text 로 두었다. PaLI-X 처럼 1000 까지의 정수가 각자 token 인 모델에서는 그 숫자 token 을
action 으로 썼고, PaLM-E 처럼 그렇지 않은 모델에서는 가장 드물게 쓰이는 token 256 개를 덮어썼다. robot 데이터와 원래의 web
VQA 데이터를 섞어 학습했고(co-fine-tuning), 이렇게 만든 모델을 VLA(Vision-Language-Action model) 라 부른다.

$$
\mathcal{L} = -\sum_{d=1}^{D} \log p_\theta\big(\tau(b_d) \ \big|\ \text{image},\ \text{instruction},\ \tau(b_1), \dots, \tau(b_{d-1})\big)
$$

$b_d$ 는 $d$ 번째 차원의 bin 이고 $\tau$ 는 bin 을 vocab id 로 바꾸는 표다. RT-2 는 공개되지 않았지만 OpenVLA(2024) 가 같은
방식을 7B 공개 모델로 재현했다. Llama 2 에 DINOv2 와 SigLIP feature 를 합친 vision encoder 를 붙이고, Open X-Embodiment
의 시연 97 만 개로 학습했으며, Llama tokenizer 에서 거의 안 쓰이는 vocab 끝쪽 token 256 개를 action bin 으로 덮어썼다. 이번
과제에서는 같은 아이디어를 500M 이하의 작은 VLM(SmolVLM-256M·500M) 에 적용해 LIBERO 에서 fine-tune 하고, 언어 조건을 붙인
mini RT-1 과 비교한다. LIBERO 는 MuJoCo 기반 Franka 팔 simulation benchmark 로, "알파벳 수프를 집어 바구니에 넣어라" 같은
언어 지시가 붙은 task 를 suite 단위로 묶어 둔다.

## 목표

- SmolVLM 의 vocabulary 에서 action bin 으로 쓸 token 256 개를 고르고 bin ↔ token id 표를 만든다
- LIBERO suite 하나의 시연으로 "이미지 + 지시문 → action token 7 개" 를 fine-tune 한다
- 추론 때 action token 만 나오도록 logits 를 제한해 7 개 token 을 decode 하고 env 에 넣는다
- suite 의 10 task 성공률을 재고 언어 조건 mini RT-1 과 비교한다

**직접 짤 것**: `ActionTokenizer`(분위수 범위, binning, token 대응), 학습 샘플 구성과 label masking, 제한된 decoding, LIBERO
eval 루프, mini RT-1 에 언어를 넣는 FiLM.
**가져다 써도 되는 것**: transformers 의 SmolVLM 모델·processor, peft 의 LoRA, `LeRobotDataset`, LeRobot 의 LIBERO env,
[CLIP](../clip/README.md) 에서 만든 text encoder, [RT-1](../rt1/README.md) 의 mini RT-1.

## 준비물

- Python 3.12, torch, transformers, peft
- `pip install "lerobot[libero]"` — LIBERO 는 Linux 전용이고, 화면 없는 서버에서는 `MUJOCO_GL=egl`
- dataset: `lerobot/libero` (1,693 episode, 40 task, 256×256 카메라 2 대, 8 차원 state, 7 차원 action, 1.9 GB)
- VLM: `HuggingFaceTB/SmolVLM-256M-Instruct` (SigLIP 93M + SmolLM2-135M) 또는 `HuggingFaceTB/SmolVLM-500M-Instruct`
- 256M 은 bf16 에 작은 batch 로 두면 8 GB GPU 에서 전체 fine-tune 이 가능한 크기다. 500M 을 쓰거나 batch 를 키우려면 LoRA·
  gradient checkpointing 을 쓰거나 24 GB 급 cloud GPU(L4 등)를 빌린다. macOS 에서는 LIBERO 가 돌지 않으므로 Linux 머신이나
  Colab 을 쓴다

## 진행 순서

1. SmolVLM 에 LIBERO frame 한 장과 지시문을 넣어 그림을 설명하는 답이 나오는지부터 확인한다
2. tokenizer 의 special·added token 범위를 확인하고, 일반 token 가운데 지시문 corpus 에 거의 안 나오는 256 개를 action vocab 으로 정한다
3. 학습 action 의 차원별 1–99 분위수로 범위를 정해 256 bin 으로 바꾸는 `ActionTokenizer` 를 짠다
4. 이미지·지시문·action token 7 개로 학습 샘플을 만들고 action token 위치에만 loss 를 건다
5. suite 하나(예: `libero_object`) 의 시연으로 fine-tune 한다
6. action token 256 개만 남기는 logits mask 로 7 개 token 을 greedy decode 해 env 에 넣는 eval 루프를 짠다
7. suite 의 10 task × 10 episode 성공률을 잰다
8. mini RT-1 에 CLIP text embedding 을 FiLM 으로 넣어 같은 데이터로 학습하고 같은 protocol 로 평가한다

## 시작점

```text
vla-tokens/
├── action_tokenizer.py   # bins <-> vocab ids
├── data.py               # lerobot/libero -> (pixel_values, input_ids, labels)
├── train.py              # full or LoRA fine-tune
├── decode.py             # constrained greedy decoding of 7 action tokens
├── eval_libero.py        # LeRobot LIBERO env loop, success per task
└── baseline_rt1.py       # mini RT-1 + CLIP text FiLM
```

```python
from collections.abc import Iterable

import numpy as np
import torch
from PIL import Image


class ActionTokenizer:
    def __init__(self, token_ids: list[int], low: np.ndarray, high: np.ndarray, n_bins: int = 256) -> None:
        """token_ids: 256 vocab ids reused as bins. low/high: per-dim 1st/99th percentile of training actions."""
    def encode(self, action: np.ndarray) -> list[int]:
        """(7,) continuous action -> 7 vocab ids (values outside [low, high] are clipped)."""
    def decode(self, token_ids: list[int]) -> np.ndarray:
        """7 vocab ids -> (7,) bin centers."""


def pick_action_token_ids(tokenizer, corpus: Iterable[str], n: int = 256) -> list[int]:
    """the n rarest ordinary tokens in corpus; special and added tokens are never chosen."""


def build_sample(processor, images: list[Image.Image], instruction: str,
                 action_ids: list[int]) -> dict[str, torch.Tensor]:
    """input_ids / attention_mask / pixel_values / labels. labels are -100 everywhere except the 7 action tokens."""


@torch.no_grad()
def predict_action(model, processor, act_tok: ActionTokenizer,
                   images: list[Image.Image], instruction: str) -> np.ndarray:
    """greedy-decode 7 tokens while masking every logit outside act_tok's 256 ids, then decode to (7,)."""


def evaluate_suite(policy_fn, suite: str = "libero_object", episodes_per_task: int = 10) -> dict[int, float]:
    """success rate per task id, using lerobot.envs.factory.make_env."""
```

## 평가 기준

- [ ] `ActionTokenizer` 로 encode 후 decode 한 action 의 오차가 분위수 범위 안에서 차원별 bin 폭의 절반 이하다
- [ ] 고른 256 개 id 에 special token·added token 이 하나도 없다
- [ ] held-out 시연 frame 에서 7 개 token 의 정확도와 decode 한 action 의 L1 오차를 기록한다
- [ ] 같은 suite 의 10 task × 10 episode 성공률을 VLA 와 mini RT-1 에 대해 task 별 표로 남기고, 두 모델의 평균 성공률에 Wilson 95% 구간을 붙인다
- [ ] (선택) 같은 장면에서 지시문의 물체 이름만 장면에 있는 다른 물체로 바꿨을 때 VLA 가 그 물체 쪽으로 움직이는지 영상으로 확인한다

## 생각해 볼 질문

1. VLM 이 web 에서 배운 지식은 어떤 경로로 로봇 action 까지 넘어오는가? 넘어오는 지식과 넘어오지 않는 지식을 하나씩 들 수 있는가?
2. action 하나에 token 7 개를 autoregressive 로 하나씩 내야 한다. 50 Hz 제어가 필요한 과제에서는 어떤 문제가 생기는가?
3. RT-2 는 robot 데이터만으로 fine-tune 하지 않고 web 데이터를 섞었다. 섞지 않으면 무엇을 잃는가?

## 힌트

<details>
<summary>덮어쓸 token 을 고르는 기준</summary>

SmolVLM-256M 의 vocab 은 49,280 개인데, 49,152 번부터 끝까지 128 개는 image 자리 token·reserved special token·
`<end_of_utterance>` 같은 added token 이다. OpenVLA 처럼 "vocab 끝 256 개" 를 그대로 덮으면 이 token 들까지 덮게 되므로,
`tokenizer.all_special_ids` 와 added token 을 빼고 그 앞쪽 일반 token 에서 고른다.

</details>

<details>
<summary>image token 수를 줄이는 법</summary>

SmolVLM processor 는 기본으로 image splitting 을 켜고 긴 변을 2048 까지 키우기 때문에, 256×256 frame 한 장도 여러 tile 로
쪼개져 token 이 크게 는다. `do_image_splitting=False` 나 `size={"longest_edge": 512}` 로 processor 를 만들면 frame 한 장이 tile 하나로
들어가 메모리와 학습 시간이 줄어든다.

</details>

<details>
<summary>LIBERO env 사용법</summary>

`make_env(make_env_config("libero", task="libero_object"), n_envs=1)` 는 `{suite: {task_id: VectorEnv}}` 모양으로 env 를
돌려준다. task 마다 지시문이 다르므로 env 에서 지시문을 읽어 모델 입력에 넣고, dataset 의 action 정의(end-effector 변위 6 +
gripper 1, 범위 [-1, 1]) 와 env 의 control mode 가 같은지 먼저 확인한다.

</details>

## 참고 자료

- [RT-2 project page](https://robotics-transformer2.github.io/) 와 [OpenVLA project page](https://openvla.github.io/)
- OpenVLA 의 [`action_tokenizer.py`](https://github.com/openvla/openvla/blob/main/prismatic/vla/action_tokenizer.py) — 막혔을 때만 열기
- Stanford SAIL blog, [MiniVLA: A Better VLA with a Smaller Footprint](https://ai.stanford.edu/blog/minivla/) — 0.5B 급 LLM 으로 VLA 를 줄인 사례
- [nanoVLM](https://github.com/huggingface/nanoVLM) — 작은 VLM 의 구조를 짧은 PyTorch 코드로 읽기 좋다
- LeRobot [LIBERO 문서](https://huggingface.co/docs/lerobot/libero) — suite 구성, dataset, 평가 protocol
- [SmolVLM-256M-Instruct](https://huggingface.co/HuggingFaceTB/SmolVLM-256M-Instruct) model card

## 남은 한계

action 하나를 얻으려면 token 7 개를 순서대로 생성해야 해서 느리고, 256 bin 해상도가 고주파·정밀 제어를 막는다. [π0](../pi0/README.md) 는
VLM 옆에 별도의 action expert 를 두고, 이 expert 가 연속 action chunk 를 flow matching 으로 한 번에 생성한다.
