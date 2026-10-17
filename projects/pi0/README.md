---
id: pi0
title: π0
branch: vla
requires: [vla-tokens, flow-matching, act]
hours: 40
summary: frozen VLM 과 flow matching action expert
papers:
  - title: "π0: A Vision-Language-Action Flow Model for General Robot Control"
    authors: Kevin Black et al.
    year: 2024
    url: https://arxiv.org/abs/2410.24164
  - title: "FAST: Efficient Action Tokenization for Vision-Language-Action Models"
    authors: Karl Pertsch et al.
    year: 2025
    url: https://arxiv.org/abs/2501.09747
  - title: "SmolVLA: A Vision-Language-Action Model for Affordable and Efficient Robotics"
    authors: Mustafa Shukor et al.
    year: 2025
    url: https://arxiv.org/abs/2506.01844
---

# π0

## 배경

RT-2 → OpenVLA 과제의 VLA 는 action 하나를 얻으려고 token 7 개를 차례로 생성했고, 256 bin 해상도 때문에 정밀한 고주파
제어가 어려웠다. Physical Intelligence 의 π0(2024) 는 VLM 이 action 을 token 으로 직접 출력하게 하지 않고, 별도의
action expert 가 앞으로 $H = 50$ step 의 연속 action chunk $A_t$ 를 flow matching 으로 한 번에 생성하게 했다. 같은
Transformer 층 안에서 이미지·지시문 token 은 PaliGemma(3B) 의 weight 로 처리하고 state·action token 은 약 300M 짜리 action
expert weight 로 처리하되, attention 은 함께 계산한다. 이 구조로 최대 50 Hz 제어까지 해냈다.

$$
A^\tau_t = \tau A_t + (1-\tau)\,\epsilon, \qquad
\mathcal{L} = \mathbb{E}_{\tau,\,\epsilon}\Big[\big\lVert v_\theta(A^\tau_t, \tau, o_t) - (A_t - \epsilon) \big\rVert^2\Big], \qquad
A^{\tau+\delta}_t = A^\tau_t + \delta\, v_\theta(A^\tau_t, \tau, o_t)
$$

$\tau = 0$ 은 순수 noise 이고, 추론 때는 $A^0_t \sim \mathcal{N}(0, I)$ 에서 출발해 $\delta = 0.1$ 로 Euler 적분을 10 번
한다. attention mask 는 [이미지·지시문], [state], [noisy action] 세 block 의 blockwise causal 구조라서 앞 block 은 뒤 block
을 보지 않는다. 그래서 관측 prefix 의 key·value 를 한 번만 계산해 캐시하고 10 번의 적분 step 에서는 action expert 쪽만
다시 돌리면 된다. 학습 때 $\tau$ 는 noise 쪽 값을 더 자주 뽑는 beta 분포에서 sampling 한다.

2025년의 FAST 는 autoregressive token 방식을 유지하되 action chunk 를 차원별 DCT 로 주파수 공간에 옮기고 양자화한
계수열을 BPE 로 압축해, 차원·step 마다 bin 하나씩 쓰던 방식보다 훨씬 적은 token 으로 고주파 chunk 를 표현했다. 같은 해의
SmolVLA 는 π0 의 구조를 SmolVLM2-500M 위에 작게 옮겨 약 450M parameter 로 만들었다. VLM 은 앞쪽 16 층만 쓰고, action
expert 는 VLM 출력을 cross-attention 으로 보는 층과 self-attention 층을 번갈아 쌓았다. 이번 과제에서는 VLM 을 freeze 한 채
prefix feature 만 뽑고, 그 위에 내 action expert 를 붙여 flow matching 으로 학습한 뒤 같은 데이터로 fine-tune 한 SmolVLA 와
LIBERO 성공률을 비교한다.

## 목표

- freeze 한 SmolVLM 으로 이미지·지시문 prefix feature 를 뽑고 캐시한다
- state token, noisy action token $H$ 개, $\tau$ embedding 을 받아 velocity 를 내는 action expert 를 만든다
- flow matching loss 로 action expert 만 학습하고, prefix 한 번 + Euler 10 step 으로 chunk 를 생성한다
- RT-2 → OpenVLA 과제와 같은 LIBERO suite 에서 성공률과 chunk 당 추론 시간을 잰다
- 같은 데이터로 fine-tune 한 SmolVLA 및 vla-tokens 모델과 비교한다

**직접 짤 것**: action expert(self-attention + prefix cross-attention), $\tau$ embedding, flow matching loss 와 $\tau$ sampling,
Euler sampler, chunk 실행 루프.
**가져다 써도 되는 것**: transformers 의 SmolVLM(freeze), [Flow Matching](../flow-matching/README.md) 과제의 코드,
[RT-2 → OpenVLA](../vla-tokens/README.md) 의 데이터 파이프라인과 LIBERO eval 루프, [ACT](../act/README.md) 의 chunk 실행
코드, 비교용 LeRobot SmolVLA(`lerobot-train --policy.type=smolvla`).

