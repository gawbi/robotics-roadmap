---
id: world-model
title: "World Model"
branch: frontier
requires: [vae, policy-gradient]
hours: 3
summary: 다음 장면을 예측하는 model 을 latent 에서 배우고, 그 안에서 행동열을 상상으로 비교해 고르는 planning·CEM·MPC
papers:
  - title: "World Models"
    authors: David Ha, Jürgen Schmidhuber
    year: 2018
    url: https://arxiv.org/abs/1803.10122
  - title: "Learning Latent Dynamics for Planning from Pixels"
    authors: Danijar Hafner et al.
    year: 2019
    url: https://arxiv.org/abs/1811.04551
  - title: "Dream to Control: Learning Behaviors by Latent Imagination"
    authors: Danijar Hafner, Timothy Lillicrap, Jimmy Ba, Mohammad Norouzi
    year: 2020
    url: https://arxiv.org/abs/1912.01603
  - title: "Mastering Diverse Domains through World Models"
    authors: Danijar Hafner, Jurgis Pasukonis, Jimmy Ba, Timothy Lillicrap
    year: 2023
    url: https://arxiv.org/abs/2301.04104
  - title: "TD-MPC2: Scalable, Robust World Models for Continuous Control"
    authors: Nicklas Hansen, Hao Su, Xiaolong Wang
    year: 2024
    url: https://arxiv.org/abs/2310.16828
  - title: "Cosmos World Foundation Model Platform for Physical AI"
    authors: NVIDIA
    year: 2025
    url: https://arxiv.org/abs/2501.03575
  - title: "V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning"
    authors: Mido Assran et al.
    year: 2025
    url: https://arxiv.org/abs/2506.09985
---

# World Model

## 학습 목표

- world model, 곧 "지금 장면에서 이렇게 움직이면 다음 장면이 어떻게 될지" 를 예측하는 모델이 무엇이고, 이름에 world 가 들어간
  물체 인식 모델과 어떻게 다른지 설명할 수 있다
- 카메라 그림을 숫자 몇 개로 줄인 뒤, 그 숫자 위에서 다음 상태와 점수를 예측하는 과정을 작은 숫자로 따라갈 수 있다
- 행동 후보 여러 개를 실제로 해 보지 않고 모델 안에서 미리 계산해 본 뒤, 점수 합을 비교해 하나를 고르는 계산을 표로 할 수 있다
- 후보를 뽑아 점수를 매기고, 점수가 좋은 후보 쪽으로 뽑는 범위를 좁히기를 되풀이하는 방법을 한 단계씩 계산할 수 있다
- 한 번의 예측에서 생긴 작은 오차가 예측을 여러 번 이어 갈 때 커지는 이유와, 매번 다시 계획하고 데이터를 다시 모으는 방법이 그
  문제를 어떻게 줄이는지 숫자로 보일 수 있다
- 실제로 움직여 보는 횟수를 이런 모델이 얼마나 줄이는지 세어 볼 수 있다

## world model 의 뜻

### 다음 장면의 예측

사람은 컵을 밀기 전에 컵이 어디로 미끄러질지 머릿속으로 먼저 그려 본다. 너무 세게 밀면 책상 끝에서 떨어질 것 같으니 살살 민다.
실제로 밀어 보기 전에 "이렇게 하면 이렇게 되겠지" 를 예측하고, 그 예측을 보고 행동을 고르는 것이다.

로봇도 같은 일을 할 수 있다. 지금 카메라에 찍힌 장면과 지금 하려는 행동을 받아서 다음 순간의 장면을 예측하는 모델이 있으면,
로봇은 행동을 실제로 하기 전에 그 결과를 모델 안에서 미리 볼 수 있다. 이렇게 "지금 상태와 행동을 넣으면 다음 상태를 내는"
모델을 world model 이라고 한다. world 는 로봇이 움직이는 바깥 세계(환경)를 뜻하고, model 은 그 세계가 어떻게 움직이는지를
흉내 내는 계산이라는 뜻이다.

가장 작은 예로, 한 줄로 놓인 레일 위에 로봇이 있다고 하자. 레일은 칸 0 부터 칸 7 까지 여덟 칸이고 로봇은 지금 칸 1 에 있다.
"오른쪽으로 한 칸" 이라는 행동을 넣으면 world model 은 "다음 장면에서 로봇은 칸 2 에 있다" 고 예측한다. 같은 장면에 "그대로
있기" 를 넣으면 "칸 1" 을, "왼쪽으로 한 칸" 을 넣으면 "칸 0" 을 예측한다.

| 지금 칸 | 넣은 행동 | world model 의 예측 |
| --- | --- | --- |
| 1 | 오른쪽으로 한 칸 | 칸 2 |
| 1 | 그대로 있기 | 칸 1 |
| 1 | 왼쪽으로 한 칸 | 칸 0 |

world model 의 입력에는 언제나 행동이 들어가고, 출력은 언제나 미래(다음 장면)다. 같은 장면이라도 넣은 행동이 다르면 다른 미래가
나온다.

**확인 문제.** 로봇이 칸 5 에 있을 때 world model 에 "왼쪽으로 한 칸" 을 넣으면 무엇을 예측해야 할까?

<details><summary>답 보기</summary>

다음 장면에서 로봇은 칸 4 에 있다고 예측해야 한다.

</details>

### world model 과 헷갈리는 이름들

world 라는 단어가 들어간 이름은 많지만 모두 world model 은 아니다. 2024년에 나온 YOLO-World 는 이름에 World 가 들어가지만,
카메라 그림 한 장과 "컵", "공" 같은 단어를 받아 그림 속 어디에 그 물체가 있는지 상자로 표시해 주는 물체 인식(object detection)
모델이다. YOLO-World 에는 행동이 들어가지 않고, 다음 순간에 무슨 일이 생길지도 예측하지 않는다. 지금 그림에 무엇이 어디 있는지만
답한다. 이름의 World 는 "세상의 온갖 물체 이름을 알아듣는다" 는 뜻으로 붙었다.

![위는 world model 로, 지금 그림(로봇이 칸 1)과 행동 "오른쪽으로 한 칸" 을 받아 다음 그림(로봇이 칸 2)을 예측한다. 아래는 YOLO-World 같은 물체 인식 모델로, 그림과 단어 "컵" 을 받아 지금 그림 속 컵의 위치에 상자를 친다. 행동도 미래도 없다](figures/world-model-vs-detector.svg)

위 그림의 위쪽이 world model, 아래쪽이 물체 인식 모델이다. 두 모델 모두 카메라 그림을 받지만, 위쪽만 행동을 받고 미래를 낸다.
비슷한 이름 몇 가지를 표로 나누면 아래와 같다.

| 이름 | 받는 것 | 내는 것 | world model 인가 |
| --- | --- | --- | --- |
| world model | 지금 장면 + 행동 | 다음 장면(과 reward) | 그렇다 |
| YOLO-World | 그림 + 물체 이름 | 지금 그림 속 물체의 위치 | 아니다 |
| world frame | — | — | 아니다. [Rigid Transforms](../transforms/README.md) 에서 방 전체에 고정해 둔 기준 좌표계를 부르는 이름이다 |
| 물리 simulator | 지금 상태 + 행동 | 다음 상태 | 하는 일은 같지만 사람이 물리 법칙을 식으로 적어 만든다. world model 은 데이터로 배운다 |

표의 reward 는 [Bandits & MDPs](../bandit-mdp/README.md) 에서 본 것처럼 행동 뒤에 받는 점수다. simulator 는 컴퓨터 안에서 물리
법칙을 계산해 로봇과 물체가 어떻게 움직일지 흉내 내는 프로그램이다. simulator 도 "지금 상태 + 행동 → 다음 상태" 를 계산하지만
사람이 질량·마찰 같은 물리 식을 직접 적어 넣어서 만들고, 이 강의의 world model 은 로봇이 겪은 데이터를 보고 그 관계를 스스로
배운다는 점이 다르다.

ChatGPT 같은 큰 언어 모델(large language model, LLM)을 다루는 글에서 "LLM 이 world model 을 가졌다" 처럼 "세상에 대한 이해" 라는 느슨한 뜻으로 쓰기도 하는데, 이 강의에서
world model 은 언제나 "상태와 행동을 받아 다음 상태를 예측하는 모델" 이라는 좁은 뜻이다.

**확인 문제.** 다음 중 world model 은 무엇일까? (가) 그림을 받아 그림 속 사람 수를 세는 모델 (나) 로봇 팔 사진과 "1 cm 위로" 라는
명령을 받아 0.1 초 뒤의 사진을 그려 내는 모델

<details><summary>답 보기</summary>

(나)다. (가)는 행동을 받지 않고 지금 그림에 대해서만 답한다. (나)는 행동을 받아 다음 장면을 예측한다.

</details>

### model-free 와 model-based

[Bandits & MDPs](../bandit-mdp/README.md) 에서는 환경을 state(지금 상황)·action(행동)·transition(다음 state 로 옮겨 가는 규칙)·
reward 로 적었다. transition 은 "state $s$ 에서 action $a$ 를 하면 다음 state 가 무엇인가" 의 규칙이므로, world model 은 이
transition 과 reward 를 데이터로 배워 둔 것이다.

[Policy Gradient](../policy-gradient/README.md) 와 [DQN → SAC](../off-policy/README.md) 의 방법들은 이런 규칙을 따로 배우지 않았다.
행동을 실제로 해 보고 받은 reward 만으로 policy(state 를 받아 action 을 내는 규칙)를 고쳤다. 이렇게 환경의 model 없이 배우는
강화학습(reinforcement learning, RL)을 model-free RL 이라고 하고, world model 을 배워서 쓰는 RL 을 model-based RL 이라고 한다.
강화학습은 정답 대신 reward 를 보고 행동을 배우는 학습이다.

여기서 "model" 은 environment 의 model, 곧 world model 을 가리킨다. 일상적으로는 weight 를 곱하고 더하는 층을 쌓은 neural network 하나하나를 모두 "model" 이라고
부르기 때문에, model-free RL 에도 policy network 라는 "model" 은 있다. model-free 는 "neural network 가 없다" 가 아니라 "환경이 어떻게
움직이는지 예측하는 model 이 없다" 는 뜻이다.

![왼쪽 model-free 는 후보 행동 넷을 실제 환경에서 하나씩 해 보느라 실제 step 12 번과 처음 자리로 되돌리기 3 번이 든다. 오른쪽 model-based 는 같은 후보 넷을 world model 안에서 계산해 보고, 가장 좋은 행동 하나만 실제로 한다](figures/model-free-vs-based.svg)

위 그림은 같은 선택을 두 방식으로 하는 모습이다. 세 step 짜리 행동 후보 넷 가운데 무엇이 가장 좋은지 알고 싶을 때, model-free 쪽은
넷을 실제로 해 보는 수밖에 없다. 실제 로봇은 한 후보를 해 보고 나면 이미 다른 자리에 가 있으므로 다음 후보를 해 보려면 처음 자리로
되돌려 놓아야 한다. model-based 쪽은 같은 비교를 world model 안의 계산으로 끝내고, 고른 행동만 실제로 한다. 실제 로봇의 움직임은
시간이 들고 부딪히면 부서질 수도 있지만, 계산은 몇 번을 해도 로봇이 다치지 않는다.

**확인 문제.** 세 step 짜리 후보 5 개를 실제 환경에서 모두 해 보면 실제 step 은 몇 번 들까? world model 안에서 비교하면 비교에 드는
실제 step 은 몇 번일까?

<details><summary>답 보기</summary>

실제 환경에서는 $5 \times 3 = 15$ 번이다(처음 자리로 되돌리는 일은 따로 든다). world model 안에서 비교하면 비교에 드는 실제 step 은
0 번이다.

</details>

**요약**

- world model 은 지금 상태와 행동을 받아 다음 상태(와 reward)를 예측하는 모델이다. 입력에 행동이 있고 출력이 미래라서
  YOLO-World 같은 물체 인식 모델과 다르다
