---
id: groot
title: GR00T N1
branch: vla
requires: [pi0]
hours: 3
summary: VLM 이 장면과 지시를 읽고 cross-attention 으로 이어진 diffusion transformer 가 flow matching 4 step 으로 action 16 개를 만드는 GR00T N1 의 구조, 로봇마다 따로 둔 encoder·decoder, action 이 없는 사람 영상·생성 영상·simulation 까지 쌓은 data pyramid, N1.5 이후의 변화
papers:
  - title: "GR00T N1: An Open Foundation Model for Generalist Humanoid Robots"
    authors: NVIDIA
    year: 2025
    url: https://arxiv.org/abs/2503.14734
  - title: "Latent Action Pretraining from Videos"
    authors: Seonghyeon Ye et al.
    year: 2024
    url: https://arxiv.org/abs/2410.11758
  - title: "DexMimicGen: Automated Data Generation for Bimanual Dexterous Manipulation via Imitation Learning"
    authors: Zhenyu Jiang et al.
    year: 2024
    url: https://arxiv.org/abs/2410.24185
---

# GR00T N1

## 학습 목표

- 사람 모양 로봇(humanoid)의 데이터가 왜 모자라고, GR00T N1 이 인터넷 영상·사람 영상·생성한 영상·simulation·실물 데이터를 어떤 층으로
  쌓아 이 문제를 다루는지 그림으로 설명할 수 있다
- 장면과 지시를 읽는 VLM(System 2)과 action 을 만드는 diffusion transformer(System 1)가 cross-attention 으로 이어진 구조를 그리고,
  π0 의 연결 방식과 무엇이 다른지 말할 수 있다
- 관절 수가 다른 여러 로봇을 한 모델로 학습하려고 로봇마다 작은 encoder 와 decoder 를 따로 두는 방법을, 0 을 채워 길이를 맞추는
  π0 의 방법과 숫자로 비교할 수 있다
- 무작위 숫자에서 출발해 4 번 고쳐 action 16 개를 만드는 계산과, 고치는 정도를 알려 주는 숫자 $\tau$ 가 network 에 들어가는 길을 작은
  숫자로 따라갈 수 있다
- action 이 적혀 있지 않은 영상에 latent action 과 inverse dynamics model 로 action 을 붙이는 과정을 설명할 수 있다
- 논문의 결과표에서 사전학습이 적은 데이터로 학습할 때 얼마나 도움이 되는지 읽고, N1.5·N1.6·N1.7 에서 바뀐 점을 정리할 수 있다

## humanoid 데이터의 부족

### 데이터 섬

[π0](../pi0/README.md) 는 Physical Intelligence 가 직접 모은 로봇 데이터 약 10,000 시간으로 사전학습했다. 사전학습(pre-training)은 여러
로봇과 여러 작업의 데이터를 섞어 먼저 학습해 두는 단계이고, 그다음 한 작업의 데이터로 조금 더 학습하는 단계를 fine-tuning 또는
post-training 이라고 불렀다. GR00T N1 은 NVIDIA 가 2025 년에 공개한 VLA(Vision-Language-Action model, 사진과 지시문을 읽고 로봇의
action 을 내는 모델)인데, 손가락이 달린 손(dexterous hand)으로 물건을 다루는 humanoid 를 주로 겨냥한다. humanoid 는 사람처럼 머리·몸통·두 팔·두 손을 가진
로봇이다.

humanoid 는 같은 데이터 문제를 더 심하게 겪는다. 글과 사진은 인터넷에 쌓여 있어서 언어 모델이나 VLM 은 그것을 모아 학습할 수 있지만,
humanoid 가 일한 기록은 인터넷에 없다. 로봇 데이터는 사람이 로봇을 직접 조종(teleoperation)해서 한 건씩 모아야 하고, 두 팔과 손가락까지
한꺼번에 조종하기는 팔 하나보다 훨씬 어렵다. 논문의 실물 데이터는 Fourier 라는 회사의 humanoid GR-1 을 조종해 모은 88 시간이었다.

여러 연구실의 로봇 데이터를 모은 Open X-Embodiment 같은 공개 데이터도 있지만, 로봇마다 관절 수·카메라 위치·명령을 내는 방식이 달라서
하나로 합치기 어렵다. 논문은 이 상태를 서로 이어지지 않은 "데이터 섬(data islands)" 이라고 불렀다.

| 데이터 | 양 | humanoid 에 맞는 정도 |
| --- | --- | --- |
| 인터넷 사진·글 | 매우 많다 | 로봇의 action 이 없다 |
| 사람이 일하는 영상 | 많다 | 몸은 비슷하지만 관절 각도가 적혀 있지 않다 |
| 다른 로봇의 데이터 | 중간 | action 은 있지만 몸의 구조가 다르다 |
| GR-1 을 조종한 데이터 | 88 시간 | 딱 맞는다 |

표의 아래로 갈수록 양은 줄고 humanoid 에 맞는 정도는 커진다. 많은 데이터는 맞지 않고, 맞는 데이터는 적다.

**확인 문제.** GR-1 을 조종한 데이터 88 시간을 1 초에 20 번씩 기록했다면 기록된 step 은 몇 개일까? 논문의 GR-1 조종은 20 Hz 로 돌았다.

<details><summary>답 보기</summary>

1 시간은 3600 초다.

$$
88 \times 3600 \times 20 = 6{,}336{,}000
$$

답: 약 634 만 step 이다. π0 의 약 10,000 시간과 비교하면 시간으로 $10{,}000 \div 88 \approx 114$ 배 적다.

</details>

### data pyramid

GR00T N1 은 성격이 다른 데이터를 한 곳에 섞되, 양과 몸의 일치도에 따라 세 층으로 나눠 생각한다. 논문은 이것을 data pyramid(데이터
피라미드)라고 불렀다.

- **바닥 — 인터넷 데이터와 사람 영상.** VLM 이 미리 학습한 인터넷 사진·글과, 사람이 머리에 카메라를 달고 요리·조립 같은 일을 찍은
  egocentric(1 인칭 시점) 영상이다. 양이 가장 많고, 물체를 어떻게 잡고 옮기는지에 대한 넓은 경험을 준다
- **가운데 — 만든 데이터.** 물리 simulation 으로 만든 로봇 기록과, 영상 생성 모델로 만든 로봇 영상이다. 사람이 조종하지 않아도
  컴퓨터 시간만 들이면 늘어난다
- **꼭대기 — 실물 로봇 데이터.** GR-1 을 직접 조종한 기록과 Open X-Embodiment 같은 공개 로봇 데이터다. 양은 가장 적지만 실제 몸으로
  실제 세상에서 움직인 기록이다

![GR00T N1 의 data pyramid. 바닥은 인터넷 데이터와 사람 영상(Ego4D 등 7 가지)으로 양이 가장 많고, 가운데는 simulation 기록(78 만 개)과 생성한 영상(827 시간), 꼭대기는 GR-1 조종 데이터(88 시간)와 공개 로봇 데이터다. 왼쪽 화살표는 위로 갈수록 양이 줄고, 오른쪽 화살표는 위로 갈수록 몸이 humanoid 에 가까워짐을 나타낸다](figures/data-pyramid.svg)

