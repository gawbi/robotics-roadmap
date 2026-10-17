---
id: vla-rl
title: "VLA + RL"
branch: frontier
requires: [pi0, ppo]
hours: 40
summary: 시연으로 배운 VLA 의 RL fine-tuning
papers:
  - title: "Diffusion Policy Policy Optimization"
    authors: Allen Z. Ren et al.
    year: 2024
    url: https://arxiv.org/abs/2409.00588
  - title: "RLDG: Robotic Generalist Policy Distillation via Reinforcement Learning"
    authors: Charles Xu, Qiyang Li, Jianlan Luo, Sergey Levine
    year: 2024
    url: https://arxiv.org/abs/2412.09858
  - title: "ConRFT: A Reinforced Fine-tuning Method for VLA Models via Consistency Policy"
    authors: Yuhui Chen et al.
    year: 2025
    url: https://arxiv.org/abs/2502.05450
  - title: "VLA-RL: Towards Masterful and General Robotic Manipulation with Scalable Reinforcement Learning"
    authors: Guanxing Lu et al.
    year: 2025
    url: https://arxiv.org/abs/2505.18719
  - title: "What Can RL Bring to VLA Generalization? An Empirical Study"
    authors: Jijia Liu et al.
    year: 2025
    url: https://arxiv.org/abs/2505.19789
  - title: "ReinFlow: Fine-tuning Flow Matching Policy with Online Reinforcement Learning"
    authors: Tonghe Zhang, Chao Yu, Sichang Su, Yu Wang
    year: 2025
    url: https://arxiv.org/abs/2505.22094
  - title: "Steering Your Diffusion Policy with Latent Space Reinforcement Learning"
    authors: Andrew Wagenmaker et al.
    year: 2025
    url: https://arxiv.org/abs/2506.15799
  - title: "Flow Matching Policy Gradients"
    authors: David McAllister et al.
    year: 2025
    url: https://arxiv.org/abs/2507.21053
  - title: "SimpleVLA-RL: Scaling VLA Training via Reinforcement Learning"
    authors: Haozhan Li et al.
    year: 2025
    url: https://arxiv.org/abs/2509.09674
  - title: "πRL: Online RL Fine-tuning for Flow-based Vision-Language-Action Models"
    authors: Kang Chen et al.
    year: 2025
    url: https://arxiv.org/abs/2510.25889
  - title: "π*0.6: a VLA That Learns From Experience"
    authors: Physical Intelligence
    year: 2025
    url: https://arxiv.org/abs/2511.14759
---

# VLA + RL

## 배경

[π0](../pi0/README.md) 에서 만든 VLA 는 시연을 따라 하도록 학습해서 시연의 질을 넘기 어렵고, 시연에 없던 상태로 벗어나면 회복하는
법을 모른다. 성공했는지만 알려 주는 reward 로 policy 를 직접 개선하는 RL fine-tuning 은 이 두 한계를 겨냥하는데, 2024–2025 년에
나온 방법들은 policy 의 확률을 어떻게 다루는지에 따라 갈린다. action 을 token 으로 내는 VLA(OpenVLA 계열)는 token 의 log-prob 이 바로
나오므로 LLM 에서 쓰던 PPO·GRPO 를 거의 그대로 쓸 수 있고, VLA-RL·SimpleVLA-RL·RL4VLA(What Can RL Bring to VLA Generalization?)가
이 방식을 쓴다.

flow matching 으로 action 을 생성하는 π0 계열은 ODE 로 noise 를 action 으로 옮기기 때문에 생성된 action 의 likelihood 를 계산하기
어렵다. DPPO 는 DDPM 의 denoising step 을 그대로 Gaussian transition 으로 쓰고, ReinFlow·πRL 은 flow 의 적분 step 마다 Gaussian
noise 를 넣어 Gaussian transition 을 만든다. 두 경우 모두 $K$ step 짜리 denoising 경로의 log-likelihood 를 Gaussian
log-density 의 합으로 계산해 PPO 의 ratio 에 쓴다.