- world model 을 배워서 쓰는 RL 을 model-based, 쓰지 않는 RL 을 model-free 라고 한다. 여기서 model 은 환경의 model 이다
- model-based 는 후보 행동을 실제로 해 보지 않고 모델 안에서 비교할 수 있다

## 레일 위 로봇

### 카메라 그림과 state

강의 내내 쓸 작은 환경을 정해 둔다. 레일은 칸 0 부터 칸 7 까지 여덟 칸이고, 칸 4 에 충전기가 있다. 로봇은 step 마다 action 하나를
고르는데, $+1$ 은 오른쪽으로 한 칸, $0$ 은 그대로, $-1$ 은 왼쪽으로 한 칸이다. 실제 환경에서는 고른 만큼 정확히 움직인다. step 은
"행동 하나를 하고 결과를 보는 한 번" 이다.

로봇은 자기 위치를 숫자로 알지 못하고, 레일 위에 달린 카메라가 찍은 그림만 본다. 카메라 그림은 가로 8 칸짜리 한 줄이다. 그림을
작은 칸(pixel)으로 나누고 칸마다 밝기를 숫자로 적는다는 것은 [VAE](../vae/README.md) 에서 본 그대로이고, 여기서는 로봇이 있는
칸만 밝기 1, 나머지는 0 이다. 로봇이 칸 1 에 있으면 그림은

$$
(0,\ 1,\ 0,\ 0,\ 0,\ 0,\ 0,\ 0)
$$

이다. 숫자 여덟 개를 순서대로 묶은 이런 값을 8 차원 vector 라고 한다. step $t$ 에 찍은 그림을 $o_t$ 라고 적는데, $o$ 는 관측
(observation)의 첫 글자이고 $t$ 는 몇 번째 step 인지를 나타낸다.

![여덟 칸 레일. 로봇은 칸 1, 충전기는 칸 4 에 있다. 아래는 카메라 그림으로, 로봇이 있는 둘째 pixel 만 밝기 1 이다. 맨 아래 줄은 칸마다 받는 reward −|칸 − 4| 이다](figures/rail-world.svg)

위 그림의 위쪽이 레일, 가운데가 카메라 그림, 아래가 칸마다 받는 reward 로, 충전기에서 멀수록 작다. 로봇이 실제로 어디
있는지를 나타내는 숫자(여기서는 칸 번호)를 state 라고 하는데, 로봇은 state 를 직접 보지 못하고 그림 $o_t$ 만 본다.

**확인 문제.** 로봇이 칸 6 에 있을 때 카메라 그림 vector 는?

<details><summary>답 보기</summary>

칸 0 부터 세어 일곱 번째 pixel 만 1 이므로 $(0, 0, 0, 0, 0, 0, 1, 0)$ 이다.

</details>

### reward 와 목표

로봇이 할 일은 충전기(칸 4)에 가서 머무는 것이다. 그래서 step 마다 받는 reward 를 "움직인 뒤 충전기까지 남은 칸 수" 에 마이너스를
붙인 값으로 정한다. 충전기에 있으면 0, 한 칸 떨어져 있으면 $-1$, 세 칸 떨어져 있으면 $-3$ 이다.

남은 칸 수는 뺄셈 결과의 부호를 떼어 낸 값이다. 숫자의 부호를 떼고 크기만 남긴 값을 절댓값이라 하고 $|\ |$ 로 감싸 적는다.
$|-3| = 3$, $|2| = 2$, $|0| = 0$ 이다. 칸 1 에서 충전기까지는 $|1 - 4| = |-3| = 3$ 칸이고, 칸 6 에서는 $|6 - 4| = 2$ 칸이다.
그래서 움직인 뒤의 칸이 $s'$ 일 때 reward 는

$$
r = -\,|s' - 4|
$$

이다. 이 식은 "움직인 뒤의 칸에서 4 를 빼고, 부호를 떼고, 마이너스를 붙인다" 로 읽는다. 칸 1 이면 $-3$, 칸 4 면 0, 칸 6 이면 $-2$
다. reward 는 0 이 가장 크고, 충전기에서 멀수록 더 작은 음수가 된다.

[Bandits & MDPs](../bandit-mdp/README.md) 에서처럼 step $t$ 의 action 을 한 직후 받는 reward 를 $r_{t+1}$ 로 적는다. 로봇이 칸 1 에서
$+1$ 을 하면 칸 2 로 가고 $r_{t+1} = -|2 - 4| = -2$ 를 받는다.

**확인 문제.** 로봇이 칸 5 에서 $-1$ 을 하면 어느 칸에 가고 reward 는 얼마일까? $+1$ 을 하면?

<details><summary>답 보기</summary>

$-1$ 이면 칸 4 로 가고 reward 는 $-|4 - 4| = 0$ 이다. $+1$ 이면 칸 6 으로 가고 reward 는 $-|6 - 4| = -2$ 다.

</details>

**요약**

- 레일은 칸 0 ~ 7, 충전기는 칸 4, action 은 $+1$·$0$·$-1$ 이다
- 로봇은 칸 번호(state)를 직접 보지 못하고, 로봇이 있는 pixel 만 1 인 8 칸짜리 그림 $o_t$ 를 본다
- reward 는 $r = -|s' - 4|$ 로, 충전기에 가까울수록 크다

## 그림을 줄이는 encoder

### 8 pixel 그림의 latent

world model 이 다음 장면을 예측하려면 그림 vector 의 숫자 여덟 개를 모두 예측해야 할까. 이 그림에서 실제로 중요한 정보는 "로봇이
몇 번 칸에 있는가" 하나뿐이다. 나머지 일곱 pixel 은 늘 0 이다.

[VAE](../vae/README.md) 에서 encoder 는 그림을 숫자 몇 개로 줄이고, decoder 는 그 숫자에서 그림을 되살렸다. 줄인 숫자를 latent
$z$ 라고 불렀고, latent 는 "숨어 있는" 이라는 뜻이었다. VAE 의 encoder 는 그림마다 평균 $\mu$ 와 표준편차 $\sigma$ 를 내는데, $\mu$ 는
그 그림의 latent 범위의 가운데이고 $\sigma$ 는 퍼진 정도다. 이 강의에서는 그 가운데 값 $\mu$ 를 latent $z$ 로 쓴다.

레일 그림으로 VAE 를 학습시켰더니 encoder 가 낸 $\mu$ 가 마침 로봇의 칸 번호와 같아졌다고 하자. 실제로 학습한 latent 는 이렇게
깔끔하지 않고 칸 번호를 늘이거나 뒤집은 값이 나오기 쉽지만, 계산을 쉽게 하려고 이렇게 둔다.

| 카메라 그림 $o_t$ | encoder 가 낸 $z_t$ | decoder 가 되살린 그림 |
| --- | --- | --- |
| $(0, 1, 0, 0, 0, 0, 0, 0)$ | 1 | $(0, 1, 0, 0, 0, 0, 0, 0)$ |
| $(0, 0, 0, 0, 1, 0, 0, 0)$ | 4 | $(0, 0, 0, 0, 1, 0, 0, 0)$ |
| $(0, 0, 0, 0, 0, 0, 1, 0)$ | 6 | $(0, 0, 0, 0, 0, 0, 1, 0)$ |

![카메라 그림 세 장이 encoder 를 지나 latent 1, 4, 6 이 되고, decoder 가 latent 에서 같은 그림을 되살린다. 숫자 8 개가 1 개로 줄었다](figures/encoder-strip.svg)

위 그림처럼 숫자 여덟 개가 하나로 줄었다. 이제부터 world model 은 그림을 예측하지 않고 이 숫자 하나가 다음 step 에 얼마가
될지를 예측한다. step $t$ 의 latent 는 $z_t$ 로 적는다. decoder 는 예측한 latent 를 사람이 볼 수 있는 그림으로 되돌릴 때 쓴다.

**확인 문제.** 이 encoder 에 $(0, 0, 1, 0, 0, 0, 0, 0)$ 을 넣으면 $z$ 는 얼마가 나올까? decoder 에 $z = 7$ 을 넣으면 어떤 그림이
나올까?

<details><summary>답 보기</summary>

셋째 pixel(칸 2)이 밝으므로 $z = 2$ 다. $z = 7$ 은 칸 7 이므로 decoder 는 마지막 pixel 만 1 인 $(0, 0, 0, 0, 0, 0, 0, 1)$ 을 낸다.

</details>

### 한 장면에 담기지 않는 속도

레일 로봇은 고른 action 만큼 바로 움직이므로 지금 위치만 알면 다음 위치를 예측할 수 있다. 그런데 공처럼 스스로 굴러가는 물체는
다르다. 공이 칸 2 에 찍힌 그림 한 장만으로는 공이 오른쪽으로 굴러가는 중인지, 왼쪽으로 굴러가는 중인지, 멈춰 있는지 알 수 없다.

연속한 두 장을 함께 보면 알 수 있다. 앞 그림에서 칸 1, 지금 그림에서 칸 2 였다면 공은 step 마다 $2 - 1 = +1$ 칸씩 오른쪽으로
가고 있다. 한 step 에 위치가 바뀌는 양을 속도라고 하는데, 이 공의 속도는 $+1$ 이고 다음 그림에서는 칸 3 에 있을 것이다.

| 앞 그림의 칸 | 지금 그림의 칸 | 속도 (지금 − 앞) | 다음 칸 예측 |
| --- | --- | --- | --- |
| 1 | 2 | $+1$ | 3 |
| 3 | 2 | $-1$ | 1 |
| 2 | 2 | $0$ | 2 |

세 줄 모두 지금 그림은 똑같이 "칸 2" 지만 다음 칸은 3, 1, 2 로 다르다. 그래서 진자나 굴러가는 공처럼 속도가 중요한 환경에서는
지금 그림 한 장이 아니라 최근 두 장을 함께 encoder 에 넣거나, 지난 그림들을 차례로 요약해 기억해 두는 network 를 써서 latent 에
속도까지 담는다. 요약을 기억해 두는 쪽은 뒤의 "PlaNet 과 Dreamer" 절에서 다시 나온다.

![같은 지금 그림(칸 2)이라도 앞 그림이 칸 1 이면 다음은 칸 3, 앞 그림이 칸 3 이면 다음은 칸 1 이다. 그림 한 장으로는 둘을 가를 수 없다](figures/velocity-frames.svg)

**확인 문제.** 앞 그림에서 칸 5, 지금 그림에서 칸 3 이면 속도는 얼마이고, 같은 속도로 움직이면 다음 칸은 어디일까?

<details><summary>답 보기</summary>

속도는 $3 - 5 = -2$ 이고 다음 칸은 $3 + (-2) = 1$ 이다.

</details>

### Pendulum 의 카메라 그림

실제 문제에서는 줄이는 효과가 훨씬 크다. [DQN → SAC](../off-policy/README.md) 에서 다룬 `Pendulum-v1` 은 아래로 늘어진 진자를
토크(축을 돌리는 힘)로 돌려 세운 뒤 위에서 버티게 하는 문제였다. 그때 행동을 고르는 쪽인 agent 는 진자의 각도와 각속도(돌아가는 빠르기)를 숫자로
직접 받았다. 같은 문제를 카메라로 찍은 가로 64, 세로 64 pixel 의 컬러 그림만 보고 풀어야 한다고 하자.

컬러 그림은 pixel 하나에 빨강·초록·파랑 밝기 세 숫자를 적으므로(이 셋을 RGB 라고 한다) 그림 한 장의 숫자는

$$
64 \times 64 \times 3 = 4096 \times 3 = 12{,}288
$$

개다. 진자의 실제 state 는 각도와 각속도 몇 개의 숫자면 충분한데, 그림에는 숫자가 만 개 넘게 들어 있다. 그래서 encoder 로 그림을
수십 개짜리 latent 로 줄인 뒤 그 latent 위에서 다음 step 을 예측한다. latent 를 30 개로 잡으면 $12{,}288 \div 30 \approx 410$ 분의
1 로 줄어든다.

![가로 64, 세로 64 pixel 의 컬러 진자 그림은 숫자 12,288 개다. encoder 가 이것을 latent 30 개로 줄인다. 진자의 실제 state 는 각도와 각속도 같은 숫자 몇 개다](figures/pendulum-pixels.svg)