## 준비물

- Python 3.12, torch, transformers
- `pip install "lerobot[libero,smolvla]"` — LIBERO 는 Linux 전용이고, 화면 없는 서버에서는 `MUJOCO_GL=egl`
- dataset: `lerobot/libero` 에서 RT-2 → OpenVLA 과제와 같은 suite 의 episode
- VLM: `HuggingFaceTB/SmolVLM-256M-Instruct`, 또는 SmolVLA 와 같은 `HuggingFaceTB/SmolVLM2-500M-Video-Instruct`
- 내 모델은 VLM 을 bf16 으로 freeze 하고 action expert 만 학습하므로 8 GB GPU 로 충분하다. SmolVLA fine-tune 은 LeRobot
  hardware guide 기준 batch 8 에서 10–16 GB 라서, 8 GB GPU 에서는 batch 를 줄이고 그래도 부족하면 24 GB 급 cloud GPU 를 빌린다

## 진행 순서

1. RT-2 → OpenVLA 과제의 데이터 파이프라인을 action token 대신 길이 $H$ 의 연속 action chunk 를 내도록 바꾼다
2. SmolVLM 을 freeze 하고 이미지·지시문을 넣어 고른 층의 hidden state 와 padding mask 를 돌려주는 `FrozenPrefix` 를 짠다
3. state token 과 noisy action token 이 서로 self-attention 하고 prefix 를 cross-attention 으로 보는 action expert 를 짠다
4. noise 쪽에 치우친 분포로 $\tau$ 를 뽑아 flow matching loss 로 action expert 만 학습한다
5. prefix 를 한 번 계산하고 Euler 10 step 으로 chunk 를 생성하는 sampler 를 짠다
6. chunk 의 앞부분만 실행하고 다시 추론하는 루프로 LIBERO suite 의 10 task × 10 episode 성공률과 chunk 당 추론 시간을 잰다
7. 같은 episode 로 SmolVLA 를 학습하고 `lerobot-eval` 로 같은 suite 를 평가한다
8. 내 모델·SmolVLA·vla-tokens 모델의 성공률과 action 하나당 추론 시간을 한 표로 정리한다

## 시작점

```text
pi0/
├── prefix.py          # FrozenPrefix: frozen SmolVLM -> prefix features (+ cache)
├── action_expert.py   # ExpertLayer (self-attn + cross-attn to prefix), ActionExpert
├── flow.py            # sample_tau, flow_matching_loss, euler_sample
├── policy.py          # Pi0Lite: prefix + expert, chunk queue for execution
├── train.py
└── eval_libero.py
```

```python
import torch
from PIL import Image
from torch import nn


class FrozenPrefix(nn.Module):
    def __init__(self, vlm_name: str = "HuggingFaceTB/SmolVLM-256M-Instruct", layer: int = -1) -> None:
        """loads the VLM in bf16 with requires_grad=False everywhere."""
    @torch.no_grad()
    def forward(self, images: list[list[Image.Image]], instructions: list[str]) -> tuple[torch.Tensor, torch.Tensor]:
        """returns (prefix (B, L, d_vlm), prefix_pad_mask (B, L)) taken from hidden_states[layer]."""


class ActionExpert(nn.Module):
    def __init__(self, d_vlm: int, d_model: int = 432, n_layers: int = 8, n_heads: int = 6,
                 horizon: int = 50, action_dim: int = 7, state_dim: int = 8) -> None: ...
    def forward(self, noisy_actions: torch.Tensor, tau: torch.Tensor, state: torch.Tensor,
                prefix: torch.Tensor, prefix_pad_mask: torch.Tensor) -> torch.Tensor:
        """noisy_actions: (B, H, action_dim), tau: (B,) -> velocity (B, H, action_dim)."""


def sample_tau(batch: int, device: torch.device) -> torch.Tensor:
    """flow time in [0, 1) with 0 = pure noise, biased toward the noisy end."""


def flow_matching_loss(expert: ActionExpert, actions: torch.Tensor, state: torch.Tensor,
                       prefix: torch.Tensor, prefix_pad_mask: torch.Tensor) -> torch.Tensor: ...


@torch.no_grad()
def euler_sample(expert: ActionExpert, state: torch.Tensor, prefix: torch.Tensor,
                 prefix_pad_mask: torch.Tensor, horizon: int, action_dim: int, steps: int = 10) -> torch.Tensor:
    """integrate from tau = 0 (noise) to tau = 1 -> (B, horizon, action_dim)."""
```