$$
\log\pi_\theta(a^{0:K}\mid o)=\sum_{k=0}^{K-1}\log\mathcal N\Big(a^{k+1};\ a^k + v_\theta(a^k,\tau_k,o)\,\Delta\tau,\ \sigma_k^2 I\Big)
$$

VLA 의 weight 를 아예 건드리지 않는 방법도 있다. DSRL 은 flow·diffusion policy 의 초기 noise $w$ 를 action 으로 보는 작은 policy
$\pi^w(w\mid o)$ 를 RL 로 학습해서, 같은 VLA 가 더 좋은 action chunk 를 내도록 noise 쪽에서 조종한다. 실물에서는 사람의 개입과 시연을
섞는 ConRFT, advantage 를 조건으로 넣어 학습하는 π\*0.6(RECAP) 같은 시스템이 나왔지만 어느 방법이 표준이 될지는 아직 정해지지 않았다.
논문들은 대부분 data-center GPU 여러 장으로 수십억 parameter VLA 를 학습하므로(SimpleVLA-RL 공개 코드는 80 GB A800 8 장 기준),
8 GB GPU 에서는 작은 VLA 를 고정하고 task 를 몇 개로 줄여 재현하는 정도가 현실적이다.

## 목표

- [π0](../pi0/README.md) 의 작은 VLA 를 LIBERO task 몇 개에 SFT 한 checkpoint 의 성공률을 기준선으로 잰다
- 성공 여부를 sparse reward 로 주는 rollout 환경과 평가 루프를 짠다
- 성공한 rollout 만 모아 다시 SFT 하는 filtered BC 를 가장 단순한 비교군으로 돌린다
- VLA 는 고정하고 초기 noise 만 고르는 DSRL 식 noise policy 를 [PPO](../ppo/README.md) 로 학습한다
- (선택) action expert 에 noise 를 주입해 PPO 로 직접 fine-tuning 하고 세 방법을 비교한다

**직접 짤 것**: rollout·reward·평가 루프, filtered BC, noise policy 와 그 학습 루프, (선택) denoising 경로 log-likelihood 와 PPO loss.
**가져다 써도 되는 것**: [π0](../pi0/README.md) 에서 만든 VLA, LeRobot 의 LIBERO 환경과 `lerobot/libero` dataset, 내 PPO 코드,
비교용 LeRobot SmolVLA checkpoint.

## 준비물

- Python 3.12, `torch`, LeRobot 소스 설치 후 `pip install -e ".[libero]"`, [π0](../pi0/README.md) 결과물
- LIBERO 는 Linux 가 필요하고, 모니터 없이 렌더링하려면 `MUJOCO_GL=egl` 을 쓴다
- GPU: 500M 이하 VLM 을 bf16 으로 고정하고 noise policy 나 action expert 만 학습하면 8 GB 에 들어간다. rollout 의 매 chunk 마다 VLA
  forward 가 필요해서 학습 시간이 sim 속도와 GPU 추론 속도에 묶이고, task 몇 개로 줄여도 실험 하나에 하루 가까이 걸릴 수 있다
- 7B 급 VLA 나 전체 parameter RL 은 80 GB 급 GPU 여러 장이 필요하므로 cloud GPU 를 빌려야 한다

## 진행 순서

1. LIBERO suite 하나에서 SFT 성공률이 30–70% 인 task 3–5 개를 고른다(이미 100% 에 가까운 task 는 개선할 여지가 없다)
2. 고정한 초기 상태와 seed 로 task 별 기준선 성공률을 잰다
3. action chunk 단위로 VLA 를 실행하고 성공하면 1, 아니면 0 을 주는 rollout 함수를 짠다
4. 성공한 episode 만 모아 SFT 를 다시 하는 filtered BC 를 2–3 번 반복한다
5. VLA 의 flow sampler 가 초기 noise $w$ 를 밖에서 받도록 고친다
6. VLM prefix feature 를 입력으로 $w$ 를 내는 Gaussian noise policy 와 value head 를 PPO 로 학습한다
7. SFT·filtered BC·noise policy 세 판의 성공률을 환경 step 축에 겹쳐 그린다
8. 학습에 쓰지 않은 LIBERO task 에서 성공률이 떨어지지 않았는지 잰다