위 그림처럼 그림의 숫자 대부분은 진자와 상관없는 배경이다. 진자 그림 한 장에도 진자가 어느 쪽을 가리키는지는 보이지만 얼마나 빨리 도는지는
보이지 않으므로, 앞 절에서 본 대로 최근 그림 두 장을 함께 넣거나 지난 그림을 요약해서 latent 에 각속도를 담는다.

**확인 문제.** 가로 32, 세로 32 pixel 의 컬러 그림 한 장은 숫자 몇 개일까? latent 를 32 개로 줄이면 몇 분의 1 일까?

<details><summary>답 보기</summary>

$32 \times 32 \times 3 = 1024 \times 3 = 3072$ 개다. $3072 \div 32 = 96$ 이므로 96 분의 1 이다.

</details>

**요약**

- encoder 는 카메라 그림을 latent $z_t$ 로 줄이고, world model 은 그림 대신 latent 의 다음 값을 예측한다. 레일 그림은 숫자 8 개가
  1 개로, Pendulum 그림은 12,288 개가 수십 개로 줄어든다
- 그림 한 장에는 속도가 담기지 않으므로, 속도가 중요한 환경에서는 최근 그림 두 장이나 지난 그림의 요약으로 latent 를 만든다

## dynamics model

### 다음 latent 의 예측

지금 latent 와 action 을 받아 다음 latent 를 예측하는 부분을 dynamics model 이라고 하고 $f$ 로 적는다. dynamics 는 "움직임을
다루는 학문" 이라는 뜻의 물리 용어로, 여기서는 "시간이 지나며 state 가 바뀌는 규칙" 을 가리킨다.

레일 로봇이라면 dynamics 는 "지금 칸에 action 만큼 더한다" 다. 이 규칙이 아직 무엇인지 모른다고 하고, 모양만

$$
\hat z_{t+1} = f(z_t, a_t) = z_t + w \times a_t
$$

로 정해 둔다. $\hat z_{t+1}$ 은 "제트 햇 티 플러스 원" 이라고 읽고, 다음 step 의 latent 를 예측한 값이다. 모자(hat)는 VAE 에서처럼
예측이나 되살린 값에 씌운다. $z_t$ 는 지금 latent, $a_t$ 는 지금 고른 action 이고, $w$ 는 "action 1 에 latent 가 얼마나 움직이는가" 를
나타내는 weight 다. 이 식은 "지금 latent 에 action 의 $w$ 배를 더하면 다음 latent 의 예측이 된다" 로 읽는다.

$w = 1$ 이면 $z_t = 1$, $a_t = +1$ 일 때 $\hat z_{t+1} = 1 + 1 \times 1 = 2$ 다. 숫자만 바꿔 $z_t = 5$, $a_t = -1$ 이면
$\hat z_{t+1} = 5 + 1 \times (-1) = 4$ 다.

**확인 문제.** $w = 1$ 일 때 $z_t = 3$, $a_t = 0$ 이면 $\hat z_{t+1}$ 은?

<details><summary>답 보기</summary>

$3 + 1 \times 0 = 3$ 이다. 그대로 있으면 latent 도 그대로다.

</details>

### 데이터로 배우는 dynamics

$w$ 는 로봇이 실제로 움직여 본 기록에서 배운다. 처음에는 world model 이 없으므로 아무 action 이나 무작위로 해 보며 기록을 모은다.
한 step 의 기록 "지금 latent, action, 실제 다음 latent" 를 transition 이라고 부르고, 모은 transition 들의 묶음을 dataset 이라고
한다.

| 지금 $z_t$ | action $a_t$ | 실제 다음 $z_{t+1}$ | 실제 변화 $z_{t+1} - z_t$ |
| --- | --- | --- | --- |
| 1 | $+1$ | 2 | $+1$ |
| 2 | $+1$ | 3 | $+1$ |
| 3 | $-1$ | 2 | $-1$ |
| 2 | $0$ | 2 | $0$ |

예측한 변화는 $w \times a_t$ 이고 실제 변화는 마지막 열이다. [Linear Regression](../linear-regression/README.md) 에서처럼 예측과
실제의 차이를 제곱해 평균한 MSE(mean squared error)를 loss 로 두고, gradient descent 로 loss 를 줄이는 $w$ 를 찾는다. gradient
descent 는 loss 를 줄이는 쪽으로 weight 를 조금씩 고치기를 되풀이하는 방법이다. 몇 가지 $w$ 를 넣어 보면 아래와 같다.

| $w$ | 예측 변화 ($w \times a_t$) | 오차 (예측 − 실제) | 오차의 제곱 | MSE |
| --- | --- | --- | --- | --- |
| 0 | $0, 0, 0, 0$ | $-1, -1, 1, 0$ | $1, 1, 1, 0$ | $3 \div 4 = 0.75$ |
| 1 | $1, 1, -1, 0$ | $0, 0, 0, 0$ | $0, 0, 0, 0$ | $0$ |
| 2 | $2, 2, -2, 0$ | $1, 1, -1, 0$ | $1, 1, 1, 0$ | $3 \div 4 = 0.75$ |

loss 는 $w = 1$ 에서 0 으로 가장 작으므로 학습이 끝나면 $w = 1$ 이 된다. 실제 world model 의 $f$ 는 이렇게 숫자 하나가 아니라
weight 가 수만 개인 neural network 이지만, "기록된 transition 의 다음 latent 를 맞히도록 loss 를 줄인다" 는 원리는 같다.

**확인 문제.** dataset 에 transition $(z_t, a_t, z_{t+1}) = (4, +1, 5)$ 하나만 있을 때, $w = 3$ 이면 이 transition 의 오차의
제곱은 얼마일까?

<details><summary>답 보기</summary>

예측 변화는 $3 \times 1 = 3$, 실제 변화는 $5 - 4 = 1$ 이라 오차는 $3 - 1 = 2$, 제곱은 4 다.

</details>

### reward model

다음 latent 만 예측해서는 그 행동이 좋은지 알 수 없으므로, latent 를 받아 그 step 의 reward 를 예측하는 부분도 함께 배운다. 이
부분을 reward model 이라고 하고 $g$ 로 적는다. 레일 로봇이 배울 reward model 은

$$
\hat r_{t+1} = g(\hat z_{t+1}) = -\,|\hat z_{t+1} - 4|
$$

이다. $\hat r_{t+1}$ 은 "알 햇 티 플러스 원" 이라고 읽고 step $t$ 의 action 뒤에 받을 reward 의 예측이다. 이 식은 "예측한 다음
latent 에서 4 를 빼고 부호를 떼어 마이너스를 붙인다" 로 읽는다. $\hat z_{t+1} = 2$ 면 $\hat r_{t+1} = -2$ 다.
아래 흐름도는 dynamics model 과 reward model 을 이은 한 step 의 계산이다.

![dynamics model 의 계산 흐름. z_t = 1 과 a_t = +1 이 들어가 w × a_t = 1 을 더해 다음 latent 예측 2 가 되고, reward model 이 그 latent 에서 reward 예측 −2 를 낸다](figures/dynamics-step.svg)

흐름도의 맨 오른쪽 칸이 방금 계산한 $-2$ 다. reward model 도 dynamics 처럼 transition 마다 기록된 실제 reward 와 예측의 차이를 줄이도록 배운다.

**흔한 오해.** 언어 모델을 사람의 선호에 맞게 고치는 RLHF(reinforcement learning from human feedback)에도 "reward model" 이 나온다.
그쪽 reward model 은 사람이 두 답변 중 어느 쪽을 더 좋아할지 맞히는 모델이다. world model 의 reward model 은 환경이 다음 step 에
줄 reward 를 예측하는 모델로, 같은 이름이지만 배우는 대상이 다르다.

**확인 문제.** $\hat z_{t+1} = 7$ 이면 $\hat r_{t+1}$ 은? $\hat z_{t+1} = 4.5$ 면?

<details><summary>답 보기</summary>

$-|7 - 4| = -3$ 이고, $-|4.5 - 4| = -0.5$ 다.

</details>

### 상상 속 rollout

시작 state 에서 action 을 차례로 넣어 여러 step 을 이어 계산하는 것을 rollout 이라고 한다. dynamics model 은 자기가 낸 예측을 다시
입력으로 받을 수 있으므로 rollout 을 할 수 있다. 칸 1 의 그림을 encoder 에 넣어 $z_0 = 1$ 을 얻은 뒤 action
$+1, +1, +1$ 을 차례로 넣으면 아래처럼 세 step 앞까지 예측한다($w = 1$).

| step | 넣은 latent | action | 예측한 다음 latent | 예측 reward |
| --- | --- | --- | --- | --- |
| 1 | $z_0 = 1$ | $+1$ | $\hat z_1 = 2$ | $-2$ |
| 2 | $\hat z_1 = 2$ | $+1$ | $\hat z_2 = 3$ | $-1$ |
| 3 | $\hat z_2 = 3$ | $+1$ | $\hat z_3 = 4$ | $0$ |

둘째 줄부터는 넣은 latent 가 실제 그림에서 온 값이 아니라 바로 윗줄의 예측이다. 카메라는 처음 한 번만 쓰고 그 뒤로는 그림 없이
latent 만으로 앞을 내다본다.

![칸 1 의 그림을 encoder 에 한 번 넣어 z_0 = 1 을 얻고, f 에 +1 을 세 번 넣어 2, 3, 4 를 예측한다. 예측 reward 는 −2, −1, 0 이다. 이 동안 실제 로봇은 움직이지 않는다](figures/imagined-rollout.svg)

RL 에서는 실제 환경에서 policy 를 끝까지 실행해 본 것도 rollout 이라고 부르므로, world model 안에서만 계산한 rollout 은 따로 상상(imagination) 속 rollout 이라고
부른다. 2020년 Dreamer 논문(Dream to Control)의 제목에 든 "Latent Imagination" 이 latent 안에서 하는 이 상상 속 rollout 을 가리킨다.

중간에 실제 관측으로 고치지 않고 처음 정한 action 만 넣어 끝까지 가는 계산을 open-loop 라고 한다. loop 는 "결과를 다시 보고 고치는
고리" 이고, open 은 그 고리가 열려 있다(결과를 다시 보지 않는다)는 뜻이다. 결과를 다시 보고 고치는 쪽은 closed-loop 라고 하며,
[PID Control](../pid-control/README.md) 의 feedback 이 그 예다.

**확인 문제.** $w = 1$ 인 world model 에서 $z_0 = 6$ 으로 시작해 action $-1, -1$ 을 넣으면 예측 latent 와 예측 reward 는 step 마다
얼마일까?

<details><summary>답 보기</summary>

step 1 은 $6 - 1 = 5$, reward $-|5 - 4| = -1$ 이고, step 2 는 $5 - 1 = 4$, reward 0 이다.

</details>

### world model 의 일반 식

지금까지의 세 부분을 기호로 모으면 아래와 같다.

$$
z_t = \text{encoder}_\phi(o_t),\qquad \hat z_{t+1} = f_\psi(z_t, a_t),\qquad \hat r_{t+1} = g_\psi(\hat z_{t+1})
$$

$\phi$ 는 "파이(phi)" 라고 읽고 encoder 의 weight 전체를, $\psi$ 는 "프사이(psi)" 라고 읽고 dynamics model 과 reward model 의 weight
전체를 가리킨다. 레일 예에서 $\psi$ 는 $w$ 하나였다. 이 식은 "그림을 encoder 로 latent 로 줄이고, latent 와 action 으로 다음 latent
를 예측하고, 그 latent 로 reward 를 예측한다" 로 읽는다. 레일 예의 숫자를 대응시키면 $o_t$ 는 $(0, 1, 0, 0, 0, 0, 0, 0)$, $z_t$ 는 1,
$a_t$ 는 $+1$, $\hat z_{t+1}$ 은 2, $\hat r_{t+1}$ 은 $-2$ 다.