위 그림의 숫자는 논문에 적힌 값이고, 각 층을 만드는 방법은 [action 이 없는 데이터](#action-이-없는-데이터) 절에서 하나씩 본다. 아래층은
넓은 경험을, 위층은 실제 몸에 맞는 움직임을 주고, 모델 하나가 이 세 층을 함께 학습한다.

**확인 문제.** 사람이 부엌에서 요리하는 영상 1 만 시간과 GR-1 조종 데이터 10 시간은 각각 pyramid 의 어느 층이고, 각자 모자란 점은 무엇일까?

<details><summary>답 보기</summary>

| 데이터 | 층 | 모자란 점 |
| --- | --- | --- |
| 요리 영상 1 만 시간 | 바닥 | 로봇의 관절 각도(action)가 적혀 있지 않고, 사람 몸과 로봇 몸이 다르다 |
| GR-1 조종 10 시간 | 꼭대기 | 몸은 맞지만 양이 적어 다양한 물체와 장면을 다 담지 못한다 |

</details>

**요약**

- humanoid 의 작업 기록은 인터넷에 없고 사람이 한 건씩 조종해 모아야 해서, 논문의 GR-1 실물 데이터는 88 시간뿐이다
- 로봇마다 몸이 달라 공개 데이터도 서로 이어지지 않는 "데이터 섬" 이다
- GR00T N1 은 인터넷·사람 영상(바닥), 만든 데이터(가운데), 실물 로봇 데이터(꼭대기)를 data pyramid 로 쌓아 함께 학습한다

## System 2 와 System 1

### 두 부분과 주기

GR00T N1 은 π0 처럼 두 부분으로 되어 있다. 논문은 심리학자 Daniel Kahneman 이 사람의 생각을 천천히 따져 보는 System 2 와 빠르고
자동으로 반응하는 System 1 로 나눈 데서 이름을 빌려 왔다.

- **System 2 — VLM.** 카메라 사진과 지시문을 읽어 장면과 목표를 숫자 묶음으로 정리한다. NVIDIA 의 VLM 인 Eagle-2 를 쓰고, 논문에
  따르면 NVIDIA L40 GPU 에서 10 Hz 로 돈다
- **System 1 — diffusion transformer.** VLM 이 정리한 숫자와 로봇의 지금 관절 상태를 보고 action 덩어리(action chunk)를 만든다.
  flow matching 으로 학습했고, 논문은 120 Hz 로 action 을 낸다고 적었다

[π0](../pi0/README.md) 의 "느린 큰 모델과 빠른 행동 생성기" 에서 본 것처럼 큰 부분은 드물게, 작은 부분은 자주 돌린다. 공개한
GR00T-N1-2B 모델은 parameter(학습으로 정하는 숫자)가 모두 22 억(2.2B) 개이고 그중 13.4 억(1.34B) 개가 VLM 이다. action 16 개짜리
덩어리 하나를 만드는 데 L40 GPU 에서 63.9 ms 가 걸렸다.

| 부분 | 하는 일 | 크기 | 논문의 주기 |
| --- | --- | --- | --- |
| System 2 (Eagle-2 VLM) | 사진·지시문 읽기 | 13.4 억 | 10 Hz |
| System 1 (diffusion transformer 와 encoder·decoder) | action 덩어리 만들기 | $22 - 13.4 = 8.6$ 억 | 120 Hz |
| 합 | | 22 억 | |

![GR00T N1 의 구조. 왼쪽 위 카메라 사진은 사진마다 image token 64 개, 지시문은 text token 이 되어 Eagle-2 VLM 에 들어가고, VLM 의 12 번째 층 출력 φ 가 오른쪽 diffusion transformer 로 간다. 아래의 로봇 상태 q 는 로봇별 state encoder 를, noise 가 섞인 action 16 개와 τ 는 로봇별 action encoder 를 지나 diffusion transformer 에 들어간다. diffusion transformer 안에서는 cross-attention 과 self-attention 이 번갈아 있고, 끝의 로봇별 action decoder 가 속도 16 개를 낸다](figures/architecture.svg)

위 그림은 한 번의 계산에서 숫자가 흐르는 길이다. 파란 쪽이 System 2, 초록 쪽이 System 1 이고, 주황 상자는 로봇마다 따로 있는
부분이다. 기호는 논문을 따라 VLM 출력을 $\phi_t$("파이"), 로봇 상태를 $q_t$, noise 가 섞인 action 덩어리를 $A_t^\tau$ 로 쓴다.

**흔한 오해.** "System 2 와 System 1 은 따로 학습한 두 모델이다" 라고 생각하기 쉽다. 논문은 두 부분을 하나로 이어 함께 학습한다고
적었다. action 의 loss 에서 나온 gradient 가 System 1 을 지나 VLM 의 일부까지 거슬러 올라간다.

**확인 문제.** 덩어리 하나에 63.9 ms 가 걸린다면, 1 초 동안 덩어리를 최대 몇 번 만들 수 있을까? 덩어리 하나가 action 16 개라면 1 초에
만들 수 있는 action 은 최대 몇 개일까?

<details><summary>답 보기</summary>

① 1 초는 1000 ms 다.

$$
1000 \div 63.9 \approx 15.6
$$

② 덩어리마다 action 이 16 개다.

$$
15.6 \times 16 \approx 250
$$

답: 덩어리는 1 초에 약 15 번, action 은 약 250 개까지 만들 수 있다. 실제로는 덩어리의 앞부분만 실행하고 다시 만들기 때문에 이보다
적게 쓴다.

</details>

### Eagle-2 VLM 과 64 개의 image token

Eagle-2 는 사진을 token 으로 바꾸는 image encoder SigLIP-2 와 작은 언어 모델 SmolLM2 를 이어 붙여 인터넷의 사진·글로 학습한 VLM 이다.
[π0](../pi0/README.md) 의 PaliGemma 와 같은 종류이고 크기는 더 작다.

GR00T N1 은 사진을 $224 \times 224$ 크기로 줄여 넣고, 그 뒤 pixel shuffle 이라는 계산으로 사진 한 장을 image token 64 개로 만든다.
pixel shuffle 은 이웃한 token 넷($2 \times 2$)을 하나로 합치는 계산이다. 합친 token 은 네 token 의 숫자를 이어 붙여 길이가 네 배가 되므로,
숫자는 하나도 버리지 않으면서 token 의 개수만 4 분의 1 로 준다.

| 단계 | token 배치 | token 수 | token 하나의 숫자 수(예) |
| --- | --- | --- | --- |
| 합치기 전 | $16 \times 16$ | 256 | 1024 |
| $2 \times 2$ 씩 합친 뒤 | $8 \times 8$ | 64 | $4 \times 1024 = 4096$ |

표의 token 하나의 숫자 수 1024 는 계산을 보이려고 정한 값이다. token 수가 줄면 뒤의 언어 모델과 diffusion transformer 가 볼 token 이
줄어 계산이 빨라진다. π0 의 PaliGemma 는 사진 한 장을 token 256 개로 만들었으므로, GR00T N1 의 64 개는 그 4 분의 1 이다.

![pixel shuffle. 왼쪽 4×4 격자의 token 16 개를 2×2 씩 네 묶음으로 나누고, 묶음마다 token 네 개의 숫자 (a, b) 를 이어 붙여 길이 8 짜리 token 하나로 만든다. 오른쪽은 2×2 격자의 token 4 개다](figures/pixel-shuffle.svg)

위 그림은 $4 \times 4 = 16$ 개를 $2 \times 2 = 4$ 개로 줄이는 작은 예다. 실제 GR00T N1 은 같은 계산으로 사진 한 장을 64 개로 만든다.

**확인 문제.** 카메라 두 대의 사진을 함께 넣으면 image token 은 모두 몇 개일까? 같은 사진을 PaliGemma 처럼 장마다 256 개로 만들면?

<details><summary>답 보기</summary>

GR00T N1 은 $2 \times 64 = 128$ 개, 장마다 256 개면 $2 \times 256 = 512$ 개다. 같은 두 장을 4 분의 1 의 token 으로 넣는다.

</details>

### VLM 의 12 번째 층

VLM 의 언어 모델은 transformer 층을 여러 개 쌓은 구조라서, 사진·글 token 이 층을 하나 지날 때마다 새 숫자 묶음이 나온다. 보통은 맨
마지막 층의 출력을 쓰지만, GR00T N1 은 언어 모델의 가운데쯤인 12 번째 층의 출력을 꺼내 $\phi_t$ 로 쓴다.

논문은 마지막 층 대신 가운데 층을 쓰자 추론이 빨라지고 로봇 작업의 성공률도 올랐다고 적었다. 12 번째 층에서 멈추면 그 위의 층은
계산하지 않아도 되므로 빨라진다. 성공률이 오른 이유는 논문이 따로 밝히지 않았다.

| 쓰는 층 | 계산하는 층 | 논문의 결과 |
| --- | --- | --- |
| 마지막 층 | 언어 모델 전체 | 기준 |
| 12 번째 층 | 1 ~ 12 번째 층만 | 더 빠르고 성공률도 더 높다 |

**확인 문제.** 언어 모델이 층 24 개로 되어 있고 층마다 계산 시간이 같다면, 12 번째 층에서 멈출 때 언어 모델의 계산 시간은 전체의 몇 %일까?

<details><summary>답 보기</summary>

$12 \div 24 = 0.5$ 라서 50% 다. 층 수 24 는 계산을 보이려고 정한 값이다.

</details>

**요약**

- GR00T N1 은 사진·지시문을 읽는 Eagle-2 VLM(System 2, 13.4 억)과 action 덩어리를 만드는 diffusion transformer(System 1)로 된 22 억
  parameter 모델이고, 둘을 이어 함께 학습한다
- 사진 한 장은 pixel shuffle 로 image token 64 개가 된다. 이웃한 $2 \times 2$ token 을 이어 붙여 숫자는 그대로 두고 개수만 4 분의 1 로 줄인다
- VLM 의 마지막 층이 아니라 12 번째 층의 출력을 써서, 위 층의 계산을 건너뛰고 성공률도 높였다

## diffusion transformer

### cross-attention 으로 읽는 VLM 출력

System 1 이 VLM 의 정리를 읽는 방식이 π0 와 다르다. [π0](../pi0/README.md) 는 사진·지시문 token 과 로봇 상태·action token 을 한 줄로
이어 같은 self-attention 에 넣고, attention mask 로 누가 누구를 볼지 정했다. 두 부분이 transformer 의 같은 층에서 층마다 만나므로,
action expert 의 층 수가 VLM 과 같아야 했다.

GR00T N1 의 diffusion transformer 는 cross-attention 으로 VLM 출력을 읽는다. [Transformer](../transformer/README.md) 의 cross-attention 은
query 를 한쪽에서, key 와 value 를 다른 쪽에서 만드는 attention 이었다. 여기서는 query 를 action·상태 token 에서, key 와 value 를 VLM
출력 $\phi_t$ 에서 만든다. diffusion transformer 는 두 종류의 block 을 번갈아 쌓는다.

- **self-attention block** — 로봇 상태 token 과 noise 가 섞인 action token 16 개가 서로를 본다. 덩어리 안의 action 들이 서로 이어지게
  맞추는 자리다
- **cross-attention block** — action·상태 token 이 VLM 출력 $\phi_t$ 를 보고 필요한 내용을 가져온다. VLM 쪽은 action 을 보지 않는다

| | π0 | GR00T N1 |
| --- | --- | --- |
| VLM 과 만나는 곳 | 같은 self-attention 층 안 | 따로 둔 cross-attention block |
| VLM 의 어느 출력을 보나 | 층마다 그 층의 key·value | 12 번째 층 출력 $\phi_t$ 하나 |
| 두 부분의 층 구조 | 층 수를 맞춰야 한다 | 서로 맞출 필요가 없다 |
| VLM 쪽이 action 을 보나 | attention mask 로 막는다 | 구조상 볼 길이 없다 |

![π0 와 GR00T N1 의 연결 비교. 왼쪽 π0 는 VLM 의 층 1·2·3 과 action expert 의 층 1·2·3 이 같은 높이끼리 양쪽 화살표로 이어져 있다. 오른쪽 GR00T N1 은 VLM 의 12 번째 층 출력 φ 하나가 오른쪽 diffusion transformer 의 cross-attention block 마다 화살표로 들어가고, block 은 cross-attention 과 self-attention 이 번갈아 쌓여 있다](figures/attention-compare.svg)

위 그림처럼 π0 는 두 부분이 층마다 짝지어 있고, GR00T N1 은 VLM 출력 하나를 diffusion transformer 의 여러 층이 반복해서 읽는다. 논문은
이 방식이 VLM 과 action 모델의 구조를 서로 맞출 필요가 없어 바꿔 끼우기 쉽다고 적었다.

**확인 문제.** cross-attention block 에서 action token 하나가 VLM token 세 개를 본다. 관련도 비율이 0.5, 0.3, 0.2 이고 value 가 6, 2, 1 이면
가져오는 값은 얼마일까?

<details><summary>답 보기</summary>

비율대로 value 를 섞는다.

$$
0.5 \times 6 + 0.3 \times 2 + 0.2 \times 1 = 3 + 0.6 + 0.2 = 3.8
$$

답: 3.8 이다. query 는 action token 에서, key 와 value 는 VLM 출력에서 만들었다는 점만 self-attention 과 다르고 섞는 계산은 같다.

</details>

### 로봇마다 다른 encoder 와 decoder

로봇마다 상태와 action 의 숫자 개수가 다르다. 관절 6 개와 집게 하나짜리 팔은 7 개, 두 팔과 두 손에 허리·목까지 움직이는 GR-1 은
훨씬 많다. transformer 는 모든 token 의 길이가 같아야 하므로 길이를 맞추는 방법이 필요하다.

[π0](../pi0/README.md) 는 모든 로봇을 가장 큰 로봇에 맞춘 18 칸에 넣고 남는 칸을 0 으로 채웠다. GR00T N1 은 로봇마다 작은 MLP(입력마다
weight 를 곱해 더하는 층을 몇 개 쌓은 neural network)를 하나씩 둬서, 그 로봇의 숫자를 공통 길이의 token 으로 바꾼다. 상태를 바꾸는
state encoder, noise 가 섞인 action 을 바꾸는 action encoder, 마지막 출력을 그 로봇의 숫자로 되돌리는 action decoder 가 로봇마다 하나씩
있다. 논문은 이것을 embodiment-specific(몸마다 따로 둔) encoder·decoder 라고 불렀다. embodiment 는 "로봇의 몸" 이라는 뜻이다.

공통 길이를 4 로 줄인 작은 예로 보자. encoder 를 층 하나짜리 Linear layer 라고 하면, 입력 수가 $n$ 일 때 parameter 는
"입력 수 × 출력 수 + 출력 수(bias)" 로 $n \times 4 + 4$ 개다.

| 로봇 | 상태 숫자 수 | 자기 state encoder | encoder parameter | 나오는 token 길이 |
| --- | --- | --- | --- | --- |
| 팔 하나 (관절 6 + 집게 1) | 7 | Linear $7 \to 4$ | $7 \times 4 + 4 = 32$ | 4 |
| 팔 둘 (관절 12 + 집게 2) | 14 | Linear $14 \to 4$ | $14 \times 4 + 4 = 60$ | 4 |

두 로봇의 숫자는 길이가 7 과 14 로 달랐지만, 각자의 encoder 를 지나면 둘 다 길이 4 의 token 이 되어 같은 diffusion transformer 에 들어간다.
diffusion transformer 를 지난 뒤에는 거꾸로 각자의 action decoder 가 길이 4 의 token 을 7 개 또는 14 개의 숫자로 되돌린다.

![로봇마다 따로 둔 encoder 와 decoder. 위쪽 팔 하나 로봇의 숫자 7 개는 자기 encoder 를, 아래쪽 팔 둘 로봇의 숫자 14 개는 자기 encoder 를 지나 둘 다 길이 4 의 token 이 되고, 가운데의 공통 diffusion transformer 를 지난 뒤 각자의 decoder 가 다시 숫자 7 개와 14 개로 되돌린다. 아래 상자는 π0 처럼 18 칸에 맞추면 팔 하나 로봇은 11 칸이 0 이 됨을 보여 준다](figures/embodiment-mlp.svg)

위 그림처럼 로봇마다 다른 부분은 입구와 출구의 작은 MLP 뿐이고, 가운데의 큰 diffusion transformer 와 VLM 은 모든 로봇이 함께 쓴다.
새 로봇을 붙일 때는 그 로봇의 encoder 와 decoder 를 새로 만들어 학습하면 된다.

| 방법 | 숫자 7 개짜리 로봇의 입력 | 로봇이 늘 때 |
| --- | --- | --- |
| π0 의 0 채우기 | 18 칸 중 11 칸이 늘 0 | 가장 큰 로봇보다 큰 로봇은 넣을 수 없다 |
| GR00T N1 의 로봇별 MLP | 자기 encoder 로 바로 공통 길이 | encoder·decoder 를 하나씩 더한다 |

**흔한 오해.** "로봇마다 encoder 가 따로 있으니 로봇마다 모델을 따로 학습한다" 고 생각하기 쉽다. 따로 있는 것은 입구와 출구의 작은
MLP 뿐이고, 22 억 parameter 의 대부분인 VLM 과 diffusion transformer 는 모든 로봇의 데이터로 함께 학습한다.

**확인 문제.** 상태 숫자가 20 개인 로봇을 새로 붙인다. 위 예처럼 공통 길이 4 의 Linear layer 하나로 state encoder 를 만들면 parameter 는
몇 개이고, π0 처럼 18 칸에 맞추는 방법으로는 무엇이 문제일까?

<details><summary>답 보기</summary>

$20 \times 4 + 4 = 84$ 개다. 18 칸 방식은 숫자 20 개가 18 칸에 들어가지 않아 칸 수 자체를 늘리고 다시 학습해야 한다.

</details>

### denoising 단계를 알려 주는 adaptive layer norm

[π0](../pi0/README.md) 의 action expert 는 noise 가 섞인 action 과 함께 시각 $\tau$ 를 받았다. 같은 값이라도 $\tau$ 가 0 에 가까우면 아직
noise 가 많고 1 에 가까우면 거의 다 고쳐진 상태라서, 맞는 속도가 다르기 때문이다. GR00T N1 의 action encoder 도 π0 처럼 $\tau$ 를 noise 가
섞인 action 과 함께 받는다.

diffusion transformer 는 여기에 한 가지를 더한다. 이미지 생성용으로 나온 DiT(Diffusion Transformer)를 바탕으로, 층마다 adaptive layer
norm 으로 $\tau$ 를 다시 넣는다. [GPT-2](../gpt/README.md) 에서 본 LayerNorm 은 token 하나의 숫자들을 평균 0, 표준편차 1 로 맞춘 뒤 학습되는
두 숫자 $\gamma$("감마", 곱하는 수)와 $\beta$("베타", 더하는 수)로 다시 조절했다. adaptive layer norm 은 $\gamma$ 와 $\beta$ 를 고정된 숫자로
두지 않고, $\tau$ 를 넣은 작은 network 가 그때그때 만들어 낸다.

LayerNorm 으로 맞춘 숫자가 $(1,\ -1)$ 이라고 하자. $\tau$ 에 따라 작은 network 가 아래처럼 $\gamma$ 와 $\beta$ 를 냈다면 결과가 달라진다.
$\gamma$ 와 $\beta$ 의 값은 계산을 보이려고 정한 것이다.

| $\tau$ | $\gamma$ | $\beta$ | $\gamma \times (1,\ -1) + \beta$ |
| --- | --- | --- | --- |
| 0.25 (noise 가 많다) | 1.5 | 0.2 | $(1.5 + 0.2,\ -1.5 + 0.2) = (1.7,\ -1.3)$ |
| 0.75 (거의 다 고쳤다) | 0.5 | $-0.1$ | $(0.5 - 0.1,\ -0.5 - 0.1) = (0.4,\ -0.6)$ |

같은 입력 $(1,\ -1)$ 이 $\tau$ 에 따라 다른 값으로 바뀌어 다음 계산으로 넘어간다. 이렇게 하면 모든 층이 지금 몇 번째 고치는 중인지를
안다. 식으로 쓰면 아래와 같다.

$$
\mathrm{adaLN}(x, \tau) = \gamma(\tau) \times \mathrm{LN}(x) + \beta(\tau)
$$

$\mathrm{LN}(x)$ 는 LayerNorm 으로 맞춘 숫자, $\gamma(\tau)$ 와 $\beta(\tau)$ 는 "$\tau$ 를 넣어 만든 $\gamma$ 와 $\beta$" 로 읽는다. 표의
첫 줄에서 $\mathrm{LN}(x) = (1,\ -1)$, $\gamma(0.25) = 1.5$, $\beta(0.25) = 0.2$ 였다.

![diffusion transformer 의 block 하나. 위에서 들어온 action·상태 token 이 adaptive layer norm 과 cross-attention 을 지나며 옆의 VLM 출력 φ 를 읽고, 다시 adaptive layer norm 과 self-attention 을 지난다. 왼쪽의 τ 는 작은 network 를 지나 γ 와 β 가 되어 adaptive layer norm 마다 들어간다. 아래 상자는 LN 결과 (1, −1) 이 τ = 0.25 에서 γ 1.5, β 0.2 로 (1.7, −1.3) 이 되는 계산이다](figures/dit-block.svg)

**확인 문제.** LayerNorm 으로 맞춘 숫자가 $(2,\ 0)$ 이고 $\gamma = 0.5$, $\beta = 1$ 이면 adaptive layer norm 의 결과는?

<details><summary>답 보기</summary>

$$
0.5 \times (2,\ 0) + 1 = (1 + 1,\ 0 + 1) = (2,\ 1)
$$

답: $(2,\ 1)$ 이다.

</details>

**요약**

- diffusion transformer 는 self-attention block(action·상태 token 끼리)과 cross-attention block(action·상태 token 이 VLM 출력 $\phi_t$ 를 읽음)을
  번갈아 쌓는다. π0 처럼 두 부분의 층을 짝지을 필요가 없다
- 로봇마다 state encoder·action encoder·action decoder 라는 작은 MLP 를 따로 두어, 숫자 개수가 다른 로봇을 공통 길이의 token 으로 바꾼다
- 고치는 단계 $\tau$ 는 action encoder 에 들어가고, 층마다 adaptive layer norm 의 $\gamma(\tau)$·$\beta(\tau)$ 로도 들어간다

## flow matching 으로 만드는 action chunk

### π0 와 같은 식, 다른 숫자

GR00T N1 의 action 생성은 [π0](../pi0/README.md) 와 같은 flow matching 이다. 시연의 action 덩어리를 $A_t$, noise 를 $\epsilon$, 섞는 시각을
$\tau$ 라 하면 섞은 점, 학습의 loss, 만들 때의 Euler step 은 아래와 같다.

$$
A_t^\tau = \tau\,A_t + (1 - \tau)\,\epsilon
$$

$$
L = \big\lVert V_\theta(\phi_t,\ A_t^\tau,\ q_t) - (A_t - \epsilon) \big\rVert^2
$$

$$
A_t^{\tau + 1/K} = A_t^\tau + \frac{1}{K}\,V_\theta(\phi_t,\ A_t^\tau,\ q_t)
$$

첫 식은 "시연 덩어리에 $\tau$ 를, noise 에 $1 - \tau$ 를 곱해 더한 점" 이다. 둘째 식의 $V_\theta$ 는 weight 가 $\theta$ 인 diffusion transformer 가 낸
속도이고, VLM 출력 $\phi_t$, 섞은 점 $A_t^\tau$, 로봇 상태 $q_t$ 를 받는다. 이 속도와 정답 속도 $A_t - \epsilon$ 의 차이를 자리마다 제곱해 더한
값이 loss 다. 셋째 식은 지금 값에 속도의 $\frac{1}{K}$ 배를 더해 한 step 나아가는 Euler step 이고, $K$ 는 step 의 개수다. π0 와 비교하면
식은 같고 숫자가 다르다.

| | π0 | GR00T N1 |
| --- | --- | --- |
| 덩어리 길이 $H$ | 50 | 16 |
| Euler step 수 | 10 ($\delta = 0.1$) | $K = 4$ (한 step 길이 $\frac{1}{4} = 0.25$) |
| 속도를 내는 부분 | action expert | diffusion transformer $V_\theta$ |
| 학습에서 $\tau$ 를 뽑는 분포 | noise 쪽을 더 자주 뽑는 beta 분포 | π0 와 같은 분포 |

논문은 $K = 4$ 가 모든 로봇에서 잘 동작했다고 적었다. step 수가 적을수록 덩어리 하나를 만드는 시간이 짧다.

**흔한 오해.** 논문의 식 (1) 은 정답 속도를 $\epsilon - A_t$ 로 적었다. 그런데 같은 논문의 Euler 식은 $\tau = 0$ 의 noise 에서 출발해
$+\frac{1}{K} V_\theta$ 를 더해 가므로, 시연 쪽으로 가려면 속도가 $A_t - \epsilon$ 이어야 한다. 섞는 식을 $\tau$ 로 미분해도 $A_t - \epsilon$ 이
나온다. 공개 구현의 코드를 읽을 때는 noise 가 $\tau = 0$ 쪽인지 1 쪽인지부터 확인한다.

**확인 문제.** π0 는 덩어리마다 속도를 내는 부분을 10 번, GR00T N1 은 4 번 돌린다. 한 번 돌리는 데 5 ms 가 걸린다면 두 모델이 덩어리
하나에 쓰는 이 부분의 시간은 각각 얼마일까?

<details><summary>답 보기</summary>

π0 는 $10 \times 5 = 50$ ms, GR00T N1 은 $4 \times 5 = 20$ ms 다. 5 ms 는 계산을 보이려고 정한 값이다.

</details>

### Euler 4 step 의 손 계산

덩어리 16 개 × 숫자 여러 개를 다 적을 수 없으니 두 칸만 떼어 계산한다. 첫째 칸은 step $t$ 의 관절 1, 둘째 칸은 step $t + 1$ 의 관절 1
이라고 하자. 시연 값이 $A = (1.0,\ -0.5)$ 이고 뽑은 noise 가 $\epsilon = (-1.0,\ 0.5)$ 다. 학습이 잘 된 $V_\theta$ 가 정답 속도를 그대로
낸다고 하면 속도는 아래와 같다.

$$
A - \epsilon = (1.0 - (-1.0),\ -0.5 - 0.5) = (2.0,\ -1.0)
$$

한 step 의 길이는 $\frac{1}{4} = 0.25$ 라서 step 마다 $0.25 \times (2.0,\ -1.0) = (0.5,\ -0.25)$ 씩 움직인다.

| step | $\tau$ | 지금 값 | 속도 $V$ | $0.25 \times V$ | 새 값 |
| --- | --- | --- | --- | --- | --- |
| 1 | 0 | $(-1.0,\ 0.5)$ | $(2.0,\ -1.0)$ | $(0.5,\ -0.25)$ | $(-0.5,\ 0.25)$ |
| 2 | 0.25 | $(-0.5,\ 0.25)$ | $(2.0,\ -1.0)$ | $(0.5,\ -0.25)$ | $(0,\ 0)$ |
| 3 | 0.5 | $(0,\ 0)$ | $(2.0,\ -1.0)$ | $(0.5,\ -0.25)$ | $(0.5,\ -0.25)$ |
| 4 | 0.75 | $(0.5,\ -0.25)$ | $(2.0,\ -1.0)$ | $(0.5,\ -0.25)$ | $(1.0,\ -0.5)$ |

4 step 뒤에 시연 값 $(1.0,\ -0.5)$ 에 정확히 닿았다. 3 번째 step 이 시작할 때의 값 $(0,\ 0)$ 은 섞는 식에 $\tau = 0.5$ 를 넣은
$0.5 \times (1.0,\ -0.5) + 0.5 \times (-1.0,\ 0.5) = (0,\ 0)$ 과 같다. 기호와 맞추면 $\epsilon$ 은 첫 줄의 $(-1.0,\ 0.5)$, $\frac{1}{K}$ 는 0.25,
$V_\theta$ 는 속도 열, $A_t^1$ 은 마지막 열의 $(1.0,\ -0.5)$ 다.

![두 칸짜리 덩어리의 Euler 4 step. 가로축은 τ 이고, 첫째 칸은 −1.0 에서 출발해 step 마다 0.5 씩 올라 1.0 에, 둘째 칸은 0.5 에서 출발해 step 마다 0.25 씩 내려 −0.5 에 닿는다. τ = 0, 0.25, 0.5, 0.75, 1 의 값이 점으로 찍혀 있다](figures/euler-4step.svg)

정답이 하나뿐이라 속도가 줄곧 같았으므로 4 step 으로도 정확히 닿았다. π0 강의의 "봉우리가 둘인 시연의 Euler 계산" 에서 본 것처럼, 정답이
여럿으로 갈리는 자리에서는 step 수가 너무 적으면 두 정답의 평균에 머물 수 있다. GR00T N1 은 실험으로 4 step 이면 충분하다고 보았다.

**확인 문제.** $\epsilon = (2.0,\ 0)$, $A = (0,\ 1.0)$ 이고 network 가 정답 속도를 낸다. Euler 4 step 중 2 step 뒤의 값은?

<details><summary>답 보기</summary>

① 속도는 $A - \epsilon$ 이다.

$$
(0 - 2.0,\ 1.0 - 0) = (-2.0,\ 1.0)
$$

② step 마다 $0.25 \times (-2.0,\ 1.0) = (-0.5,\ 0.25)$ 씩 움직인다.

| step | 지금 값 | 더하는 양 | 새 값 |
| --- | --- | --- | --- |
| 1 | $(2.0,\ 0)$ | $(-0.5,\ 0.25)$ | $(1.5,\ 0.25)$ |
| 2 | $(1.5,\ 0.25)$ | $(-0.5,\ 0.25)$ | $(1.0,\ 0.5)$ |

답: $(1.0,\ 0.5)$ 다. 섞는 식에 $\tau = 0.5$ 를 넣은 $0.5 \times (0,\ 1.0) + 0.5 \times (2.0,\ 0) = (1.0,\ 0.5)$ 와 같다.

</details>

### 덩어리 16 개와 실행하는 개수

덩어리 길이 $H = 16$ 은 [ACT](../act/README.md) 에서 온 action chunking 이다. 로봇 step $t$ 에서 앞으로의 action 16 개를 한꺼번에 만든다.

$$
A_t = [a_t,\ a_{t+1},\ \ldots,\ a_{t+15}]
$$

덩어리 16 개가 몇 초 분량인지는 로봇의 제어 주기에 달려 있다. 제어 주기는 1 초에 명령을 몇 번 새로 보내는지를 뜻한다.

| 로봇의 제어 주기 | action 하나의 시간 | 덩어리 16 개 | 앞 8 개만 실행할 때 |
| --- | --- | --- | --- |
| 20 Hz | $1 \div 20 = 0.05$ 초 | $16 \times 0.05 = 0.8$ 초 | 0.4 초 |
| 30 Hz | $1 \div 30 \approx 0.033$ 초 | $16 \div 30 \approx 0.53$ 초 | $8 \div 30 \approx 0.27$ 초 |

π0 가 50 개 중 25 개만 실행하고 다시 추론했듯이, GR00T 도 덩어리의 앞부분만 실행하고 새 덩어리를 만드는 방식으로 쓴다. 공개 구현의
예시 명령은 덩어리 16 개 중 8 개를 실행하도록 되어 있다. 실행하는 개수가 적을수록 새 사진을 자주 보지만, 그 시간 안에 다음 덩어리의
계산이 끝나야 로봇이 멈추지 않는다.

**확인 문제.** 덩어리 하나를 만드는 데 105 ms 가 걸리는 컴퓨터로 30 Hz 로봇을 움직인다. 앞 8 개를 실행하는 동안 다음 덩어리를 계산하면
시간이 충분할까?

<details><summary>답 보기</summary>

① 8 개를 실행하는 시간은 $8 \div 30 \approx 0.267$ 초, 곧 약 267 ms 다.

② 계산 시간 105 ms 는 267 ms 보다 짧다.

답: 충분하다. 실행하는 동안 다음 덩어리 계산을 시작하면 멈춤 없이 이어진다.

</details>

**요약**

- GR00T N1 의 flow matching 은 π0 와 같은 식 $A_t^\tau = \tau A_t + (1 - \tau)\epsilon$ 이고, 덩어리 길이 $H = 16$, Euler step $K = 4$ 다
- $\epsilon = (-1.0,\ 0.5)$ 에서 step 마다 $(0.5,\ -0.25)$ 씩 4 번 움직여 $(1.0,\ -0.5)$ 에 닿는다
- 덩어리 16 개는 20 Hz 로봇에서 0.8 초, 30 Hz 로봇에서 약 0.53 초 분량이고, 앞부분만 실행한 뒤 다시 만든다

## action 이 없는 데이터

### latent action

data pyramid 의 바닥인 사람 영상에는 관절 각도가 적혀 있지 않다. flow matching 의 loss 는 정답 action 덩어리 $A_t$ 가 있어야 계산되므로,
영상만으로는 학습할 수 없다. GR00T N1 은 LAPA(Latent Action Pretraining) 연구의 방법으로 영상에서 "action 비슷한 숫자" 를 뽑아 정답
자리에 쓴다. 이 숫자를 latent action 이라고 한다. latent 는 "겉으로 드러나지 않은" 이라는 뜻으로, [VAE](../vae/README.md) 의 latent 처럼
사람이 정하지 않고 모델이 스스로 찾은 숫자라는 뜻이다.

latent action 은 영상의 두 장면으로 학습한 autoencoder 에서 나온다. [VAE](../vae/README.md) 의 autoencoder 는 입력을 encoder 로 줄였다가
decoder 로 되살리며 학습했다. 여기서는 encoder 와 decoder 가 이렇게 일한다.

- **encoder** — 지금 장면 $x_t$ 와 $H$ step 뒤의 장면 $x_{t+H}$ 를 함께 보고 숫자 묶음 $z_t$ 를 낸다
- **decoder** — 지금 장면 $x_t$ 와 $z_t$ 만 보고 $H$ step 뒤의 장면 $x_{t+H}$ 를 되살린다

decoder 는 지금 장면을 이미 받았으므로, $z_t$ 에는 "두 장면 사이에 무엇이 바뀌었나", 곧 움직임이 담기도록 학습된다. 다만 $z_t$ 에
제한이 없으면 encoder 가 미래 장면 전체를 그대로 $z_t$ 에 담아 넘길 수도 있다. 그래서 VQ-VAE(vector quantized VAE)라는 방식으로 $z_t$ 가
가질 수 있는 값을 몇 개로 제한한다.

VQ-VAE 는 미리 정한 개수의 vector 를 담은 표, codebook 을 둔다. encoder 가 낸 숫자 묶음은 codebook 안에서 가장 가까운 vector 로 바뀐 뒤
decoder 로 간다. 가까운 정도는 자리마다 차이를 제곱해 더한 값으로 잰다. codebook 에 vector 가 셋 있고 encoder 가 $e = (0.8,\ 0.3)$ 을 냈다고
하자. codebook 의 vector 와 그 뜻은 계산을 보이려고 정한 것이다.

| codebook vector | 뜻(예) | $e = (0.8,\ 0.3)$ 과의 거리 |
| --- | --- | --- |
| $c_1 = (1,\ 0)$ | 손이 오른쪽으로 | $(0.8 - 1)^2 + (0.3 - 0)^2 = 0.04 + 0.09 = 0.13$ |
| $c_2 = (-1,\ 0)$ | 손이 왼쪽으로 | $(0.8 + 1)^2 + (0.3 - 0)^2 = 3.24 + 0.09 = 3.33$ |
| $c_3 = (0,\ 1)$ | 손이 위로 | $(0.8 - 0)^2 + (0.3 - 1)^2 = 0.64 + 0.49 = 1.13$ |

가장 가까운 것은 거리 0.13 의 $c_1$ 이라서 decoder 는 $c_1 = (1,\ 0)$ 을 받는다. 이런 VQ-VAE 를 사람 영상과 로봇 영상을 섞어 학습하면,
몸이 달라도 같은 움직임은 같은 codebook vector 근처로 모인다. 논문의 그림 4 는 사람과 로봇 8 가지 몸에서 "오른팔을 왼쪽으로" 와
"오른팔을 오른쪽으로" 가 각각 비슷한 latent action 으로 묶인 예를 보여 준다.

![latent action 을 만드는 VQ-VAE. 지금 장면 x_t 와 H step 뒤 장면 x_{t+H} 가 encoder 에 들어가 e = (0.8, 0.3) 이 나오고, codebook 의 세 vector 중 가장 가까운 c₁ = (1, 0) 으로 바뀐다. decoder 는 x_t 와 c₁ 을 받아 x_{t+H} 를 되살린다. 학습이 끝나면 encoder 의 출력 e 를 latent action 정답으로 쓴다](figures/latent-action.svg)

학습이 끝나면 encoder 만 떼어 쓴다. 영상의 두 장면 $(x_t,\ x_{t+H})$ 를 넣고, codebook 으로 바꾸기 전의 숫자 $e$ 를 그 구간의 latent action
으로 삼는다. 위 예라면 $(0.8,\ 0.3)$ 이 정답 자리에 들어간다. GR00T N1 은 이 숫자를 flow matching 의 정답 $A_t$ 처럼 쓰되, latent action 을
"LAPA" 라는 이름의 또 하나의 몸(embodiment)으로 취급해 자기 encoder·decoder 를 따로 둔다.

**흔한 오해.** "latent action 은 로봇의 관절 각도로 바꿔 쓸 수 있다" 고 생각하기 쉽다. latent action 은 영상의 움직임을 요약한 숫자일 뿐
어느 로봇의 관절 각도도 아니다. 그래서 따로 둔 "LAPA" 몸의 decoder 로만 나오고, 실제 로봇의 action 은 그 로봇의 데이터로 학습한 decoder
가 낸다.

**확인 문제.** 같은 codebook 에서 encoder 가 $e = (-0.6,\ 0.6)$ 을 냈다. 가장 가까운 vector 는 무엇일까?

<details><summary>답 보기</summary>

| vector | 거리 |
| --- | --- |
| $c_1 = (1,\ 0)$ | $(-0.6 - 1)^2 + 0.6^2 = 2.56 + 0.36 = 2.92$ |
| $c_2 = (-1,\ 0)$ | $(-0.6 + 1)^2 + 0.6^2 = 0.16 + 0.36 = 0.52$ |
| $c_3 = (0,\ 1)$ | $0.6^2 + (0.6 - 1)^2 = 0.36 + 0.16 = 0.52$ |

답: $c_2$ 와 $c_3$ 가 0.52 로 같아서 둘 다 가장 가깝다. 실제 구현은 이런 동점을 정한 규칙(예: 먼저 나온 번호)으로 하나를 고른다.

</details>

### inverse dynamics model

latent action 과 다른 방법으로, 실물 로봇 데이터로 학습한 inverse dynamics model(IDM)을 쓴다. 지금 상태와 action 을 받아 다음 상태를
맞히는 모델을 dynamics model 이라고 하는데, inverse dynamics model 은 그 반대로 지금 장면과 나중 장면을 받아 그사이의 action 을 맞힌다.

| 모델 | 입력 | 출력 |
| --- | --- | --- |
| dynamics model | 지금 장면, action | 나중 장면 |
| inverse dynamics model | 지금 장면, 나중 장면 | 그사이의 action 덩어리 |

GR00T N1 의 IDM 은 System 1 과 같은 diffusion transformer 구조에 SigLIP-2 image encoder 를 붙여, 두 장면을 보고 그사이의 action 덩어리를
flow matching 으로 만들도록 학습했다. 실물 로봇 데이터에는 장면과 action 이 함께 있으니 정답을 줄 수 있다. 학습한 IDM 을 action 이
없는 영상에 대면 영상의 두 장면 사이에 들어갈 그럴듯한 action 이 나오고, 이것을 pseudo-action(가짜 정답 action)이라고 한다.

| | latent action | IDM pseudo-action |
| --- | --- | --- |
| 학습에 필요한 것 | 영상만 | 장면과 action 이 함께 있는 로봇 데이터 |
| 나오는 숫자 | 어느 로봇의 action 도 아닌 움직임 요약 | 그 로봇의 action 형식 |
| 쓰는 곳 | 사람 영상, 생성한 영상, 로봇 영상 | 생성한 로봇 영상 |

논문은 RoboCasa simulation 에서 두 방법을 비교했다. 작업마다 시연이 30 개뿐일 때는 latent action 이 조금 나았고, 100 개·300 개로 늘면
IDM 이 더 나았다. IDM 을 학습할 로봇 데이터가 많을수록 pseudo-action 이 실제 action 에 가까워지기 때문이라고 논문은 설명했다.

**확인 문제.** 사람이 컵을 옮기는 영상에 GR-1 로봇 데이터로 학습한 IDM 을 대면 어떤 문제가 생길 수 있을까?

<details><summary>답 보기</summary>

IDM 은 GR-1 의 몸이 찍힌 장면과 그 action 으로만 학습했으므로, 사람 손이 찍힌 장면은 학습 때 본 적이 없다. 그래서 그럴듯하지 않은
action 을 낼 수 있다. GR00T N1 도 사람 영상에는 latent action 만 붙이고, IDM 은 로봇이 찍힌 생성 영상에 썼다.

</details>

### 생성한 영상으로 만든 neural trajectory

data pyramid 의 가운데 층 하나는 영상 생성 모델로 만든 로봇 영상이다. 논문은 이것을 neural trajectory(neural network 가 만든 기록)라고
불렀다. 사진 한 장과 지시문을 받아 그다음 영상을 만드는 image-to-video 모델을 GR-1 조종 데이터 88 시간으로 fine-tuning 하고, 기록의 첫
장면과 새로운 지시문을 넣어 영상을 만든다. 같은 첫 장면에서 "사과를 왼쪽 접시에" 대신 "사과를 오른쪽 바구니에" 처럼 실제로 찍지 않은
경우를 만들 수 있다.

| 단계 | 하는 일 |
| --- | --- |
| ① 지시문 늘리기 | 큰 multimodal LLM 이 첫 장면의 물체를 찾고, 물리적으로 가능한 "pick up {물체} from {A} to {B}" 조합을 만든다 |
| ② 영상 만들기 | fine-tuning 한 image-to-video 모델이 첫 장면과 새 지시문으로 영상을 만든다 |
| ③ 걸러 내기 | multimodal LLM 이 영상에서 뽑은 8 장을 보고 지시문대로 했는지 판정해 맞지 않는 영상을 거른다 |
| ④ action 붙이기 | 남은 영상에 latent action 과 IDM pseudo-action 을 붙인다 |

이렇게 88 시간이던 실물 데이터에 생성 영상 827 시간을 더했다. 논문은 이것을 약 10 배로 늘렸다고 적었다. 영상 1 초를 만드는 데 L40 GPU 로
2 분이 걸려서, 모두 약 10 만 5 천 GPU 시간이 들었고 L40 3,600 장으로 약 1.5 일에 만들었다.

![neural trajectory 를 만드는 과정. GR-1 조종 데이터 88 시간으로 image-to-video 모델을 fine-tuning 하고, 기록의 첫 장면과 새 지시문으로 영상 827 시간을 만든다. multimodal LLM 이 지시문대로 했는지 걸러 낸 뒤, latent action 과 IDM 이 action 을 붙여 학습 데이터가 된다](figures/neural-trajectory.svg)

**확인 문제.** 827 시간은 88 시간의 몇 배일까? 영상 1 초에 GPU 2 분이 걸린다면, 영상 1 시간을 만드는 데는 GPU 몇 시간이 걸릴까?

<details><summary>답 보기</summary>

① 배수다.

$$
827 \div 88 \approx 9.4
$$

② 영상 1 시간은 3600 초이고 1 초마다 2 분이다.

$$
3600 \times 2 = 7200 \text{ 분} = 7200 \div 60 = 120 \text{ 시간}
$$

답: 약 9.4 배이고, 영상 1 시간에 GPU 120 시간이 걸린다.

</details>

### simulation 으로 늘린 시연

가운데 층의 다른 하나는 simulation 기록이다. GR00T N1 은 DexMimicGen 이라는 도구로, 사람이 simulation 안에서 조종한 시연 수십 개를 수십만
개로 늘렸다.

1. 사람의 시연을 물체 하나씩을 다루는 작은 구간으로 나눈다. "사과를 집는다", "접시 위에 놓는다" 처럼 나눈다
2. 새 환경에서 물체가 놓인 자리에 맞춰 구간을 옮긴다. 손끝과 물체 사이의 상대 위치는 그대로 두므로, 사과가 10 cm 오른쪽에 있으면 집는
   동작 전체가 10 cm 오른쪽으로 옮겨 간다
3. 지금 자세에서 옮긴 구간의 시작까지는 그 사이를 이어 주는 움직임을 끼워 넣는다
4. simulation 에서 끝까지 실행해 보고 작업에 성공한 기록만 남긴다

![DexMimicGen 이 시연을 늘리는 과정. 사람의 시연 하나가 물체마다의 구간으로 나뉘고, 새 장면에서는 사과가 10 cm 오른쪽에 있어 집는 구간 전체가 10 cm 오른쪽으로 옮겨진다. 구간 사이는 이어 주는 움직임으로 메우고, simulation 에서 실행해 성공한 기록만 남긴다](figures/dexmimicgen.svg)

논문은 사전학습과 post-training 을 합쳐 simulation 기록 78 만 개를 11 시간 만에 만들었고, 사람이 조종했다면 6,500 시간, 쉬지 않고 9 개월이
걸렸을 양이라고 적었다. 사전학습용으로는 출발 그릇과 도착 그릇 종류의 조합 54 가지마다 10,000 개씩, 54 만 개를 만들었다.

**확인 문제.** 기록 78 만 개가 사람 조종 6,500 시간에 해당한다면 기록 하나는 평균 몇 초일까?

<details><summary>답 보기</summary>

① 6,500 시간을 초로 바꾼다.

$$
6500 \times 3600 = 23{,}400{,}000 \text{ 초}
$$

② 기록 수로 나눈다.

$$
23{,}400{,}000 \div 780{,}000 = 30
$$

답: 기록 하나는 평균 30 초다.

</details>

**요약**

- 사람 영상에는 VQ-VAE 의 encoder 로 두 장면 사이의 움직임을 요약한 latent action 을 붙이고, "LAPA" 라는 또 하나의 몸으로 학습한다
- 실물 로봇 데이터로 학습한 inverse dynamics model 은 두 장면 사이의 action 을 맞혀 생성한 로봇 영상에 pseudo-action 을 붙인다
- 영상 생성 모델로 88 시간의 실물 데이터에 827 시간의 영상을 더했고, DexMimicGen 으로 simulation 기록 78 만 개를 11 시간에 만들었다

## 사전학습과 post-training

### 학습의 설정

사전학습은 data pyramid 의 세 층을 모두 섞어 flow matching loss 로 한다. 데이터마다 정답 자리에 들어가는 것이 다르다.

| 데이터 | flow matching 의 정답 |
| --- | --- |
| 사람 영상 | latent action |
| GR-1·Open X-Embodiment 같은 로봇 데이터 | 실제 action 과 latent action 둘 다 |
| 생성한 로봇 영상 | latent action 과 IDM pseudo-action |
| simulation 기록 | 실제 action |

부록의 설정에 따르면 사전학습은 한 step 에 예시 16,384 개를 묶어 200,000 step 학습했고, H100 GPU 를 최대 1,024 장까지 써서 GPU 시간이
약 5 만 시간 들었다. 사전학습과 post-training 모두 VLM 의 언어 모델 부분은 얼려 두고(weight 를 고치지 않고) 나머지를 학습한다.

post-training 은 로봇 하나의 데이터로 한다. 데이터가 적을 때 지나치게 외우지 않도록 한 step 에 128 개 또는 1,024 개로 묶어 20,000 ~ 60,000
step 학습한다. 논문은 GPU 한 장(A6000)으로도 해 봤는데, 로봇별 encoder·decoder 와 diffusion transformer 만 학습하면 한 step 에 200 개까지,
image encoder 까지 학습하면 16 개까지 넣을 수 있었다.

| | 사전학습 | post-training |
| --- | --- | --- |
| 데이터 | 세 층을 모두 섞음 | 로봇 하나 |
| 한 step 의 예시 수 | 16,384 | 128 또는 1,024 |
| step 수 | 200,000 | 20,000 ~ 60,000 |
| 얼려 두는 부분 | VLM 의 언어 모델 | VLM 의 언어 모델 |

부록에 따르면 학습에는 flow matching loss 말고 loss 가 하나 더 있다. 지시문이 가리키는 물체가 사진의 어디 있는지를 맞히는 loss 다.
물체 검출 모델로 표시한 물체 상자의 가운데 좌표를 정답으로 두고, VLM 출력 위에 붙인 Linear layer 가 그 좌표를 맞히게 한다. 전체 loss 는
두 loss 의 합 $L = L_{fm} + L_{det}$ 이다.

**확인 문제.** 사전학습 한 step 에 예시 16,384 개, 모두 200,000 step 이면 학습에 쓴 예시는 모두 몇 개일까? 같은 예시가 여러 번 쓰여도
따로 센다.

<details><summary>답 보기</summary>

$$
16{,}384 \times 200{,}000 = 3{,}276{,}800{,}000
$$

답: 약 33 억 개다.

</details>

### 적은 데이터에서의 결과

사전학습이 쓸모 있는지는 post-training 데이터가 적을 때 잘 드러난다. 논문은 GR-1 실물 작업에서 GR00T N1 과, 사전학습 없이 그 작업
데이터로만 처음부터 학습한 Diffusion Policy 를 비교했다. 데이터는 작업마다 모은 시연 전체와, 그중 10% 만 쓴 경우 두 가지다.

| 모델 | 데이터 10% | 데이터 전체 |
| --- | --- | --- |
| Diffusion Policy | 10.2% | 46.4% |
| GR00T-N1-2B | 42.6% | 76.8% |

표는 네 종류 작업(물건을 그릇에 옮기기, 물건을 서랍·상자에 넣고 닫기, 공장 물건 다루기, 두 로봇의 협동)의 평균 성공률이다. GR00T N1 은 데이터 10% 만으로
42.6% 에 닿아, 데이터 전체를 쓴 Diffusion Policy 의 46.4% 와 $46.4 - 42.6 = 3.8$%p 차이밖에 나지 않았다. %p(퍼센트포인트)는 두 % 값의
차이를 뺄셈으로 잰 단위다.

![GR-1 실물 작업의 평균 성공률. 데이터 10% 에서 Diffusion Policy 10.2%, GR00T N1 42.6%, 데이터 전체에서 Diffusion Policy 46.4%, GR00T N1 76.8% 를 막대로 비교한다. 10% 의 GR00T N1 막대와 전체의 Diffusion Policy 막대 사이에 3.8%p 차이가 표시되어 있다](figures/real-results.svg)

simulation 세 곳에서도 작업마다 시연 100 개로 학습했을 때 평균 성공률이 Diffusion Policy 33.4%, GR00T N1 45.0% 였다. 논문은 post-training
데이터가 아주 많아지면 사전학습의 효과가 줄어드는 것이 자연스럽다고도 적었다.

생성한 영상을 post-training 에 섞은 효과도 실험했다. 실물 데이터와 생성 영상을 1 : 1 로 섞어 학습하자, RoboCasa 에서는 작업당 시연
30·100·300 개일 때 평균 성공률이 각각 4.2·8.8·6.8%p 올랐고, GR-1 실물 작업 8 가지에서는 평균 5.8%p 올랐다.

**확인 문제.** 데이터 10% 에서 데이터 전체로 늘렸을 때 성공률이 오른 폭은 두 모델이 각각 몇 %p 일까?

<details><summary>답 보기</summary>

| 모델 | 전체 − 10% |
| --- | --- |
| Diffusion Policy | $46.4 - 10.2 = 36.2$%p |
| GR00T-N1-2B | $76.8 - 42.6 = 34.2$%p |

답: 오른 폭은 비슷하지만, GR00T N1 은 출발점(10% 의 42.6%)이 이미 훨씬 높다. 사전학습의 효과는 데이터가 적을 때 가장 크게 보인다.

</details>

### post-training 이 지운 행동

사전학습만 마친 모델은 지시에 맞춰 여러 행동을 꺼내 쓴다. 논문은 사전학습 모델에게 "빨간 사과를 집어 바구니에 넣어라" 를 시키면서 사과를
일부러 왼손 쪽에 두었다. 사전학습 모델은 왼손으로 사과를 집어 오른손에 건넨 뒤 바구니에 넣었다. 움직임은 덜 매끄러웠지만 작업을
해냈다.

같은 작업으로 post-training 한 모델은 이 상황에서 실패했다. post-training 데이터에는 오른손만 쓰는 시연뿐이고 손을 바꿔 건네는 장면이
없었기 때문이다. 좁은 데이터로 더 학습하면 그 작업은 매끄럽게 잘하게 되지만, 그 데이터에 없는 행동은 잊을 수 있다.

| 모델 | 사과가 왼손 쪽일 때 | 움직임 |
| --- | --- | --- |
| 사전학습만 | 왼손 → 오른손으로 건네 성공 | 덜 매끄럽다 |
| post-training 후 | 실패 | 오른손 시연을 매끄럽게 따른다 |

**확인 문제.** post-training 데이터를 모을 때 위 실패를 막으려면 어떤 시연을 넣어야 할까?

<details><summary>답 보기</summary>

사과가 왼손 쪽에 있어 왼손으로 집고 오른손에 건네는 시연을 함께 넣는다. post-training 데이터에 있는 행동만 확실히 남으므로, 실제로
만날 상황을 시연에 고르게 담아야 한다.

</details>

**요약**

- 사전학습은 세 층의 데이터를 정답 종류에 맞춰 섞어 한 step 에 16,384 개씩 200,000 step 학습했고, post-training 은 로봇 하나의 데이터로
  20,000 ~ 60,000 step 학습한다. VLM 의 언어 모델은 얼려 둔다
- GR-1 실물 작업에서 GR00T N1 은 데이터 10% 로 42.6% 에 닿아, 데이터 전체를 쓴 Diffusion Policy(46.4%)에 3.8%p 차이로 다가갔다
- post-training 은 그 데이터의 행동을 매끄럽게 만들지만, 데이터에 없는 행동(손 바꿔 건네기)은 지울 수 있다

## N1.5 이후의 변화

### N1.5 의 VLM 과 FLARE

NVIDIA 는 GR00T N1 이후 N1.5, N1.6, N1.7 을 차례로 공개했다. 구조의 큰 틀(VLM + flow matching diffusion transformer, 로봇별
encoder·decoder)은 같고, 부분마다 바뀌었다. N1.5 연구 페이지가 밝힌 변화는 아래와 같다.

- **VLM 을 얼림.** VLM 을 사전학습과 fine-tuning 내내 얼려 두어, 인터넷에서 배운 언어 이해가 로봇 학습으로 흐트러지지 않게 했다
- **새 VLM.** Eagle 2.5 를 바탕으로, 사진 속에서 지시문이 가리키는 물체를 찾는 능력(grounding)과 물리적인 이해를 더 학습시킨 VLM 으로
  바꿨다
- **연결부 단순화.** image encoder 와 언어 모델 사이의 MLP 를 단순하게 하고, 언어 모델에 들어가는 사진·글 token 에 layer normalization 을
  더했다
- **FLARE.** flow matching loss 에 FLARE 라는 loss 를 더했다. 미래 장면을 직접 만들어 내는 대신, 미래 장면의 embedding(장면을 요약한 숫자
  묶음)에 모델의 내부 숫자를 맞추게 하는 loss 다. 연구 페이지는 FLARE 가 성능을 높이고 사람 영상에서 배우는 길을 열었다고 적었다

연구 페이지에 따르면 실물 GR-1 에서 지시문대로 움직이는 비율(language following)이 N1 의 46.6% 에서 N1.5 의 93.3% 로 올랐고, 전체 성공률은
43.3% 에서 83.0% 로 올랐다.

**확인 문제.** VLM 을 얼려 두면 로봇 데이터로 학습하는 동안 무엇이 바뀌지 않고, 그 덕분에 무엇을 지킬 수 있을까?

<details><summary>답 보기</summary>

VLM 의 weight 가 바뀌지 않는다. 로봇 데이터에는 지시문의 종류가 적어서 VLM 까지 고치면 인터넷에서 배운 언어 이해가 그 적은 지시문에 맞춰
좁아질 수 있는데, 얼려 두면 그 이해를 그대로 지킨다.

</details>

### N1.6 의 state-relative action

N1.6 의 공개 구현 설명이 밝힌 구조 변화는 아래와 같다.

- VLM 을 NVIDIA 내부의 Cosmos-Reason-2B 변형으로 바꿨다. 사진을 원래 가로세로 비율 그대로, 빈칸을 채우지 않고 넣을 수 있다
- diffusion transformer 를 두 배로 키웠다. N1.5 의 16 층에서 32 층이 됐다
- N1.5 의 VLM 뒤에 있던 4 층짜리 transformer 연결부를 없애고, 대신 사전학습 동안 VLM 의 맨 위 4 층을 학습하도록 풀었다
- 대부분의 로봇에서 관절 각도나 손끝 위치의 절댓값 대신 지금 상태에서의 차이(state-relative action)로 덩어리를 낸다

절댓값 action 은 "관절을 32° 로 보내라" 처럼 목표 자리 자체를 말하고, state-relative action 은 "지금보다 2° 더 굽혀라" 처럼 지금 상태에서의
차이를 말한다. 지금 각도가 30° 인 경우와 50° 인 경우를 나란히 보면 차이가 보인다.

| 지금 각도 | 목표 각도 | 절댓값 action | state-relative action |
| --- | --- | --- | --- |
| 30° | 32° | 32° | $32 - 30 = +2°$ |
| 50° | 52° | 52° | $52 - 50 = +2°$ |

두 경우는 "2° 더 굽힌다" 는 같은 움직임인데, 절댓값으로는 32° 와 52° 라는 다른 숫자가 되고 state-relative 로는 둘 다 $+2°$ 로 같은 숫자가
된다. 같은 움직임이 같은 숫자로 나타나므로, 자세가 조금 다른 상황에서 배운 움직임을 그대로 옮겨 쓰기 쉽다.

![절댓값 action 과 state-relative action 의 비교. 위쪽은 지금 30° 에서 32° 로, 아래쪽은 지금 50° 에서 52° 로 가는 관절이다. 절댓값 action 은 32 와 52 로 다르고, state-relative action 은 둘 다 +2 로 같다](figures/relative-action.svg)

N1.6 의 공개 구현은 추론 시간도 표로 밝혔다. 4 denoising step, 카메라 한 대 기준으로 덩어리 하나에 RTX 4090 은 44 ms, 로봇에 싣는
컴퓨터 Jetson Thor 는 105 ms 가 걸렸다.

**확인 문제.** 지금 각도가 40° 이고 state-relative action 덩어리가 $(+1,\ +2,\ +3)$ 이다. 이 차이를 모두 지금 각도에서 잰다면 세 step 의 목표
각도는 각각 몇 도일까?

<details><summary>답 보기</summary>

| step | 계산 | 목표 각도 |
| --- | --- | --- |
| 1 | $40 + 1$ | 41° |
| 2 | $40 + 2$ | 42° |
| 3 | $40 + 3$ | 43° |

답: 41°, 42°, 43° 다. 덩어리 안의 차이를 모두 덩어리를 만든 순간의 상태에서 재는지, 바로 앞 action 에서 재는지는 구현마다 정해 두므로
코드에서 확인한다.

</details>

### N1.7 의 relative EEF action 과 사람 영상

N1.7 의 공개 구현 설명이 밝힌 변화는 아래와 같다.

- VLM 을 Cosmos-Reason2-2B(Qwen3-VL 구조)로 바꿨다
- diffusion transformer 는 다시 16 층이 됐고, 덩어리 길이는 16 에서 40 으로 늘었다
- 손끝(end-effector, EEF)의 위치와 방향을 지금 자세에서의 차이로 나타내는 relative EEF action 을 로봇과 사람 모두에 같은 형식으로 쓴다
- 사람 영상 데이터 EgoScale 2 만 시간을 사전학습에 넣었다

N1 은 사람 영상에 latent action 을 붙여 로봇과 다른 몸으로 다뤘다. N1.7 은 사람 손끝의 움직임도 로봇 손끝의 움직임과 같은 형식의 차이로
적어서, 사람 영상에서 배운 손의 움직임을 로봇 제어로 바로 옮기려 한다.

| 버전 | VLM | diffusion transformer | 덩어리 길이 | 바뀐 점 |
| --- | --- | --- | --- | --- |
| N1 | Eagle-2, 12 번째 층 출력 | 층 수 미공개 | 16 | data pyramid, latent action, 로봇별 MLP |
| N1.5 | Eagle 2.5 바탕, 얼림 | 16 층 | 16 | FLARE, 연결부 단순화 |
| N1.6 | Cosmos-Reason-2B 변형, 맨 위 4 층 학습 | 32 층 | 16 | state-relative action |
| N1.7 | Cosmos-Reason2-2B | 16 층 | 40 | relative EEF action, 사람 영상 2 만 시간 |

![GR00T 버전별 변화. N1 → N1.5 → N1.6 → N1.7 을 왼쪽에서 오른쪽으로 놓고, 칸마다 VLM, diffusion transformer 층 수, 덩어리 길이, 주요 변화를 적었다](figures/versions.svg)

**확인 문제.** 30 Hz 로봇에서 덩어리 길이가 16 에서 40 으로 늘면, 덩어리 하나가 덮는 시간은 몇 초에서 몇 초가 될까?

<details><summary>답 보기</summary>

$16 \div 30 \approx 0.53$ 초에서 $40 \div 30 \approx 1.33$ 초가 된다. 덩어리 전체를 다 실행하지 않고 앞부분만 실행하는 것은 그대로다.

</details>

**요약**

- N1.5 는 VLM 을 얼리고 grounding 을 강화한 VLM 으로 바꿨으며, 미래 장면의 embedding 에 맞추는 FLARE loss 를 더해 지시문을 따르는 비율을
  46.6% 에서 93.3% 로 높였다
- N1.6 은 diffusion transformer 를 32 층으로 키우고, 절댓값 대신 지금 상태에서의 차이(state-relative action)로 덩어리를 낸다
- N1.7 은 VLM 을 Cosmos-Reason2-2B 로 바꾸고 덩어리를 40 으로 늘렸으며, 사람과 로봇이 같은 relative EEF action 을 써서 사람 영상 2 만 시간을
  함께 학습한다

## 정리

- humanoid 데이터는 사람이 조종해 한 건씩 모아야 해서 적고(GR-1 88 시간), GR00T N1 은 인터넷·사람 영상, 만든 데이터, 실물 로봇 데이터를
  data pyramid 로 쌓아 함께 학습한다
- 구조는 Eagle-2 VLM(System 2, 13.4 억)과 diffusion transformer(System 1)로 된 22 억 parameter 모델이다. 사진 한 장은 pixel shuffle 로 token
  64 개가 되고, VLM 의 12 번째 층 출력 $\phi_t$ 를 diffusion transformer 가 cross-attention 으로 읽는다
- 로봇마다 state encoder·action encoder·action decoder 를 따로 두어 숫자 개수가 다른 로봇을 공통 길이의 token 으로 바꾸고, 고치는 단계 $\tau$ 는
  adaptive layer norm 의 $\gamma(\tau)$·$\beta(\tau)$ 로 층마다 들어간다
- flow matching 은 π0 와 같은 식이고 덩어리 $H = 16$, Euler $K = 4$ 다. $\epsilon = (-1.0,\ 0.5)$ 에서 step 마다 $(0.5,\ -0.25)$ 씩 움직여
  $(1.0,\ -0.5)$ 에 닿는다
- action 이 없는 영상에는 VQ-VAE 로 학습한 latent action 이나, 로봇 데이터로 학습한 inverse dynamics model 의 pseudo-action 을 붙인다. 생성 영상
  827 시간과 simulation 기록 78 만 개가 가운데 층을 채운다
- GR-1 실물 작업에서 데이터 10% 의 GR00T N1(42.6%)이 데이터 전체의 Diffusion Policy(46.4%)에 가까웠고, post-training 은 데이터에 없는 행동을
  지울 수 있다
- N1.5 는 VLM 을 얼리고 FLARE 를, N1.6 은 32 층 diffusion transformer 와 state-relative action 을, N1.7 은 Cosmos-Reason2-2B 와 덩어리 40·사람 영상
  2 만 시간을 더했다

GR00T 도 π0 처럼 시연과 만든 데이터를 따라 하도록 학습하므로, 직접 시도해 받은 reward 로 더 나아지지는 않는다. 그런 학습은
[VLA + RL](../vla-rl/README.md) 에서 다룬다. 영상 생성 모델이 세상의 다음 장면을 만들어 학습 데이터로 쓰는 생각은
[World Model](../world-model/README.md) 에서 다른 방향으로 이어진다.

## 참고 자료

- NVIDIA, [GR00T N1: An Open Foundation Model for Generalist Humanoid Robots](https://arxiv.org/abs/2503.14734) (2025) — 2.1 절이 Eagle-2 VLM·12 번째
  층·로봇별 encoder·diffusion transformer·flow matching 식, 2.2 절이 latent action·neural trajectory·simulation 기록, 4.4 절의 표 2·3 이
  simulation 과 실물 결과다. 부록 D 에 학습 설정, F 에 물체 위치 loss 와 IDM 학습이 있다
- S. Ye 외, [Latent Action Pretraining from Videos](https://arxiv.org/abs/2410.11758) (2024) — 두 장면 사이의 움직임을 VQ-VAE 로 latent action 으로
  만들어, 로봇 action 없이 영상만으로 VLA 를 사전학습하는 LAPA
- Z. Jiang 외, [DexMimicGen: Automated Data Generation for Bimanual Dexterous Manipulation via Imitation Learning](https://arxiv.org/abs/2410.24185)
  (2024) — 사람 시연 60 개를 물체별 구간으로 나눠 옮겨 21,000 개로 늘린 방법
- NVIDIA GEAR, [GR00T N1.5](https://research.nvidia.com/labs/gear/gr00t-n1_5/) — 얼린 VLM, grounding, FLARE, language following 46.6% → 93.3% 의
  실물 결과
- NVIDIA, [Isaac-GR00T](https://github.com/NVIDIA/Isaac-GR00T) — 공식 구현. main 의 README 에 N1.7 의 변화와 N1.6 과의 차이,
  [n1d6 branch](https://github.com/NVIDIA/Isaac-GR00T/tree/n1d6) 의 README 에 N1.6 의 변화와 기기별 추론 시간표가 있다
- Hugging Face, [nvidia/GR00T-N1.6-3B](https://huggingface.co/nvidia/GR00T-N1.6-3B) — N1.6 모델 카드. 입력·출력 형식과 학습 데이터 설명