## 시작점

```text
vla-rl/
├── config.py
├── env.py            # LIBERO wrapper with sparse success reward
├── rollout.py
├── filtered_bc.py
├── noise_policy.py   # DSRL-style latent-noise policy trained with PPO
├── flow_ppo.py       # (optional) PPO directly on the action expert
└── evaluate.py
```

```python
from dataclasses import dataclass
import torch
import torch.nn as nn

@dataclass
class Episode:
    feats: torch.Tensor          # (n_chunks, feat_dim) frozen VLM prefix features
    noises: torch.Tensor         # (n_chunks, chunk_len, act_dim) initial noise used per chunk
    chunks: torch.Tensor         # (n_chunks, chunk_len, act_dim) executed actions
    success: bool

class VLAPolicy(nn.Module):
    """the model from the pi0 project; frozen in the default setup"""
    def prefix_features(self, obs: dict, instruction: str) -> torch.Tensor: ...
    def sample_chunk(self, obs: dict, instruction: str, noise: torch.Tensor | None = None,
                     steps: int = 10) -> torch.Tensor:
        """integrate the flow from `noise` (drawn from N(0, I) if None) to an action chunk"""

class NoisePolicy(nn.Module):
    """pi^w(w | o): chooses the initial noise for the flow sampler"""
    def __init__(self, feat_dim: int, chunk_len: int, act_dim: int): ...
    def forward(self, feat: torch.Tensor) -> torch.distributions.Normal: ...
    def value(self, feat: torch.Tensor) -> torch.Tensor: ...

def rollout(env, vla: VLAPolicy, instruction: str, noise_policy: NoisePolicy | None = None,
            max_chunks: int = 50) -> Episode: ...

def success_rate(make_env, vla: VLAPolicy, task_ids: list[int], episodes_per_task: int = 20,
                 noise_policy: NoisePolicy | None = None, seed: int = 0) -> dict[int, float]: ...

def denoising_log_prob(vla: VLAPolicy, feat: torch.Tensor, path: torch.Tensor,
                       sigmas: torch.Tensor) -> torch.Tensor:
    """(optional) sum of per-step Gaussian log-densities along a noise-injected denoising path"""
```

## 평가 기준

- [ ] `sample_chunk` 에 같은 noise 를 넣으면 같은 action chunk 가 $10^{-5}$ 안에서 나온다(noise policy 가 기대는 성질)
- [ ] 학습에 쓴 task 의 평균 성공률을 noise policy 가 SFT 기준선보다 10%p 이상 올린다(task 마다 20 episode 이상으로 잰다)
- [ ] 같은 성공률 향상까지 필요한 환경 step 수를 filtered BC 와 noise policy 사이에서 비교한 표가 있다
- [ ] 학습에 쓰지 않은 task 의 성공률이 기준선 대비 5%p 넘게 떨어지지 않는다
- [ ] (선택) action expert 를 직접 PPO 로 학습한 판에서 SFT policy 와의 KL 이나 BC loss 를 함께 걸지 않으면 성공률이 급격히 떨어지는지 확인한다
- [ ] (선택) 같은 protocol 에 LeRobot 의 SmolVLA 를 기준선으로 넣어 모델 크기에 따라 개선 폭이 어떻게 달라지는지 본다

## 생각해 볼 질문

1. flow matching policy 는 sample 을 쉽게 뽑지만 그 action 의 log-likelihood 는 바로 계산하기 어렵다. 이것이 PPO 의 ratio 에서 왜
   문제가 되고, denoising step 마다 noise 를 넣으면 무엇을 얻고 무엇을 잃는가?