![Pendulum 의 world model. 64×64×3 그림 o_t 를 encoder 가 수십 차원 latent z_t 로 줄이고, dynamics model f 와 reward model g 가 z_t 와 action a_t 로 다음 latent 와 reward 를 예측한다. 예측한 latent 에 다시 f 를 적용해 여러 step 을 이어 간다](figures/latent-model.svg)

위 그림은 같은 구조를 Pendulum 에 쓴 모습이다. 그림 $o_t$ 는 처음에 한 번만 encoder 에 넣고, 그 뒤의 예측은 모두 latent 안에서
한다. 점선은 예측한 $\hat z_{t+1}$ 을 다시 $f$ 에 넣는 상상 속 rollout 이다.

**요약**

- dynamics model $f$ 는 $(z_t, a_t)$ 로 $\hat z_{t+1}$ 을, reward model $g$ 는 그 latent 로 $\hat r_{t+1}$ 을 예측하고, 둘 다 실제로 모은
  transition 의 값을 맞히도록 배운다
- 예측을 다시 입력으로 넣으면 그림 없이 여러 step 앞까지 내다볼 수 있다. 이것이 상상 속 rollout 이고, 실제 관측으로 고치지 않으므로
  open-loop 다

## 상상 속 planning

### 후보 행동열의 비교

world model 이 있으면 행동을 고르는 방법이 하나 생긴다. 앞으로 할 행동 몇 개를 줄지어 놓은 것을 행동열(action sequence)이라고
하는데, 행동열 후보를 여러 개 만들어 world model 안에서 rollout 해 보고 예측 reward 합이 가장 큰 후보를 고르는 것이다. 행동하기
전에 결과를 예측해 행동을 고르는 이 일을 planning 이라고 하고, 몇 step 앞까지 내다보는지를 horizon 이라 하며 $H$ 로 적는다.

로봇이 칸 1 에 있고($z_0 = 1$) $H = 3$ 일 때, 아래 후보 넷을 $w = 1$ 인 world model 로 비교한다.

| 후보 | 행동열 | 예측 latent | 예측 reward | 합 |
| --- | --- | --- | --- | --- |
| A | $(+1, +1, +1)$ | $2, 3, 4$ | $-2, -1, 0$ | $-3$ |
| B | $(+1, +1, 0)$ | $2, 3, 3$ | $-2, -1, -1$ | $-4$ |
| C | $(+1, 0, 0)$ | $2, 2, 2$ | $-2, -2, -2$ | $-6$ |
| D | $(0, 0, 0)$ | $1, 1, 1$ | $-3, -3, -3$ | $-9$ |

합이 가장 큰 것은 $-3$ 인 A 다. 셋째 step 에 충전기에 닿는 A 가 가장 빨리 reward 0 에 이르므로 당연한 결과다. 네 후보를 비교하는
데 든 계산은 $4 \times 3 = 12$ 번의 latent 예측이고, 실제 로봇은 아직 한 칸도 움직이지 않았다.

![step 0 부터 3 까지 네 후보의 예측 위치. A 는 2, 3, 4 로 충전기에 닿아 합 −3, B 는 3 에서 멈춰 −4, C 는 2 에 머물러 −6, D 는 1 에 머물러 −9 다. 가장 큰 합 −3 의 A 를 고른다](figures/plan-candidates.svg)

위 그림은 네 후보의 예측 위치를 step 순서대로 이은 것이고, 점선이 충전기(칸 4)다. 선이 점선에 빨리 닿고 오래 머물수록 합이 크다.

### 숫자를 바꾼 두 번째 계획

같은 후보 넷으로 로봇이 칸 3 에서 출발하면($z_0 = 3$) 결과가 달라진다.

| 후보 | 행동열 | 예측 latent | 예측 reward | 합 |
| --- | --- | --- | --- | --- |
| A | $(+1, +1, +1)$ | $4, 5, 6$ | $0, -1, -2$ | $-3$ |
| B | $(+1, +1, 0)$ | $4, 5, 5$ | $0, -1, -1$ | $-2$ |
| C | $(+1, 0, 0)$ | $4, 4, 4$ | $0, 0, 0$ | $0$ |
| D | $(0, 0, 0)$ | $3, 3, 3$ | $-1, -1, -1$ | $-3$ |

이번에는 한 칸 가서 멈추는 C 가 합 0 으로 가장 좋다. A 는 충전기를 지나쳐서 오히려 reward 가 깎인다. 같은 후보라도 출발 자리에
따라 가장 좋은 것이 바뀌므로, planning 은 지금 자리에서 매번 새로 해야 한다.

이 비교를 기호로 쓰면 아래와 같다.

$$
a^*_{0:H} = \arg\max_{a_{0:H}} \sum_{k=0}^{H-1} \hat r_{k+1},\qquad \hat z_0 = z_0,\quad \hat z_{k+1} = f(\hat z_k, a_k),\quad \hat r_{k+1} = g(\hat z_{k+1})
$$

$a_{0:H}$ 는 "step 0 부터 $H$ 바로 전까지의 행동열" 로, 위 표의 행동열 열이다. $\sum_{k=0}^{H-1}$ 은 시그마(sigma)라고 읽고 "$k$ 를
0 부터 $H - 1$ 까지 바꿔 가며 모두 더한다" 는 뜻이라서, 위 표의 합 열이 이 값이다. $\arg\max$ 는 "그 값을 가장 크게 만드는 것을
고른다" 는 뜻이고 $a^*$ 의 별표는 고른 결과라는 표시다. 오른쪽의 세 식은 "처음 latent 는 encoder 가 낸 $z_0$ 이고, 그 뒤로는 $f$ 로
다음 latent 를, $g$ 로 reward 를 예측한다" 는 rollout 규칙이다. 두 번째 표라면 $H = 3$, $z_0 = 3$ 이고 $a^*$ 는 C 의 $(+1, 0, 0)$ 이다.

[Bandits & MDPs](../bandit-mdp/README.md) 의 return 은 늦게 받는 reward 를 discount factor $\gamma$ 로 깎아 더했지만, 여기서는
horizon 이 짧아서 깎지 않고 그대로 더했다.

**흔한 오해.** planning 이 고르는 것은 "세상의 모든 행동열 가운데 가장 좋은 것" 이 아니라 "만들어 본 후보 가운데 가장 좋은 것" 이다.
첫 번째 표에서 $(+1, +1, +1)$ 이 후보에 없었다면 B 가 골라졌을 것이다. 행동이 셋뿐이고 $H = 3$ 이면 가능한 행동열이
$3 \times 3 \times 3 = 27$ 개라 모두 넣어 볼 수 있지만, 행동이 연속된 숫자이거나 $H$ 가 길면 모두 넣어 볼 수 없다. 후보를 잘 만드는
방법은 다음 절에서 다룬다.

**확인 문제.** 로봇이 칸 5 에 있고($z_0 = 5$) 후보가 $(-1, 0, 0)$ 과 $(-1, -1, 0)$ 둘일 때, 각 후보의 예측 reward 합과 고를
후보는?

<details><summary>답 보기</summary>

$(-1, 0, 0)$ 은 latent 4, 4, 4 로 reward 0, 0, 0, 합 0 이다. $(-1, -1, 0)$ 은 4, 3, 3 으로 reward $0, -1, -1$, 합 $-2$ 다. 합이
큰 $(-1, 0, 0)$ 을 고른다.

</details>

**요약**

- planning 은 행동열 후보를 world model 안에서 rollout 해 예측 reward 합을 비교하고, 합이 가장 큰 후보를 고르는 일이다
- 출발 자리가 바뀌면 가장 좋은 후보도 바뀐다. 칸 1 에서는 A, 칸 3 에서는 C 였다
- planning 은 만들어 본 후보 안에서만 고를 수 있다

## CEM

### 후보를 뽑는 분포

Pendulum 의 토크는 $-2$ 부터 2 사이의 아무 실수나 될 수 있어서, 행동이 셋뿐인 레일처럼 모든 행동열을 적어 볼 수 없다. 그래서 후보를
무작위로 뽑는다. 무작위로 뽑는다는 것은 어떤 값이 얼마나 자주 나올지를 정한 분포에서 값을 꺼낸다는 뜻이고, 이렇게 값을 꺼내는 일을
sampling 이라고 한다.

[VAE](../vae/README.md) 에서 본 정규분포(Gaussian) $\mathcal N(\mu, \sigma^2)$ 은 평균 $\mu$ 근처에서 가장 자주, 멀어질수록 드물게
값이 나오는 종 모양 분포였다. 값의 약 68% 가 $\mu - \sigma$ 와 $\mu + \sigma$ 사이에 나오므로, $\mu$ 는 "어디쯤에서 뽑을지",
$\sigma$ 는 "얼마나 넓게 뽑을지" 를 정한다.

후보를 무작위로 한 번 뽑아 가장 좋은 것을 고르면 운이 좋아야 좋은 후보가 나온다. cross-entropy method(CEM)는 뽑기를 여러 번
되풀이하면서, 앞에서 점수가 좋았던 후보 근처에서 다음 후보를 뽑도록 분포를 옮긴다. 이름의 cross-entropy 는 두 분포가 얼마나 다른지를 재는 양으로,
이 방법을 처음 유도할 때 쓰여서 이름에 남았다. 지금 쓰는 계산에는 평균과 표준편차만 나온다.

**확인 문제.** $\mathcal N(2, 0.5^2)$ 에서 뽑으면 값의 약 68% 는 어느 범위에 나올까?

<details><summary>답 보기</summary>

$\mu - \sigma = 1.5$ 부터 $\mu + \sigma = 2.5$ 사이다.

</details>

### elite 로 다시 맞춘 분포

계산을 손으로 할 수 있게 레일 로봇의 action 을 잠시 연속된 숫자로 바꾼다. action $a$ 만큼 칸을 움직이고(1.5 면 한 칸 반), $H = 1$
이라 action 하나만 고른다. 로봇이 칸 1 에 있으면 예측 latent 는 $1 + a$, 점수(예측 reward)는 $-|1 + a - 4| = -|a - 3|$ 이다. 정답이
$a = 3$ 이라는 것을 우리는 알지만, CEM 은 모르고 찾아간다.

CEM 은 아래를 되풀이한다.

1. 지금 분포 $\mathcal N(\mu, \sigma^2)$ 에서 후보를 여러 개 뽑는다
2. 후보마다 world model 로 점수를 매긴다
3. 점수가 가장 좋은 몇 개를 고른다. 이렇게 고른 후보를 elite(엘리트)라고 한다
4. elite 들의 평균과 표준편차를 새 $\mu$, $\sigma$ 로 삼는다

처음 분포는 $\mu = 0$, $\sigma = 2$ 로 넓게 잡고, 반복마다 후보 4 개를 뽑아 상위 2 개를 elite 로 쓴다. 뽑은 값은 아래처럼 나왔다고
하자.

| 반복 | 분포 | 뽑은 후보 | 점수 $-\lvert a - 3 \rvert$ | elite | 새 $\mu$ | 새 $\sigma$ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | $\mathcal N(0, 2^2)$ | $-2, -1, 1, 2$ | $-5, -4, -2, -1$ | $1, 2$ | 1.5 | 0.5 |
| 2 | $\mathcal N(1.5, 0.5^2)$ | $1, 1.5, 2, 2.5$ | $-2, -1.5, -1, -0.5$ | $2, 2.5$ | 2.25 | 0.25 |
| 3 | $\mathcal N(2.25, 0.25^2)$ | $2, 2.25, 2.5, 2.75$ | $-1, -0.75, -0.5, -0.25$ | $2.5, 2.75$ | 2.625 | 0.125 |

새 $\mu$ 는 elite 둘의 평균이다. 반복 1 이면 $(1 + 2) \div 2 = 1.5$ 다. 새 $\sigma$ 는 표준편차로, 각 elite 가 평균에서 떨어진 거리를
제곱해 평균한 값(분산)의 제곱근이다. 반복 1 의 elite 1 과 2 는 평균 1.5 에서 $-0.5$, $+0.5$ 떨어져 있으므로 분산은
$(0.25 + 0.25) \div 2 = 0.25$, 표준편차는 $\sqrt{0.25} = 0.5$ 다. 제곱근 $\sqrt{\ }$ 은 제곱해서 그 수가 되는 양수다.