## 스스로 확인

- [ ] VLM 의 모든 parameter 가 `requires_grad=False` 이고, 학습 전후 VLM weight 의 차이가 정확히 0 이다
- [ ] 학습 데이터 batch 하나에 overfit 시키면 loss 가 0 근처로 떨어지고, 같은 관측에서 생성한 chunk 가 시연 chunk 와 거의 겹친다
- [ ] 같은 LIBERO suite 에서 내 모델의 평균 성공률이 같은 데이터로 fine-tune 한 SmolVLA 의 70% 이상이다
- [ ] 같은 GPU 에서 chunk 하나 생성 시간(prefix 1 회 + Euler 10 step)과 vla-tokens 모델의 action 하나 decode 시간을 재서 action 하나당 시간으로 비교한다
- [ ] Euler step 을 10 → 3 → 1 로 줄였을 때 성공률 변화를 기록한다
- [ ] (선택) LIBERO action chunk 에 DCT + 양자화 + [BPE Tokenizer](../tokenizer/README.md) 과제의 BPE 를 적용한 FAST 식 tokenizer 를 만들어, chunk 하나의 token 수를 256-bin 방식($H \times 7$ 개)과 비교한다

## 생각해 볼 질문

1. action expert 를 VLM 과 다른 weight 로 두는 이유는? VLM 의 weight 로 action token 까지 처리하면 무엇이 문제인가?
2. vla-tokens 모델은 action 하나에 forward 7 번이 필요했다. 이 모델은 action $H$ 개를 얻는 데 forward 가 몇 번 필요하고,
   그 차이는 어디서 오는가?
3. FAST 는 autoregressive token 방식을 유지하면서 고주파 제어 문제를 풀었다. flow matching action expert 와 비교했을 때
   각 방식이 유리한 상황은?

## 힌트

<details>
<summary>시간 규약과 부호</summary>

π0 논문은 $\tau = 0$ 을 noise 로 두고 0 에서 1 로 적분하지만, openpi 코드는 diffusion 문헌의 관례대로 $t = 1$ 을 noise 로
두고 1 에서 0 으로 적분한다. 다른 구현을 참고할 때는 noise 를 섞는 식과 velocity target 의 부호부터 확인하고, 내 코드 안에서는
한 가지 규약만 쓴다.

</details>

<details>
<summary>prefix 로 쓸 VLM 층</summary>

마지막 층 hidden state 는 다음 text token 예측에 맞춰져 있어서 action 에 필요한 공간 정보가 덜 남아 있을 수 있다.
SmolVLA 는 VLM 의 앞 16 층까지만 쓰고(`num_vlm_layers=16`) 나머지는 버린다. `layer` 를 바꿔 가며 성공률을 비교해
볼 만하다.

</details>

<details>
<summary>SmolVLA 와 조건을 맞추는 법</summary>

LeRobot LIBERO 문서의 SmolVLA 학습 예시는 `--policy.type=smolvla --policy.load_vlm_weights=true` 로 사전학습 VLM 만 불러와
action expert 를 새로 학습하고, SmolVLA 의 기본 설정은 vision encoder 를 freeze 하고 action expert 만 학습한다. 내 모델과
조건이 비슷하므로 같은 episode 목록을 `--dataset.episodes` 로 넘기고 `--steps` 를 같게 둔다.

</details>

## 참고 자료

- Physical Intelligence, [π0 blog](https://www.pi.website/blog/pi0) 와 [FAST research page](https://www.pi.website/research/fast)
- Hugging Face blog, [π0 and π0-FAST](https://huggingface.co/blog/pi0) 와 [SmolVLA](https://huggingface.co/blog/smolvla)
- LeRobot [SmolVLA 문서](https://huggingface.co/docs/lerobot/smolvla)·[π₀-FAST 문서](https://huggingface.co/docs/lerobot/pi0fast)·[LIBERO 문서](https://huggingface.co/docs/lerobot/libero)
- openpi 의 [`pi0.py`](https://github.com/Physical-Intelligence/openpi/blob/main/src/openpi/models/pi0.py) 와 LeRobot 의 [`smolvlm_with_expert.py`](https://github.com/huggingface/lerobot/blob/main/src/lerobot/policies/smolvla/smolvlm_with_expert.py) — 막혔을 때만 열기

## 남은 한계

여기서 만든 policy 는 시연을 따라 하는 것만 배워서 시연보다 잘할 수 없고, 시연에 없던 실패에서 스스로 회복하는 법도 모른다.
실제 시도에서 얻은 reward 로 이 policy 를 더 다듬는 방법은 [VLA + RL](../vla-rl/README.md) 에서 다룬다.