2. 성공 여부만 주는 sparse reward 에서 SFT 성공률이 0% 인 task 를 RL 로 개선할 수 있는가? 30% 인 task 와 무엇이 다른가?
3. noise 공간 RL 은 VLA 가 원래 낼 수 있는 action 분포 바깥으로 나가지 못한다. 이 제약은 장점인가 단점인가?

## 힌트

<details>
<summary>개선이 보이지 않을 때 먼저 볼 것</summary>

task 당 평가 episode 가 10 개면 성공 하나가 10%p 라서 작은 개선은 noise 에 묻힌다. 평가 수를 늘리고 초기 상태를 고정한 다음,
학습 batch 안에 reward 1 을 받은 episode 가 몇 개인지 센다. 성공이 거의 없으면 RL 이 배울 신호도 없다.

</details>

<details>
<summary>noise policy 의 출력 범위</summary>

VLA 는 학습 때 표준 Gaussian 에서 뽑은 noise 만 보았으므로 noise policy 가 $\lVert w\rVert$ 를 키우면 action 이 망가진다. 출력을
tanh 로 묶거나 $\mathrm{KL}\big(\pi^w(\cdot\mid o)\,\Vert\,\mathcal N(0,I)\big)$ 를 약한 penalty 로 둔다. noise policy 는 off-policy 로
학습해도 되므로, [DQN → SAC](../off-policy/README.md) 를 했다면 SAC 로 바꿔 sample efficiency 를 비교해 볼 수 있다.

</details>

<details>
<summary>8 GB 에 맞추는 법</summary>

VLM prefix 는 고정이므로 같은 관측의 prefix feature 는 한 번만 계산해 rollout 과 update 에서 함께 쓴다. 학습하는 parameter 는 noise
policy 나 action expert 뿐이라 optimizer state 도 작다. rollout 은 bf16 으로 추론하고, update 때는 작은 head 만 fp32 로 계산한다.

</details>

## 참고 자료

- [DSRL 프로젝트 페이지](https://diffusion-steering.github.io/) — π0 를 noise 공간에서 조종한 LIBERO·실물 결과
- [DPPO](https://diffusion-ppo.github.io/)·[ReinFlow](https://reinflow.github.io/)·[FPO](https://flowreinforce.github.io/) — diffusion·flow
  policy 를 policy gradient 로 학습하는 방법들의 프로젝트 페이지
- [RL4VLA 프로젝트 페이지](https://rlvla.github.io/) — OpenVLA 에 PPO·GRPO·DPO 를 비교한 empirical study
- [RLinf](https://github.com/RLinf/RLinf) — πRL 과 π0 용 DSRL 구현이 있는 VLA RL 프레임워크. 막혔을 때만 열기
- [SimpleVLA-RL](https://github.com/PRIME-RL/SimpleVLA-RL) — OpenVLA-OFT 를 LIBERO·RoboTwin 에서 RL 로 학습하는 코드. 필요한 GPU 규모를 가늠하는 용도
- [ConRFT 프로젝트 페이지](https://cccedric.github.io/conrft/)·Physical Intelligence [π\*0.6 블로그](https://www.physicalintelligence.company/blog/pistar06)
  — 실물 시도와 사람의 개입으로 VLA 를 다듬는 시스템
- LeRobot [LIBERO 문서](https://huggingface.co/docs/lerobot/libero) — 설치, 평가 protocol, dataset

## 남은 한계

이 과제는 sim 이 성공 여부를 바로 알려 주는 경우만 다룬다. 실물에서는 성공을 판정하는 reward model, 사람의 개입, 안전한 reset 까지
시스템 전체를 설계해야 한다. 다음 단계로 SO-101 같은 팔에 LeRobot 의 [HIL-SERL](https://huggingface.co/docs/lerobot/hilserl) 도구로
reward classifier 와 개입을 붙여 볼 수 있다.