![CEM 세 번의 반복. 가로축은 action 값이고 정답은 3 이다. 반복마다 후보 4 개(회색) 가운데 점수 상위 2 개(주황)로 분포를 다시 맞추면 평균이 0 → 1.5 → 2.25 → 2.625 로 3 에 다가가고 폭이 2 → 0.5 → 0.25 → 0.125 로 좁아진다](figures/cem-iterations.svg)

$\mu$ 는 $0 \to 1.5 \to 2.25 \to 2.625$ 로 정답 3 에 다가가고, 3 까지 남은 거리는 $3 \to 1.5 \to 0.75 \to 0.375$ 로 반복마다 반으로
준다. $\sigma$ 도 $2 \to 0.5 \to 0.25 \to 0.125$ 로 좁아져서, 좋은 자리 근처를 점점 촘촘하게 뒤진다. 반복을 마치면 마지막 $\mu$ 를
계획으로 쓴다.

$H$ 가 1 보다 크면 step 마다 $\mu$ 와 $\sigma$ 를 하나씩 둔다. $H = 12$ 라면 $\mu$ 12 개와 $\sigma$ 12 개로 행동열 하나를 뽑고,
elite 행동열들의 step 별 평균과 표준편차로 각각을 다시 맞춘다. Pendulum 처럼 action 에 범위가 있으면 뽑은 값이 범위를 넘을 때
가장자리 값($-2$ 나 2)으로 자른다.

**흔한 오해.** CEM 이 world model 의 weight 를 학습한다고 생각하기 쉽다. CEM 이 고치는 것은 행동열을 뽑는 분포의 $\mu$, $\sigma$ 뿐이고,
world model 의 $w$ 는 그대로다. 또 CEM 은 gradient 를 쓰지 않고 점수 비교만으로 좋은 쪽을 찾는다.

**확인 문제.** 어떤 반복에서 elite 가 3 과 5 였다. 새 $\mu$ 와 $\sigma$ 는?

<details><summary>답 보기</summary>

$\mu = (3 + 5) \div 2 = 4$ 다. 두 값은 4 에서 $-1$, $+1$ 떨어져 있어 분산은 $(1 + 1) \div 2 = 1$ 이고, $\sigma = \sqrt 1 = 1$ 이다.

</details>

### planning 에 드는 계산량

CEM 은 실제 step 하나를 고를 때마다 world model 을 아주 많이 계산한다. 후보 1000 개를 10 번 반복해 뽑으면 rollout 이
$1000 \times 10 = 10{,}000$ 번이고, rollout 하나가 $H = 12$ step 이면 latent 예측은

$$
10{,}000 \times 12 = 120{,}000
$$

번이다. 이 계산을 그림 단위로 하면 예측마다 숫자 12,288 개를 내야 하지만, latent
가 30 개면 예측마다 30 개만 내면 된다. latent 에서 예측하는 이유가 여기에도 있다. 그래도 계산이 많으므로 후보 1000 개를 하나씩
따로 계산하지 않고, 한 묶음(batch)으로 쌓아 GPU 에서 한꺼번에 계산한다. GPU 는 같은 종류의 곱셈과 덧셈을 수천 개씩 동시에 하도록 만든 계산 칩이다.

**확인 문제.** 후보 500 개, 반복 4 번, $H = 10$ 이면 실제 step 하나에 latent 예측은 몇 번일까?

<details><summary>답 보기</summary>

$500 \times 4 \times 10 = 20{,}000$ 번이다.

</details>

**요약**

- CEM 은 분포에서 행동열 후보를 뽑아 world model 로 점수를 매기고, 점수 상위 elite 의 평균과 표준편차로 분포를 다시 맞추기를
  되풀이한다
- 레일 예에서 평균은 $0 \to 1.5 \to 2.25 \to 2.625$ 로 정답 3 에 다가가고 표준편차는 $2 \to 0.5 \to 0.25 \to 0.125$ 로 좁아졌다
- 후보 1000 개 × 반복 10 번 × $H = 12$ 면 실제 step 하나에 latent 예측 120,000 번이 든다

## 예측 오차의 누적

### step 마다 쌓이는 오차

지금까지는 world model 이 $w = 1$ 로 정확했다. 실제로 배운 world model 은 조금씩 틀린다. 데이터가 적거나 카메라 그림에 잡음이
있어서, 레일 로봇의 world model 이 $w = 1.5$ 를 배웠다고 하자. action 하나에 한 칸 반 간다고 잘못 믿는 것이다.

칸 1 에서 $+1, +1, +1$ 을 open-loop 로 rollout 하면 아래처럼 된다.

| step | 실제 칸 | 예측 latent ($w = 1.5$) | 오차 (예측 − 실제) |
| --- | --- | --- | --- |
| 0 | 1 | 1 | 0 |
| 1 | 2 | $1 + 1.5 = 2.5$ | $0.5$ |
| 2 | 3 | $2.5 + 1.5 = 4$ | $1$ |
| 3 | 4 | $4 + 1.5 = 5.5$ | $1.5$ |

한 step 의 오차는 0.5 지만, 예측 위에 다시 예측을 쌓으면 앞 step 의 오차를 고치지 못한 채 새 오차가 더해져 0.5, 1, 1.5 로 커진다.
셋째 step 에서는 실제로는 충전기(칸 4)에 있는데 world model 은 충전기를 한 칸 반 지나쳤다고 예측한다.

![실제 칸(초록)은 1, 2, 3, 4 이고 w = 1.5 로 예측한 latent(주황)는 1, 2.5, 4, 5.5 다. 둘 사이의 오차가 0.5, 1, 1.5 로 step 마다 커진다](figures/error-accumulation.svg)

숫자만 바꿔 $w = 1.2$ 이면 예측은 2.2, 3.4, 4.6 이고 오차는 0.2, 0.4, 0.6 이다. 한 step 오차가 작아져도 step 수만큼 곱해져 쌓이는
모양은 같아서, $H = 12$ 면 마지막 오차는 $0.2 \times 12 = 2.4$ 칸이 된다.

**확인 문제.** $w = 0.8$ 인 world model 로 칸 0 에서 $+1$ 을 네 번 넣으면 넷째 step 의 예측과 오차는?

<details><summary>답 보기</summary>

예측은 $0.8, 1.6, 2.4, 3.2$ 이고 실제는 1, 2, 3, 4 라서 넷째 step 오차는 $3.2 - 4 = -0.8$ 이다. step 마다 $-0.2$ 씩 쌓였다.

</details>

### 입력으로 되먹임되는 오차

앞의 오차는 step 마다 같은 양씩 늘었는데, 오차가 다음 예측의 입력에 들어가서 그 자체로 더 큰 오차를 낳으면 더 빨리 커진다.
action 0(그대로)일 때 실제 로봇은 움직이지 않지만, world model 이 "그대로 두면 latent 가 1.2 배가 된다", 곧 $\hat z_{t+1} = 1.2 \times z_t$
를 배웠다고 하자. 칸 1 에서 시작하면 아래와 같다.

| step | 실제 칸 | 예측 ($1.2 \times$ 앞 예측) | 오차 | 오차가 매번 0.2 씩 늘 때 |
| --- | --- | --- | --- | --- |
| 1 | 1 | $1.2$ | $0.2$ | $0.2$ |
| 2 | 1 | $1.2 \times 1.2 = 1.44$ | $0.44$ | $0.4$ |
| 3 | 1 | $1.44 \times 1.2 = 1.728$ | $0.728$ | $0.6$ |
| 4 | 1 | $1.728 \times 1.2 \approx 2.074$ | $1.074$ | $0.8$ |
| 5 | 1 | $2.074 \times 1.2 \approx 2.488$ | $1.488$ | $1.0$ |

step 2 의 예측 1.44 는 "1.2 의 1.2 배" 다. 앞 step 에서 이미 0.2 만큼 틀린 1.2 를 받아 다시 1.2 배를 했으므로, 앞의 오차 0.2 도
1.2 배가 되어 $0.2 \times 1.2 = 0.24$ 가 되고 여기에 새 오차 0.2 가 더해진다($0.24 + 0.2 = 0.44$). 이렇게 오차가 입력을 통해
되먹임되므로, 마지막 열처럼 같은 양씩 늘 때보다 점점 더 벌어진다.

![오차를 step 별로 그린 그래프. 같은 양씩 늘면 0.2, 0.4, 0.6, 0.8, 1.0 의 직선이지만, 입력으로 되먹임되면 0.2, 0.44, 0.728, 1.074, 1.488 로 위로 휘며 더 빨리 커진다](figures/error-feedback.svg)

neural network 로 만든 world model 은 대개 이 두 가지가 섞여 있어서, 한 step 예측이 꽤 정확해도 10 step 남짓 rollout 하면 크게
틀어질 수 있다. 이것이 world model 로 먼 미래까지 planning 하기 어려운 가장 큰 이유다.

**확인 문제.** $\hat z_{t+1} = 2 \times z_t$ 를 배운 world model 로 실제로는 칸 1 에 가만히 있는 로봇을 세 step 예측하면 오차는
step 마다 얼마일까?

<details><summary>답 보기</summary>

예측은 2, 4, 8 이고 실제는 1, 1, 1 이라 오차는 1, 3, 7 이다. 같은 양씩 늘었다면 1, 2, 3 이었을 텐데 훨씬 빨리 커진다.

</details>

### 틀린 model 을 믿은 계획

예측이 틀리면 planning 도 틀린다. $w = 1.5$ 인 world model 로 칸 1 에서 앞의 후보 넷을 비교하면 아래와 같다.

| 후보 | 행동열 | 예측 latent ($w = 1.5$) | 예측 reward | 예측 합 | 실제 합 ($w = 1$) |
| --- | --- | --- | --- | --- | --- |
| A | $(+1, +1, +1)$ | $2.5, 4, 5.5$ | $-1.5, 0, -1.5$ | $-3$ | $-3$ |
| B | $(+1, +1, 0)$ | $2.5, 4, 4$ | $-1.5, 0, 0$ | $-1.5$ | $-4$ |
| C | $(+1, 0, 0)$ | $2.5, 2.5, 2.5$ | $-1.5, -1.5, -1.5$ | $-4.5$ | $-6$ |
| D | $(0, 0, 0)$ | $1, 1, 1$ | $-3, -3, -3$ | $-9$ | $-9$ |

world model 은 B 가 두 번만 움직여 충전기에 닿는다고 믿고 B 를 고른다. 실제로 B 를 하면 칸 3 에서 멈춰 합이 $-4$ 이고, 실제로 가장
좋은 A 의 $-3$ 보다 나쁘다. planner 는 world model 이 틀린 곳, 여기서는 "적게 움직여도 멀리 간다" 는 착각을 그대로 믿고 그쪽을
골랐다. planner 는 예측 점수가 높은 곳을 찾아다니므로, model 이 점수를 실제보다 높게 예측하는 곳이 있으면 거기로 끌려가기 쉽다.

**확인 문제.** 이 표에서 world model 의 예측 합과 실제 합이 같은 후보는 어느 것이고, 왜 같을까?

<details><summary>답 보기</summary>

A 와 D 다. D 는 움직이지 않아서 $w$ 가 틀려도 예측이 실제와 같다. A 는 예측 위치(2.5, 4, 5.5)와 실제 위치(2, 3, 4)가 다르지만, 충전기
까지의 거리 합이 $1.5 + 0 + 1.5 = 3$ 과 $2 + 1 + 0 = 3$ 으로 우연히 같다.

</details>

### 여러 step 을 펼친 학습

오차가 rollout 을 따라 쌓이는 문제는 학습할 때부터 줄일 수 있다. 앞 절의 dynamics 학습은 transition 마다 실제 $z_t$ 에서 출발해
한 step 만 예측했다. 그런데 planning 할 때는 자기 예측 위에 다시 예측하므로, 학습 때 본 상황과 쓸 때의 상황이 다르다.

그래서 학습할 때도 실제 그림에서 얻은 $z_0$ 하나에서 출발해 action 만 주고 여러 step 을 펼친 뒤, 펼친 예측마다 실제 그림에서 얻은
latent 와 비교해 loss 를 더한다. 이것을 multi-step loss 라고 한다. 칸 1, 2, 3, 4 를 지난 기록 하나로 $w = 1.5$ 의 두 loss 를
비교하면 아래와 같다(오차의 제곱을 더하기만 한다).

| step | 실제 | 한 step 예측 (실제에서 출발) | 제곱 오차 | 여러 step 예측 (예측에서 출발) | 제곱 오차 |
| --- | --- | --- | --- | --- | --- |
| 1 | 2 | $1 + 1.5 = 2.5$ | 0.25 | 2.5 | 0.25 |
| 2 | 3 | $2 + 1.5 = 3.5$ | 0.25 | 4 | 1 |
| 3 | 4 | $3 + 1.5 = 4.5$ | 0.25 | 5.5 | 2.25 |
| 합 | | | 0.75 | | 3.5 |

한 step loss 는 0.75 지만 multi-step loss 는 3.5 로, rollout 에서 실제로 생기는 오차를 그대로 벌한다. 숫자만 바꿔 $w = 1.2$ 면 한
step loss 는 $0.04 \times 3 = 0.12$, multi-step loss 는 $0.04 + 0.16 + 0.36 = 0.56$ 이다. multi-step loss 를 줄이도록 배운 world
model 은 오차가 쌓여 커지는 쪽을 특히 피하게 되므로, 긴 rollout 에서 덜 틀어진다. PlaNet 논문의 latent overshooting 이 이 생각을
latent 의 분포에 맞게 다듬은 학습 방법이다.

**확인 문제.** $w = 2$ 인 world model 로 같은 기록(칸 1 → 2 → 3 → 4, action $+1$ 세 번)의 한 step loss 와 multi-step loss 를
구하면?

<details><summary>답 보기</summary>

한 step 예측은 3, 4, 5 로 오차가 1, 1, 1 이라 loss 는 3 이다. 여러 step 예측은 3, 5, 7 로 오차가 1, 2, 3 이라 loss 는
$1 + 4 + 9 = 14$ 다.

</details>

**요약**

- 예측 위에 다시 예측하면 오차가 step 마다 쌓인다. $w = 1.5$ 면 0.5, 1, 1.5 로 늘고, 오차가 입력으로 되먹임되면 0.2, 0.44, 0.728
  처럼 더 빨리 는다
- planner 는 예측 점수가 높은 곳을 찾으므로 model 이 틀린 곳을 믿고 틀린 계획(B)을 고를 수 있다
- 여러 step 을 펼쳐 비교하는 multi-step loss 는 rollout 에서 쌓이는 오차를 학습 때부터 벌한다

## MPC

### 첫 action 만 실행하는 계획

$w = 1.5$ 인 world model 이 고른 B $(+1, +1, 0)$ 를 끝까지 그대로 실행하면 로봇은 칸 3 에서 멈춘다. 그런데 B 의 첫 action 만 하고
나서 카메라를 다시 보면, 로봇이 실제로는 칸 2.5 가 아니라 칸 2 에 있다는 것을 알 수 있다. 그 자리에서 다시 계획하면 틀린 예측이
쌓이기 전에 바로잡을 수 있다.

model predictive control(MPC)은 매 step 이렇게 한다.

1. 카메라 그림을 encoder 에 넣어 지금 latent 를 얻는다
2. 그 latent 에서 길이 $H$ 의 행동열을 planning 한다
3. 행동열의 첫 action 하나만 실제로 한다
4. 다음 step 에서 1 로 돌아간다

model predictive 는 "model 로 예측한다", control 은 "제어한다(움직임을 원하는 대로 이끈다)" 는 뜻이다. 매 step 실제 관측을 다시
보므로 closed-loop 다.

$w = 1.5$ 인 world model 과 같은 후보 넷으로 MPC 를 칸 1 에서 돌리면 아래와 같다. 실제 로봇은 고른 만큼 정확히 움직인다.

| 실제 step | 실제 칸 | 예측 합 A / B / C / D | 고른 후보 | 실행한 첫 action | 다음 실제 칸 |
| --- | --- | --- | --- | --- | --- |
| 0 | 1 | $-3$ / $-1.5$ / $-4.5$ / $-9$ | B | $+1$ | 2 |
| 1 | 2 | $-4$ / $-2.5$ / $-1.5$ / $-6$ | C | $+1$ | 3 |
| 2 | 3 | $-6$ / $-4.5$ / $-1.5$ / $-3$ | C | $+1$ | 4 |
| 3 | 4 | $-9$ / $-7.5$ / $-4.5$ / $0$ | D | $0$ | 4 |

step 1 의 C 는 latent 2 에서 $2 + 1.5 = 3.5$ 로 한 번 움직이고 멈추는 계획이라 예측 reward 가 $-0.5$ 씩 세 번, 합 $-1.5$ 다. 칸 4 에
도착한 step 3 에서는 움직이면 모두 충전기를 벗어난다고 예측하므로 그대로 있는 D 를 고른다. world model 은 끝까지 $w = 1.5$ 로
틀렸지만, 로봇은 세 step 만에 충전기에 도착해 머문다.

![MPC 의 네 step. 매 step 실제 칸에서 w = 1.5 로 계획을 세우고(주황 원은 계획이 예측한 위치) 첫 action 만 실행한다. 실제 칸은 1 → 2 → 3 → 4 → 4 로 충전기에 도착한다](figures/mpc-steps.svg)

**확인 문제.** 위 표의 step 1 에서 A 의 예측 합 $-4$ 를 직접 계산해 보자.

<details><summary>답 보기</summary>

latent 2 에서 $+1$ 을 세 번 하면 예측은 $3.5, 5, 6.5$ 이고 reward 는 $-0.5, -1, -2.5$ 라서 합은 $-4$ 다.

</details>

### open-loop 실행과의 비교

같은 틀린 world model 로 두 방식을 비교하면 아래와 같다.

| 방식 | 실제로 지난 칸 | 실제 reward | 합 |
| --- | --- | --- | --- |
| B 를 끝까지 실행 (open-loop) | $2, 3, 3$ | $-2, -1, -1$ | $-4$ |
| MPC (closed-loop) | $2, 3, 4$ | $-2, -1, 0$ | $-3$ |

MPC 는 정확한 world model 로 고른 A 와 같은 합 $-3$ 을 얻었다. 계획이 틀려도 첫 action 하나만 쓰고 바로 실제 결과를 다시 보므로,
틀린 예측이 여러 step 쌓일 틈이 없다. 대가는 계산량이다. 실제 step 마다 planning 을 처음부터 다시 하므로, 앞의 계산대로라면 Pendulum
의 한 episode(시작부터 끝까지 한 판, 200 step) 동안 latent 예측을 $120{,}000 \times 200 = 24{,}000{,}000$ 번 한다.

MPC 가 model 오차를 모두 없애 주지는 않는다. 첫 action 도 틀린 model 로 고른 것이라서, model 이 크게 틀리면 첫 action 부터 엉뚱한
쪽을 고른다. MPC 는 틀린 예측이 여러 step 쌓이는 것을 막을 뿐이다.

**확인 문제.** $w = 1.5$ 인 world model 로 로봇이 칸 6 에 있을 때 후보 $(-1, 0, 0)$ 과 $(-1, -1, 0)$ 의 예측 합을 구하고, MPC 가
실행할 첫 action 과 그 뒤의 실제 칸을 답해 보자.

<details><summary>답 보기</summary>

$(-1, 0, 0)$ 은 예측 4.5, 4.5, 4.5 로 reward $-0.5$ 세 번, 합 $-1.5$ 다. $(-1, -1, 0)$ 은 4.5, 3, 3 으로 reward $-0.5, -1, -1$,
합 $-2.5$ 다. $(-1, 0, 0)$ 을 골라 첫 action $-1$ 을 하고, 실제 칸은 5 가 된다.

</details>

### model 오차와 planner 한계의 구분

MPC agent 가 잘 못할 때, 원인은 world model 이 틀린 것일 수도 있고 planner(후보 수, 반복 횟수, horizon)가 모자란 것일 수도 있다.
둘을 가르려면 같은 planner 에 world model 대신 진짜 환경의 식을 넣어 돌려 본다. 이렇게 정답 model 을 쓴 판을 oracle 이라고 하는데,
oracle 은 "신탁, 정답을 알려 주는 존재" 라는 뜻이다. 레일 예라면 $w = 1.5$ 대신 $w = 1$ 을 넣은 planner 가 oracle 이다.

oracle 은 model 이 완벽할 때 이 planner 가 낼 수 있는 성능이고, 무작위 action 의 성능은 아무것도 배우지 않았을 때다. 배운 world
model 의 성능 $R$ 이 그 사이 어디쯤인지는 아래 비율로 잰다.

$$
\text{score} = \frac{R - R_\text{random}}{R_\text{oracle} - R_\text{random}}
$$

$R$ 은 episode 의 reward 합(return)이고, 아래첨자 random 과 oracle 은 각각 무작위 action 과 oracle 의 return 이다. 이 식은 "무작위보다
얼마나 나아졌는지를, oracle 이 무작위보다 나아진 만큼으로 나눈다" 로 읽는다. 0 이면 무작위와 같고 1 이면 oracle 과 같다.

Pendulum 에서 무작위 action 의 return 은 $-1200$ 안팎이고, CEM 에 진짜 pendulum 식을 넣은 oracle 은 $-225$ 안팎이다. 배운 world
model 로 $R = -520$ 을 얻었다면

$$
\text{score} = \frac{-520 - (-1200)}{-225 - (-1200)} = \frac{680}{975} \approx 0.70
$$

이다. oracle 도 진자를 못 세운다면 world model 보다 planner 부터 고쳐야 한다.

**확인 문제.** $R_\text{random} = -100$, $R_\text{oracle} = 0$ 일 때 $R = -40$ 이면 score 는?

<details><summary>답 보기</summary>

$(-40 + 100) \div (0 + 100) = 60 \div 100 = 0.6$ 이다.

</details>

**요약**

- MPC 는 매 step 실제 관측에서 다시 계획하고 첫 action 하나만 실행한다. $w = 1.5$ 로 틀린 model 로도 칸 1 → 2 → 3 → 4 로 충전기에
  도착해, open-loop 로 B 를 실행한 합 $-4$ 보다 좋은 $-3$ 을 얻었다
- 대가는 실제 step 마다 planning 을 다시 하는 계산량이다
- 같은 planner 에 진짜 환경 식을 넣은 oracle 과 비교하면 model 오차와 planner 의 한계를 가를 수 있다

## 데이터 수집 반복

### 데이터 밖으로 이어진 reward model

world model 은 dataset 에 있는 상황에서만 믿을 만하다. 처음 dataset 을 무작위 action 으로 모았더니 로봇이 칸 0 ~ 3 만 다녔다고
하자. reward model 은 그 네 칸에서 받은 reward 만 보았다.

| 칸 $z$ | 0 | 1 | 2 | 3 |
| --- | --- | --- | --- | --- |
| 실제 reward | $-4$ | $-3$ | $-2$ | $-1$ |

이 네 점은 직선 $\hat r = z - 4$ 위에 정확히 놓인다. reward model 을 [Linear Regression](../linear-regression/README.md) 의 직선으로
만들어 이 데이터에 맞추면 loss 0 인 $\hat r = z - 4$ 가 나온다. 데이터가 있는 칸 0 ~ 3 에서는 완벽하다.

문제는 데이터 밖이다. 이 직선을 칸 4 너머까지 이어 그리면 칸 5 에서 $+1$, 칸 6 에서 $+2$ 로 계속 커진다. 실제 reward 는 칸 4 에서
가장 크고 그 뒤로 다시 작아지는 V 자 모양인데, world model 은 칸 4 너머를 본 적이 없으니 알 수 없다.

로봇이 칸 3 에 왔을 때 dynamics 는 정확하고($w = 1$) reward model 만 이 직선인 world model 로 앞의 후보 넷을 비교하면 아래와 같다.

| 후보 | 예측 latent | 예측 reward ($z - 4$) | 예측 합 | 실제 reward | 실제 합 |
| --- | --- | --- | --- | --- | --- |
| A $(+1, +1, +1)$ | $4, 5, 6$ | $0, 1, 2$ | $3$ | $0, -1, -2$ | $-3$ |
| B $(+1, +1, 0)$ | $4, 5, 5$ | $0, 1, 1$ | $2$ | $0, -1, -1$ | $-2$ |
| C $(+1, 0, 0)$ | $4, 4, 4$ | $0, 0, 0$ | $0$ | $0, 0, 0$ | $0$ |
| D $(0, 0, 0)$ | $3, 3, 3$ | $-1, -1, -1$ | $-3$ | $-1, -1, -1$ | $-3$ |

planner 는 예측 합 3 인 A 를 골라 충전기를 지나쳐 달려간다. 실제로 가장 좋은 C(합 0)는 예측 합이 0 이라 뒤로 밀렸다. "충전기를
지나칠수록 좋다" 는 착각은 데이터가 없는 칸에서 생겼고, planner 는 예측 점수가 높은 곳을 찾으므로 바로 그 칸으로 간다.

![칸 0~3 의 데이터(점)에 맞춘 reward model 직선 r = z − 4 를 칸 7 까지 이으면 계속 올라가지만, 실제 reward(초록)는 칸 4 에서 가장 크고 다시 내려간다. 칸 6 에서 예측은 +2, 실제는 −2 다](figures/reward-extrapolation.svg)

**확인 문제.** 이 직선 reward model 은 칸 7 의 reward 를 얼마로 예측하고, 실제 reward 는 얼마일까?

<details><summary>답 보기</summary>

예측은 $7 - 4 = 3$, 실제는 $-|7 - 4| = -3$ 이다. 차이가 6 이나 된다.

</details>

### 계획으로 모은 데이터의 재학습

이 문제는 틀린 계획을 실제로 해 보면서 풀린다. A 를 실행하면 로봇은 칸 4, 5, 6 에 가서 실제 reward $0, -1, -2$ 를 받는다. 이 기록을
dataset 에 더하면 reward model 은 칸 4 너머에서 reward 가 다시 줄어든다는 것을 배운다. 다시 학습한 world model 로 planning 하면 이번에는
C 를 고른다.

그래서 world model 은 한 번에 배우고 끝내지 않고 아래 고리를 몇 번 되풀이한다.

1. 무작위 action 으로 처음 dataset 을 모은다
2. dataset 으로 world model 을 학습한다
3. 그 world model 과 planner(MPC)로 실제 환경에서 episode 를 몇 개 더 모아 dataset 에 더한다
4. 2 로 돌아간다

![데이터 수집 반복. dataset 으로 world model 을 학습하고, world model 과 MPC 로 실제 환경에서 행동해 새 transition 을 모아 dataset 에 더하기를 되풀이한다. 처음 dataset 만 무작위 action 으로 모은다](figures/data-loop.svg)

3 에서 모은 데이터는 planner 가 "좋을 것" 이라고 믿은 곳의 데이터라서 쓸모가 크다. model 이 맞았다면 좋은 행동의 데이터가 쌓이고,
틀렸다면 그 착각을 고칠 데이터가 쌓인다. 앞의 레일 예에서는 칸 4 ~ 6 의 데이터가 이렇게 들어왔다.

**확인 문제.** 반복 3 에서 모은 데이터 대신 무작위 action 데이터만 계속 더하면, 레일 예의 착각(칸 4 너머 reward)은 얼마나 빨리
고쳐질까?

<details><summary>답 보기</summary>

무작위 action 은 칸 0 ~ 3 근처를 주로 다니므로 칸 4 너머에 가는 일이 드물어서 고쳐지는 데 오래 걸린다. planner 는 착각한 곳(칸 5, 6)으로
곧장 가므로 한 번 만에 그 칸의 데이터를 모은다.

</details>

### Pendulum 의 무작위 데이터

Pendulum 에서도 같은 일이 생긴다. 진자를 세우는 것이 목표인데, 무작위 토크로는 진자가 위로 서는 일이 드물다. 무작위 토크로 200
step 짜리 episode 를 2000 개 돌려 세어 보면, 진자가 똑바로 선 자세에서 20° 안쪽에 있던 step 은 전체의 약 4% 다.

그래서 무작위 데이터로만 배운 world model 은 진자가 선 근처, 곧 가장 중요한 자리를 거의 본 적이 없다. planner 가 진자를 세우려고
위쪽으로 데려가면 거기서 model 의 예측이 틀리고, 그 episode 를 dataset 에 더해 다시 학습하면 위쪽 예측이 나아진다. 반복할수록
진자가 위에 머무는 시간이 늘고, 위쪽 데이터도 함께 늘어난다.

**확인 문제.** 200 step 짜리 episode 10 개를 무작위 토크로 모았다. 그중 진자가 위쪽 20° 안에 있던 step 은 대략 몇 개일까?

<details><summary>답 보기</summary>

전체 step 이 $200 \times 10 = 2000$ 개이고 그 약 4% 라서 $2000 \times 0.04 = 80$ 개쯤이다.

</details>

**요약**

- world model 은 dataset 에 있던 상황에서만 믿을 만하다. 칸 0 ~ 3 데이터로 맞춘 직선 reward model 은 칸 6 에서 $+2$ 를 예측했지만
  실제는 $-2$ 였고, planner 는 그 착각을 따라갔다
- planner 로 모은 데이터를 dataset 에 더해 다시 학습하는 반복이 착각을 고치고, 중요한 자리의 데이터를 늘린다
- 무작위 토크의 Pendulum 데이터에서 진자가 선 자세 근처(20° 안)는 약 4% 뿐이다

## 실제 환경 데이터의 절약

### 실제 step 수의 비교

[DQN → SAC](../off-policy/README.md) 에서 같은 성능에 이르는 데 실제 environment 의 step 이 얼마나 적게 드는지를 sample
efficiency 라고 했다. sample 은 직접 겪어 얻은 경험 하나다. world model 을 쓰면 sample efficiency 가 크게 오른다.

레일 예로 세어 보면, 세 step 후보 넷을 실제로 다 해 보는 model-free 방식은 비교 한 번에 실제 step 12 번과 처음 자리로 되돌리기
3 번이 든다. world model 은 같은 비교를 latent 예측 12 번으로 하고, 실제로는 고른 action 하나만 한다.

| 방식 | 비교 한 번에 드는 실제 step | 비교 한 번에 드는 계산 |
| --- | --- | --- |
| 후보를 실제로 다 해 보기 | $4 \times 3 = 12$ (되돌리기 3 번 별도) | 거의 없음 |
| world model 안에서 비교 | 0 (고른 action 1 번만 실행) | latent 예측 $4 \times 3 = 12$ 번 |

world model 은 실제 step 이 들 자리를 계산으로 바꾼다. 실제 로봇의 step 은 시간이 걸리고, 사람이 물건을 다시 놓아 주어야 하고, 부딪히면 로봇이
부서질 수도 있다. 계산은 GPU 에서 빠르게 하고 몇 번을 해도 아무것도 부서지지 않는다.

한 번 모은 transition 을 버리지 않고 world model 학습에 계속 다시 쓰는 것도 이득이다. [Policy Gradient](../policy-gradient/README.md)
의 REINFORCE 는 policy 를 한 번 고치면 그때까지 모은 sample 을 버려야 했는데, world model 은 "이 상태에서 이 action 을 하면 이렇게 된다"
는 환경의 규칙을 배우는 것이라 어떤 policy 로 모은 transition 이든 그대로 학습에 쓸 수 있다.

PlaNet 논문은 64×64 그림만 보고 DeepMind Control(DeepMind 가 만든 simulator 속 제어 과제 모음)의 과제들을 풀면서, 강한 model-free 방법들보다 훨씬 적은 episode 로 그
방법들에 가깝거나 때로 더 높은 최종 성능을 냈다고 보고했다.

**확인 문제.** 세 step 후보 10 개를 비교한다. 실제로 다 해 보면 실제 step 은 몇 번이고, world model 안에서 비교하면 latent 예측은
몇 번일까?

<details><summary>답 보기</summary>

실제로 다 해 보면 $10 \times 3 = 30$ 번이고(되돌리기 별도), world model 안에서는 실제 step 0 번에 latent 예측 30 번이다.

</details>

### 상상 속 policy 학습

MPC 는 실제 step 마다 latent 예측을 수만 번 해서 느리다. Pendulum 예에서는 실제 step 하나에 120,000 번이었다. Dreamer 는 planning 을
매 step 하는 대신, world model 안의 상상 속 rollout 으로 policy 를 미리 학습해 둔다.

actor 와 critic 두 network 를 함께 두는 구조는 [Policy Gradient](../policy-gradient/README.md) 의 actor-critic 과 같다. actor 는 latent 를 받아 action 을 내는 policy network 이고,
critic 은 latent 가 앞으로 받을 reward 합(value)을 예측하는 network 다. 다만 episode 를 실제 환경에서 모으지 않고 world model 안에서
상상으로 만든다. dataset 의 latent 에서 출발해 actor 가 낸 action 을 $f$ 에 넣어 다음 latent 를, $g$ 로 reward 를 예측하기를 여러
step 되풀이하고, 이 상상 속 episode 로 actor 와 critic 을 고친다.

학습이 끝나면 실제 step 마다 encoder 한 번과 actor 한 번만 계산하면 action 이 나온다. MPC 의 120,000 번 예측과 비교하면 행동을 고르는
계산이 훨씬 가볍다.

| 방식 | 학습 때 | 실제 step 마다의 계산 |
| --- | --- | --- |
| MPC + CEM | world model 만 학습 | latent 예측 120,000 번 (후보 1000 × 반복 10 × $H$ 12) |
| Dreamer | world model 과 상상 속 actor-critic 학습 | encoder 1 번 + actor 1 번 |

![왼쪽 MPC 는 실제 step 마다 후보 행동열 수만 개를 world model 로 rollout 해서 고른다. 오른쪽 Dreamer 는 학습 때 world model 안에서 상상한 episode 로 actor 를 미리 학습해 두고, 실제 step 에서는 actor 를 한 번 계산한다](figures/mpc-vs-dreamer.svg)

Ha & Schmidhuber 의 2018년 World Models 논문도 비슷하게, world model 이 만든 상상(논문은 "꿈" 이라고 불렀다) 속에서 작은 controller 를
학습해 실제 환경으로 옮겼다.

**확인 문제.** 200 step 짜리 episode 하나를 MPC(실제 step 마다 latent 예측 120,000 번)로 돌릴 때와 Dreamer(실제 step 마다 actor
1 번)로 돌릴 때, 행동을 고르는 데 드는 계산 횟수는 각각 얼마일까?

<details><summary>답 보기</summary>

MPC 는 $120{,}000 \times 200 = 24{,}000{,}000$ 번의 latent 예측이고, Dreamer 는 actor 계산 200 번(encoder 200 번 별도)이다.

</details>

**요약**

- world model 은 후보 비교를 실제 step 대신 계산으로 하고, 모은 transition 을 어떤 policy 로 모았든 계속 다시 써서 sample efficiency 가
  높다
- Dreamer 는 world model 안의 상상 속 episode 로 actor-critic 을 학습해, 실제 step 마다의 계산을 actor 한 번으로 줄인다

## 대표 world model

### Ha & Schmidhuber 의 World Models

2018년 David Ha 와 Jürgen Schmidhuber 의 World Models 는 이 강의의 구성을 그대로 보여 준다. VAE 로 게임 화면을 latent 로 줄이고,
지난 latent 들을 차례로 받아 다음 latent 의 분포를 예측하는 network(MDN-RNN)를 dynamics 로 썼다. RNN(recurrent neural network)은
지난 입력의 요약을 기억해 두고 다음 입력을 하나씩 받는 network 이고, MDN(mixture density network)은 다음 값을 숫자 하나가 아니라
봉우리가 여럿일 수 있는 분포로 내는 출력 방식이다. 그 위에 action 을 내는 아주 작은 controller 를 두고, world model 이 만든 상상 속에서
controller 를 학습한 뒤 실제 게임으로 옮겼다.

### PlaNet 과 Dreamer

2019년 PlaNet(Deep Planning Network)은 64×64 그림만 보고 CEM 과 MPC 로 연속 제어 과제를 풀었다. latent 를 확정된 숫자 부분과
분포에서 뽑는 무작위 부분으로 나누어 둔 dynamics 를 RSSM(recurrent state-space model)이라고 부르는데, 확정된 부분은 RNN 처럼 지난
그림들의 요약을 기억해 두어서 그림 한 장에 안 보이는 속도를 담고, 무작위 부분은 미래가 하나로 정해지지 않는 경우를 담는다.
multi-step loss 를 latent 분포에 맞게 다듬은 latent overshooting 도 이 논문에서 나왔다.

2020년 Dreamer 는 같은 RSSM 위에서 planning 대신 상상 속 actor-critic 으로 행동을 배웠고, 2023년 DreamerV3 는 설정 하나로 150 개가 넘는
여러 분야의 과제를 풀었다. DreamerV3 는 사람의 시연 데이터 없이 처음부터 Minecraft 에서 다이아몬드를 캐낸 첫 알고리즘이기도 하다.

### decoder 없는 world model

지금까지의 world model 은 decoder 로 latent 에서 그림을 되살리는 reconstruction loss 로 latent 에 그림의 정보를 담았다. 그런데 그림을
pixel 하나하나까지 되살리려면 배경의 무늬처럼 행동과 상관없는 것까지 latent 에 담아야 한다. 그래서 decoder 를 빼고 "다음 latent 를
맞혀라" 만으로 배우려는 방법들이 나왔는데, 이렇게 하면 아무 쓸모 없는 답으로 loss 를 0 으로 만들 수 있다.

encoder 가 어떤 그림이든 $z = 0$ 을 내고, dynamics 가 언제나 $\hat z_{t+1} = 0$ 을 낸다고 하자. 칸 1 의 그림이든 칸 4 의 그림이든 다음
그림의 latent 도 0 이고 예측도 0 이라서, 다음 latent 를 맞히는 loss 는 0 이다. latent 가 아무 정보도 담지 않는데 loss 는
가장 작다. 이렇게 모든 입력이 한 점으로 쪼그라드는 것을 collapse 라고 한다.

reward 를 함께 예측하면 이 해가 막힌다. 칸 1 로 가는 transition 의 reward 는 $-3$, 칸 4 로 가는 transition 은 0 인데, latent 가 늘 0
이면 reward model 은 두 경우에 같은 값밖에 낼 수 없다. 둘의 평균 $-1.5$ 를 내도 제곱 오차는 $(-1.5 + 3)^2 + (-1.5 - 0)^2 = 2.25 + 2.25 = 4.5$
로 0 이 될 수 없으므로, loss 를 줄이려면 latent 가 두 칸을 구별해야 한다. [DQN → SAC](../off-policy/README.md) 의 target network 처럼,
비교 대상이 되는 다음 latent 를 천천히 따라오는 encoder 복사본으로 계산하는 방법도 collapse 를 막는 데 쓴다.

2024년 TD-MPC2 는 decoder 없는 latent world model 위에서 MPC 로 계획하는 방법으로, 하나의 설정으로 104 개 연속 제어 과제에서 좋은
결과를 냈다. 2025년 V-JEPA 2 는 100만 시간이 넘는 인터넷 영상으로 pixel 을 되살리지 않고 latent(representation) 공간에서만 예측하도록
미리 학습(pretraining)한 뒤, DROID dataset 의 로봇 영상 62 시간 미만으로 action 을 받는 world model(V-JEPA 2-AC)을 만들어 실물 Franka 로봇 팔에서
목표 그림을 주고 CEM 으로 계획해 물체를 집어 옮겼다. 이 강의의 latent CEM 과 같은 구조를 실물 규모로 키운 사례다.

**확인 문제.** encoder 가 모든 그림에 $z = 0$ 을 낼 때, 실제 reward 가 $-2$ 와 $0$ 인 두 transition 에서 reward model 이 낼 수 있는 가장
좋은 값과 그때의 제곱 오차 합은?

<details><summary>답 보기</summary>

같은 값 하나만 낼 수 있으므로 평균 $-1$ 이 가장 좋고, 제곱 오차 합은 $(-1 + 2)^2 + (-1 - 0)^2 = 1 + 1 = 2$ 다. 0 이 아니므로 latent 가
두 상황을 구별하도록 학습이 밀어 준다.

</details>

### 영상 world model

NVIDIA 의 Cosmos 는 대규모 영상으로 학습한 world foundation model 이다. foundation model 은 넓은 데이터로 미리 크게 학습해 두고 여러
용도에 맞게 조금씩 더 학습해 쓰는 기반 모델을 말한다. Cosmos 는 지금까지의 영상과 조건을 받아 앞으로의 영상을 그려 내는데, Cosmos
논문은 로봇처럼 실제 세계에서 몸을 움직이는 AI(Physical AI)에게 자기 자신의 디지털 사본(policy model)과 세계의 디지털 사본(world model)이 필요하다고 보고, 개발자가 자기 로봇
환경에 맞는 world model 을 만들 수 있도록 미리 학습해 둔 모델과 영상 처리 도구를 공개했다.

이런 영상 world model 도 "지금 장면 + 행동(또는 조건) → 다음 장면" 이라는 뜻에서 레일 로봇의 world model 과 같은 일을 한다. 다만
그림이 8 pixel 이 아니라 수십만 pixel 의 영상이고, 배우는 데이터도 로봇 한 대의 기록이 아니라 수많은 영상이다.

**요약**

- World Models(2018)는 VAE + MDN-RNN + 작은 controller, PlaNet(2019)은 RSSM + CEM·MPC, Dreamer(2020, 2023)는 상상 속 actor-critic 이다
- decoder 없이 다음 latent 만 맞히면 모든 latent 가 0 인 collapse 로 loss 가 0 이 되므로, reward 예측이나 천천히 따라오는 target encoder
  로 막는다. TD-MPC2 와 V-JEPA 2 가 이쪽이다
- Cosmos 같은 영상 world model 은 같은 일을 대규모 영상에서 배운다

## 정리

- world model 은 지금 상태와 행동을 받아 다음 상태와 reward 를 예측하는 모델이다. 입력에 행동이 있고 출력이 미래라서, YOLO-World 같은
  물체 인식 모델이나 world frame 같은 좌표계 이름과는 다르다. world model 을 배워서 쓰는 RL 이 model-based, 쓰지 않는 RL 이 model-free 다
- 카메라 그림은 encoder 로 latent 로 줄인다. 레일 그림은 8 개에서 1 개로, Pendulum 그림은 12,288 개에서 수십 개로 줄고, 속도는 최근
  그림 두 장이나 지난 그림의 요약으로 latent 에 담는다
- dynamics model $\hat z_{t+1} = f(z_t, a_t)$ 와 reward model $\hat r_{t+1} = g(\hat z_{t+1})$ 은 모은 transition 을 맞히도록 배우고,
  예측을 다시 넣으면 그림 없이 여러 step 을 내다보는 상상 속 rollout 이 된다
- planning 은 행동열 후보를 rollout 해 예측 reward 합이 가장 큰 것을 고른다. 칸 1 에서는 A $(+1, +1, +1)$ 가 $-3$ 으로, 칸 3 에서는
  C $(+1, 0, 0)$ 가 0 으로 가장 좋았다
- CEM 은 후보를 뽑고 elite 의 평균과 표준편차로 분포를 다시 맞추기를 되풀이한다. 평균이 $0 \to 1.5 \to 2.25 \to 2.625$ 로 정답 3 에
  다가갔다
- 예측 위에 다시 예측하면 오차가 쌓이고($w = 1.5$ 면 0.5, 1, 1.5), planner 는 model 이 틀린 곳을 믿고 따라간다. multi-step loss,
  매 step 다시 계획하는 MPC, planner 로 모은 데이터로 다시 학습하는 반복이 이 문제를 줄인다
- world model 은 후보 비교를 실제 step 대신 계산으로 하고 모은 데이터를 계속 다시 써서, 실제 환경과 주고받는 횟수가 적다. 대신
  계산이 많아서 Dreamer 는 상상 속에서 policy 를 미리 학습한다

이 강의의 world model 은 고정된 카메라로 보는 칸 하나짜리 로봇과 관절 하나짜리 진자를 다룬다. 물체가 서로 부딪히고 미끄러지는
조작이나 실제 로봇 영상으로 가면 예측이 몇 step 만에 흐려져서, DreamerV3 처럼 latent 안에서 policy 까지 학습하거나 Cosmos·V-JEPA 2
처럼 대규모 영상으로 미리 학습한 훨씬 큰 model 과 데이터가 필요하다. 아직 정해진 표준 구현이 없어서, decoder 로 그림을 되살릴지,
latent 를 확률적으로 둘지, 몇 step 을 펼쳐 학습할지에 따라 결과가 크게 달라진다. 큰 VLA(카메라 그림과 말로 된 지시를 받아 로봇 행동을
내는 모델)를 실제 환경에서 reward 로 더 고치는 방법은 [VLA + RL](../vla-rl/README.md) 에서 다루고, world model 이 쓰는 latent 와 생성
모델의 바탕은 [VAE](../vae/README.md) 와 [DDPM](../ddpm/README.md) 에서 다룬다.

## 참고 자료

- David Ha, Jürgen Schmidhuber, [World Models](https://arxiv.org/abs/1803.10122) (2018)·[interactive 판](https://worldmodels.github.io/)
  — VAE·MDN-RNN·controller 로 나눈 구성과 상상 속 controller 학습. interactive 판은 그림을 직접 조작해 볼 수 있어서 이 강의 다음에 처음
  읽기에 알맞다
- Danijar Hafner 외, [Learning Latent Dynamics for Planning from Pixels](https://arxiv.org/abs/1811.04551) (2019)·[PlaNet 프로젝트 페이지](https://danijar.com/project/planet/)
  — RSSM, latent overshooting, CEM 과 MPC 로 그림만 보고 계획하는 방법. "CEM" 과 "MPC" 절의 구성과 가장 가깝다
- Danijar Hafner 외, [Dream to Control](https://arxiv.org/abs/1912.01603) (2020)·[Mastering Diverse Domains through World Models](https://arxiv.org/abs/2301.04104)
  (2023)·[DreamerV3 프로젝트 페이지](https://danijar.com/project/dreamerv3/) — planner 대신 latent 안에서 actor-critic 을 학습하는 방향.
  "상상 속 policy 학습" 절을 읽은 뒤 본다
- Nicklas Hansen 외, [TD-MPC2](https://arxiv.org/abs/2310.16828) (2024)·[프로젝트 페이지](https://tdmpc2.com/) — decoder 없는 latent model
  위에서 계획하는 연속 제어 방법
- BAIR, [Model-Based Reinforcement Learning: Theory and Practice](https://bair.berkeley.edu/blog/2019/12/12/mbpo/) — model 오차가
  rollout 길이에 따라 커지는 문제와 짧은 rollout 으로 다루는 방법. "예측 오차의 누적" 절과 함께 읽는다
- [Wikipedia — Cross-entropy method](https://en.wikipedia.org/wiki/Cross-entropy_method)·[Model predictive control](https://en.wikipedia.org/wiki/Model_predictive_control)
  — CEM 과 MPC 의 일반적인 정의
- Gymnasium [Pendulum](https://gymnasium.farama.org/environments/classic_control/pendulum/) 문서 — Pendulum 의 state·action·reward 정의
- NVIDIA [Cosmos](https://github.com/nvidia-cosmos/cosmos-predict2)([논문](https://arxiv.org/abs/2501.03575)) — 대규모 영상으로 학습한
  world foundation model
- Meta [V-JEPA 2](https://github.com/facebookresearch/vjepa2)([논문](https://arxiv.org/abs/2506.09985)) — representation 공간에서 예측하는
  video model 과, 그 위에서 CEM 으로 계획하는 action-conditioned model(V-JEPA 2-AC)
